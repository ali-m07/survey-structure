"""Ollama wrapper for LLM interactions."""
import os
import requests
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class OllamaWrapper:
    """Wrapper for Ollama API."""
    
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.default_model = os.getenv("OLLAMA_MODEL", "gemma3")
    
    def list_models(self) -> List[str]:
        """List available models."""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []
    
    def chat(self, prompt: str, model: Optional[str] = None) -> str:
        """Chat with a model."""
        model = model or self.default_model
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            raise
    
    def generate_embedding(self, text: str, model: Optional[str] = None) -> List[float]:
        """Generate embedding for text."""
        model = model or self.default_model
        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": model,
                    "prompt": text
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("embedding", [])
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using LLM."""
        prompt = f"Analyze the sentiment of the following text and return a JSON with 'sentiment' (positive/negative/neutral), 'score' (0-1), and 'emotions' (dict):\n\n{text}"
        response = self.chat(prompt)
        # Parse JSON from response
        import json
        try:
            # Extract JSON from response if it's wrapped in text
            if "{" in response:
                json_start = response.find("{")
                json_end = response.rfind("}") + 1
                return json.loads(response[json_start:json_end])
            return json.loads(response)
        except:
            # Fallback if JSON parsing fails
            return {
                "sentiment": "neutral",
                "score": 0.5,
                "emotions": {}
            }

