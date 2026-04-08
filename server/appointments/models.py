from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Doctor(models.Model):
    """
    Doctor profile — can optionally be linked to a User with role='doctor'.
    Separate model allows flexibility: doctors may or may not have app accounts.
    """

    # ── Link to User (optional) ─────────────────────
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='doctor_profile',
        help_text="Linked user account (optional)",
    )

    # ── Professional Info ───────────────────────────
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=15, blank=True, default='')

    SPECIALIZATION_CHOICES = [
        ('general', 'General Physician'),
        ('cardiology', 'Cardiology'),
        ('pulmonology', 'Pulmonology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('dermatology', 'Dermatology'),
        ('endocrinology', 'Endocrinology'),
        ('psychiatry', 'Psychiatry'),
        ('pediatrics', 'Pediatrics'),
        ('other', 'Other'),
    ]
    specialization = models.CharField(
        max_length=20, choices=SPECIALIZATION_CHOICES, default='general',
    )
    qualification = models.CharField(
        max_length=200, blank=True, default='',
        help_text="E.g., MBBS, MD, FRCP",
    )
    experience_years = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(60)],
        help_text="Years of experience",
    )
    hospital = models.CharField(max_length=200, blank=True, default='')
    bio = models.TextField(blank=True, default='')

    # ── Availability ────────────────────────────────
    consultation_fee = models.DecimalField(
        max_digits=8, decimal_places=2, default=0,
        help_text="Fee per consultation in your currency",
    )
    is_available = models.BooleanField(default=True)

    # ── Rating ──────────────────────────────────────
    rating = models.DecimalField(
        max_digits=2, decimal_places=1, default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_reviews = models.PositiveIntegerField(default=0)

    # ── Timestamps ──────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        ordering = ['-rating', 'last_name']
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.get_specialization_display()})"

    @property
    def full_name(self):
        return f"Dr. {self.first_name} {self.last_name}"


class TimeSlot(models.Model):
    """
    Available time slots for a doctor.
    Reusable weekly schedule — slots can be marked as booked.
    """

    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name='time_slots',
    )
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'time_slots'
        ordering = ['weekday', 'start_time']
        unique_together = ['doctor', 'weekday', 'start_time']

    def __str__(self):
        return f"{self.doctor.full_name} — {self.get_weekday_display()} {self.start_time}–{self.end_time}"


class Appointment(models.Model):
    """
    Patient appointment with a doctor.
    Links patient (User) with Doctor at a specific date/time.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    TYPE_CHOICES = [
        ('in_person', 'In Person'),
        ('video_call', 'Video Call'),
        ('phone_call', 'Phone Call'),
    ]

    # ── Relationships ───────────────────────────────
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        db_index=True,
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments',
        db_index=True,
    )

    # ── Scheduling ──────────────────────────────────
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    # ── Details ─────────────────────────────────────
    appointment_type = models.CharField(
        max_length=15, choices=TYPE_CHOICES, default='in_person',
    )
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='pending',
    )
    reason = models.TextField(
        blank=True, default='',
        help_text="Why the patient is seeing the doctor",
    )
    notes = models.TextField(
        blank=True, default='',
        help_text="Doctor's notes after the appointment",
    )

    # ── Timestamps ──────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['date', 'start_time']
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        indexes = [
            models.Index(fields=['patient', 'date'], name='idx_patient_date'),
            models.Index(fields=['doctor', 'date'], name='idx_doctor_date'),
        ]
        # Prevent double-booking the same doctor at the same time
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'date', 'start_time'],
                name='unique_doctor_slot',
            ),
        ]

    def __str__(self):
        return f"{self.patient.username} → {self.doctor.full_name} on {self.date} at {self.start_time}"
