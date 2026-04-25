from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserSettingsBase(BaseModel):
    """Base user settings schema"""
    receive_notifications: Optional[bool] = None
    dark_mode: Optional[bool] = None
    language: Optional[str] = None
    time_format: Optional[str] = None
    date_format: Optional[str] = None
    workout_duration: Optional[int] = None
    workout_intensity: Optional[str] = None


class UserSettingsUpdate(UserSettingsBase):
    """Schema for updating user settings"""
    pass

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        #orm_mode=True
        from_attributes = True
