from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
)


# ── Registration ─────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register/

    Creates a new user account and returns JWT tokens.
    No authentication required.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly registered user
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'Registration successful.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ── Login ────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/users/login/

    Authenticates user and returns access + refresh JWT tokens.
    Accepts: { "username": "...", "password": "..." }
    No authentication required.
    """
    serializer_class = CustomTokenObtainPairSerializer


# ── Token Refresh ────────────────────────────────────

class TokenRefreshView(TokenRefreshView):
    """
    POST /api/users/token/refresh/

    Accepts a refresh token and returns a new access token.
    Accepts: { "refresh": "<refresh_token>" }
    """
    pass


# ── Profile ──────────────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/users/profile/  — Retrieve current user's profile.
    PUT  /api/users/profile/  — Update current user's profile.
    PATCH /api/users/profile/ — Partial update.

    Requires authentication.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ── Logout ───────────────────────────────────────────

class LogoutView(APIView):
    """
    POST /api/users/logout/

    Blacklists the refresh token to prevent reuse.
    Accepts: { "refresh": "<refresh_token>" }
    Requires authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Logout successful.'},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
