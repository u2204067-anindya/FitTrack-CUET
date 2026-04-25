"""
Diet Plan and Diet Preferences Models
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class DietPlan(Base):
    __tablename__ = "diet_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Diet Type
    diet_type = Column(String(100), nullable=True)  # Balanced, Keto, Vegan, etc.
    goal = Column(String(100), nullable=True)  # Weight Loss, Muscle Gain, Maintenance
    
    # Caloric Information
    target_calories = Column(Integer, nullable=True)
    protein_target = Column(Float, nullable=True)  # in grams
    carbs_target = Column(Float, nullable=True)    # in grams
    fat_target = Column(Float, nullable=True)      # in grams
    
    # Meals - stored as JSON
    meals = Column(JSON, nullable=True)  # Array of meal objects
    
    # Preferences
    preferences = Column(JSON, nullable=True)  # Dietary restrictions, allergies, etc.
    
    # Water intake
    water_goal = Column(Float, nullable=True)  # in liters
    
    # Schedule
    meal_frequency = Column(Integer, default=3)  # Number of meals per day
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="diet_plan")
    
    def __repr__(self):
        return f"<DietPlan user_id={self.user_id}>"


class DietPreferences(Base):
    __tablename__ = "diet_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(50), nullable=True)  # Restriction, Allergy, Preference
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<DietPreference {self.name}>"
