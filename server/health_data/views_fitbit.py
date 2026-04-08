"""
Fitbit OAuth2 & Data Views
===========================

Handles the Fitbit connection flow and data endpoints.
All Fitbit API logic lives in services/fitbit_service.py.
"""

import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models_fitbit import FitbitToken
from .services import (
    FitbitService,
    FitbitUserService,
    FitbitAPIError,
    FitbitNotConnectedError,
)

logger = logging.getLogger(__name__)


class FitbitConnectView(APIView):
    """
    GET /api/health/fitbit/connect/

    Returns the Fitbit OAuth2 authorization URL.
    Frontend redirects the user to this URL.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service = FitbitService()

        if not service.client_id:
            return Response(
                {'error': 'Fitbit integration is not configured. Set FITBIT_CLIENT_ID in environment.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        auth_url = service.get_authorization_url(
            state=str(request.user.pk),  # CSRF protection
        )
        return Response({'authorization_url': auth_url})


class FitbitCallbackView(APIView):
    """
    GET /api/health/fitbit/callback/?code=...&state=...

    Fitbit redirects here after user grants permission.
    Exchanges the authorization code for tokens and stores them.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'Missing authorization code from Fitbit.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = FitbitService()

        try:
            token_data = service.exchange_code(code)
        except FitbitAPIError as e:
            logger.error(f"Fitbit callback error for {request.user.username}: {e}")
            return Response(
                {'error': 'Failed to connect Fitbit. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        from django.shortcuts import redirect
        from django.conf import settings

        # Save or update tokens
        FitbitToken.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_type': token_data['token_type'],
                'expires_at': timezone.now() + timedelta(
                    seconds=token_data['expires_in']
                ),
                'fitbit_user_id': token_data['user_id'],
                'scope': token_data['scope'],
            },
        )

        return redirect(f"{settings.FRONTEND_URL}/profile?fitbit=success")


class FitbitDisconnectView(APIView):
    """
    POST /api/health/fitbit/disconnect/

    Disconnect Fitbit by deleting stored tokens.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        deleted, _ = FitbitToken.objects.filter(user=request.user).delete()
        if deleted:
            return Response({'message': 'Fitbit disconnected.'})
        return Response(
            {'message': 'No Fitbit account was connected.'},
            status=status.HTTP_404_NOT_FOUND,
        )


class FitbitStatusView(APIView):
    """
    GET /api/health/fitbit/status/

    Check if user has Fitbit connected and token status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            token = request.user.fitbit_token
            return Response({
                'connected': True,
                'fitbit_user_id': token.fitbit_user_id,
                'token_expired': token.is_expired,
                'last_synced': token.updated_at,
            })
        except FitbitToken.DoesNotExist:
            return Response({
                'connected': False,
            })


class FitbitSyncView(APIView):
    """
    POST /api/health/fitbit/sync/

    Sync today's Fitbit data into HealthData.
    Fetches steps, heart rate, and sleep in one call.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        service = FitbitUserService()

        try:
            record = service.sync_today(request.user)
            return Response({
                'message': 'Fitbit data synced successfully!',
                'record': {
                    'id': record.id,
                    'heart_rate': record.heart_rate,
                    'steps': record.steps,
                    'sleep_hours': str(record.sleep_hours),
                    'calories_burned': str(record.calories_burned),
                    'source': record.source,
                    'timestamp': record.timestamp,
                },
            })
        except FitbitNotConnectedError:
            return Response(
                {'error': 'Fitbit not connected. Please connect first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except FitbitAPIError as e:
            logger.error(f"Fitbit sync error for {request.user.username}: {e}")
            return Response(
                {'error': 'Failed to sync Fitbit data. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class FitbitStepsView(APIView):
    """
    GET /api/health/fitbit/steps/?date=today

    Fetch steps data directly from Fitbit (without saving to DB).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date = request.query_params.get('date', 'today')
        service = FitbitUserService()

        try:
            data = service.get_steps(request.user, date)
            return Response(data)
        except FitbitNotConnectedError:
            return Response(
                {'error': 'Fitbit not connected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except FitbitAPIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class FitbitHeartRateView(APIView):
    """
    GET /api/health/fitbit/heart-rate/?date=today

    Fetch heart rate data directly from Fitbit.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date = request.query_params.get('date', 'today')
        service = FitbitUserService()

        try:
            data = service.get_heart_rate(request.user, date)
            return Response(data)
        except FitbitNotConnectedError:
            return Response(
                {'error': 'Fitbit not connected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except FitbitAPIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
