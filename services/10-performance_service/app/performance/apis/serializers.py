from rest_framework import serializers
from app.performance.models import ReviewCycle, Goal, Feedback, GamificationBadge


class ReviewCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewCycle
        fields = ['id', 'tenant', 'name', 'description', 'status', 'start_date',
                 'end_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    def get_progress_percentage(self, obj):
        if obj.target_value:
            return (obj.current_value / obj.target_value) * 100
        return 0
    
    class Meta:
        model = Goal
        fields = ['id', 'tenant', 'employee', 'employee_name', 'title', 'description',
                 'target_value', 'current_value', 'progress_percentage', 'due_date',
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeedbackSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'tenant', 'review_cycle', 'employee', 'employee_name',
                 'reviewer', 'reviewer_name', 'rating', 'comments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GamificationBadgeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    
    class Meta:
        model = GamificationBadge
        fields = ['id', 'tenant', 'employee', 'employee_name', 'badge_type',
                 'badge_name', 'description', 'earned_at', 'metadata']
        read_only_fields = ['id', 'earned_at']

