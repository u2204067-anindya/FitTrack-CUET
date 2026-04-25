"""
Workout and Exercise Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ExerciseBase(BaseModel):
    """Base exercise schema"""
    name: str = Field(..., min_length=1, max_length=255)
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[str] = None
    rest_time: Optional[int] = None
    equipment: Optional[str] = None
    notes: Optional[str] = None
    order: Optional[int] = 0


class ExerciseCreate(ExerciseBase):
    """Schema for creating exercise"""
    pass


class ExerciseUpdate(BaseModel):
    """Schema for updating exercise"""
    name: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[str] = None
    rest_time: Optional[int] = None
    equipment: Optional[str] = None
    notes: Optional[str] = None
    order: Optional[int] = None


class ExerciseResponse(ExerciseBase):
    """Schema for exercise response"""
    id: int
    workout_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class WorkoutBase(BaseModel):
    """Base workout schema"""
    name: str = Field(..., min_length=1, max_length=255)
    workout_type: Optional[str] = None
    focus_area: Optional[str] = None
    duration: Optional[int] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None


class WorkoutCreate(WorkoutBase):
    """Schema for creating workout with exercises"""
    exercises: Optional[List[ExerciseCreate]] = []


class WorkoutUpdate(BaseModel):
    """Schema for updating workout"""
    name: Optional[str] = None
    workout_type: Optional[str] = None
    focus_area: Optional[str] = None
    duration: Optional[int] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None


class WorkoutResponse(WorkoutBase):
    """Schema for workout response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    exercises: List[ExerciseResponse] = []
    
    class Config:
        from_attributes = True


class WorkoutListResponse(BaseModel):
    """Schema for list of workouts"""
    total: int
    workouts: List[WorkoutResponse]
