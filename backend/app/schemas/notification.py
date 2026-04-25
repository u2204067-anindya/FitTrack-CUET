"""
Notification Schemas for Request/Response Validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    """Base notification schema"""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: str = Field(..., pattern="^(info|success|warning|error)$")
    category: str = Field(..., pattern="^(workout|diet|medical|system|achievement)$")
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification"""
    user_id: int


class NotificationUpdate(BaseModel):
    """Schema for updating notification"""
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    """Schema for notification statistics"""
    total: int
    unread: int
    by_category: dict
