"""
Medical Profile Schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import json


class EmergencyContact(BaseModel):
    """Emergency contact schema"""
    name: Optional[str] = None
    phone: Optional[str] = None
    relation: Optional[str] = None


class MedicalProfileBase(BaseModel):
    """Base medical profile schema"""
    age: Optional[int] = Field(None, ge=10, le=100)
    gender: Optional[str] = None
    height: Optional[float] = Field(None, ge=50, le=300)  # cm
    weight: Optional[float] = Field(None, ge=20, le=500)  # kg
    blood_group: Optional[str] = None
    
    # Medical history
    medical_conditions: Optional[List[str]] = []
    conditions_details: Optional[str] = None
    past_injuries: Optional[str] = None
    current_medications: Optional[str] = None
    allergies: Optional[List[str]] = []
    
    # Fitness
    fitness_goal: Optional[str] = None
    physical_limitations: Optional[str] = None
    activity_level: Optional[str] = None
    target_weight: Optional[float] = None
    
    # Emergency contact
    emergency_contact: Optional[EmergencyContact] = None
    
    # Doctor
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None


class MedicalProfileCreate(MedicalProfileBase):
    """Schema for creating medical profile"""
    pass


class MedicalProfileUpdate(MedicalProfileBase):
    """Schema for updating medical profile"""
    pass


class MedicalProfileResponse(MedicalProfileBase):
    """Schema for medical profile response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Computed health metrics
class HealthMetrics(BaseModel):
    """Computed health metrics"""
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None
    ideal_weight_range: Optional[str] = None
    daily_calorie_needs: Optional[int] = None
