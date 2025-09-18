import numpy as np
from typing import Dict, Any, Union
from config import settings

def apply_differential_privacy(
    data: Dict[str, Any], 
    epsilon: float = None
) -> Dict[str, Any]:
    """
    Apply differential privacy to analysis results.
    
    Args:
        data: Dictionary containing analysis results
        epsilon: Privacy parameter (smaller = more private)
    
    Returns:
        Privacy-protected data with added noise
    """
    if epsilon is None:
        epsilon = settings.privacy_epsilon
    
    # Create a copy to avoid modifying original data
    protected_data = data.copy()
    
    # Add Laplace noise to numerical values
    for key, value in protected_data.items():
        if isinstance(value, (int, float)):
            # Calculate sensitivity (max change in output for unit change in input)
            sensitivity = 1.0  # Conservative estimate
            
            # Add Laplace noise
            noise = np.random.laplace(0, sensitivity / epsilon)
            protected_data[key] = max(0, min(1, value + noise))  # Clamp to [0,1]
            
        elif isinstance(value, dict):
            # Recursively apply to nested dictionaries
            protected_data[key] = apply_differential_privacy(value, epsilon)
            
        elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], (int, float)):
            # Apply noise to numerical lists
            sensitivity = 1.0
            noise = np.random.laplace(0, sensitivity / epsilon, len(value))
            protected_data[key] = [max(0, min(1, v + n)) for v, n in zip(value, noise)]
    
    return protected_data

def anonymize_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove or anonymize potentially identifying features.
    
    Args:
        features: Feature dictionary
        
    Returns:
        Anonymized features
    """
    # List of potentially identifying feature keys to remove
    identifying_keys = [
        'user_id', 'username', 'email', 'ip_address', 
        'device_id', 'session_id', 'timestamp_exact'
    ]
    
    anonymized = {}
    for key, value in features.items():
        if key.lower() not in identifying_keys:
            anonymized[key] = value
    
    return anonymized

def k_anonymize_aggregates(
    data: list, 
    k: int = 5, 
    quasi_identifiers: list = None
) -> list:
    """
    Apply k-anonymity to aggregate data.
    
    Args:
        data: List of data records
        k: Minimum group size for anonymity
        quasi_identifiers: List of quasi-identifying attributes
        
    Returns:
        K-anonymized data
    """
    if not quasi_identifiers:
        quasi_identifiers = ['age_group', 'location_region', 'study_field']
    
    # Group records by quasi-identifiers
    groups = {}
    for record in data:
        key = tuple(record.get(qi, 'unknown') for qi in quasi_identifiers)
        if key not in groups:
            groups[key] = []
        groups[key].append(record)
    
    # Filter out groups smaller than k
    anonymized_data = []
    for group_records in groups.values():
        if len(group_records) >= k:
            anonymized_data.extend(group_records)
    
    return anonymized_data

def sanitize_text_features(text_features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize text-derived features to remove potential PII.
    
    Args:
        text_features: Dictionary of text analysis features
        
    Returns:
        Sanitized features
    """
    sanitized = {}
    
    # Keep only aggregate/statistical features
    safe_features = [
        'sentiment_score', 'emotion_scores', 'toxicity_score',
        'stress_indicators_count', 'word_count', 'sentence_count',
        'avg_word_length', 'readability_score', 'linguistic_features'
    ]
    
    for key, value in text_features.items():
        if any(safe_key in key.lower() for safe_key in safe_features):
            sanitized[key] = value
    
    return sanitized