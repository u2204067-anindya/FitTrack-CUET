"""
Chat/AI Instructor Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageBase(BaseModel):
    """Base chat message schema"""
    user_message: str = Field(..., min_length=1)
    context: Optional[str] = None  # workout, diet, injury, general


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating chat message"""
    pass


class ChatMessageResponse(BaseModel):
    """Schema for chat message response with AI reply"""
    id: int
    user_id: int
    user_message: str
    ai_response: str
    context: Optional[str] = None
    is_helpful: Optional[bool] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    """Schema for chat history response"""
    total: int
    messages: List[ChatMessageResponse]


class ChatFeedback(BaseModel):
    """Schema for providing feedback on AI response"""
    is_helpful: bool


class AIQueryRequest(BaseModel):
    """Schema for AI query request"""
    question: str = Field(..., min_length=1, max_length=2000)
    context: Optional[str] = None
    include_history: Optional[bool] = False


class AIResponse(BaseModel):
    """Schema for AI response"""
    response: str
    context: Optional[str] = None
    suggestions: Optional[List[str]] = None
