"""
Seed Notifications
Creates sample notifications for testing
"""
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.notification import Notification
from app.models.user import User


def seed_notifications():
    """Create sample notifications for all users"""
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).all()
        
        if not users:
            print("No users found. Please run seed_data.py first.")
            return
        
        # Sample notifications for each user
        sample_notifications = [
            {
                "title": "Welcome to FitTrack CUET!",
                "message": "Thank you for joining our gym management system. Start tracking your fitness journey today!",
                "type": "success",
                "category": "system",
                "action_url": "dashboard.html"
            },
            {
                "title": "Complete Your Medical Profile",
                "message": "Please complete your medical profile to help us provide better recommendations and ensure your safety.",
                "type": "warning",
                "category": "medical",
                "action_url": "medical-profile.html"
            },
            {
                "title": "New Equipment Available",
                "message": "Check out our newly added equipment: Leg Press Machine, Cable Crossover, and more!",
                "type": "info",
                "category": "system",
                "action_url": "equipment.html"
            },
            {
                "title": "Workout Reminder",
                "message": "Don't forget your scheduled chest workout today! Stay consistent with your fitness goals.",
                "type": "info",
                "category": "workout",
                "action_url": "workout-history.html"
            },
            {
                "title": "Achievement Unlocked! 🎉",
                "message": "Congratulations! You've completed 10 workouts this month. Keep up the great work!",
                "type": "success",
                "category": "achievement",
                "action_url": "dashboard.html"
            },
            {
                "title": "Diet Plan Updated",
                "message": "Your nutritionist has updated your meal plan. Check it out for optimal results!",
                "type": "info",
                "category": "diet",
                "action_url": "diet-plan.html"
            },
            {
                "title": "Gym Maintenance Notice",
                "message": "The gym will be closed for maintenance on Sunday from 6 AM to 10 AM. Plan accordingly.",
                "type": "warning",
                "category": "system",
                "action_url": "dashboard.html"
            }
        ]
        
        notifications_created = 0
        
        for user in users:
            # Add 3-5 random notifications per user
            for i, notif_data in enumerate(sample_notifications[:5]):
                notification = Notification(
                    user_id=user.id,
                    title=notif_data["title"],
                    message=notif_data["message"],
                    type=notif_data["type"],
                    category=notif_data["category"],
                    action_url=notif_data.get("action_url"),
                    is_read=i > 2,  # First 3 are unread
                    created_at=datetime.utcnow() - timedelta(days=i)
                )
                db.add(notification)
                notifications_created += 1
        
        db.commit()
        print(f"✅ Successfully created {notifications_created} sample notifications for {len(users)} users")
        
    except Exception as e:
        print(f"❌ Error seeding notifications: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🔔 Seeding notifications...")
    seed_notifications()
