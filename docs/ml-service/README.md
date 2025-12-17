# ML Service Documentation - Python FastAPI

## Overview

The ML Service is a Python-based FastAPI application that provides machine learning capabilities for the student community platform, including stress analysis, content safety, sentiment analysis, and privacy-preserving AI features.

## Technology Stack

### Core Technologies
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Python 3.11+**: Latest Python features and performance improvements
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: Lightning-fast ASGI server implementation

### Key Libraries & Dependencies

#### Framework & Server
- **fastapi**: Modern web framework for building APIs
- **uvicorn[standard]**: ASGI server with performance optimizations
- **pydantic**: Data validation and settings management
- **pydantic-settings**: Settings management with Pydantic

#### Environment & Configuration
- **python-dotenv**: Environment variable management
- **logging**: Built-in Python logging capabilities

#### Future ML Dependencies (Planned)
- **scikit-learn**: Machine learning library
- **transformers**: Hugging Face transformers for NLP
- **torch**: PyTorch for deep learning
- **numpy**: Numerical computing
- **pandas**: Data manipulation and analysis
- **nltk**: Natural language processing toolkit

## Project Structure

```
apps/ml-service/
├── src/                    # Source code
│   ├── api/               # API routes and endpoints
│   ├── models/            # ML models and algorithms
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── config.py          # Configuration management
│   └── main.py            # Application entry point
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data and fixtures
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── README.md             # Service documentation
```

## Current Implementation

### Application Setup (`src/main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Student Community ML Service",
    description="Privacy-preserving ML service for stress analysis and content safety",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Configuration Management (`src/config.py`)
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server Configuration
    ml_port: int = 8001
    host: str = "0.0.0.0"
    reload: bool = True
    
    # CORS Configuration
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001"
    ]
    
    # ML Configuration
    model_cache_size: int = 100
    max_text_length: int = 5000
    
    # Privacy Configuration
    enable_differential_privacy: bool = True
    privacy_epsilon: float = 1.0
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Planned ML Features

### 1. Stress Analysis
**Purpose**: Analyze text content to detect stress indicators while maintaining privacy.

**Implementation Plan**:
```python
from transformers import pipeline
import torch

class StressAnalyzer:
    def __init__(self):
        self.model = pipeline(
            "text-classification",
            model="mental-health/stress-classifier",
            return_all_scores=True
        )
    
    async def analyze_stress(self, text: str) -> dict:
        """
        Analyze stress levels in text content.
        Returns stress score and confidence level.
        """
        # Preprocess text
        cleaned_text = self.preprocess_text(text)
        
        # Run inference
        results = self.model(cleaned_text)
        
        # Apply differential privacy
        if settings.enable_differential_privacy:
            results = self.apply_privacy_noise(results)
        
        return {
            "stress_score": results[0]["score"],
            "confidence": results[0]["confidence"],
            "indicators": self.extract_indicators(text),
            "recommendations": self.generate_recommendations(results)
        }
```

### 2. Content Safety
**Purpose**: Detect harmful content, toxicity, and inappropriate material.

**Features**:
- Toxicity detection
- Hate speech identification
- Self-harm content detection
- Spam and abuse filtering
- Context-aware moderation

### 3. Sentiment Analysis
**Purpose**: Understand emotional tone and sentiment in community content.

**Features**:
- Multi-class sentiment classification
- Emotion detection (joy, sadness, anger, fear, etc.)
- Sarcasm detection
- Context-aware sentiment analysis

### 4. Wellness Insights
**Purpose**: Provide personalized wellness insights based on user interactions.

**Features**:
- Mood pattern analysis
- Wellness trend detection
- Personalized recommendations
- Crisis intervention triggers
- Progress tracking

## API Endpoints

### Health Check
```
GET /health
```
**Response**:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "version": "1.0.0",
  "timestamp": "2023-12-17T10:00:00Z"
}
```

### Stress Analysis (Planned)
```
POST /api/v1/analyze/stress
```
**Request**:
```json
{
  "text": "I'm feeling overwhelmed with all these assignments...",
  "user_id": "optional-for-personalization",
  "context": "post" // post, comment, message
}
```
**Response**:
```json
{
  "stress_score": 0.75,
  "confidence": 0.89,
  "level": "moderate",
  "indicators": [
    "overwhelmed",
    "assignments",
    "pressure"
  ],
  "recommendations": [
    "Consider taking breaks between study sessions",
    "Reach out to academic support services"
  ],
  "privacy_preserved": true
}
```

### Content Safety (Planned)
```
POST /api/v1/analyze/safety
```
**Request**:
```json
{
  "content": "Text content to analyze",
  "content_type": "post", // post, comment, message
  "check_types": ["toxicity", "hate_speech", "self_harm"]
}
```
**Response**:
```json
{
  "is_safe": true,
  "safety_score": 0.95,
  "flags": [],
  "recommendations": {
    "action": "approve",
    "confidence": 0.95
  }
}
```

### Sentiment Analysis (Planned)
```
POST /api/v1/analyze/sentiment
```
**Request**:
```json
{
  "text": "I'm really excited about this new project!",
  "include_emotions": true
}
```
**Response**:
```json
{
  "sentiment": "positive",
  "score": 0.85,
  "emotions": {
    "joy": 0.8,
    "excitement": 0.7,
    "confidence": 0.3
  },
  "confidence": 0.92
}
```

## Privacy & Ethics

### Privacy-Preserving Techniques

#### 1. Differential Privacy
```python
import numpy as np

