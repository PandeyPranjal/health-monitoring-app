from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Doctor, Appointment
from .serializers import (
    DoctorListSerializer,
    DoctorDetailSerializer,
    AppointmentSerializer,
    AppointmentCreateSerializer,
)


# ── Doctors ──────────────────────────────────────────

class DoctorListView(generics.ListAPIView):
    """
    GET /api/appointments/doctors/

    List all available doctors (paginated).

    Query parameters:
      ?specialization=cardiology  — Filter by specialization
      ?search=smith               — Search by name
      ?available=true             — Only available doctors
    """
    serializer_class = DoctorListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Doctor.objects.all()

        specialization = self.request.query_params.get('specialization')
        if specialization:
            qs = qs.filter(specialization=specialization)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(hospital__icontains=search)
            )

        available = self.request.query_params.get('available')
        if available and available.lower() == 'true':
            qs = qs.filter(is_available=True)

        return qs.distinct()


class DoctorDetailView(generics.RetrieveAPIView):
    """
    GET /api/appointments/doctors/<id>/

    Get doctor details including time slots.
    """
    serializer_class = DoctorDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Doctor.objects.all()


# ── Appointments ─────────────────────────────────────

class AppointmentListView(generics.ListAPIView):
    """
    GET /api/appointments/

    List current user's appointments.

    Query parameters:
      ?status=pending       — Filter by status
      ?upcoming=true        — Only future appointments
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Appointment.objects.filter(patient=self.request.user)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        upcoming = self.request.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            from django.utils import timezone
            qs = qs.filter(date__gte=timezone.now().date())

        return qs.select_related('doctor')


class AppointmentCreateView(generics.CreateAPIView):
    """
    POST /api/appointments/

    Book a new appointment.
    Patient is auto-set from the authenticated user.
    """
    serializer_class = AppointmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save(patient=request.user)

        # Return full appointment details
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(generics.RetrieveAPIView):
    """
    GET /api/appointments/<id>/

    Retrieve appointment details.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user,
        ).select_related('doctor')


class AppointmentCancelView(APIView):
    """
    PATCH /api/appointments/<id>/cancel/

    Cancel an appointment (only if pending or confirmed).
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk, patient=request.user,
            )
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if appointment.status not in ('pending', 'confirmed'):
            return Response(
                {'error': f'Cannot cancel appointment with status "{appointment.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = 'cancelled'
        appointment.save(update_fields=['status', 'updated_at'])

        return Response(AppointmentSerializer(appointment).data)
