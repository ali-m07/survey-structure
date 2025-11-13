from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from app.integrations.models import DirectoryConfiguration, DatabaseConfiguration, SCIMConfiguration
from app.integrations.apis.serializers import (
    DirectoryConfigurationSerializer, 
    DatabaseConfigurationSerializer,
    SCIMConfigurationSerializer
)
from app.integrations.services.user_sync import UserSyncService


class DirectoryConfigurationViewSet(viewsets.ModelViewSet):
    queryset = DirectoryConfiguration.objects.all()
    serializer_class = DirectoryConfigurationSerializer
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync users from directory configuration."""
        config = self.get_object()
        sync_service = UserSyncService()
        
        if config.directory_type in ['AD']:
            count = sync_service.sync_from_ad(config)
        elif config.directory_type in ['LDAP']:
            count = sync_service.sync_from_ldap(config)
        else:
            return Response(
                {'error': f'Sync not supported for {config.directory_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'synced_count': count})


class DatabaseConfigurationViewSet(viewsets.ModelViewSet):
    queryset = DatabaseConfiguration.objects.all()
    serializer_class = DatabaseConfigurationSerializer
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync users from database configuration."""
        config = self.get_object()
        sync_service = UserSyncService()
        count = sync_service.sync_from_database(config)
        return Response({'synced_count': count})


class SCIMConfigurationViewSet(viewsets.ModelViewSet):
    queryset = SCIMConfiguration.objects.all()
    serializer_class = SCIMConfigurationSerializer
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync users from SCIM configuration."""
        config = self.get_object()
        sync_service = UserSyncService()
        count = sync_service.sync_from_scim(
            config.endpoint,
            config.bearer_token,
            config.tenant
        )
        return Response({'synced_count': count})

