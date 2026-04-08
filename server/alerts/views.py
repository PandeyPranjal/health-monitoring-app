from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alert
from .serializers import AlertSerializer, AlertCountSerializer


class AlertListView(generics.ListAPIView):
    """
    GET /api/alerts/

    List user's alerts (newest first, paginated).

    Query parameters:
      ?severity=critical    — Filter by severity
      ?is_read=false        — Filter unread only
      ?alert_type=high_heart_rate — Filter by type
    """
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Alert.objects.filter(
            user=self.request.user,
            is_dismissed=False,
        )

        severity = self.request.query_params.get('severity')
        if severity:
            qs = qs.filter(severity=severity)

        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() == 'true')

        alert_type = self.request.query_params.get('alert_type')
        if alert_type:
            qs = qs.filter(alert_type=alert_type)

        return qs


class AlertDetailView(generics.RetrieveAPIView):
    """
    GET /api/alerts/<id>/

    Retrieve a single alert (auto-marks as read).
    """
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Auto-mark as read when viewed
        if not instance.is_read:
            instance.is_read = True
            instance.read_at = timezone.now()
            instance.save(update_fields=['is_read', 'read_at'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AlertMarkReadView(APIView):
    """
    PATCH /api/alerts/<id>/read/

    Mark a single alert as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk, user=request.user)
        except Alert.DoesNotExist:
            return Response(
                {'error': 'Alert not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        alert.is_read = True
        alert.read_at = timezone.now()
        alert.save(update_fields=['is_read', 'read_at'])

        return Response(AlertSerializer(alert).data)


class AlertMarkAllReadView(APIView):
    """
    POST /api/alerts/read-all/

    Mark all unread alerts as read for the current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated = Alert.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True, read_at=timezone.now())

        return Response({
            'message': f'{updated} alert(s) marked as read.',
            'updated_count': updated,
        })


class AlertDismissView(APIView):
    """
    PATCH /api/alerts/<id>/dismiss/

    Dismiss (soft-delete) an alert so it no longer appears in lists.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk, user=request.user)
        except Alert.DoesNotExist:
            return Response(
                {'error': 'Alert not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        alert.is_dismissed = True
        alert.save(update_fields=['is_dismissed'])

        return Response({'message': 'Alert dismissed.'})


class AlertCountView(APIView):
    """
    GET /api/alerts/count/

    Get unread and total alert counts (for notification badge).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        base_qs = Alert.objects.filter(user=request.user, is_dismissed=False)
        data = {
            'unread_count': base_qs.filter(is_read=False).count(),
            'total_count': base_qs.count(),
        }
        return Response(AlertCountSerializer(data).data)
