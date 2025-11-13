from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from app.feedback.models import FeedbackItem, AnonymousChannel, SentimentScore
from app.feedback.apis.serializers import (
    FeedbackItemSerializer, AnonymousChannelSerializer, SentimentScoreSerializer
)
from app.feedback.services.realtime_service import RealtimeService


class FeedbackItemViewSet(viewsets.ModelViewSet):
    queryset = FeedbackItem.objects.all()
    serializer_class = FeedbackItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FeedbackItem.objects.filter(tenant=self.request.user.tenant)
    
    def create(self, request, *args, **kwargs):
        """Create feedback item with sentiment analysis."""
        response = super().create(request, *args, **kwargs)
        feedback_item = FeedbackItem.objects.get(id=response.data['id'])
        
        # Analyze sentiment and route
        realtime_service = RealtimeService()
        routing_result = realtime_service.route_feedback(feedback_item)
        
        return Response({
            **response.data,
            'sentiment': routing_result.get('sentiment'),
            'escalated': routing_result.get('escalated', False)
        })


class AnonymousChannelViewSet(viewsets.ModelViewSet):
    queryset = AnonymousChannel.objects.all()
    serializer_class = AnonymousChannelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AnonymousChannel.objects.filter(tenant=self.request.user.tenant)


class SentimentScoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SentimentScore.objects.all()
    serializer_class = SentimentScoreSerializer
    permission_classes = [IsAuthenticated]

