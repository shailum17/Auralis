import asyncio
from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime
from utils.logging import get_logger
from utils.validation import validate_text_input, sanitize_output
from config import settings

logger = get_logger(__name__)

class TextAnalyzer:
    """
    Privacy-preserving text analyzer for sentiment, emotion, and safety detection.
    """
    
    def __init__(self):
        self.models_loaded = False
        self._load_models()
    
    def _load_models(self):
        """Load or initialize text analysis models."""
        try:
            # In a real implementation, you would load actual models here
            # For now, we'll simulate with rule-based approaches
            
            # Sentiment keywords (simplified approach)
            self.positive_words = {
                'happy', 'joy', 'excited', 'great', 'awesome', 'wonderful',
                'amazing', 'fantastic', 'excellent', 'good', 'love', 'like'
            }
            
            self.negative_words = {
                'sad', 'angry', 'frustrated', 'terrible', 'awful', 'hate',
                'depressed', 'anxious', 'worried', 'stressed', 'bad', 'horrible'
            }
            
            # Stress indicator keywords
            self.stress_indicators = {
                'overwhelmed', 'stressed', 'anxious', 'panic', 'exhausted',
                'burnout', 'pressure', 'deadline', 'exam', 'test', 'finals',
                'assignment', 'project', 'workload', 'sleepless', 'tired'
            }
            
            # Safety flag keywords (simplified)
            self.safety_keywords = {
                'self_harm': {'hurt myself', 'end it all', 'not worth living', 'suicide'},
                'violence': {'kill', 'hurt someone', 'violence', 'fight'},
                'crisis': {'emergency', 'crisis', 'help me', 'desperate'}
            }
            
            # Toxicity keywords
            self.toxic_words = {
                'hate', 'stupid', 'idiot', 'loser', 'worthless', 'pathetic',
                'disgusting', 'terrible person', 'kill yourself'
            }
            
            self.models_loaded = True
            logger.info("Text analysis models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load text analysis models: {e}")
            self.models_loaded = False
    
    async def analyze(
        self, 
        text: str, 
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze text for sentiment, emotion, toxicity, and stress indicators.
        
        Args:
            text: Text to analyze
            user_id: Optional user identifier (for privacy-safe logging)
            context: Optional context information
            
        Returns:
            Analysis results dictionary
        """
        start_time = datetime.now()
        
        try:
            # Validate input
            validate_text_input(text)
            
            # Normalize text
            text_lower = text.lower()
            words = text_lower.split()
            
            # Analyze sentiment
            sentiment = self._analyze_sentiment(words)
            
            # Analyze emotions
            emotion = self._analyze_emotion(words, text_lower)
            
            # Calculate toxicity score
            toxicity_score = self._calculate_toxicity(words)
            
            # Detect stress indicators
            stress_indicators = self._detect_stress_indicators(words, text_lower)
            
            # Check for safety flags
            safety_flags = self._check_safety_flags(text_lower)
            
            results = {
                'sentiment': sentiment,
                'emotion': emotion,
                'toxicity_score': toxicity_score,
                'stress_indicators': stress_indicators,
                'safety_flags': safety_flags,
            }
            
            # Sanitize output
            results = sanitize_output(results)
            
            # Log analysis (privacy-safe)
            logger.info(
                "Text analysis completed",
                user_id=user_id[:8] + "..." if user_id else None,  # Partial ID only
                text_length=len(text),
                toxicity_score=toxicity_score,
                stress_indicators_count=len(stress_indicators),
                safety_flags_count=len(safety_flags)
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Text analysis failed: {e}", user_id=user_id)
            raise
    
    def _analyze_sentiment(self, words: List[str]) -> Dict[str, float]:
        """Analyze sentiment using keyword-based approach."""
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        total_words = len(words)
        
        if total_words == 0:
            return {'positive': 0.5, 'negative': 0.5, 'neutral': 0.0}
        
        positive_score = positive_count / total_words
        negative_score = negative_count / total_words
        neutral_score = max(0, 1 - positive_score - negative_score)
        
        # Normalize scores
        total_score = positive_score + negative_score + neutral_score
        if total_score > 0:
            positive_score /= total_score
            negative_score /= total_score
            neutral_score /= total_score
        
        return {
            'positive': round(positive_score, 3),
            'negative': round(negative_score, 3),
            'neutral': round(neutral_score, 3)
        }
    
    def _analyze_emotion(self, words: List[str], text: str) -> Dict[str, float]:
        """Analyze emotions using keyword-based approach."""
        emotions = {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'delighted'},
            'sadness': {'sad', 'depressed', 'down', 'melancholy', 'gloomy'},
            'anger': {'angry', 'mad', 'furious', 'irritated', 'annoyed'},
            'fear': {'scared', 'afraid', 'terrified', 'anxious', 'worried'},
            'surprise': {'surprised', 'shocked', 'amazed', 'astonished'},
            'disgust': {'disgusted', 'revolted', 'repulsed', 'sickened'}
        }
        
        emotion_scores = {}
        total_words = len(words)
        
        for emotion, keywords in emotions.items():
            count = sum(1 for word in words if word in keywords)
            emotion_scores[emotion] = round(count / max(total_words, 1), 3)
        
        return emotion_scores
    
    def _calculate_toxicity(self, words: List[str]) -> float:
        """Calculate toxicity score based on harmful keywords."""
        toxic_count = sum(1 for word in words if word in self.toxic_words)
        total_words = len(words)
        
        if total_words == 0:
            return 0.0
        
        # Base toxicity score
        base_score = toxic_count / total_words
        
        # Apply sigmoid function to normalize to [0, 1]
        toxicity_score = 1 / (1 + np.exp(-10 * (base_score - 0.1)))
        
        return round(float(toxicity_score), 3)
    
    def _detect_stress_indicators(self, words: List[str], text: str) -> List[str]:
        """Detect stress-related indicators in text."""
        detected_indicators = []
        
        # Check for stress keywords
        for word in words:
            if word in self.stress_indicators:
                detected_indicators.append(word)
        
        # Check for stress patterns
        stress_patterns = [
            'too much work', 'can\'t handle', 'breaking point',
            'so tired', 'no sleep', 'deadline approaching'
        ]
        
        for pattern in stress_patterns:
            if pattern in text:
                detected_indicators.append(pattern.replace(' ', '_'))
        
        return list(set(detected_indicators))  # Remove duplicates
    
    def _check_safety_flags(self, text: str) -> List[str]:
        """Check for safety concerns in text."""
        safety_flags = []
        
        for flag_type, keywords in self.safety_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    safety_flags.append(flag_type)
                    break  # Only add flag once per type
        
        return safety_flags
    
    async def health_check(self) -> bool:
        """Check if the text analyzer is healthy."""
        try:
            # Test with a simple analysis
            test_result = await self.analyze("This is a test message")
            return (
                self.models_loaded and 
                'sentiment' in test_result and 
                'emotion' in test_result
            )
        except Exception as e:
            logger.error(f"Text analyzer health check failed: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models."""
        return {
            'type': 'rule_based',
            'version': '1.0.0',
            'capabilities': [
                'sentiment_analysis',
                'emotion_detection', 
                'toxicity_scoring',
                'stress_indicators',
                'safety_flags'
            ],
            'languages': ['en'],
            'privacy_preserving': True,
            'models_loaded': self.models_loaded
        }