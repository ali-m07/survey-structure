from django.db import models
from django.contrib.postgres.fields import JSONField


class Integration(models.Model):
    INTEGRATION_TYPE_CHOICES = [
        ('hris', 'HRIS'),
        ('crm', 'CRM'),
        ('slack', 'Slack'),
        ('teams', 'Microsoft Teams'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('webhook', 'Webhook'),
        ('api', 'API'),
        ('blockchain', 'Blockchain'),
        ('iot', 'IoT'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='integrations')
    name = models.CharField(max_length=255)
    integration_type = models.CharField(max_length=50, choices=INTEGRATION_TYPE_CHOICES)
    description = models.TextField(blank=True)
    config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'integrations'
        ordering = ['name']

    def __str__(self):
        return self.name


class Webhook(models.Model):
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='webhooks')
    url = models.URLField()
    secret = models.CharField(max_length=255)
    events = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'webhooks'

    def __str__(self):
        return f"{self.integration.name} - {self.url}"


class APIKey(models.Model):
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=500)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_keys'

    def __str__(self):
        return f"{self.integration.name} - {self.name}"


class OAuthFlow(models.Model):
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='oauth_flows')
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=500)
    authorization_url = models.URLField()
    token_url = models.URLField()
    redirect_uri = models.URLField()
    scope = models.CharField(max_length=500, blank=True)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'oauth_flows'

    def __str__(self):
        return f"{self.integration.name} - OAuth"

