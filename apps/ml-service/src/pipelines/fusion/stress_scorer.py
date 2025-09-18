import asyncio
from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime
from utils.logging import get_logger
from utils.validation import validate_user_id, sanitize_output
from config import settings

logger = get_logger(__name__)

class StressScorer:
    """
    Privacy-preserving stress scoring system that combines text and behavioral features.
    Uses transparent, interpretable models with clear contributing factors.
    """
    
    def __init__(self):
        self.model_ready = True
        self.feature_weights = self._initialize_feature_weights()
        self.thresholds = {
            'low': settings.stress_threshold_medium,
            'medium': settings.stress_threshold_high,
            'high': 1.0
        }
        logger.info("Stress scorer initialized")
    
    def _initialize_feature_weights(self) -> Dict[str, float]:
        """Initialize feature weights for transparent stress scoring."""
        return {
            # Text-based features
            'negative_sentiment': 0.15,
            'stress_keywords': 0.20,
            'safety_flags': 0.25,
            'emotional_distress': 0.10,
            
            # Behavioral features
            'activity_drop': 0.12,
            'late_night_activity': 0.08,
            'social_isolation': 0.10,
            
            # Combined indicators
            'consistency_disruption': 0.05,
            'engagement_decline': 0.05
        }
    
    async def calculate_score(
        self,
        user_id: str,
        text_features: Optional[Dict[str, float]] = None,
        behavior_features: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive stress score from available features.
        
        Args:
            user_id: User identifier (for privacy-safe logging)
            text_features: Text analysis features
            behavior_features: Behavioral analysis features
            
        Returns:
            Stress scoring results with interpretability
        """
        start_time = datetime.now()
        
        try:
            # Validate inputs
            validate_user_id(user_id)
            
            if not text_features and not behavior_features:
                raise ValueError("At least one feature set must be provided")
            
            # Extract and normalize features
            normalized_features = self._extract_and_normalize_features(
                text_features or {}, 
                behavior_features or {}
            )
            
            # Calculate weighted stress score
            stress_score = self._calculate_weighted_score(normalized_features)
            
            # Calculate confidence based on available features
            confidence = self._calculate_confidence(text_features, behavior_features)
            
            # Identify contributing factors
            contributing_factors = self._identify_contributing_factors(
                normalized_features, stress_score
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                stress_score, contributing_factors
            )
            
            results = {
                'stress_score': round(stress_score, 3),
                'confidence': round(confidence, 3),
                'contributing_factors': contributing_factors,
                'recommendations': recommendations,
            }
            
            # Sanitize output
            results = sanitize_output(results)
            
            # Log scoring (privacy-safe)
            logger.info(
                "Stress score calculated",
                user_id=user_id[:8] + "..." if user_id else None,
                stress_score=stress_score,
                confidence=confidence,
                factors_count=len(contributing_factors)
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Stress scoring failed: {e}", user_id=user_id)
            raise
    
    def _extract_and_normalize_features(
        self, 
        text_features: Dict[str, float], 
        behavior_features: Dict[str, float]
    ) -> Dict[str, float]:
        """Extract and normalize features for scoring."""
        
        normalized = {}
        
        # Text-based features
        if text_features:
            # Negative sentiment
            sentiment = text_features.get('sentiment', {})
            normalized['negative_sentiment'] = sentiment.get('negative', 0.0)
            
            # Stress indicators
            stress_indicators_count = len(text_features.get('stress_indicators', []))
            normalized['stress_keywords'] = min(stress_indicators_count / 5.0, 1.0)
            
            # Safety flags (high weight)
            safety_flags_count = len(text_features.get('safety_flags', []))
            normalized['safety_flags'] = min(safety_flags_count / 2.0, 1.0)
            
            # Emotional distress (sadness, fear, anger)
            emotions = text_features.get('emotion', {})
            distress_emotions = ['sadness', 'fear', 'anger']
            emotional_distress = sum(emotions.get(emotion, 0) for emotion in distress_emotions)
            normalized['emotional_distress'] = min(emotional_distress, 1.0)
        
        # Behavioral features
        if behavior_features:
            # Activity drop
            activity_score = behavior_features.get('activity_score', 0.5)
            normalized['activity_drop'] = max(0, 1 - activity_score)
            
            # Late night activity
            rhythm_changes = behavior_features.get('rhythm_changes', {})
            late_night_ratio = rhythm_changes.get('late_night_ratio', 0.0)
            normalized['late_night_activity'] = min(late_night_ratio * 2, 1.0)
            
            # Social isolation
            anomaly_flags = behavior_features.get('anomaly_flags', [])
            has_isolation = 'low_social_interaction' in anomaly_flags
            normalized['social_isolation'] = 1.0 if has_isolation else 0.0
            
            # Consistency disruption
            consistency_score = rhythm_changes.get('consistency_score', 1.0)
            normalized['consistency_disruption'] = max(0, 1 - consistency_score)
            
            # Engagement decline
            engagement_trend = behavior_features.get('engagement_trend', 'stable')
            normalized['engagement_decline'] = 1.0 if engagement_trend == 'decreasing' else 0.0
        
        return normalized
    
    def _calculate_weighted_score(self, features: Dict[str, float]) -> float:
        """Calculate weighted stress score using transparent formula."""
        
        total_score = 0.0
        total_weight = 0.0
        
        for feature_name, value in features.items():
            if feature_name in self.feature_weights:
                weight = self.feature_weights[feature_name]
                total_score += weight * value
                total_weight += weight
        
        # Normalize by total weight used
        if total_weight > 0:
            stress_score = total_score / total_weight
        else:
            stress_score = 0.0
        
        # Apply sigmoid function for smooth scaling
        stress_score = 1 / (1 + np.exp(-5 * (stress_score - 0.5)))
        
        return min(max(stress_score, 0.0), 1.0)
    
    def _calculate_confidence(
        self, 
        text_features: Optional[Dict], 
        behavior_features: Optional[Dict]
    ) -> float:
        """Calculate confidence based on available feature completeness."""
        
        confidence_factors = []
        
        # Text features confidence
        if text_features:
            text_completeness = 0.0
            expected_text_features = ['sentiment', 'emotion', 'stress_indicators', 'safety_flags']
            
            for feature in expected_text_features:
                if feature in text_features:
                    text_completeness += 0.25
            
            confidence_factors.append(text_completeness)
        
        # Behavioral features confidence
        if behavior_features:
            behavior_completeness = 0.0
            expected_behavior_features = ['activity_score', 'rhythm_changes', 'anomaly_flags']
            
            for feature in expected_behavior_features:
                if feature in behavior_features:
                    behavior_completeness += 0.33
            
            confidence_factors.append(behavior_completeness)
        
        # Overall confidence
        if confidence_factors:
            base_confidence = np.mean(confidence_factors)
            
            # Boost confidence if we have both types of features
            if len(confidence_factors) == 2:
                base_confidence = min(base_confidence * 1.2, 1.0)
            
            return base_confidence
        
        return 0.0
    
    def _identify_contributing_factors(
        self, 
        features: Dict[str, float], 
        stress_score: float
    ) -> List[str]:
        """Identify the main factors contributing to the stress score."""
        
        contributing_factors = []
        
        # Sort features by their contribution to the score
        feature_contributions = []
        for feature_name, value in features.items():
            if feature_name in self.feature_weights and value > 0.1:
                weight = self.feature_weights[feature_name]
                contribution = weight * value
                feature_contributions.append((feature_name, contribution, value))
        
        # Sort by contribution
        feature_contributions.sort(key=lambda x: x[1], reverse=True)
        
        # Take top contributing factors
        for feature_name, contribution, value in feature_contributions[:5]:
            if contribution > 0.05:  # Minimum threshold for inclusion
                # Convert feature names to human-readable descriptions
                factor_description = self._get_factor_description(feature_name, value)
                contributing_factors.append(factor_description)
        
        return contributing_factors
    
    def _get_factor_description(self, feature_name: str, value: float) -> str:
        """Convert feature names to human-readable descriptions."""
        
        descriptions = {
            'negative_sentiment': 'Negative emotional tone in recent posts',
            'stress_keywords': 'Frequent use of stress-related language',
            'safety_flags': 'Content indicating potential crisis or distress',
            'emotional_distress': 'Expression of sadness, fear, or anger',
            'activity_drop': 'Significant decrease in platform engagement',
            'late_night_activity': 'Increased activity during late night hours',
            'social_isolation': 'Reduced interaction with other users',
            'consistency_disruption': 'Irregular activity patterns',
            'engagement_decline': 'Declining participation in community activities'
        }
        
        base_description = descriptions.get(feature_name, feature_name)
        
        # Add intensity qualifier based on value
        if value > 0.8:
            return f"High: {base_description}"
        elif value > 0.5:
            return f"Moderate: {base_description}"
        else:
            return f"Mild: {base_description}"
    
    def _generate_recommendations(
        self, 
        stress_score: float, 
        contributing_factors: List[str]
    ) -> List[str]:
        """Generate personalized recommendations based on stress indicators."""
        
        recommendations = []
        
        # Base recommendations by stress level
        if stress_score > self.thresholds['medium']:
            recommendations.extend([
                "Consider reaching out to a counselor or trusted friend",
                "Explore stress management resources in the wellness section",
                "Take regular breaks from academic work"
            ])
        elif stress_score > self.thresholds['low']:
            recommendations.extend([
                "Practice mindfulness or relaxation techniques",
                "Maintain regular sleep and exercise routines",
                "Connect with supportive community members"
            ])
        else:
            recommendations.extend([
                "Keep up the great work managing your wellbeing",
                "Continue engaging with the supportive community"
            ])
        
        # Factor-specific recommendations
        factor_keywords = ' '.join(contributing_factors).lower()
        
        if 'late night' in factor_keywords:
            recommendations.append("Consider establishing a regular sleep schedule")
        
        if 'social isolation' in factor_keywords or 'interaction' in factor_keywords:
            recommendations.append("Try participating in group discussions or study groups")
        
        if 'negative' in factor_keywords or 'distress' in factor_keywords:
            recommendations.append("Consider journaling or talking to someone about your feelings")
        
        if 'activity drop' in factor_keywords:
            recommendations.append("Gentle re-engagement with activities you enjoy might help")
        
        # Remove duplicates and limit to top 5
        recommendations = list(dict.fromkeys(recommendations))[:5]
        
        return recommendations
    
    async def health_check(self) -> bool:
        """Check if the stress scorer is healthy."""
        try:
            # Test with sample features
            test_text_features = {
                'sentiment': {'negative': 0.3, 'positive': 0.7},
                'emotion': {'sadness': 0.2, 'joy': 0.8},
                'stress_indicators': ['exam'],
                'safety_flags': []
            }
            
            test_behavior_features = {
                'activity_score': 0.6,
                'rhythm_changes': {'late_night_ratio': 0.2},
                'anomaly_flags': []
            }
            
            test_result = await self.calculate_score(
                "test-user-id", 
                test_text_features, 
                test_behavior_features
            )
            
            return (
                self.model_ready and
                'stress_score' in test_result and
                'confidence' in test_result and
                0 <= test_result['stress_score'] <= 1
            )
        except Exception as e:
            logger.error(f"Stress scorer health check failed: {e}")
            return False
    
    def get_model_type(self) -> str:
        """Get model type information."""
        return "transparent_weighted_fusion"
    
    def get_feature_weights(self) -> Dict[str, float]:
        """Get current feature weights for transparency."""
        return self.feature_weights.copy()
    
    def get_thresholds(self) -> Dict[str, float]:
        """Get stress level thresholds."""
        return self.thresholds.copy()