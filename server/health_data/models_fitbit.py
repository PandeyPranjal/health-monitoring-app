from django.conf import settings
from django.db import models


class FitbitToken(models.Model):
    """
    Stores Fitbit OAuth2 tokens per user.
    Enables automatic token refresh and multi-user support.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fitbit_token',
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_type = models.CharField(max_length=20, default='Bearer')
    expires_at = models.DateTimeField(
        help_text="When the access token expires",
    )
    fitbit_user_id = models.CharField(
        max_length=50, blank=True, default='',
        help_text="Fitbit user ID returned during auth",
    )
    scope = models.TextField(
        blank=True, default='',
        help_text="Granted OAuth scopes",
    )

    # ── Timestamps ──────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fitbit_tokens'
        verbose_name = 'Fitbit Token'
        verbose_name_plural = 'Fitbit Tokens'

    def __str__(self):
        return f"Fitbit — {self.user.username} (expires {self.expires_at})"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at
