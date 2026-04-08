from django.urls import path
from . import views

app_name = 'appointments'

urlpatterns = [
    # Doctor endpoints
    path('doctors/', views.DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),

    # Appointment endpoints
    path('', views.AppointmentListView.as_view(), name='appointment-list'),
    path('book/', views.AppointmentCreateView.as_view(), name='appointment-book'),
    path('<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/cancel/', views.AppointmentCancelView.as_view(), name='appointment-cancel'),
]
