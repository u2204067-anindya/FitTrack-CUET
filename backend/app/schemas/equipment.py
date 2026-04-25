"""
Equipment Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EquipmentBase(BaseModel):
    """Base equipment schema"""
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    muscle_groups: Optional[str] = None
    difficulty_level: Optional[str] = None
    instructions: Optional[str] = None
    safety_tips: Optional[str] = None
    quantity: Optional[int] = 1
    location: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    """Schema for creating equipment"""
    pass


class EquipmentUpdate(BaseModel):
    """Schema for updating equipment"""
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    muscle_groups: Optional[str] = None
    difficulty_level: Optional[str] = None
    instructions: Optional[str] = None
    safety_tips: Optional[str] = None
    quantity: Optional[int] = None
    available_quantity: Optional[int] = None
    is_available: Optional[bool] = None
    location: Optional[str] = None
    maintenance_notes: Optional[str] = None


class EquipmentResponse(EquipmentBase):
    """Schema for equipment response"""
    id: int
    available_quantity: int
    is_available: bool
    last_maintenance: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    maintenance_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EquipmentListResponse(BaseModel):
    """Schema for list of equipment"""
    total: int
    equipment: List[EquipmentResponse]
