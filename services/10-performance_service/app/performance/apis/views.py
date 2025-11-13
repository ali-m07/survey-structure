from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from app.performance.models import ReviewCycle, Goal, Feedback, GamificationBadge
from app.performance.apis.serializers import (
    ReviewCycleSerializer, GoalSerializer, FeedbackSerializer, GamificationBadgeSerializer
)
from app.performance.services.calibration import CalibrationService


class ReviewCycleViewSet(viewsets.ModelViewSet):
    queryset = ReviewCycle.objects.all()
    serializer_class = ReviewCycleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReviewCycle.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def detect_bias(self, request, pk=None):
        """Detect bias in review cycle."""
        review_cycle = self.get_object()
        calibration_service = CalibrationService()
        result = calibration_service.detect_bias(review_cycle)
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def calibrate(self, request, pk=None):
        """Calibrate ratings in review cycle."""
        review_cycle = self.get_object()
        calibration_service = CalibrationService()
        result = calibration_service.calibrate_ratings(review_cycle)
        return Response(result)


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(tenant=self.request.user.tenant)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Feedback.objects.filter(tenant=self.request.user.tenant)


class GamificationBadgeViewSet(viewsets.ModelViewSet):
    queryset = GamificationBadge.objects.all()
    serializer_class = GamificationBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GamificationBadge.objects.filter(tenant=self.request.user.tenant)

