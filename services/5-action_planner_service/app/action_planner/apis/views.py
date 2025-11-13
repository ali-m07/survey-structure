from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from app.action_planner.models import ActionItem, Recommendation, SimulationOutcome
from app.action_planner.apis.serializers import (
    ActionItemSerializer, RecommendationSerializer, SimulationOutcomeSerializer
)
from app.action_planner.services.planner_service import PlannerService


class ActionItemViewSet(viewsets.ModelViewSet):
    queryset = ActionItem.objects.all()
    serializer_class = ActionItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ActionItem.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark action item as completed."""
        action_item = self.get_object()
        action_item.status = 'completed'
        action_item.save()
        return Response({'status': 'completed'})


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Recommendation.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def generate_actions(self, request, pk=None):
        """Generate action items from recommendation."""
        recommendation = self.get_object()
        planner_service = PlannerService()
        
        # Create action items
        action_items = planner_service.generate_actions_from_insight(
            {
                "context": recommendation.description,
                "data": {"recommendation_id": str(recommendation.id)}
            },
            recommendation.tenant
        )
        
        # Link action items to recommendation
        recommendation.action_items.set(action_items)
        
        serializer = ActionItemSerializer(action_items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def simulate(self, request, pk=None):
        """Run simulation for recommendation."""
        recommendation = self.get_object()
        scenario = request.data.get('scenario', 'default')
        
        planner_service = PlannerService()
        outcome_data = planner_service.run_simulation(recommendation, scenario)
        
        simulation = SimulationOutcome.objects.create(
            recommendation=recommendation,
            scenario=scenario,
            outcome_data=outcome_data.get("outcome_data", {}),
            success_probability=outcome_data.get("success_probability", 0.0),
            expected_impact=outcome_data.get("expected_impact", "medium")
        )
        
        serializer = SimulationOutcomeSerializer(simulation)
        return Response(serializer.data)


class SimulationOutcomeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SimulationOutcome.objects.all()
    serializer_class = SimulationOutcomeSerializer
    permission_classes = [IsAuthenticated]

