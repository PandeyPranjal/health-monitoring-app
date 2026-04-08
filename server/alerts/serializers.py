from django.utils import timezone
from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    """Full serializer for alert records."""

    username = serializers.CharField(source='user.username', read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            'id',
            'username',
            'alert_type',
            'severity',
            'title',
            'message',
            'metric_value',
            'threshold',
            'source',
            'is_read',
            'is_dismissed',
            'created_at',
            'read_at',
            'time_ago',
            'health_record',
        ]
        read_only_fields = [
            'id', 'username', 'alert_type', 'severity', 'title',
            'message', 'metric_value', 'threshold', 'source',
            'created_at', 'health_record', 'time_ago',
        ]

    def get_time_ago(self, obj):
        diff = timezone.now() - obj.created_at
        mins = int(diff.total_seconds() / 60)
        if mins < 1:
            return 'Just now'
        if mins < 60:
            return f'{mins}m ago'
        hrs = mins // 60
        if hrs < 24:
            return f'{hrs}h ago'
        days = hrs // 24
        return f'{days}d ago'


class AlertCountSerializer(serializers.Serializer):
    """Serializer for unread alert count."""
    unread_count = serializers.IntegerField()
    total_count = serializers.IntegerField()
