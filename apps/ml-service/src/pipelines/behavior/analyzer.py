import asyncio
from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime, timedelta
from utils.logging import get_logger
from utils.validation import validate_user_id, validate_time_window, sanitize_output
from config import settings

logger = get_logger(__name__)

class BehaviorAnalyzer:
    """
    Privacy-preserving behavioral pattern analyzer for stress and wellbeing indicators.
    """
    
    def __init__(self):
        self.analyzer_ready = True
        logger.info("Behavior analyzer initialized")
    
    async def analyze(
        self,
        user_id: str,
        activity_data: Dict[str, Any],
        time_window_days: int = 7
    ) -> Dict[str, Any]:
        """
        Analyze user behavioral patterns for stress and wellbeing indicators.
        
        Args:
            user_id: User identifier (for privacy-safe logging only)
            activity_data: Aggregated activity data
            time_window_days: Analysis time window in days
            
        Returns:
            Behavioral analysis results
        """
        start_time = datetime.now()
        
        try:
            # Validate inputs
            validate_user_id(user_id)
            validate_time_window(time_window_days)
            
            # Extract activity metrics
            activity_score = self._calculate_activity_score(activity_data)
            
            # Analyze rhythm changes
            rhythm_changes = self._analyze_rhythm_changes(activity_data, time_window_days)
            
            # Determine engagement trend
            engagement_trend = self._calculate_engagement_trend(activity_data)
            
            # Detect anomalies
            anomaly_flags = self._detect_anomalies(activity_data, time_window_days)
            
            results = {
                'activity_score': activity_score,
                'rhythm_changes': rhythm_changes,
                'engagement_trend': engagement_trend,
                'anomaly_flags': anomaly_flags,
            }
            
            # Sanitize output
            results = sanitize_output(results)
            
            # Log analysis (privacy-safe)
            logger.info(
                "Behavior analysis completed",
                user_id=user_id[:8] + "..." if user_id else None,
                time_window_days=time_window_days,
                activity_score=activity_score,
                anomaly_count=len(anomaly_flags)
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Behavior analysis failed: {e}", user_id=user_id)
            raise
    
    def _calculate_activity_score(self, activity_data: Dict[str, Any]) -> float:
        """Calculate overall activity score based on user engagement."""
        
        # Extract activity metrics with defaults
        posts_count = activity_data.get('posts_count', 0)
        comments_count = activity_data.get('comments_count', 0)
        reactions_count = activity_data.get('reactions_count', 0)
        messages_count = activity_data.get('messages_count', 0)
        login_frequency = activity_data.get('login_frequency', 0)
        session_duration = activity_data.get('avg_session_duration', 0)
        
        # Weighted activity score
        weights = {
            'posts': 0.3,
            'comments': 0.25,
            'reactions': 0.15,
            'messages': 0.15,
            'logins': 0.1,
            'session_time': 0.05
        }
        
        # Normalize values (assuming reasonable maximums)
        normalized_posts = min(posts_count / 10, 1.0)  # Max 10 posts per week
        normalized_comments = min(comments_count / 20, 1.0)  # Max 20 comments per week
        normalized_reactions = min(reactions_count / 50, 1.0)  # Max 50 reactions per week
        normalized_messages = min(messages_count / 30, 1.0)  # Max 30 messages per week
        normalized_logins = min(login_frequency / 7, 1.0)  # Max daily logins
        normalized_session = min(session_duration / 120, 1.0)  # Max 2 hours avg session
        
        activity_score = (
            weights['posts'] * normalized_posts +
            weights['comments'] * normalized_comments +
            weights['reactions'] * normalized_reactions +
            weights['messages'] * normalized_messages +
            weights['logins'] * normalized_logins +
            weights['session_time'] * normalized_session
        )
        
        return round(activity_score, 3)
    
    def _analyze_rhythm_changes(
        self, 
        activity_data: Dict[str, Any], 
        time_window_days: int
    ) -> Dict[str, float]:
        """Analyze changes in activity rhythms that might indicate stress."""
        
        # Get activity patterns by time of day
        hourly_activity = activity_data.get('hourly_activity', {})
        daily_activity = activity_data.get('daily_activity', {})
        
        # Calculate rhythm metrics
        rhythm_changes = {}
        
        # Late night activity (11 PM - 3 AM)
        late_night_hours = ['23', '0', '1', '2', '3']
        late_night_activity = sum(
            hourly_activity.get(hour, 0) for hour in late_night_hours
        )
        total_activity = sum(hourly_activity.values()) or 1
        rhythm_changes['late_night_ratio'] = round(late_night_activity / total_activity, 3)
        
        # Weekend vs weekday activity
        weekday_activity = sum(
            daily_activity.get(str(day), 0) for day in range(5)  # Mon-Fri
        )
        weekend_activity = sum(
            daily_activity.get(str(day), 0) for day in [5, 6]  # Sat-Sun
        )
        
        if weekday_activity + weekend_activity > 0:
            rhythm_changes['weekend_ratio'] = round(
                weekend_activity / (weekday_activity + weekend_activity), 3
            )
        else:
            rhythm_changes['weekend_ratio'] = 0.0
        
        # Activity consistency (coefficient of variation)
        daily_counts = list(daily_activity.values())
        if daily_counts and len(daily_counts) > 1:
            mean_activity = np.mean(daily_counts)
            std_activity = np.std(daily_counts)
            if mean_activity > 0:
                rhythm_changes['consistency_score'] = round(
                    1 - (std_activity / mean_activity), 3
                )
            else:
                rhythm_changes['consistency_score'] = 1.0
        else:
            rhythm_changes['consistency_score'] = 1.0
        
        return rhythm_changes
    
    def _calculate_engagement_trend(self, activity_data: Dict[str, Any]) -> str:
        """Calculate overall engagement trend."""
        
        # Get recent activity data
        recent_activity = activity_data.get('recent_activity', [])
        
        if len(recent_activity) < 3:
            return 'stable'
        
        # Calculate trend using simple linear regression
        x = np.arange(len(recent_activity))
        y = np.array(recent_activity)
        
        # Calculate slope
        if len(x) > 1:
            slope = np.polyfit(x, y, 1)[0]
            
            # Classify trend
            if slope > 0.1:
                return 'increasing'
            elif slope < -0.1:
                return 'decreasing'
            else:
                return 'stable'
        
        return 'stable'
    
    def _detect_anomalies(
        self, 
        activity_data: Dict[str, Any], 
        time_window_days: int
    ) -> List[str]:
        """Detect behavioral anomalies that might indicate stres
s or wellbeing concerns."""
        
        anomaly_flags = []
        
        # Check for sudden activity drops
        recent_activity = activity_data.get('recent_activity', [])
        if len(recent_activity) >= 3:
            recent_avg = np.mean(recent_activity[-3:])
            overall_avg = np.mean(recent_activity)
            
            if recent_avg < 0.3 * overall_avg and overall_avg > 0:
                anomaly_flags.append('sudden_activity_drop')
        
        # Check for excessive late-night activity
        hourly_activity = activity_data.get('hourly_activity', {})
        late_night_activity = sum(
            hourly_activity.get(hour, 0) for hour in ['23', '0', '1', '2', '3']
        )
        total_activity = sum(hourly_activity.values()) or 1
        
        if late_night_activity / total_activity > 0.4:
            anomaly_flags.append('excessive_late_night_activity')
        
        # Check for social isolation (low interaction)
        messages_count = activity_data.get('messages_count', 0)
        comments_count = activity_data.get('comments_count', 0)
        reactions_count = activity_data.get('reactions_count', 0)
        
        social_activity = messages_count + comments_count + reactions_count
        total_posts = activity_data.get('posts_count', 0)
        
        if total_posts > 5 and social_activity < total_posts * 0.2:
            anomaly_flags.append('low_social_interaction')
        
        # Check for posting frequency spikes
        daily_posts = activity_data.get('daily_posts', [])
        if len(daily_posts) >= 7:
            recent_posts = sum(daily_posts[-3:])  # Last 3 days
            baseline_posts = np.mean(daily_posts[:-3]) if len(daily_posts) > 3 else 0
            
            if recent_posts > 3 * baseline_posts and baseline_posts > 0:
                anomaly_flags.append('posting_frequency_spike')
        
        # Check for session duration changes
        session_durations = activity_data.get('session_durations', [])
        if len(session_durations) >= 5:
            recent_sessions = session_durations[-3:]
            baseline_sessions = session_durations[:-3]
            
            if baseline_sessions:
                recent_avg = np.mean(recent_sessions)
                baseline_avg = np.mean(baseline_sessions)
                
                if recent_avg > 2 * baseline_avg and recent_avg > 60:  # > 1 hour
                    anomaly_flags.append('extended_session_duration')
                elif recent_avg < 0.3 * baseline_avg:
                    anomaly_flags.append('shortened_session_duration')
        
        return anomaly_flags
    
    async def health_check(self) -> bool:
        """Check if the behavior analyzer is healthy."""
        try:
            # Test with sample data
            test_data = {
                'posts_count': 5,
                'comments_count': 10,
                'reactions_count': 15,
                'messages_count': 8,
                'login_frequency': 5,
                'avg_session_duration': 45
            }
            
            test_result = await self.analyze("test-user-id", test_data, 7)
            return (
                self.analyzer_ready and
                'activity_score' in test_result and
                'rhythm_changes' in test_result
            )
        except Exception as e:
            logger.error(f"Behavior analyzer health check failed: {e}")
            return False
    
    def get_feature_info(self) -> Dict[str, Any]:
        """Get information about behavioral features analyzed."""
        return {
            'activity_metrics': [
                'posts_count',
                'comments_count', 
                'reactions_count',
                'messages_count',
                'login_frequency',
                'session_duration'
            ],
            'rhythm_features': [
                'late_night_ratio',
                'weekend_ratio',
                'consistency_score'
            ],
            'anomaly_detection': [
                'sudden_activity_drop',
                'excessive_late_night_activity',
                'low_social_interaction',
                'posting_frequency_spike',
                'session_duration_changes'
            ],
            'privacy_preserving': True,
            'time_windows': [1, 7, 14, 30]
        }