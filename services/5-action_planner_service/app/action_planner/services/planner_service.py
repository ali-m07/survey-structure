"""Action planner service with AI integration."""
import requests
import os
from typing import List, Dict, Any
from app.action_planner.models import Recommendation, ActionItem
import logging

logger = logging.getLogger(__name__)


class PlannerService:
    """Service for generating action plans from AI insights."""
    
    def __init__(self):
        self.ai_service_url = os.getenv("AI_ML_SERVICE_URL", "http://ai-ml-service:8000")
    
    def generate_actions_from_insight(self, insight_data: Dict[str, Any], tenant) -> List[ActionItem]:
        """Generate action items from AI insight."""
        try:
            # Get AI recommendations
            response = requests.post(
                f"{self.ai_service_url}/api/v1/insights/generate",
                json={
                    "context": insight_data.get("context", ""),
                    "data": insight_data.get("data", {}),
                    "insight_type": "action_plan"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Create action items from recommendations
            action_items = []
            for recommendation_text in data.get("recommendations", []):
                action_item = ActionItem.objects.create(
                    tenant=tenant,
                    title=recommendation_text[:100],
                    description=recommendation_text,
                    priority='medium',
                    status='pending'
                )
                action_items.append(action_item)
            
            return action_items
        except Exception as e:
            logger.error(f"Error generating actions: {e}")
            return []
    
    def create_recommendation(self, source: str, source_id: str, title: str, 
                             description: str, confidence_score: float, 
                             category: str, tenant) -> Recommendation:
        """Create a recommendation."""
        recommendation = Recommendation.objects.create(
            tenant=tenant,
            source=source,
            source_id=source_id,
            title=title,
            description=description,
            confidence_score=confidence_score,
            category=category
        )
        return recommendation
    
    def run_simulation(self, recommendation: Recommendation, scenario: str) -> Dict[str, Any]:
        """Run Monte Carlo simulation for a recommendation."""
        # Simplified simulation - in production, use proper Monte Carlo methods
        import random
        
        success_probability = random.uniform(0.5, 0.9)
        expected_impact = random.choice(['low', 'medium', 'high'])
        
        outcome = {
            "scenario": scenario,
            "success_probability": success_probability,
            "expected_impact": expected_impact,
            "outcome_data": {
                "estimated_completion_time": random.randint(30, 90),
                "resource_requirements": random.randint(1, 5),
                "expected_roi": random.uniform(1.2, 3.0)
            }
        }
        
        return outcome

