"""
Workout API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.workout import Workout, Exercise
from app.schemas.workout import (
    WorkoutCreate,
    WorkoutUpdate,
    WorkoutResponse,
    WorkoutListResponse,
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseResponse
)

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new workout"""
    # Create workout
    new_workout = Workout(
        user_id=current_user.id,
        name=workout_data.name,
        workout_type=workout_data.workout_type,
        focus_area=workout_data.focus_area,
        duration=workout_data.duration,
        intensity=workout_data.intensity,
        notes=workout_data.notes
    )
    
    db.add(new_workout)
    db.flush()  # Get the workout ID
    
    # Add exercises
    if workout_data.exercises:
        for idx, exercise_data in enumerate(workout_data.exercises):
            exercise = Exercise(
                workout_id=new_workout.id,
                name=exercise_data.name,
                sets=exercise_data.sets,
                reps=exercise_data.reps,
                weight=exercise_data.weight,
                rest_time=exercise_data.rest_time,
                equipment=exercise_data.equipment,
                notes=exercise_data.notes,
                order=exercise_data.order if exercise_data.order else idx
            )
            db.add(exercise)
    
    db.commit()
    db.refresh(new_workout)
    
    return new_workout


@router.get("/", response_model=WorkoutListResponse)
async def get_workouts(
    skip: int = 0,
    limit: int = 50,
    workout_type: Optional[str] = None,
    focus_area: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all workouts for current user"""
    query = db.query(Workout).filter(Workout.user_id == current_user.id)
    
    if workout_type:
        query = query.filter(Workout.workout_type == workout_type)
    if focus_area:
        query = query.filter(Workout.focus_area == focus_area)
    
    total = query.count()
    workouts = query.order_by(Workout.created_at.desc()).offset(skip).limit(limit).all()
    
    return WorkoutListResponse(total=total, workouts=workouts)


@router.get("/{workout_id}", response_model=WorkoutResponse)
async def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
async def update_workout(
    workout_id: int,
    workout_data: WorkoutUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    update_data = workout_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(workout, field, value)
    
    db.commit()
    db.refresh(workout)
    
    return workout


@router.delete("/{workout_id}")
async def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    db.delete(workout)
    db.commit()
    
    return {"message": "Workout deleted successfully"}


@router.post("/{workout_id}/start", response_model=WorkoutResponse)
async def start_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a workout (record start time)"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    workout.start_time = datetime.utcnow()
    db.commit()
    db.refresh(workout)
    
    return workout


@router.post("/{workout_id}/complete", response_model=WorkoutResponse)
async def complete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a workout (record end time)"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    workout.end_time = datetime.utcnow()
    db.commit()
    db.refresh(workout)
    
    return workout


# Exercise endpoints
@router.post("/{workout_id}/exercises", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def add_exercise(
    workout_id: int,
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an exercise to a workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    # Get max order
    max_order = db.query(Exercise).filter(Exercise.workout_id == workout_id).count()
    
    exercise = Exercise(
        workout_id=workout_id,
        name=exercise_data.name,
        sets=exercise_data.sets,
        reps=exercise_data.reps,
        weight=exercise_data.weight,
        rest_time=exercise_data.rest_time,
        equipment=exercise_data.equipment,
        notes=exercise_data.notes,
        order=exercise_data.order if exercise_data.order else max_order
    )
    
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    
    return exercise


@router.put("/{workout_id}/exercises/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    workout_id: int,
    exercise_id: int,
    exercise_data: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an exercise"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_id == workout_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    update_data = exercise_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    db.commit()
    db.refresh(exercise)
    
    return exercise


@router.delete("/{workout_id}/exercises/{exercise_id}")
async def delete_exercise(
    workout_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an exercise"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.workout_id == workout_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    db.delete(exercise)
    db.commit()
    
    return {"message": "Exercise deleted successfully"}
