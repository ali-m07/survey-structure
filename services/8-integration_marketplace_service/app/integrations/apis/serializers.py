from rest_framework import serializers
from app.integrations.models import Integration, Webhook, APIKey, OAuthFlow


class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = ['id', 'tenant', 'name', 'integration_type', 'description',
                 'config', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'integration', 'url', 'secret', 'events', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {'secret': {'write_only': True}}


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'integration', 'name', 'key', 'expires_at', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {'key': {'write_only': True}}


class OAuthFlowSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthFlow
        fields = ['id', 'integration', 'client_id', 'authorization_url', 'token_url',
                 'redirect_uri', 'scope', 'expires_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'client_secret': {'write_only': True},
            'access_token': {'write_only': True},
            'refresh_token': {'write_only': True}
        }

