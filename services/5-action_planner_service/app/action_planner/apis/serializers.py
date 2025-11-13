from rest_framework import serializers
from app.action_planner.models import ActionItem, Recommendation, SimulationOutcome


class ActionItemSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = ActionItem
        fields = ['id', 'tenant', 'title', 'description', 'priority', 'status',
                 'assigned_to', 'assigned_to_name', 'due_date', 'created_at',
                 'updated_at', 'completed_at', 'metadata']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RecommendationSerializer(serializers.ModelSerializer):
    action_items = ActionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Recommendation
        fields = ['id', 'tenant', 'source', 'source_id', 'title', 'description',
                 'confidence_score', 'category', 'action_items', 'created_at',
                 'updated_at', 'is_applied']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SimulationOutcomeSerializer(serializers.ModelSerializer):
    recommendation_title = serializers.CharField(source='recommendation.title', read_only=True)
    
    class Meta:
        model = SimulationOutcome
        fields = ['id', 'recommendation', 'recommendation_title', 'scenario',
                 'outcome_data', 'success_probability', 'expected_impact', 'created_at']
        read_only_fields = ['id', 'created_at']

