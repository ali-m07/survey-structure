from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.sentiment_analysis import SentimentAnalysisService
from app.services.predictive_retention import PredictiveRetentionService
from app.services.clustering import ClusteringService
from app.services.generative_insights import GenerativeInsightsService
from app.models.ollama_wrapper import OllamaWrapper
from app.models.multimodal import MultimodalAIService

router = APIRouter()


class SentimentAnalysisRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class SentimentAnalysisResponse(BaseModel):
    sentiment: str
    score: float
    emotions: Dict[str, float]


class PredictiveRetentionRequest(BaseModel):
    employee_data: Dict[str, Any]
    features: List[str]


class PredictiveRetentionResponse(BaseModel):
    retention_probability: float
    risk_level: str
    recommendations: List[str]


class ClusteringRequest(BaseModel):
    data: List[Dict[str, Any]]
    n_clusters: Optional[int] = 5
    features: List[str]


class ClusteringResponse(BaseModel):
    clusters: List[Dict[str, Any]]
    cluster_centers: List[List[float]]


class GenerativeInsightsRequest(BaseModel):
    context: str
    data: Dict[str, Any]
    insight_type: Optional[str] = "executive_summary"


class GenerativeInsightsResponse(BaseModel):
    insights: str
    key_points: List[str]
    recommendations: List[str]


class MultimodalAnalysisRequest(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None
    analysis_type: str = "combined"


class MultimodalAnalysisResponse(BaseModel):
    text_analysis: Optional[Dict[str, Any]] = None
    image_analysis: Optional[Dict[str, Any]] = None
    combined_insights: Optional[str] = None


@router.post("/sentiment/analyze", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze sentiment of text."""
    try:
        service = SentimentAnalysisService()
        result = service.analyze(request.text, request.language)
        return SentimentAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retention/predict", response_model=PredictiveRetentionResponse)
async def predict_retention(request: PredictiveRetentionRequest):
    """Predict employee retention probability."""
    try:
        service = PredictiveRetentionService()
        result = service.predict(request.employee_data, request.features)
        return PredictiveRetentionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clustering/analyze", response_model=ClusteringResponse)
async def analyze_clusters(request: ClusteringRequest):
    """Perform clustering analysis on data."""
    try:
        service = ClusteringService()
        result = service.cluster(request.data, request.n_clusters, request.features)
        return ClusteringResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/insights/generate", response_model=GenerativeInsightsResponse)
async def generate_insights(request: GenerativeInsightsRequest):
    """Generate AI insights from data."""
    try:
        service = GenerativeInsightsService()
        result = service.generate(request.context, request.data, request.insight_type)
        return GenerativeInsightsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multimodal/analyze", response_model=MultimodalAnalysisResponse)
async def analyze_multimodal(request: MultimodalAnalysisRequest):
    """Analyze text and/or images using multimodal AI."""
    try:
        service = MultimodalAIService()
        result = service.analyze(request.text, request.image_url, request.analysis_type)
        return MultimodalAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/list")
async def list_models():
    """List available AI models."""
    try:
        ollama = OllamaWrapper()
        models = ollama.list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/chat")
async def chat_with_model(prompt: str, model: Optional[str] = "gemma3"):
    """Chat with an AI model."""
    try:
        ollama = OllamaWrapper()
        response = ollama.chat(prompt, model)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

