"""
Medical Profile API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.medical_profile import MedicalProfile
from app.schemas.medical_profile import (
    MedicalProfileCreate,
    MedicalProfileUpdate,
    MedicalProfileResponse,
    HealthMetrics
)

router = APIRouter(prefix="/api/medical-profile", tags=["Medical Profile"])


def calculate_bmi(weight: float, height: float) -> tuple:
    """Calculate BMI and category"""
    if not weight or not height or height == 0:
        return None, None
    
    height_m = height / 100  # Convert cm to m
    bmi = weight / (height_m ** 2)
    bmi = round(bmi, 1)
    
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    
    return bmi, category


def calculate_daily_calories(weight: float, height: float, age: int, gender: str, activity_level: str) -> int:
    """Calculate daily calorie needs using Mifflin-St Jeor equation"""
    if not all([weight, height, age, gender]):
        return None
    
    # BMR calculation
    if gender.lower() in ['male', 'm']:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Activity multiplier
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very active': 1.9
    }
    
    multiplier = activity_multipliers.get(activity_level.lower() if activity_level else 'moderate', 1.55)
    
    return int(bmr * multiplier)


@router.get("/", response_model=Optional[MedicalProfileResponse])
async def get_medical_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's medical profile"""
    profile = db.query(MedicalProfile).filter(
        MedicalProfile.user_id == current_user.id
    ).first()
    
    return profile


@router.post("/", response_model=MedicalProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_medical_profile(
    profile_data: MedicalProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create medical profile for current user"""
    # Check if profile already exists
    existing = db.query(MedicalProfile).filter(
        MedicalProfile.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medical profile already exists. Use PUT to update."
        )
    
    profile = MedicalProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return profile


@router.put("/", response_model=MedicalProfileResponse)
async def update_medical_profile(
    profile_data: MedicalProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's medical profile"""
    profile = db.query(MedicalProfile).filter(
        MedicalProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Create new profile if doesn't exist
        profile = MedicalProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    else:
        update_data = profile_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile


@router.delete("/")
async def delete_medical_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user's medical profile"""
    profile = db.query(MedicalProfile).filter(
        MedicalProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical profile not found"
        )
    
    db.delete(profile)
    db.commit()
    
    return {"message": "Medical profile deleted successfully"}


@router.get("/health-metrics", response_model=Optional[HealthMetrics])
async def get_health_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get calculated health metrics for current user"""
    profile = db.query(MedicalProfile).filter(
        MedicalProfile.user_id == current_user.id
    ).first()

    if not profile:
        return None
    
    bmi, bmi_category = calculate_bmi(profile.weight, profile.height)
    
    # Calculate ideal weight range (BMI 18.5 - 24.9)
    ideal_weight_range = None
    if profile.height:
        height_m = profile.height / 100
        min_weight = round(18.5 * (height_m ** 2), 1)
        max_weight = round(24.9 * (height_m ** 2), 1)
        ideal_weight_range = f"{min_weight} - {max_weight} kg"
    
    daily_calories = calculate_daily_calories(
        profile.weight,
        profile.height,
        profile.age,
        profile.gender,
        profile.activity_level
    )
    
    return HealthMetrics(
        bmi=bmi,
        bmi_category=bmi_category,
        ideal_weight_range=ideal_weight_range,
        daily_calorie_needs=daily_calories
    )
