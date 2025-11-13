from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.compliance.apis.views import ConsentLogViewSet, DataResidencyConfigViewSet, AuditTrailViewSet

router = DefaultRouter()
router.register(r'consents', ConsentLogViewSet)
router.register(r'data-residency', DataResidencyConfigViewSet)
router.register(r'audit-trails', AuditTrailViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

