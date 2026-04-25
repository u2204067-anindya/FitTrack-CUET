"""
Admin/Gym Status API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.gym_status import GymStatus, Announcement
from app.schemas.gym_status import (
    GymStatusUpdate,
    GymStatusResponse,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    AnnouncementListResponse
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# Gym Status endpoints
@router.get("/gym-status", response_model=GymStatusResponse)
async def get_gym_status(db: Session = Depends(get_db)):
    """Get current gym status (public endpoint)"""
    status = db.query(GymStatus).first()
    
    if not status:
        # Create default status if none exists
        status = GymStatus(
            is_open=True,
            status_message="Gym is open",
            current_occupancy=0,
            max_capacity=100
        )
        db.add(status)
        db.commit()
        db.refresh(status)
    
    # Calculate occupancy percentage
    response = GymStatusResponse.model_validate(status)
    if status.max_capacity > 0:
        response.occupancy_percentage = round(
            (status.current_occupancy / status.max_capacity) * 100, 1
        )
    
    return response


@router.put("/gym-status", response_model=GymStatusResponse)
async def update_gym_status(
    status_data: GymStatusUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update gym status (Admin only)"""
    status = db.query(GymStatus).first()
    
    if not status:
        status = GymStatus()
        db.add(status)
    
    update_data = status_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(status, field, value)
    
    status.updated_by = current_user.id
    
    db.commit()
    db.refresh(status)
    
    response = GymStatusResponse.model_validate(status)
    if status.max_capacity > 0:
        response.occupancy_percentage = round(
            (status.current_occupancy / status.max_capacity) * 100, 1
        )
    
    return response


@router.post("/gym-status/toggle")
async def toggle_gym_status(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle gym open/closed status (Admin only)"""
    status = db.query(GymStatus).first()
    
    if not status:
        status = GymStatus(is_open=True)
        db.add(status)
    
    status.is_open = not status.is_open
    status.status_message = "Gym is open" if status.is_open else "Gym is closed"
    status.updated_by = current_user.id
    
    db.commit()
    
    return {
        "is_open": status.is_open,
        "message": f"Gym is now {'open' if status.is_open else 'closed'}"
    }


# Announcement endpoints
@router.get("/announcements", response_model=AnnouncementListResponse)
async def get_announcements(
    skip: int = 0,
    limit: int = 20,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all announcements (public endpoint)"""
    query = db.query(Announcement)
    
    if active_only:
        query = query.filter(Announcement.is_active == True)
    
    total = query.count()
    announcements = query.order_by(
        Announcement.is_pinned.desc(),
        Announcement.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return AnnouncementListResponse(total=total, announcements=announcements)


@router.get("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db)
):
    """Get announcement by ID"""
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create new announcement (Admin only)"""
    announcement = Announcement(
        title=announcement_data.title,
        content=announcement_data.content,
        category=announcement_data.category,
        priority=announcement_data.priority,
        is_pinned=announcement_data.is_pinned,
        start_date=announcement_data.start_date,
        end_date=announcement_data.end_date,
        created_by=current_user.id
    )
    
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    # Create notifications for all users
    from app.models.notification import Notification
    users = db.query(User).all()
    
    notifications = []
    category_map = {
        "general": "system",
        "maintenance": "system",
        "event": "info",
        "urgent": "warning"
    }
    notif_type = "warning" if announcement_data.priority == "high" else "info"
    notif_category = category_map.get(announcement_data.category, "system")

    for user in users:
        new_notif = Notification(
            user_id=user.id,
            title=f"New Announcement: {announcement.title}",
            message=announcement.content[:200] + ("..." if len(announcement.content) > 200 else ""),
            type=notif_type,
            category=notif_category,
            action_url="dashboard.html"
        )
        notifications.append(new_notif)
    
    if notifications:
        db.add_all(notifications)
        db.commit()

    return announcement


@router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    announcement_data: AnnouncementUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update announcement (Admin only)"""
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    update_data = announcement_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    db.commit()
    db.refresh(announcement)
    
    return announcement


@router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete announcement (Admin only)"""
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    db.delete(announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}


# Dashboard stats for admin
@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    from app.models.equipment import Equipment
    from app.models.workout import Workout
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_equipment = db.query(Equipment).count()
    available_equipment = db.query(Equipment).filter(Equipment.is_available == True).count()
    total_workouts = db.query(Workout).count()
    active_announcements = db.query(Announcement).filter(Announcement.is_active == True).count()
    
    gym_status = db.query(GymStatus).first()
    
    # Department distribution
    from sqlalchemy import func
    dept_distribution = db.query(User.department, func.count(User.id)).group_by(User.department).all()
    department_stats = [{"department": str(d[0] or "Unknown"), "count": d[1]} for d in dept_distribution]

    # Monthly workout trends (rolling 6 months grouped by month-year)
    import calendar
    from datetime import datetime

    today = datetime.utcnow()
    monthly_workouts = {}
    for i in range(5, -1, -1):
        year, month = today.year, today.month - i
        if month <= 0:
            month += 12
            year -= 1
        month_str = f"{calendar.month_abbr[month]} {year}"
        monthly_workouts[month_str] = 0

    workouts = db.query(Workout.created_at).all()
    for w in workouts:
        if w[0]:
            year, month = w[0].year, w[0].month
            month_str = f"{calendar.month_abbr[month]} {year}"
            if month_str in monthly_workouts:
                monthly_workouts[month_str] += 1

    trends_list = [{"month": k, "workouts": v} for k, v in monthly_workouts.items()]

    return {
        "users": {
            "total": total_users,
            "active": active_users
        },
        "equipment": {
            "total": total_equipment,
            "available": available_equipment
        },
        "workouts": {
            "total": total_workouts
        },
        "announcements": {
            "active": active_announcements
        },
        "gym_status": {
            "is_open": gym_status.is_open if gym_status else True,
            "current_occupancy": gym_status.current_occupancy if gym_status else 0,
            "max_capacity": gym_status.max_capacity if gym_status else 100
        },
        "department_distribution": department_stats,
        "monthly_trends": trends_list
    }
