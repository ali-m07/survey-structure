from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.integrations.apis.views import (
    DirectoryConfigurationViewSet, 
    DatabaseConfigurationViewSet,
    SCIMConfigurationViewSet
)

router = DefaultRouter()
router.register(r'directories', DirectoryConfigurationViewSet)
router.register(r'databases', DatabaseConfigurationViewSet)
router.register(r'scim', SCIMConfigurationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

