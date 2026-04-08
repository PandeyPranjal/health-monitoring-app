"""
Fitbit API Integration Service
===============================

Separated service layer for all Fitbit API interactions.
Handles OAuth2 flow, token management, and data fetching.

Setup:
    1. Register at https://dev.fitbit.com/apps/new
    2. Set redirect URI to: http://localhost:8000/api/health/fitbit/callback/
    3. Add to .env:
        FITBIT_CLIENT_ID=your_id
        FITBIT_CLIENT_SECRET=your_secret
        FITBIT_REDIRECT_URI=http://localhost:8000/api/health/fitbit/callback/

Usage:
    from health_data.services.fitbit_service import FitbitService

    service = FitbitService()
    auth_url = service.get_authorization_url()
    tokens = service.exchange_code(code)
    steps = service.get_steps(access_token, date='today')
    heart = service.get_heart_rate(access_token, date='today')
"""

import os
import base64
import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


# ── Configuration ─────────────────────────────────────

def _get_config():
    """Load Fitbit config from environment / Django settings."""
    return {
        'client_id': getattr(settings, 'FITBIT_CLIENT_ID', None)
                      or os.environ.get('FITBIT_CLIENT_ID', ''),
        'client_secret': getattr(settings, 'FITBIT_CLIENT_SECRET', None)
                          or os.environ.get('FITBIT_CLIENT_SECRET', ''),
        'redirect_uri': getattr(settings, 'FITBIT_REDIRECT_URI', None)
                         or os.environ.get('FITBIT_REDIRECT_URI', ''),
    }


# ── Fitbit API Constants ─────────────────────────────

FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize'
FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token'
FITBIT_API_BASE = 'https://api.fitbit.com'

# Scopes we request from the user
FITBIT_SCOPES = [
    'activity',      # Steps, distance, calories
    'heartrate',     # Heart rate data
    'sleep',         # Sleep data
    'profile',       # User profile
]


