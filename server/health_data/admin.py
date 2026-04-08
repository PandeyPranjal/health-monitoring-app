from django.contrib import admin
from .models import HealthData


@admin.register(HealthData)
class HealthDataAdmin(admin.ModelAdmin):
    """Admin for viewing and managing health records."""

    list_display = [
        'user', 'heart_rate', 'steps', 'sleep_hours',
        'spo2', 'source', 'timestamp',
    ]
    list_filter = ['source', 'timestamp']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']
    ordering = ['-timestamp']

    fieldsets = (
        ('User', {
            'fields': ('user',),
        }),
        ('Vitals', {
            'fields': ('heart_rate', 'spo2', 'body_temperature'),
        }),
        ('Activity', {
            'fields': ('steps', 'calories_burned'),
        }),
        ('Sleep', {
            'fields': ('sleep_hours',),
        }),
        ('Blood Pressure', {
            'fields': ('systolic_bp', 'diastolic_bp'),
        }),
        ('Metadata', {
            'fields': ('source', 'notes', 'timestamp', 'created_at'),
        }),
    )
