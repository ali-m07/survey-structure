"""Real-time feedback service."""
import requests
import os
from typing import Dict, Any, List
from app.feedback.models import FeedbackItem, SentimentScore
from app.feedback.models import AnonymousChannel
import logging

logger = logging.getLogger(__name__)


class RealtimeService:
    """Service for real-time feedback processing."""
    
    def __init__(self):
        self.ai_service_url = os.getenv("AI_ML_SERVICE_URL", "http://ai-ml-service:8000")
        self.n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook")
    
    def analyze_sentiment(self, feedback_text: str) -> Dict[str, Any]:
        """Analyze sentiment of feedback."""
        try:
            response = requests.post(
                f"{self.ai_service_url}/api/v1/sentiment/analyze",
                json={"text": feedback_text, "language": "en"},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                "sentiment": "neutral",
                "score": 0.5,
                "emotions": {}
            }
    
    def route_feedback(self, feedback_item: FeedbackItem) -> Dict[str, Any]:
        """Route feedback based on sentiment."""
        sentiment_result = self.analyze_sentiment(feedback_item.feedback_text)
        
        # Update feedback item with sentiment
        feedback_item.sentiment_score = sentiment_result.get("score", 0.5)
        feedback_item.save()
        
        # Create sentiment score record
        sentiment_score = SentimentScore.objects.create(
            feedback_item=feedback_item,
            positive_score=sentiment_result.get("emotions", {}).get("joy", 0.0),
            negative_score=sentiment_result.get("emotions", {}).get("sadness", 0.0),
            neutral_score=1.0 - (sentiment_result.get("emotions", {}).get("joy", 0.0) + 
                                sentiment_result.get("emotions", {}).get("sadness", 0.0)),
            overall_sentiment=sentiment_result.get("sentiment", "neutral")
        )
        
        # Auto-escalate if negative sentiment
        if sentiment_result.get("sentiment") == "negative" and sentiment_result.get("score", 0.5) < 0.3:
            self._escalate_feedback(feedback_item)
        
        return {
            "sentiment": sentiment_result,
            "routed": True,
            "escalated": sentiment_result.get("sentiment") == "negative"
        }
    
    def _escalate_feedback(self, feedback_item: FeedbackItem):
        """Escalate negative feedback via n8n."""
        try:
            requests.post(
                f"{self.n8n_webhook_url}/feedback-escalation",
                json={
                    "feedback_id": str(feedback_item.id),
                    "target_user_id": str(feedback_item.target_user.id),
                    "sentiment": "negative",
                    "feedback_text": feedback_item.feedback_text[:500]
                },
                timeout=10
            )
            logger.info(f"Feedback {feedback_item.id} escalated")
        except Exception as e:
            logger.error(f"Failed to escalate feedback: {e}")

