"""
Equipment Model
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Cardio, Strength, Free Weights, etc.
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    
    # Specifications
    muscle_groups = Column(String(255), nullable=True)  # Comma-separated list
    difficulty_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    instructions = Column(Text, nullable=True)
    safety_tips = Column(Text, nullable=True)
    
    # Availability
    quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)
    is_available = Column(Boolean, default=True)
    location = Column(String(100), nullable=True)  # Location in gym
    
    # Maintenance
    last_maintenance = Column(DateTime, nullable=True)
    next_maintenance = Column(DateTime, nullable=True)
    maintenance_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Equipment {self.id}: {self.name}>"
