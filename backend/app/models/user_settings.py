
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receive_notifications = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)
    language = Column(String(50), default="en")
    time_format = Column(String(10), default="12")
    date_format = Column(String(20), default="MM/DD/YYYY")
    workout_duration = Column(Integer, default=60)
    workout_intensity = Column(String(20), default="moderate")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="settings")
    
    def __repr__(self):
        return f"<UserSettings {self.id} for User {self.user_id}>"