class FitbitService:
    """
    Fitbit API client — handles OAuth2 and data fetching.

    This class is stateless; pass tokens per-request.
    For automatic token refresh, use FitbitUserService instead.
    """

    def __init__(self):
        config = _get_config()
        self.client_id = config['client_id']
        self.client_secret = config['client_secret']
        self.redirect_uri = config['redirect_uri']

    # ── OAuth2 Flow ───────────────────────────────────

    def get_authorization_url(self, state=None):
        """
        Generate the Fitbit OAuth2 authorization URL.
        Redirect the user to this URL to start the auth flow.

        Args:
            state: Optional CSRF token for security

        Returns:
            str: Authorization URL
        """
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(FITBIT_SCOPES),
        }
        if state:
            params['state'] = state
        return f"{FITBIT_AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, authorization_code):
        """
        Exchange authorization code for access/refresh tokens.

        Args:
            authorization_code: Code received from Fitbit callback

        Returns:
            dict: {access_token, refresh_token, expires_in, user_id, scope, token_type}

        Raises:
            FitbitAPIError: If the exchange fails
        """
        # Fitbit requires Basic auth with base64-encoded client_id:client_secret
        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        response = requests.post(
            FITBIT_TOKEN_URL,
            headers={
                'Authorization': f'Basic {credentials}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data={
                'code': authorization_code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.redirect_uri,
            },
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(f"Fitbit token exchange failed: {response.text}")
            raise FitbitAPIError(
                f"Token exchange failed: {response.status_code}",
                response=response,
            )

        data = response.json()
        return {
            'access_token': data['access_token'],
            'refresh_token': data['refresh_token'],
            'expires_in': data.get('expires_in', 28800),  # 8 hours default
            'user_id': data.get('user_id', ''),
            'scope': data.get('scope', ''),
            'token_type': data.get('token_type', 'Bearer'),
        }

    def refresh_access_token(self, refresh_token):
        """
        Refresh an expired access token.

        Args:
            refresh_token: The current refresh token

        Returns:
            dict: New token data (same format as exchange_code)

        Raises:
            FitbitAPIError: If refresh fails (user may need to re-authorize)
        """
        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        response = requests.post(
            FITBIT_TOKEN_URL,
            headers={
                'Authorization': f'Basic {credentials}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data={
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
            },
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(f"Fitbit token refresh failed: {response.text}")
            raise FitbitAPIError(
                f"Token refresh failed: {response.status_code}",
                response=response,
            )

        data = response.json()
        return {
            'access_token': data['access_token'],
            'refresh_token': data['refresh_token'],
            'expires_in': data.get('expires_in', 28800),
            'user_id': data.get('user_id', ''),
            'scope': data.get('scope', ''),
            'token_type': data.get('token_type', 'Bearer'),
        }

    # ── Data Fetching ─────────────────────────────────

    def _api_request(self, access_token, endpoint):
        """
        Make an authenticated GET request to the Fitbit API.

        Args:
            access_token: Valid Fitbit access token
            endpoint: API endpoint path (after base URL)

        Returns:
            dict: JSON response data

        Raises:
            FitbitAPIError: On API errors
        """
        url = f"{FITBIT_API_BASE}{endpoint}"
        response = requests.get(
            url,
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json',
            },
            timeout=30,
        )

        if response.status_code == 401:
            raise FitbitTokenExpiredError("Access token expired. Refresh needed.")
        if response.status_code != 200:
            logger.error(f"Fitbit API error: {response.status_code} — {response.text}")
            raise FitbitAPIError(
                f"API request failed: {response.status_code}",
                response=response,
            )

        return response.json()

    def get_steps(self, access_token, date='today'):
        """
        Fetch step count for a specific date.

        Args:
            access_token: Fitbit access token
            date: Date string ('today', 'yyyy-MM-dd')

        Returns:
            dict: {
                'date': '2026-04-08',
                'steps': 8432,
                'distance_km': 5.6,
                'calories': 1847,
                'active_minutes': 45,
            }
        """
        data = self._api_request(
            access_token,
            f'/1/user/-/activities/date/{date}.json',
        )

        summary = data.get('summary', {})
        return {
            'date': date if date != 'today' else datetime.now().strftime('%Y-%m-%d'),
            'steps': summary.get('steps', 0),
            'distance_km': round(
                sum(d.get('distance', 0) for d in summary.get('distances', [])
                    if d.get('activity') == 'total'), 2
            ),
            'calories': summary.get('caloriesOut', 0),
            'active_minutes': (
                summary.get('fairlyActiveMinutes', 0) +
                summary.get('veryActiveMinutes', 0)
            ),
            'floors': summary.get('floors', 0),
        }

    def get_heart_rate(self, access_token, date='today'):
        """
        Fetch heart rate data for a specific date.

        Args:
            access_token: Fitbit access token
            date: Date string ('today', 'yyyy-MM-dd')

        Returns:
            dict: {
                'date': '2026-04-08',
                'resting_heart_rate': 68,
                'zones': [
                    {'name': 'Out of Range', 'minutes': 1380, 'min_hr': 30, 'max_hr': 86},
                    {'name': 'Fat Burn', 'minutes': 45, 'min_hr': 86, 'max_hr': 120},
                    ...
                ],
                'intraday': [{'time': '09:15:00', 'value': 72}, ...]  (if authorized)
            }
        """
        data = self._api_request(
            access_token,
            f'/1/user/-/activities/heart/date/{date}/1d.json',
        )

        hr_data = data.get('activities-heart', [{}])
        value = hr_data[0].get('value', {}) if hr_data else {}

        result = {
            'date': date if date != 'today' else datetime.now().strftime('%Y-%m-%d'),
            'resting_heart_rate': value.get('restingHeartRate'),
            'zones': [
                {
                    'name': z.get('name', ''),
                    'minutes': z.get('minutes', 0),
                    'min_hr': z.get('min', 0),
                    'max_hr': z.get('max', 0),
                    'calories_out': round(z.get('caloriesOut', 0), 1),
                }
                for z in value.get('heartRateZones', [])
            ],
        }

        # Include intraday data if available (requires personal app type)
        intraday = data.get('activities-heart-intraday', {})
        if intraday and intraday.get('dataset'):
            result['intraday'] = intraday['dataset']

        return result

    def get_sleep(self, access_token, date='today'):
        """
        Fetch sleep data for a specific date.

        Args:
            access_token: Fitbit access token
            date: Date string ('today', 'yyyy-MM-dd')

        Returns:
            dict: {
                'date': '2026-04-08',
                'total_minutes_asleep': 420,
                'total_hours': 7.0,
                'efficiency': 92,
                'stages': {'deep': 85, 'light': 210, 'rem': 95, 'wake': 30},
            }
        """
        data = self._api_request(
            access_token,
            f'/1.2/user/-/sleep/date/{date}.json',
        )

        summary = data.get('summary', {})
        stages = summary.get('stages', {})

        total_minutes = summary.get('totalMinutesAsleep', 0)

        return {
            'date': date if date != 'today' else datetime.now().strftime('%Y-%m-%d'),
            'total_minutes_asleep': total_minutes,
            'total_hours': round(total_minutes / 60, 2),
            'efficiency': summary.get('efficiency', 0),
            'stages': {
                'deep': stages.get('deep', 0),
                'light': stages.get('light', 0),
                'rem': stages.get('rem', 0),
                'wake': stages.get('wake', 0),
            },
        }

    def get_profile(self, access_token):
        """
        Fetch the Fitbit user's profile.

        Returns:
            dict: {display_name, age, gender, height, weight, ...}
        """
        data = self._api_request(access_token, '/1/user/-/profile.json')
        user = data.get('user', {})
        return {
            'display_name': user.get('displayName', ''),
            'age': user.get('age'),
            'gender': user.get('gender', ''),
            'height_cm': user.get('height', 0),
            'weight_kg': user.get('weight', 0),
            'avatar_url': user.get('avatar', ''),
            'member_since': user.get('memberSince', ''),
        }


# ── User-Level Service (with auto token refresh) ─────

class FitbitUserService:
    """
    Higher-level service that handles per-user token management.
    Automatically refreshes tokens and syncs data to HealthData records.
    """

    def __init__(self):
        self.fitbit = FitbitService()

    def _get_valid_token(self, user):
        """Get a valid access token for a user, refreshing if needed."""
        from health_data.models_fitbit import FitbitToken

        try:
            token = FitbitToken.objects.get(user=user)
        except FitbitToken.DoesNotExist:
            raise FitbitNotConnectedError(
                "Fitbit account not connected. Please authorize first."
            )

        if token.is_expired:
            # Refresh the token
            new_tokens = self.fitbit.refresh_access_token(token.refresh_token)
            token.access_token = new_tokens['access_token']
            token.refresh_token = new_tokens['refresh_token']
            token.expires_at = timezone.now() + timedelta(
                seconds=new_tokens['expires_in']
            )
            token.save()
            logger.info(f"Refreshed Fitbit token for {user.username}")

        return token.access_token

    def sync_today(self, user):
        """
        Sync today's Fitbit data into a HealthData record.

        Returns:
            HealthData: The created/updated health record
        """
        from health_data.models import HealthData

        access_token = self._get_valid_token(user)

        # Fetch all data in parallel-ish (sequential for now)
        steps_data = self.fitbit.get_steps(access_token, 'today')
        heart_data = self.fitbit.get_heart_rate(access_token, 'today')
        sleep_data = self.fitbit.get_sleep(access_token, 'today')

        # Create or update today's record
        today = timezone.now()
        record, created = HealthData.objects.update_or_create(
            user=user,
            source='fitbit',
            timestamp__date=today.date(),
            defaults={
                'heart_rate': heart_data.get('resting_heart_rate'),
                'steps': steps_data.get('steps', 0),
                'calories_burned': steps_data.get('calories', 0),
                'sleep_hours': sleep_data.get('total_hours', 0),
                'timestamp': today,
            },
        )

        # Run alert evaluation on the synced data
        from alerts.services import evaluate_health_data
        if created:
            evaluate_health_data(record)

        logger.info(
            f"Synced Fitbit data for {user.username}: "
            f"steps={steps_data['steps']}, "
            f"resting_hr={heart_data.get('resting_heart_rate')}, "
            f"sleep={sleep_data['total_hours']}h"
        )

        return record

    def get_steps(self, user, date='today'):
        """Get steps for a user (with auto token refresh)."""
        access_token = self._get_valid_token(user)
        return self.fitbit.get_steps(access_token, date)

    def get_heart_rate(self, user, date='today'):
        """Get heart rate for a user (with auto token refresh)."""
        access_token = self._get_valid_token(user)
        return self.fitbit.get_heart_rate(access_token, date)

    def get_sleep(self, user, date='today'):
        """Get sleep data for a user (with auto token refresh)."""
        access_token = self._get_valid_token(user)
        return self.fitbit.get_sleep(access_token, date)


# ── Custom Exceptions ─────────────────────────────────

class FitbitAPIError(Exception):
    """Raised when a Fitbit API call fails."""
    def __init__(self, message, response=None):
        super().__init__(message)
        self.response = response


class FitbitTokenExpiredError(FitbitAPIError):
    """Raised when the access token has expired."""
    pass


class FitbitNotConnectedError(Exception):
    """Raised when the user hasn't connected their Fitbit account."""
    pass
