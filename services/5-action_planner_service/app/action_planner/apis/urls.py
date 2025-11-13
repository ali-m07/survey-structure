from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.action_planner.apis.views import (
    ActionItemViewSet, RecommendationViewSet, SimulationOutcomeViewSet
)

router = DefaultRouter()
router.register(r'action-items', ActionItemViewSet)
router.register(r'recommendations', RecommendationViewSet)
router.register(r'simulations', SimulationOutcomeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

