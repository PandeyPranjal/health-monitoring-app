from rest_framework import serializers
from .models import Doctor, TimeSlot, Appointment


# ── Doctor ───────────────────────────────────────────

class TimeSlotSerializer(serializers.ModelSerializer):
    """Nested serializer for doctor time slots."""
    weekday_name = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = TimeSlot
        fields = ['id', 'weekday', 'weekday_name', 'start_time', 'end_time', 'is_active']


class DoctorListSerializer(serializers.ModelSerializer):
    """Compact serializer for doctor list views."""
    full_name = serializers.ReadOnlyField()
    specialization_display = serializers.CharField(
        source='get_specialization_display', read_only=True,
    )

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'first_name', 'last_name',
            'specialization', 'specialization_display',
            'hospital', 'experience_years', 'consultation_fee',
            'rating', 'total_reviews', 'is_available',
        ]


class DoctorDetailSerializer(serializers.ModelSerializer):
    """Full serializer for doctor detail view with time slots."""
    full_name = serializers.ReadOnlyField()
    specialization_display = serializers.CharField(
        source='get_specialization_display', read_only=True,
    )
    time_slots = TimeSlotSerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'first_name', 'last_name',
            'email', 'phone', 'specialization', 'specialization_display',
            'qualification', 'experience_years', 'hospital', 'bio',
            'consultation_fee', 'is_available',
            'rating', 'total_reviews',
            'time_slots',
            'created_at',
        ]


# ── Appointment ──────────────────────────────────────

class AppointmentSerializer(serializers.ModelSerializer):
    """Full serializer for appointments."""
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    doctor_specialization = serializers.CharField(
        source='doctor.get_specialization_display', read_only=True,
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(
        source='get_appointment_type_display', read_only=True,
    )

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient', 'patient_name',
            'doctor', 'doctor_name', 'doctor_specialization',
            'date', 'start_time', 'end_time',
            'appointment_type', 'type_display',
            'status', 'status_display',
            'reason', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'patient', 'patient_name',
            'doctor_name', 'doctor_specialization',
            'status_display', 'type_display',
            'created_at', 'updated_at',
        ]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def validate(self, attrs):
        """Validate appointment booking."""
        doctor = attrs.get('doctor')
        date = attrs.get('date')
        start_time = attrs.get('start_time')

        # Check doctor availability
        if doctor and not doctor.is_available:
            raise serializers.ValidationError(
                "This doctor is currently not available for appointments."
            )

        # Check for double-booking
        if doctor and date and start_time:
            exists = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                start_time=start_time,
            ).exclude(status='cancelled').exists()

            # Exclude current instance for updates
            if self.instance:
                exists = Appointment.objects.filter(
                    doctor=doctor,
                    date=date,
                    start_time=start_time,
                ).exclude(
                    pk=self.instance.pk,
                ).exclude(status='cancelled').exists()

            if exists:
                raise serializers.ValidationError(
                    "This time slot is already booked. Please choose another."
                )

        # Ensure end_time > start_time
        end_time = attrs.get('end_time')
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError(
                "End time must be after start time."
            )

        return attrs


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for booking a new appointment."""

    class Meta:
        model = Appointment
        fields = [
            'doctor', 'date', 'start_time', 'end_time',
            'appointment_type', 'reason',
        ]

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        date = attrs.get('date')
        start_time = attrs.get('start_time')

        if doctor and not doctor.is_available:
            raise serializers.ValidationError(
                "This doctor is currently not available."
            )

        if doctor and date and start_time:
            exists = Appointment.objects.filter(
                doctor=doctor,
                date=date,
                start_time=start_time,
            ).exclude(status='cancelled').exists()
            if exists:
                raise serializers.ValidationError(
                    "This time slot is already booked."
                )

        end_time = attrs.get('end_time')
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time.")

        return attrs
