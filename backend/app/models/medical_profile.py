"""
Medical Profile Model
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class MedicalProfile(Base):
    __tablename__ = "medical_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Basic Info
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    blood_group = Column(String(10), nullable=True)
    
    # Medical Information
    medical_conditions = Column(JSON, nullable=True)  # Array of conditions
    conditions_details = Column(Text, nullable=True)  # Additional details
    past_injuries = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    allergies = Column(JSON, nullable=True)  # Array of allergies
    
    # Fitness Goals
    fitness_goal = Column(String(100), nullable=True)  # Weight Loss, Muscle Gain, etc.
    physical_limitations = Column(Text, nullable=True)
    activity_level = Column(String(50), nullable=True)  # Sedentary, Light, Moderate, Active
    target_weight = Column(Float, nullable=True)
    
    # Emergency Contact (stored as JSON)
    emergency_contact = Column(JSON, nullable=True)
    
    # Doctor Information
    doctor_name = Column(String(255), nullable=True)
    doctor_phone = Column(String(20), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="medical_profile")
    
    def __repr__(self):
        return f"<MedicalProfile user_id={self.user_id}>"
