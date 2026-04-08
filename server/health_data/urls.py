from django.urls import path
from . import views
from . import views_fitbit

app_name = 'health_data'

urlpatterns = [
    # CRUD endpoints
    path('records/', views.HealthDataListCreateView.as_view(), name='record-list'),
    path('records/<int:pk>/', views.HealthDataDetailView.as_view(), name='record-detail'),

    # Dashboard endpoints
    path('latest/', views.HealthDataLatestView.as_view(), name='latest'),
    path('summary/', views.HealthDataSummaryView.as_view(), name='summary'),

    # ── Fitbit Integration ────────────────────────────
    path('fitbit/connect/', views_fitbit.FitbitConnectView.as_view(), name='fitbit-connect'),
    path('fitbit/callback/', views_fitbit.FitbitCallbackView.as_view(), name='fitbit-callback'),
    path('fitbit/disconnect/', views_fitbit.FitbitDisconnectView.as_view(), name='fitbit-disconnect'),
    path('fitbit/status/', views_fitbit.FitbitStatusView.as_view(), name='fitbit-status'),
    path('fitbit/sync/', views_fitbit.FitbitSyncView.as_view(), name='fitbit-sync'),
    path('fitbit/steps/', views_fitbit.FitbitStepsView.as_view(), name='fitbit-steps'),
    path('fitbit/heart-rate/', views_fitbit.FitbitHeartRateView.as_view(), name='fitbit-heart-rate'),
]
