import re
from typing import List, Optional
from fastapi import HTTPException
from config import settings

def validate_text_input(text: str) -> None:
    """
    Validate text input for safety and compliance.
    
    Args:
        text: Input text to validate
        
    Raises:
        HTTPException: If text fails validation
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if len(text) > settings.max_text_length:
        raise HTTPException(
            status_code=400, 
            detail=f"Text exceeds maximum length of {settings.max_text_length} characters"
        )
    
    # Check for potential PII patterns
    pii_patterns = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Phone number
    ]
    
    for pattern in pii_patterns:
        if re.search(pattern, text):
            raise HTTPException(
                status_code=400, 
                detail="Text appears to contain personally identifiable information"
            )

def validate_user_id(user_id: str) -> None:
    """
    Validate user ID format.
    
    Args:
        user_id: User identifier
        
    Raises:
        HTTPException: If user ID is invalid
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    # Check if it's a valid UUID format
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, user_id, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

def validate_features(features: dict) -> None:
    """
    Validate feature dictionary.
    
    Args:
        features: Feature dictionary to validate
        
    Raises:
        HTTPException: If features are invalid
    """
    if not isinstance(features, dict):
        raise HTTPException(status_code=400, detail="Features must be a dictionary")
    
    # Check for reasonable feature values
    for key, value in features.items():
        if isinstance(value, (int, float)):
            if not (-1000 <= value <= 1000):  # Reasonable bounds
                raise HTTPException(
                    status_code=400, 
                    detail=f"Feature '{key}' has unreasonable value: {value}"
                )
        elif isinstance(value, list):
            if len(value) > 1000:  # Prevent extremely large lists
                raise HTTPException(
                    status_code=400, 
                    detail=f"Feature '{key}' list is too large"
                )

def sanitize_output(output: dict) -> dict:
    """
    Sanitize output to ensure no sensitive information leaks.
    
    Args:
        output: Output dictionary to sanitize
        
    Returns:
        Sanitized output
    """
    # Remove any keys that might contain sensitive information
    sensitive_keys = ['raw_text', 'user_data', 'internal_state', 'debug_info']
    
    sanitized = {}
    for key, value in output.items():
        if key.lower() not in sensitive_keys:
            if isinstance(value, dict):
                sanitized[key] = sanitize_output(value)
            elif isinstance(value, list):
                # Limit list sizes in output
                sanitized[key] = value[:100] if len(value) > 100 else value
            else:
                sanitized[key] = value
    
    return sanitized

def validate_time_window(days: int) -> None:
    """
    Validate time window parameter.
    
    Args:
        days: Number of days for analysis window
        
    Raises:
        HTTPException: If time window is invalid
    """
    if not isinstance(days, int) or days < 1 or days > 365:
        raise HTTPException(
            status_code=400, 
            detail="Time window must be between 1 and 365 days"
        )