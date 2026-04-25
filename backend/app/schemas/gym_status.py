"""
Gym Status and Announcement Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time


class GymStatusBase(BaseModel):
    """Base gym status schema"""
    is_open: Optional[bool] = True
    status_message: Optional[str] = None
    opening_time: Optional[str] = None  # HH:MM format
    closing_time: Optional[str] = None  # HH:MM format
    current_occupancy: Optional[int] = Field(None, ge=0)
    max_capacity: Optional[int] = Field(None, ge=1)
    special_notice: Optional[str] = None


class GymStatusUpdate(GymStatusBase):
    """Schema for updating gym status"""
    pass


class GymStatusResponse(BaseModel):
    """Schema for gym status response"""
    id: int
    is_open: bool
    status_message: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    current_occupancy: int
    max_capacity: int
    special_notice: Optional[str] = None
    updated_at: datetime
    occupancy_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True


class AnnouncementBase(BaseModel):
    """Base announcement schema"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    category: Optional[str] = None
    priority: Optional[str] = "normal"
    is_pinned: Optional[bool] = False
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating announcement"""
    pass


class AnnouncementUpdate(BaseModel):
    """Schema for updating announcement"""
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AnnouncementResponse(AnnouncementBase):
    """Schema for announcement response"""
    id: int
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    """Schema for list of announcements"""
    total: int
    announcements: List[AnnouncementResponse]
