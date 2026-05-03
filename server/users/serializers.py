from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ── Registration ─────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Handles user signup with password confirmation."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'phone_number',
            'role',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        """Check that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ── Login (Custom JWT Claims) ────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds custom claims to the JWT token payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.get_full_name()

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to response (alongside tokens)
        data['user'] = UserProfileSerializer(self.user).data

        return data


# ── User Profile ─────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Read/update serializer for user profile data."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'date_of_birth',
            'gender',
            'height_cm',
            'weight_kg',
            'blood_type',
            'health_goal',
            'onboarding_completed',
            'role',
            'date_joined',
            'updated_at',
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'updated_at', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name()
