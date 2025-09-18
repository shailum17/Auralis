from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Student Community ML Service",
    description="Privacy-preserving ML service for stress analysis and content safety",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}

@app.post("/api/v1/analyze-text")
async def analyze_text(request: dict):
    """Simple text analysis mock for development"""
    return {
        "sentiment": {"positive": 0.7, "negative": 0.2, "neutral": 0.1},
        "emotion": {"joy": 0.6, "sadness": 0.1, "anger": 0.1, "fear": 0.1, "surprise": 0.1, "disgust": 0.0},
        "toxicity_score": 0.1,
        "stress_indicators": ["exam"] if "exam" in request.get("text", "").lower() else [],
        "safety_flags": [],
        "processing_time_ms": 50.0
    }

@app.post("/api/v1/analyze-behavior")
async def analyze_behavior(request: dict):
    """Simple behavior analysis mock for development"""
    return {
        "activity_score": 0.7,
        "rhythm_changes": {
            "late_night_ratio": 0.2,
            "weekend_ratio": 0.3,
            "consistency_score": 0.8
        },
        "engagement_trend": "stable",
        "anomaly_flags": [],
        "processing_time_ms": 30.0
    }

@app.post("/api/v1/stress-score")
async def calculate_stress_score(request: dict):
    """Simple stress scoring mock for development"""
    return {
        "stress_score": 0.4,
        "confidence": 0.8,
        "contributing_factors": ["Moderate: Negative emotional tone in recent posts"],
        "recommendations": ["Practice mindfulness or relaxation techniques"],
        "processing_time_ms": 40.0
    }

@app.get("/api/v1/model-info")
async def get_model_info():
    """Model info endpoint"""
    return {
        "text_analyzer": {
            "models": ["mock_sentiment", "mock_emotion"],
            "capabilities": ["sentiment", "emotion", "toxicity", "stress_detection"]
        },
        "behavior_analyzer": {
            "features": ["activity_patterns", "rhythm_analysis"],
            "capabilities": ["activity_patterns", "rhythm_analysis", "anomaly_detection"]
        },
        "stress_scorer": {
            "model_type": "mock_transparent_fusion",
            "interpretability": "high",
            "privacy_preserving": True
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main-simple:app",
        host="0.0.0.0",
        port=int(os.getenv("ML_PORT", 8001)),
        reload=True
    )