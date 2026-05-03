import zoneinfo
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin

class TimezoneMiddleware(MiddlewareMixin):
    """
    Middleware to dynamically set the internal Django active timezone 
    based on the 'X-Timezone' header provided by the frontend client.
    """
    def process_request(self, request):
        tzname = request.META.get('HTTP_X_TIMEZONE')
        if tzname:
            try:
                timezone.activate(zoneinfo.ZoneInfo(tzname))
            except zoneinfo.ZoneInfoNotFoundError:
                timezone.deactivate()
        else:
            timezone.deactivate()
