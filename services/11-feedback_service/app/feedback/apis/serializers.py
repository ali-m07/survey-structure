from rest_framework import serializers
from app.feedback.models import FeedbackItem, AnonymousChannel, SentimentScore


class FeedbackItemSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True, allow_null=True)
    target_user_name = serializers.CharField(source='target_user.get_full_name', read_only=True)
    
    class Meta:
        model = FeedbackItem
        fields = ['id', 'tenant', 'submitted_by', 'submitted_by_name', 'target_user',
                 'target_user_name', 'feedback_text', 'is_anonymous', 'sentiment_score',
                 'category', 'created_at', 'updated_at', 'metadata']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sentiment_score']


class AnonymousChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymousChannel
        fields = ['id', 'tenant', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class SentimentScoreSerializer(serializers.ModelSerializer):
    feedback_text = serializers.CharField(source='feedback_item.feedback_text', read_only=True)
    
    class Meta:
        model = SentimentScore
        fields = ['id', 'feedback_item', 'feedback_text', 'positive_score',
                 'negative_score', 'neutral_score', 'overall_sentiment', 'analyzed_at']
        read_only_fields = ['id', 'analyzed_at']

