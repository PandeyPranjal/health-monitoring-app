from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """Admin for viewing and managing health alerts."""

    list_display = [
        'user', 'alert_type', 'severity', 'title',
        'is_read', 'source', 'created_at',
    ]
    list_filter = ['severity', 'alert_type', 'is_read', 'source', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Alert Info', {
            'fields': ('user', 'health_record', 'alert_type', 'severity', 'source'),
        }),
        ('Content', {
            'fields': ('title', 'message', 'metric_value', 'threshold'),
        }),
        ('Status', {
            'fields': ('is_read', 'is_dismissed', 'created_at', 'read_at'),
        }),
    )
