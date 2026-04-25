"""
Equipment API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.equipment import Equipment
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentListResponse
)

router = APIRouter(prefix="/api/equipment", tags=["Equipment"])


@router.get("/categories")
async def get_equipment_categories(db: Session = Depends(get_db)):
    """Get all equipment categories"""
    categories = db.query(Equipment.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/", response_model=EquipmentListResponse)
async def get_all_equipment(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    search: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all equipment (public endpoint)"""
    query = db.query(Equipment)
    
    if category:
        query = query.filter(Equipment.category == category)
    
    if search:
        query = query.filter(
            Equipment.name.ilike(f"%{search}%") | 
            Equipment.description.ilike(f"%{search}%")
        )
    
    if available_only:
        query = query.filter(Equipment.is_available == True)
    
    total = query.count()
    equipment = query.order_by(Equipment.name).offset(skip).limit(limit).all()
    
    return EquipmentListResponse(total=total, equipment=equipment)


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Get equipment by ID (public endpoint)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    return equipment


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create new equipment (Admin only)"""
    equipment = Equipment(
        name=equipment_data.name,
        category=equipment_data.category,
        description=equipment_data.description,
        image_url=equipment_data.image_url,
        muscle_groups=equipment_data.muscle_groups,
        difficulty_level=equipment_data.difficulty_level,
        instructions=equipment_data.instructions,
        safety_tips=equipment_data.safety_tips,
        quantity=equipment_data.quantity,
        available_quantity=equipment_data.quantity,
        location=equipment_data.location
    )
    
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update equipment (Admin only)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    update_data = equipment_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    
    return equipment


@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete equipment (Admin only)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    db.delete(equipment)
    db.commit()
    
    return {"message": "Equipment deleted successfully"}


@router.post("/{equipment_id}/toggle-availability")
async def toggle_equipment_availability(
    equipment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle equipment availability (Admin only)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    equipment.is_available = not equipment.is_available
    db.commit()
    
    status_msg = "available" if equipment.is_available else "unavailable"
    return {"message": f"Equipment marked as {status_msg}"}
