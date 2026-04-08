from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Auth endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),

    # Profile endpoint
    path('profile/', views.ProfileView.as_view(), name='profile'),
]
