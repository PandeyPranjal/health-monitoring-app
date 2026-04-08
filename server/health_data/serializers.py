from rest_framework import serializers
from .models import HealthData


class HealthDataSerializer(serializers.ModelSerializer):
    """
    Full read/write serializer for health data records.
    User is auto-set from the request — never sent by the client.
    """

    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = HealthData
        fields = [
            'id',
            'username',
            'heart_rate',
            'spo2',
            'steps',
            'calories_burned',
            'sleep_hours',
            'systolic_bp',
            'diastolic_bp',
            'body_temperature',
            'source',
            'notes',
            'timestamp',
            'created_at',
        ]
        read_only_fields = ['id', 'username', 'created_at']


    def validate(self, attrs):
        """Ensure at least one metric + BP cross-validation."""
        # At least one metric
        metric_fields = [
            'heart_rate', 'spo2', 'steps', 'calories_burned',
            'sleep_hours', 'systolic_bp', 'diastolic_bp', 'body_temperature',
        ]
        has_metric = any(attrs.get(f) is not None for f in metric_fields)
        if not has_metric:
            raise serializers.ValidationError(
                "At least one health metric must be provided."
            )

        # If BP is provided, both values should be present
        systolic = attrs.get('systolic_bp')
        diastolic = attrs.get('diastolic_bp')
        if (systolic is not None) != (diastolic is not None):
            raise serializers.ValidationError(
                "Both systolic and diastolic blood pressure must be provided together."
            )
        if systolic and diastolic and diastolic >= systolic:
            raise serializers.ValidationError(
                "Systolic BP must be higher than diastolic BP."
            )

        return attrs


class HealthDataSummarySerializer(serializers.Serializer):
    """
    Read-only serializer for aggregated health data summaries.
    Used for dashboard stats (averages, min, max over a period).
    """

    period = serializers.CharField()
    avg_heart_rate = serializers.FloatField(allow_null=True)
    avg_spo2 = serializers.FloatField(allow_null=True)
    total_steps = serializers.IntegerField(allow_null=True)
    total_calories = serializers.FloatField(allow_null=True)
    avg_sleep_hours = serializers.FloatField(allow_null=True)
    record_count = serializers.IntegerField()
