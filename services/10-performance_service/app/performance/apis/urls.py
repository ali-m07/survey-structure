from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.performance.apis.views import (
    ReviewCycleViewSet, GoalViewSet, FeedbackViewSet, GamificationBadgeViewSet
)

router = DefaultRouter()
router.register(r'review-cycles', ReviewCycleViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'feedback', FeedbackViewSet)
router.register(r'badges', GamificationBadgeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