class DifferentialPrivacy:
    def __init__(self, epsilon: float = 1.0):
        self.epsilon = epsilon
    
    def add_noise(self, value: float, sensitivity: float = 1.0) -> float:
        """Add Laplace noise for differential privacy"""
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale)
        return value + noise
```

#### 2. Data Minimization
- Only process necessary text content
- Remove personally identifiable information
- Limit data retention periods
- Implement secure data deletion

#### 3. Federated Learning (Future)
- Train models without centralizing data
- Preserve user privacy during model updates
- Implement secure aggregation protocols

### Ethical AI Principles

#### 1. Transparency
- Explainable AI models
- Clear confidence scores
- Model decision reasoning
- Bias detection and mitigation

#### 2. Non-Diagnostic Approach
- Supportive insights, not medical diagnosis
- Clear disclaimers about limitations
- Encourage professional help when needed
- Avoid overconfident predictions

#### 3. User Control
- Opt-out mechanisms for all ML features
- Granular privacy controls
- Data deletion capabilities
- Consent management

## Model Management

### Model Loading and Caching
```python
from functools import lru_cache
import torch

class ModelManager:
    def __init__(self):
        self.models = {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    @lru_cache(maxsize=settings.model_cache_size)
    def load_model(self, model_name: str):
        """Load and cache ML models"""
        if model_name not in self.models:
            model = self._download_model(model_name)
            model.to(self.device)
            self.models[model_name] = model
        return self.models[model_name]
```

### Model Versioning
- Semantic versioning for model releases
- A/B testing for model improvements
- Rollback capabilities for problematic models
- Performance monitoring and alerting

## Development Setup

### Prerequisites
```bash
# Python 3.11+
python --version

# Virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

### Installation
```bash
cd apps/ml-service

# Install dependencies
pip install -r requirements.txt

# Install development dependencies (future)
pip install -r requirements-dev.txt
```

### Running the Service
```bash
# Development mode with hot reload
python src/main.py

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8001

# With specific configuration
uvicorn src.main:app --host 0.0.0.0 --port 8001 --workers 4
```

## Testing

### Test Structure
```
tests/
├── unit/                  # Unit tests
│   ├── test_models.py     # Model testing
│   ├── test_services.py   # Service testing
│   └── test_utils.py      # Utility testing
├── integration/           # Integration tests
│   ├── test_api.py        # API endpoint testing
│   └── test_ml_pipeline.py # ML pipeline testing
├── fixtures/              # Test data
│   ├── sample_texts.json  # Sample text data
│   └── expected_results.json # Expected ML results
└── conftest.py           # Test configuration
```

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/unit/test_models.py

# Run with verbose output
pytest -v
```

### Test Examples
```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_stress_analysis():
    # Test stress analysis endpoint
    response = client.post("/api/v1/analyze/stress", json={
        "text": "I'm feeling very stressed about exams"
    })
    assert response.status_code == 200
    data = response.json()
    assert "stress_score" in data
    assert 0 <= data["stress_score"] <= 1
```

## Performance Optimization

### Model Optimization
- Model quantization for faster inference
- ONNX runtime for optimized execution
- Batch processing for multiple requests
- GPU acceleration when available

### Caching Strategy
- Model result caching
- Preprocessing result caching
- Redis integration for distributed caching
- Cache invalidation strategies

### Monitoring
```python
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        
        # Log performance metrics
        logger.info(f"{func.__name__} took {end_time - start_time:.2f}s")
        return result
    return wrapper
```

## Deployment

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Expose port
EXPOSE 8001

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Environment Configuration
```env
# Server Configuration
ML_PORT=8001
HOST=0.0.0.0
RELOAD=false

# Model Configuration
MODEL_CACHE_SIZE=100
MAX_TEXT_LENGTH=5000

# Privacy Configuration
ENABLE_DIFFERENTIAL_PRIVACY=true
PRIVACY_EPSILON=1.0

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# External Services
API_SERVICE_URL=http://localhost:3001
```

### Production Deployment
```bash
# Build Docker image
docker build -t ml-service .

# Run container
docker run -p 8001:8001 --env-file .env ml-service

# With docker-compose
docker-compose up ml-service
```

## Security Considerations

### Input Validation
- Text length limits
- Content sanitization
- Rate limiting per user
- Request size limits

### Model Security
- Model integrity verification
- Secure model storage
- Access control for model updates
- Audit logging for model usage

### Data Protection
- No persistent storage of user data
- Secure communication with API service
- Encryption for sensitive model parameters
- Regular security audits

## Future Enhancements

### Advanced ML Features
- Multi-modal analysis (text + images)
- Real-time streaming analysis
- Personalized model adaptation
- Cross-lingual support

### Infrastructure Improvements
- Kubernetes deployment
- Auto-scaling based on load
- Model serving optimization
- Distributed model inference

### Research Integration
- Latest NLP model integration
- Custom model training pipelines
- Research collaboration features
- Academic paper implementation