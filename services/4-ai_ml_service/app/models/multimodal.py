"""Multimodal AI service for text and image analysis."""
import os
import requests
from typing import Optional, Dict, Any
import logging
import base64
from PIL import Image
import io

logger = logging.getLogger(__name__)


class MultimodalAIService:
    """Service for multimodal AI analysis (text + images)."""
    
    def __init__(self):
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
    
    def analyze(self, text: Optional[str] = None, image_url: Optional[str] = None, analysis_type: str = "combined") -> Dict[str, Any]:
        """Analyze text and/or images."""
        result = {
            "text_analysis": None,
            "image_analysis": None,
            "combined_insights": None
        }
        
        if text:
            result["text_analysis"] = self._analyze_text(text)
        
        if image_url:
            result["image_analysis"] = self._analyze_image(image_url)
        
        if analysis_type == "combined" and text and image_url:
            result["combined_insights"] = self._generate_combined_insights(text, image_url)
        
        return result
    
    def _analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze text content."""
        try:
            # Use Ollama for text analysis
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": "gemma3",
                    "prompt": f"Analyze the following text and provide: key themes, sentiment, and main points:\n\n{text}",
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return {
                "analysis": data.get("response", ""),
                "type": "text"
            }
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return {"error": str(e)}
    
    def _analyze_image(self, image_url: str) -> Dict[str, Any]:
        """Analyze image content."""
        try:
            # Download image
            img_response = requests.get(image_url)
            img_response.raise_for_status()
            image_data = img_response.content
            
            # Convert to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Use Ollama with vision model if available, or use OpenAI
            if self.openai_api_key:
                return self._analyze_image_openai(image_base64)
            else:
                # Fallback to basic image analysis
                return {
                    "analysis": "Image analysis requires OpenAI API key or vision-capable model",
                    "type": "image",
                    "size": len(image_data)
                }
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {"error": str(e)}
    
    def _analyze_image_openai(self, image_base64: str) -> Dict[str, Any]:
        """Analyze image using OpenAI Vision API."""
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4-vision-preview",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Analyze this image and describe its content, key elements, and any relevant insights."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 300
                }
            )
            response.raise_for_status()
            data = response.json()
            return {
                "analysis": data["choices"][0]["message"]["content"],
                "type": "image",
                "model": "gpt-4-vision"
            }
        except Exception as e:
            logger.error(f"Error with OpenAI image analysis: {e}")
            return {"error": str(e)}
    
    def _generate_combined_insights(self, text: str, image_url: str) -> str:
        """Generate combined insights from text and image."""
        try:
            text_analysis = self._analyze_text(text)
            image_analysis = self._analyze_image(image_url)
            
            prompt = f"Based on the following text analysis and image analysis, provide combined insights:\n\nText Analysis: {text_analysis.get('analysis', '')}\n\nImage Analysis: {image_analysis.get('analysis', '')}\n\nProvide key insights that combine both sources:"
            
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": "gemma3",
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            logger.error(f"Error generating combined insights: {e}")
            return f"Error generating combined insights: {str(e)}"

