from django.contrib import admin
from .models import Doctor, TimeSlot, Appointment


class TimeSlotInline(admin.TabularInline):
    """Inline for managing time slots within Doctor admin."""
    model = TimeSlot
    extra = 1


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'specialization', 'hospital',
        'experience_years', 'consultation_fee', 'rating', 'is_available',
    ]
    list_filter = ['specialization', 'is_available']
    search_fields = ['first_name', 'last_name', 'hospital']
    inlines = [TimeSlotInline]

    fieldsets = (
        ('Personal Info', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone'),
        }),
        ('Professional', {
            'fields': (
                'specialization', 'qualification',
                'experience_years', 'hospital', 'bio',
            ),
        }),
        ('Availability & Pricing', {
            'fields': ('consultation_fee', 'is_available'),
        }),
        ('Rating', {
            'fields': ('rating', 'total_reviews'),
        }),
    )


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'doctor', 'date', 'start_time',
        'appointment_type', 'status',
    ]
    list_filter = ['status', 'appointment_type', 'date']
    search_fields = ['patient__username', 'doctor__first_name', 'doctor__last_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Booking', {
            'fields': ('patient', 'doctor'),
        }),
        ('Schedule', {
            'fields': ('date', 'start_time', 'end_time', 'appointment_type'),
        }),
        ('Status', {
            'fields': ('status', 'reason', 'notes'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
