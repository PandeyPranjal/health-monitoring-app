"""
Health Alert Rule Engine
========================

Separated service layer that evaluates health data against defined rules
and generates alerts. Designed to be swappable with an AI model in the future.

Usage:
    from alerts.services import evaluate_health_data
    alerts = evaluate_health_data(health_record)

To upgrade to AI:
    1. Create a new function `ai_evaluate_health_data(record)` that returns
       the same list-of-dicts format.
    2. Swap the call in health_data/views.py.
"""

from .models import Alert


# ── Rule Definitions ──────────────────────────────────
# Each rule is a dict with:
#   - field:      the HealthData field to check
#   - condition:  callable(value) → bool
#   - alert_type: matches Alert.TYPE_CHOICES
#   - severity:   'info' | 'warning' | 'critical'
#   - title:      alert title
#   - message:    alert message (can use {value} placeholder)
#   - threshold:  human-readable threshold description

HEALTH_RULES = [
    # ── Heart Rate ──────────────────────────────────
    {
        'field': 'heart_rate',
        'condition': lambda v: v is not None and v > 100,
        'alert_type': 'high_heart_rate',
        'severity': 'warning',
        'title': 'High Heart Rate Detected',
        'message': 'Your heart rate is {value} bpm, which is above the normal resting range. Consider resting and monitoring your condition.',
        'threshold': '> 100 bpm',
    },
    {
        'field': 'heart_rate',
        'condition': lambda v: v is not None and v > 130,
        'alert_type': 'high_heart_rate',
        'severity': 'critical',
        'title': 'Dangerously High Heart Rate',
        'message': 'Your heart rate is {value} bpm, which is critically high. Seek medical attention if this persists.',
        'threshold': '> 130 bpm',
    },
    {
        'field': 'heart_rate',
        'condition': lambda v: v is not None and v < 50,
        'alert_type': 'low_heart_rate',
        'severity': 'warning',
        'title': 'Low Heart Rate Detected',
        'message': 'Your heart rate is {value} bpm, which is below normal. Consult a doctor if you feel dizzy or faint.',
        'threshold': '< 50 bpm',
    },

    # ── Sleep ───────────────────────────────────────
    {
        'field': 'sleep_hours',
        'condition': lambda v: v is not None and float(v) < 5,
        'alert_type': 'poor_sleep',
        'severity': 'warning',
        'title': 'Poor Sleep Detected',
        'message': 'You slept only {value} hours, which is below the recommended minimum. Aim for 7–9 hours for optimal health.',
        'threshold': '< 5 hours',
    },
    {
        'field': 'sleep_hours',
        'condition': lambda v: v is not None and float(v) < 3,
        'alert_type': 'poor_sleep',
        'severity': 'critical',
        'title': 'Severely Insufficient Sleep',
        'message': 'You slept only {value} hours. Chronic sleep deprivation can lead to serious health issues.',
        'threshold': '< 3 hours',
    },

    # ── Blood Oxygen ────────────────────────────────
    {
        'field': 'spo2',
        'condition': lambda v: v is not None and float(v) < 92,
        'alert_type': 'low_spo2',
        'severity': 'critical',
        'title': 'Low Blood Oxygen',
        'message': 'Your SpO₂ is {value}%, which is dangerously low. Seek immediate medical attention.',
        'threshold': '< 92%',
    },
    {
        'field': 'spo2',
        'condition': lambda v: v is not None and float(v) < 95,
        'alert_type': 'low_spo2',
        'severity': 'warning',
        'title': 'Below Normal Blood Oxygen',
        'message': 'Your SpO₂ is {value}%, which is below normal. Monitor closely.',
        'threshold': '< 95%',
    },

    # ── Blood Pressure ──────────────────────────────
    {
        'field': 'systolic_bp',
        'condition': lambda v: v is not None and v > 140,
        'alert_type': 'high_bp',
        'severity': 'warning',
        'title': 'High Blood Pressure',
        'message': 'Your systolic blood pressure is {value} mmHg, indicating hypertension. Consult your doctor.',
        'threshold': '> 140 mmHg',
    },

    # ── Body Temperature ────────────────────────────
    {
        'field': 'body_temperature',
        'condition': lambda v: v is not None and float(v) > 38.0,
        'alert_type': 'high_temperature',
        'severity': 'warning',
        'title': 'Elevated Body Temperature',
        'message': 'Your body temperature is {value}°C, indicating a fever. Rest and stay hydrated.',
        'threshold': '> 38.0°C',
    },
]


def evaluate_health_data(health_record):
    """
    Evaluate a single health record against all defined rules.

    Args:
        health_record: HealthData model instance

    Returns:
        list[Alert]: List of Alert instances that were created
    """
    created_alerts = []

    for rule in HEALTH_RULES:
        field_value = getattr(health_record, rule['field'], None)

        if field_value is None:
            continue

        if not rule['condition'](field_value):
            continue

        # For critical rules that override warning (e.g., HR > 130 overrides HR > 100),
        # check if we already created an alert of the same type with higher severity
        existing_same_type = [
            a for a in created_alerts
            if a.alert_type == rule['alert_type']
        ]
        if existing_same_type:
            # Keep the higher severity alert
            severity_rank = {'info': 0, 'warning': 1, 'critical': 2}
            existing_severity = max(
                severity_rank.get(a.severity, 0) for a in existing_same_type
            )
            if severity_rank.get(rule['severity'], 0) <= existing_severity:
                continue
            else:
                # Remove the lower-severity alert, replace with this one
                for a in existing_same_type:
                    a.delete()
                created_alerts = [
                    a for a in created_alerts
                    if a.alert_type != rule['alert_type']
                ]

        # Format message with actual value
        value_str = str(field_value)
        message = rule['message'].format(value=value_str)

        alert = Alert.objects.create(
            user=health_record.user,
            health_record=health_record,
            alert_type=rule['alert_type'],
            severity=rule['severity'],
            title=rule['title'],
            message=message,
            metric_value=f"{value_str}",
            threshold=rule['threshold'],
            source='rule_engine',
        )
        created_alerts.append(alert)

    return created_alerts


def get_unread_count(user):
    """Get count of unread alerts for a user."""
    return Alert.objects.filter(user=user, is_read=False).count()
