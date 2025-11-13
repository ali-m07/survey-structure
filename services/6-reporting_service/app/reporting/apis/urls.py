from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.reporting.apis.views import (
    ReportViewSet, DashboardViewSet, InteractiveWidgetViewSet
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'dashboards', DashboardViewSet)
router.register(r'widgets', InteractiveWidgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

