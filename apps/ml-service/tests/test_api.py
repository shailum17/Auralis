import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app

client = TestClient(app)

class TestHealthEndpoint:
    def test_health_check(self):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

class TestTextAnalysis:
    @patch('pipelines.nlp.analyzer.TextAnalyzer')
    def test_analyze_text_success(self, mock_analyzer):
        """Test successful text analysis."""
        # Mock the analyzer
        mock_instance = MagicMock()
        mock_analyzer.return_value = mock_instance
        mock_instance.analyze.return_value = {
            "sentiment": {"positive": 0.7, "negative": 0.2, "neutral": 0.1},
            "emotion": {"joy": 0.6, "sadness": 0.1, "anger": 0.1, "fear": 0.1, "surprise": 0.1, "disgust": 0.0},
            "toxicity_score": 0.1,
            "stress_indicators": ["exam"],
            "safety_flags": []
        }
        
        request_data = {
            "text": "I'm feeling good about my upcoming exam!",
            "user_id": "test-user-123"
        }
        
        response = client.post("/api/v1/analyze-text", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "sentiment" in data
        assert "emotion" in data
        assert "toxicity_score" in data
        assert "processing_time_ms" in data

    def test_analyze_text_empty_text(self):
        """Test text analysis with empty text."""
        request_data = {
            "text": "",
            "user_id": "test-user-123"
        }
        
        response = client.post("/api/v1/analyze-text", json=request_data)
        assert response.status_code == 400

    def test_analyze_text_too_long(self):
        """Test text analysis with text that's too long."""
        request_data = {
            "text": "a" * 3000,  # Exceeds max length
            "user_id": "test-user-123"
        }
        
        response = client.post("/api/v1/analyze-text", json=request_data)
        assert response.status_code == 400

class TestBehaviorAnalysis:
    @patch('pipelines.behavior.analyzer.BehaviorAnalyzer')
    def test_analyze_behavior_success(self, mock_analyzer):
        """Test successful behavior analysis."""
        mock_instance = MagicMock()
        mock_analyzer.return_value = mock_instance
        mock_instance.analyze.return_value = {
            "activity_score": 0.7,
            "rhythm_changes": {
                "late_night_ratio": 0.2,
                "weekend_ratio": 0.3,
                "consistency_score": 0.8
            },
            "engagement_trend": "stable",
            "anomaly_flags": []
        }
        
        request_data = {
            "user_id": "test-user-123",
            "activity_data": {
                "posts_count": 5,
                "comments_count": 10,
                "reactions_count": 15,
                "messages_count": 8
            },
            "time_window_days": 7
        }
        
        response = client.post("/api/v1/analyze-behavior", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "activity_score" in data
        assert "rhythm_changes" in data
        assert "engagement_trend" in data
        assert "processing_time_ms" in data

class TestStressScoring:
    @patch('pipelines.fusion.stress_scorer.StressScorer')
    def test_stress_score_success(self, mock_scorer):
        """Test successful stress score calculation."""
        mock_instance = MagicMock()
        mock_scorer.return_value = mock_instance
        mock_instance.calculate_score.return_value = {
            "stress_score": 0.4,
            "confidence": 0.8,
            "contributing_factors": ["Moderate: Negative emotional tone in recent posts"],
            "recommendations": ["Practice mindfulness or relaxation techniques"]
        }
        
        request_data = {
            "user_id": "test-user-123",
            "text_features": {
                "sentiment": {"negative": 0.3, "positive": 0.7},
                "stress_indicators": ["exam"]
            },
            "behavior_features": {
                "activity_score": 0.6,
                "rhythm_changes": {"late_night_ratio": 0.2}
            }
        }
        
        response = client.post("/api/v1/stress-score", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "stress_score" in data
        assert "confidence" in data
        assert "contributing_factors" in data
        assert "recommendations" in data
        assert "processing_time_ms" in data

class TestModelInfo:
    def test_model_info(self):
        """Test model info endpoint."""
        response = client.get("/api/v1/model-info")
        assert response.status_code == 200
        data = response.json()
        assert "text_analyzer" in data
        assert "behavior_analyzer" in data
        assert "stress_scorer" in data

if __name__ == "__main__":
    pytest.main([__file__])