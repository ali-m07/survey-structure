"""Generative insights service."""
from typing import Dict, Any
import logging
from app.models.ollama_wrapper import OllamaWrapper
import json

logger = logging.getLogger(__name__)


class GenerativeInsightsService:
    """Service for generating AI insights."""
    
    def __init__(self):
        self.ollama = OllamaWrapper()
    
    def generate(self, context: str, data: Dict[str, Any], insight_type: str = "executive_summary") -> Dict[str, Any]:
        """Generate insights from data."""
        try:
            # Format data for prompt
            data_str = json.dumps(data, indent=2)
            
            if insight_type == "executive_summary":
                prompt = f"""Based on the following context and data, generate an executive summary with key insights, findings, and recommendations.

Context: {context}

Data:
{data_str}

Please provide:
1. Key insights (3-5 bullet points)
2. Main findings
3. Actionable recommendations

Format as JSON with keys: insights (string), key_points (list), recommendations (list)"""
            
            elif insight_type == "trend_analysis":
                prompt = f"""Analyze the following data for trends and patterns. Provide insights about trends, anomalies, and predictions.

Context: {context}

Data:
{data_str}

Format as JSON with keys: insights (string), key_points (list), recommendations (list)"""
            
            else:
                prompt = f"""Analyze the following data and provide insights.

Context: {context}

Data:
{data_str}

Format as JSON with keys: insights (string), key_points (list), recommendations (list)"""
            
            response = self.ollama.chat(prompt)
            
            # Parse JSON from response
            try:
                if "{" in response:
                    json_start = response.find("{")
                    json_end = response.rfind("}") + 1
                    result = json.loads(response[json_start:json_end])
                else:
                    result = json.loads(response)
            except:
                # Fallback if JSON parsing fails
                result = {
                    "insights": response,
                    "key_points": response.split("\n")[:5],
                    "recommendations": []
                }
            
            return {
                "insights": result.get("insights", response),
                "key_points": result.get("key_points", []),
                "recommendations": result.get("recommendations", [])
            }
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return {
                "insights": f"Error generating insights: {str(e)}",
                "key_points": [],
                "recommendations": []
            }

