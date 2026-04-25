"""
Workout and Exercise Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    workout_type = Column(String(100), nullable=True)  # Strength, Cardio, Flexibility, etc.
    focus_area = Column(String(100), nullable=True)    # Upper Body, Lower Body, Core, Full Body
    duration = Column(Integer, nullable=True)          # Duration in minutes
    intensity = Column(String(50), nullable=True)      # Low, Medium, High
    notes = Column(Text, nullable=True)
    
    # Workout session tracking
    start_time = Column(DateTime, nullable=True)       # When workout started
    end_time = Column(DateTime, nullable=True)         # When workout completed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="workouts")
    exercises = relationship("Exercise", back_populates="workout", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Workout {self.id}: {self.name}>"


class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    weight = Column(String(50), nullable=True)  # Can be "bodyweight" or numeric
    rest_time = Column(Integer, nullable=True)  # Rest time in seconds
    equipment = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    order = Column(Integer, default=0)  # Order in workout
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workout = relationship("Workout", back_populates="exercises")
    
    def __repr__(self):
        return f"<Exercise {self.id}: {self.name}>"
