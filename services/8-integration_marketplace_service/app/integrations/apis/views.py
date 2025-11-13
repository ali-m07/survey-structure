from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from app.integrations.models import Integration, Webhook, APIKey, OAuthFlow
from app.integrations.apis.serializers import (
    IntegrationSerializer, WebhookSerializer, APIKeySerializer, OAuthFlowSerializer
)
from app.integrations.services.connector_service import ConnectorService
from app.integrations.services.n8n_connector import N8NConnector


class IntegrationViewSet(viewsets.ModelViewSet):
    queryset = Integration.objects.all()
    serializer_class = IntegrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Integration.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test integration connection."""
        integration = self.get_object()
        connector_service = ConnectorService()
        is_connected = connector_service.test_connection(integration)
        
        return Response({'connected': is_connected})
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync data from integration."""
        integration = self.get_object()
        sync_type = request.data.get('sync_type', 'full')
        
        connector_service = ConnectorService()
        result = connector_service.sync_data(integration, sync_type)
        
        return Response(result)


class WebhookViewSet(viewsets.ModelViewSet):
    queryset = Webhook.objects.all()
    serializer_class = WebhookSerializer
    permission_classes = [IsAuthenticated]


class APIKeyViewSet(viewsets.ModelViewSet):
    queryset = APIKey.objects.all()
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]


class OAuthFlowViewSet(viewsets.ModelViewSet):
    queryset = OAuthFlow.objects.all()
    serializer_class = OAuthFlowSerializer
    permission_classes = [IsAuthenticated]

