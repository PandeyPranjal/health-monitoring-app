from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for the health monitoring app.
    Extends Django's AbstractUser to allow future health-specific fields.
    """

    # ── Profile fields ──────────────────────────────
    phone_number = models.CharField(max_length=15, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, default='')

    # ── Health-specific fields ──────────────────────
    height_cm = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True,
        help_text="Height in centimeters"
    )
    weight_kg = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True,
        help_text="Weight in kilograms"
    )
    blood_type = models.CharField(max_length=5, blank=True, default='')

    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')

    HEALTH_GOAL_CHOICES = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('better_sleep', 'Better Sleep'),
        ('heart_health', 'Heart Health'),
        ('athletic_perf', 'Athletic Performance'),
        ('maintenance', 'Maintenance'),
    ]
    health_goal = models.CharField(
        max_length=20, choices=HEALTH_GOAL_CHOICES, blank=True, default=''
    )
    onboarding_completed = models.BooleanField(default=False)

    # ── Timestamps ──────────────────────────────────
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
