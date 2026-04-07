"""
URL configuration for server project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/users/', include('users.urls')),
    path('api/health/', include('health_data.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/appointments/', include('appointments.urls')),
]
