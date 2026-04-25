"""
Diet Plan Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class MealItem(BaseModel):
    """Individual meal item"""
    name: str
    portion: Optional[str] = None
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None


class Meal(BaseModel):
    """Meal schema"""
    meal_type: str  # breakfast, lunch, dinner, snack
    time: Optional[str] = None
    items: List[MealItem] = []
    total_calories: Optional[int] = None


class DietPlanBase(BaseModel):
    """Base diet plan schema"""
    diet_type: Optional[str] = None
    goal: Optional[str] = None
    target_calories: Optional[int] = Field(None, ge=500, le=10000)
    protein_target: Optional[float] = None
    carbs_target: Optional[float] = None
    fat_target: Optional[float] = None
    water_goal: Optional[float] = None
    meal_frequency: Optional[int] = Field(None, ge=1, le=10)


class DietPlanCreate(DietPlanBase):
    """Schema for creating diet plan"""
    meals: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None


class DietPlanUpdate(DietPlanBase):
    """Schema for updating diet plan"""
    meals: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class DietPlanResponse(DietPlanBase):
    """Schema for diet plan response"""
    id: int
    user_id: int
    meals: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DietPreferenceBase(BaseModel):
    """Base diet preference schema"""
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class DietPreferenceResponse(DietPreferenceBase):
    """Schema for diet preference response"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
