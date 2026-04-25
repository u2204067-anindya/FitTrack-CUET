import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from sqlalchemy import text

def update_db():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE workouts ADD COLUMN start_time TIMESTAMP;"))
        db.commit()
        print("Added start_time")
    except Exception as e:
        print("start_time error:", e)
        db.rollback()

    try:
        db.execute(text("ALTER TABLE workouts ADD COLUMN end_time TIMESTAMP;"))
        db.commit()
        print("Added end_time")
    except Exception as e:
        print("end_time error:", e)
        db.rollback()

    db.close()

if __name__ == "__main__":
    update_db()
