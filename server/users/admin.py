from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model with health-specific fields."""

    list_display = [
        'username', 'email', 'first_name', 'last_name',
        'role', 'is_active', 'date_joined',
    ]
    list_filter = ['role', 'is_active', 'is_staff', 'gender']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    # Add health fields to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Health Profile', {
            'fields': (
                'phone_number', 'date_of_birth', 'gender',
                'height_cm', 'weight_kg', 'blood_type', 'role',
            ),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'role'),
        }),
    )
