from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class HealthData(models.Model):
    """
    Stores a single health data reading from a wearable device or manual entry.

    Designed to be extensible — new wearable metrics (blood_pressure, spo2, etc.)
    can be added as nullable fields without breaking existing data.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='health_records',
        db_index=True,
    )

    # ── Core Vitals ─────────────────────────────────
    heart_rate = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(250)],
        help_text="Heart rate in bpm (30–250)",
    )
    spo2 = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(100)],
        help_text="Blood oxygen saturation % (50–100)",
    )

    # ── Activity ────────────────────────────────────
    steps = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Step count for the period",
    )
    calories_burned = models.DecimalField(
        max_digits=7, decimal_places=1,
        null=True, blank=True,
        help_text="Calories burned (kcal)",
    )

    # ── Sleep ───────────────────────────────────────
    sleep_hours = models.DecimalField(
        max_digits=4, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(24)],
        help_text="Total sleep in hours (0–24)",
    )

    # ── Blood Pressure (future wearable) ────────────
    systolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(60), MaxValueValidator(250)],
        help_text="Systolic blood pressure (mmHg)",
    )
    diastolic_bp = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(150)],
        help_text="Diastolic blood pressure (mmHg)",
    )

    # ── Body Metrics ────────────────────────────────
    body_temperature = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        help_text="Body temperature in °C",
    )

    # ── Metadata ────────────────────────────────────
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('fitbit', 'Fitbit'),
        ('apple_watch', 'Apple Watch'),
        ('garmin', 'Garmin'),
        ('samsung', 'Samsung Health'),
        ('other', 'Other Device'),
    ]
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='manual',
        help_text="Data source / wearable device",
    )
    notes = models.TextField(blank=True, default='')

    # ── Timestamps ──────────────────────────────────
    timestamp = models.DateTimeField(
        db_index=True,
        help_text="When the reading was taken",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'health_data'
        ordering = ['-timestamp']
        verbose_name = 'Health Record'
        verbose_name_plural = 'Health Records'
        indexes = [
            models.Index(fields=['user', '-timestamp'], name='idx_user_timestamp'),
        ]

    def __str__(self):
        return f"{self.user.username} — {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
