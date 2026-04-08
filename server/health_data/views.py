from django.db.models import Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HealthData
from .serializers import HealthDataSerializer, HealthDataSummarySerializer
from alerts.services import evaluate_health_data


class HealthDataListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/health/records/     — List user's health records (paginated).
    POST /api/health/records/     — Add a new health record.

    Query parameters:
      ?source=fitbit          — Filter by data source
      ?from=2026-04-01        — Filter records from date
      ?to=2026-04-07          — Filter records until date
    """
    serializer_class = HealthDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = HealthData.objects.filter(user=self.request.user)

        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            qs = qs.filter(source=source)

        # Filter by date range
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')
        if date_from:
            qs = qs.filter(timestamp__date__gte=date_from)
        if date_to:
            qs = qs.filter(timestamp__date__lte=date_to)

        return qs

    def perform_create(self, serializer):
        """Auto-set user and evaluate health rules for alerts."""
        record = serializer.save(user=self.request.user)
        # Run rule engine — generates alerts if thresholds are exceeded
        evaluate_health_data(record)


class HealthDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/health/records/<id>/  — Retrieve a single record.
    PUT    /api/health/records/<id>/  — Full update.
    PATCH  /api/health/records/<id>/  — Partial update.
    DELETE /api/health/records/<id>/  — Delete a record.
    """
    serializer_class = HealthDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Users can only access their own records."""
        return HealthData.objects.filter(user=self.request.user)


class HealthDataLatestView(APIView):
    """
    GET /api/health/latest/  — Get the user's most recent health record.

    Useful for the dashboard "current vitals" display.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        record = (
            HealthData.objects
            .filter(user=request.user)
            .order_by('-timestamp')
            .first()
        )
        if not record:
            return Response(
                {'message': 'No health records found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = HealthDataSerializer(record)
        return Response(serializer.data)


class HealthDataSummaryView(APIView):
    """
    GET /api/health/summary/  — Aggregated health stats.

    Query parameters:
      ?period=today    (default)
      ?period=week
      ?period=month
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'today')
        now = timezone.now()

        # Determine date range
        period_map = {
            'today': now - timedelta(days=1),
            'week': now - timedelta(weeks=1),
            'month': now - timedelta(days=30),
        }
        start_date = period_map.get(period, period_map['today'])

        # Aggregate
        qs = HealthData.objects.filter(
            user=request.user,
            timestamp__gte=start_date,
        )

        stats = qs.aggregate(
            avg_heart_rate=Avg('heart_rate'),
            avg_spo2=Avg('spo2'),
            total_steps=Sum('steps'),
            total_calories=Sum('calories_burned'),
            avg_sleep_hours=Avg('sleep_hours'),
            record_count=Count('id'),
        )
        stats['period'] = period

        serializer = HealthDataSummarySerializer(stats)
        return Response(serializer.data)
