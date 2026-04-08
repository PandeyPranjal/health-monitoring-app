from django.urls import path
from . import views

app_name = 'alerts'

urlpatterns = [
    path('', views.AlertListView.as_view(), name='alert-list'),
    path('count/', views.AlertCountView.as_view(), name='alert-count'),
    path('read-all/', views.AlertMarkAllReadView.as_view(), name='alert-read-all'),
    path('<int:pk>/', views.AlertDetailView.as_view(), name='alert-detail'),
    path('<int:pk>/read/', views.AlertMarkReadView.as_view(), name='alert-read'),
    path('<int:pk>/dismiss/', views.AlertDismissView.as_view(), name='alert-dismiss'),
]
