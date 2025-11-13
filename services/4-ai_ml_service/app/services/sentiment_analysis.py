"""Sentiment analysis service."""
from typing import Dict, Any
import logging
from app.models.ollama_wrapper import OllamaWrapper
import re
import json

logger = logging.getLogger(__name__)


class SentimentAnalysisService:
    """Service for sentiment analysis."""
    
    def __init__(self):
        self.ollama = OllamaWrapper()
    
    def analyze(self, text: str, language: str = "en") -> Dict[str, Any]:
        """Analyze sentiment of text."""
        try:
            # Use Ollama for advanced sentiment analysis
            result = self.ollama.analyze_sentiment(text)
            
            # Fallback to simple rule-based analysis if LLM fails
            if not result or "error" in result:
                result = self._rule_based_analysis(text)
            
            return {
                "sentiment": result.get("sentiment", "neutral"),
                "score": result.get("score", 0.5),
                "emotions": result.get("emotions", {})
            }
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return self._rule_based_analysis(text)
    
    def _rule_based_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback rule-based sentiment analysis."""
        text_lower = text.lower()
        
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "happy", "satisfied", "love", "like"]
        negative_words = ["bad", "terrible", "awful", "horrible", "hate", "disappointed", "angry", "frustrated", "sad"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = min(0.5 + (positive_count - negative_count) * 0.1, 1.0)
        elif negative_count > positive_count:
            sentiment = "negative"
            score = max(0.5 - (negative_count - positive_count) * 0.1, 0.0)
        else:
            sentiment = "neutral"
            score = 0.5
        
        return {
            "sentiment": sentiment,
            "score": score,
            "emotions": {
                "joy": positive_count * 0.1,
                "sadness": negative_count * 0.1
            }
        }

