"""
Diet Plan API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.diet_plan import DietPlan, DietPreferences
from app.models.medical_profile import MedicalProfile
from app.services.gemini_service import gemini_service
from app.schemas.diet_plan import (
    DietPlanCreate,
    DietPlanUpdate,
    DietPlanResponse,
    DietPreferenceResponse
)

router = APIRouter(prefix="/api/diet", tags=["Diet Plan"])


@router.get("/", response_model=Optional[DietPlanResponse])
async def get_diet_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's diet plan"""
    diet_plan = db.query(DietPlan).filter(
        DietPlan.user_id == current_user.id
    ).first()
    
    return diet_plan


@router.post("/generate", response_model=DietPlanResponse)
async def generate_diet_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI personalized diet plan"""
    diet_plan = db.query(DietPlan).filter(DietPlan.user_id == current_user.id).first()
    medical_profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == current_user.id).first()
    
    if not diet_plan:
        raise HTTPException(status_code=400, detail="Diet plan/preferences not set")
        
    med_info = {}
    if medical_profile:
        med_info = {
            "age": medical_profile.age,
            "gender": medical_profile.gender,
            "height": medical_profile.height,
            "weight": medical_profile.weight,
            "blood_group": medical_profile.blood_group,
            "conditions": medical_profile.medical_conditions,
            "conditions_details": medical_profile.conditions_details,
            "fitness_goal": medical_profile.fitness_goal,
            "physical_limitations": medical_profile.physical_limitations
        }
        
    diet_info = {
        "diet_type": diet_plan.diet_type,
        "goal": diet_plan.goal,
        "target_calories": diet_plan.target_calories,
        "protein_target": diet_plan.protein_target,
        "carbs_target": diet_plan.carbs_target,
        "fat_target": diet_plan.fat_target,
        "meal_frequency": diet_plan.meal_frequency,
        "preferences": diet_plan.preferences
    }

    try:
        generated_meals = await gemini_service.generate_personalized_diet_plan(
            medical_profile=med_info,
            diet_prefs=diet_info
        )
        
        # Save generated meals to DB
        diet_plan.meals = generated_meals
        db.commit()
        db.refresh(diet_plan)
        
        return diet_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI diet plan: {str(e)}"
        )


@router.post("/", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_diet_plan(
    diet_data: DietPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create diet plan for current user"""
    # Check if diet plan already exists
    existing = db.query(DietPlan).filter(
        DietPlan.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diet plan already exists. Use PUT to update."
        )
    
    diet_plan = DietPlan(
        user_id=current_user.id,
        diet_type=diet_data.diet_type,
        goal=diet_data.goal,
        target_calories=diet_data.target_calories,
        protein_target=diet_data.protein_target,
        carbs_target=diet_data.carbs_target,
        fat_target=diet_data.fat_target,
        water_goal=diet_data.water_goal,
        meal_frequency=diet_data.meal_frequency,
        meals=diet_data.meals,
        preferences=diet_data.preferences
    )
    
    db.add(diet_plan)
    db.commit()
    db.refresh(diet_plan)
    
    return diet_plan


@router.put("/", response_model=DietPlanResponse)
async def update_diet_plan(
    diet_data: DietPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's diet plan"""
    diet_plan = db.query(DietPlan).filter(
        DietPlan.user_id == current_user.id
    ).first()
    
    if not diet_plan:
        # Create new diet plan if doesn't exist
        diet_plan = DietPlan(
            user_id=current_user.id,
            **diet_data.model_dump(exclude_unset=True)
        )
        db.add(diet_plan)
    else:
        update_data = diet_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(diet_plan, field, value)
    
    db.commit()
    db.refresh(diet_plan)
    
    return diet_plan


@router.delete("/")
async def delete_diet_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user's diet plan"""
    diet_plan = db.query(DietPlan).filter(
        DietPlan.user_id == current_user.id
    ).first()
    
    if not diet_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found"
        )
    
    db.delete(diet_plan)
    db.commit()
    
    return {"message": "Diet plan deleted successfully"}


# Diet preferences (predefined options)
@router.get("/preferences", response_model=List[DietPreferenceResponse])
async def get_diet_preferences(db: Session = Depends(get_db)):
    """Get all predefined diet preferences"""
    preferences = db.query(DietPreferences).all()
    return preferences


@router.get("/diet-types")
async def get_diet_types():
    """Get available diet types"""
    return [
        {"id": "balanced", "name": "Balanced", "description": "Balanced mix of all nutrients"},
        {"id": "keto", "name": "Ketogenic", "description": "High fat, low carb diet"},
        {"id": "vegan", "name": "Vegan", "description": "Plant-based diet, no animal products"},
        {"id": "vegetarian", "name": "Vegetarian", "description": "No meat, includes dairy and eggs"},
        {"id": "paleo", "name": "Paleo", "description": "Based on foods from the Paleolithic era"},
        {"id": "mediterranean", "name": "Mediterranean", "description": "Based on traditional Mediterranean cuisine"},
        {"id": "low_carb", "name": "Low Carb", "description": "Reduced carbohydrate intake"},
        {"id": "high_protein", "name": "High Protein", "description": "Focus on protein-rich foods"}
    ]


@router.get("/goals")
async def get_diet_goals():
    """Get available diet goals"""
    return [
        {"id": "weight_loss", "name": "Weight Loss", "description": "Lose weight and body fat"},
        {"id": "muscle_gain", "name": "Muscle Gain", "description": "Build muscle mass"},
        {"id": "maintenance", "name": "Maintenance", "description": "Maintain current weight"},
        {"id": "endurance", "name": "Improve Endurance", "description": "Enhance stamina and energy"},
        {"id": "general_health", "name": "General Health", "description": "Overall health improvement"}
    ]
