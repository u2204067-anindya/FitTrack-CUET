"""
AI Instructor API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat_history import ChatHistory
from app.models.equipment import Equipment
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatHistoryResponse,
    ChatFeedback,
    AIQueryRequest,
    AIResponse
)
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai-instructor", tags=["AI Instructor"])


@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_ai(
    request: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI instructor and get a response"""
    # Get chat history if requested
    chat_history = None
    if request.include_history:
        history = db.query(ChatHistory).filter(
            ChatHistory.user_id == current_user.id
        ).order_by(ChatHistory.created_at.desc()).limit(5).all()
        
        chat_history = [
            {"user_message": h.user_message, "ai_response": h.ai_response}
            for h in reversed(history)
        ]
    
    # Get available equipment from the database
    available_equipment = None
    try:
        equipment_list = db.query(Equipment).filter(Equipment.is_available == True).all()
        if equipment_list:
            categories = {}
            for eq in equipment_list:
                if eq.category not in categories:
                    categories[eq.category] = []
                categories[eq.category].append(eq.name)
            
            eq_str = []
            for cat, items in categories.items():
                eq_str.append(f"{cat}: {', '.join(items)}")
            available_equipment = "\n".join(eq_str)
    except Exception as e:
        print(f"Error fetching equipment: {e}")
        pass

    # Get AI response
    ai_response = await gemini_service.get_response(
        question=request.question,
        context=request.context,
        chat_history=chat_history,
        available_equipment=available_equipment
    )
    
    # Save to chat history
    chat_record = ChatHistory(
        user_id=current_user.id,
        user_message=request.question,
        ai_response=ai_response,
        context=request.context
    )
    
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)
    
    return chat_record


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    skip: int = 0,
    limit: int = 50,
    context: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's chat history with AI instructor"""
    query = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)
    
    if context:
        query = query.filter(ChatHistory.context == context)
    
    total = query.count()
    messages = query.order_by(ChatHistory.created_at.desc()).offset(skip).limit(limit).all()
    
    return ChatHistoryResponse(total=total, messages=messages)


@router.get("/history/{message_id}", response_model=ChatMessageResponse)
async def get_chat_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat message"""
    message = db.query(ChatHistory).filter(
        ChatHistory.id == message_id,
        ChatHistory.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return message


@router.post("/history/{message_id}/feedback")
async def provide_feedback(
    message_id: int,
    feedback: ChatFeedback,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provide feedback on an AI response"""
    message = db.query(ChatHistory).filter(
        ChatHistory.id == message_id,
        ChatHistory.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.is_helpful = feedback.is_helpful
    db.commit()
    
    return {"message": "Feedback recorded successfully"}


@router.delete("/history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all chat history for current user"""
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {"message": "Chat history cleared successfully"}


@router.delete("/history/{message_id}")
async def delete_chat_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific chat message"""
    message = db.query(ChatHistory).filter(
        ChatHistory.id == message_id,
        ChatHistory.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}


@router.get("/suggestions")
async def get_suggestions(context: Optional[str] = None):
    """Get quick suggestion prompts"""
    suggestions = gemini_service.get_quick_suggestions(context)
    return {"suggestions": suggestions}


@router.get("/contexts")
async def get_available_contexts():
    """Get available chat contexts"""
    return [
        {"id": "workout", "name": "Workout & Training", "icon": "dumbbell"},
        {"id": "diet", "name": "Diet & Nutrition", "icon": "apple-alt"},
        {"id": "injury", "name": "Injury & Recovery", "icon": "first-aid"},
        {"id": "equipment", "name": "Equipment Guide", "icon": "cogs"},
        {"id": "general", "name": "General Fitness", "icon": "heartbeat"}
    ]
