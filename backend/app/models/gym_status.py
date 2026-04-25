"""
Gym Status and Announcement Models
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Time
from datetime import datetime
from app.core.database import Base


class GymStatus(Base):
    __tablename__ = "gym_status"
    
    id = Column(Integer, primary_key=True, index=True)
    is_open = Column(Boolean, default=True)
    status_message = Column(String(255), nullable=True)
    
    # Operating Hours
    opening_time = Column(Time, nullable=True)
    closing_time = Column(Time, nullable=True)
    
    # Current occupancy
    current_occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer, default=100)
    
    # Special status
    special_notice = Column(Text, nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, nullable=True)  # Admin user id
    
    def __repr__(self):
        status = "Open" if self.is_open else "Closed"
        return f"<GymStatus: {status}>"


class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)  # General, Maintenance, Event, Emergency
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    is_active = Column(Boolean, default=True)
    is_pinned = Column(Boolean, default=False)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    created_by = Column(Integer, nullable=True)  # Admin user id
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Announcement {self.id}: {self.title}>"
