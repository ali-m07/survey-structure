from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.feedback.apis.views import (
    FeedbackItemViewSet, AnonymousChannelViewSet, SentimentScoreViewSet
)

router = DefaultRouter()
router.register(r'feedback-items', FeedbackItemViewSet)
router.register(r'anonymous-channels', AnonymousChannelViewSet)
router.register(r'sentiment-scores', SentimentScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

