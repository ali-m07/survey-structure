from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.integrations.apis.views import (
    IntegrationViewSet, WebhookViewSet, APIKeyViewSet, OAuthFlowViewSet
)

router = DefaultRouter()
router.register(r'integrations', IntegrationViewSet)
router.register(r'webhooks', WebhookViewSet)
router.register(r'api-keys', APIKeyViewSet)
router.register(r'oauth-flows', OAuthFlowViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

