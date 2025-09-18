from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime

from pipelines.nlp.analyzer import TextAnalyzer
from pipelines.behavior.analyzer import BehaviorAnalyzer
from pipelines.fusion.stress_scorer import StressScorer
from utils.privacy import apply_differential_privacy
from utils.validation import validate_text_input
from config import settings

router = APIRouter()

# Request/Response models
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., max_length=settings.max_text_length)
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class TextAnalysisResponse(BaseModel):
    sentiment: Dict[str, float]
    emotion: Dict[str, float]
    toxicity_score: float
    stress_indicators: List[str]
    safety_flags: List[str]
    processing_time_ms: float

class BehaviorAnalysisRequest(BaseModel):
    user_id: str
    activity_data: Dict[str, Any]
    time_window_days: int = Field(default=7, ge=1, le=30)

class BehaviorAnalysisResponse(BaseModel):
    activity_score: float
    rhythm_changes: Dict[str, float]
    engagement_trend: str
    anomaly_flags: List[str]
    processing_time_ms: float

class StressScoreRequest(BaseModel):
    user_id: str
    text_features: Optional[Dict[str, float]] = None
    behavior_features: Optional[Dict[str, float]] = None

class StressScoreResponse(BaseModel):
    stress_score: float
    confidence: float
    contributing_factors: List[str]
    recommendations: List[str]
    processing_time_ms: float

# Initialize analyzers
text_analyzer = TextAnalyzer()
behavior_analyzer = BehaviorAnalyzer()
stress_scorer = StressScorer()

@router.post("/analyze-text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text content for sentiment, emotion, toxicity, and stress indicators.
    Privacy-preserving: No raw text is stored, only aggregated features.
    """
    start_time = datetime.now()
    
    try:
        # Validate input
        validate_text_input(request.text)
        
        # Perform analysis
        results = await text_analyzer.analyze(
            text=request.text,
            user_id=request.user_id,
            context=request.context
        )
        
        # Apply privacy protection
        if settings.enable_differential_privacy:
            results = apply_differential_privacy(results, settings.privacy_epsilon)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return TextAnalysisResponse(
            sentiment=results["sentiment"],
            emotion=results["emotion"],
            toxicity_score=results["toxicity_score"],
            stress_indicators=results["stress_indicators"],
            safety_flags=results["safety_flags"],
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/analyze-behavior", response_model=BehaviorAnalysisResponse)
async def analyze_behavior(request: BehaviorAnalysisRequest):
    """
    Analyze user behavioral patterns for stress and wellbeing indicators.
    Privacy-preserving: Only aggregated patterns, no individual activity details.
    """
    start_time = datetime.now()
    
    try:
        # Perform behavioral analysis
        results = await behavior_analyzer.analyze(
            user_id=request.user_id,
            activity_data=request.activity_data,
            time_window_days=request.time_window_days
        )
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return BehaviorAnalysisResponse(
            activity_score=results["activity_score"],
            rhythm_changes=results["rhythm_changes"],
            engagement_trend=results["engagement_trend"],
            anomaly_flags=results["anomaly_flags"],
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Behavior analysis failed: {str(e)}")

@router.post("/stress-score", response_model=StressScoreResponse)
async def calculate_stress_score(request: StressScoreRequest):
    """
    Calculate comprehensive stress score from text and behavioral features.
    Uses transparent, interpretable model with clear contributing factors.
    """
    start_time = datetime.now()
    
    try:
        # Calculate stress score
        results = await stress_scorer.calculate_score(
            user_id=request.user_id,
            text_features=request.text_features,
            behavior_features=request.behavior_features
        )
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return StressScoreResponse(
            stress_score=results["stress_score"],
            confidence=results["confidence"],
            contributing_factors=results["contributing_factors"],
            recommendations=results["recommendations"],
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress scoring failed: {str(e)}")

@router.get("/model-info")
async def get_model_info():
    """Get information about loaded models and their capabilities."""
    return {
        "text_analyzer": {
            "models": text_analyzer.get_model_info(),
            "capabilities": ["sentiment", "emotion", "toxicity", "stress_detection"]
        },
        "behavior_analyzer": {
            "features": behavior_analyzer.get_feature_info(),
            "capabilities": ["activity_patterns", "rhythm_analysis", "anomaly_detection"]
        },
        "stress_scorer": {
            "model_type": stress_scorer.get_model_type(),
            "interpretability": "high",
            "privacy_preserving": True
        }
    }

@router.get("/health")
async def health_check():
    """Health check endpoint with model status."""
    try:
        # Quick model health checks
        text_healthy = await text_analyzer.health_check()
        behavior_healthy = await behavior_analyzer.health_check()
        scorer_healthy = await stress_scorer.health_check()
        
        return {
            "status": "healthy" if all([text_healthy, behavior_healthy, scorer_healthy]) else "degraded",
            "models": {
                "text_analyzer": "healthy" if text_healthy else "unhealthy",
                "behavior_analyzer": "healthy" if behavior_healthy else "unhealthy", 
                "stress_scorer": "healthy" if scorer_healthy else "unhealthy"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }