"""
Database seeding script - Creates initial data
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.core.security import get_password_hash
from app.models.user import User
from app.models.equipment import Equipment
from app.models.gym_status import GymStatus, Announcement


def seed_admin_user(db: Session):
    """Create default admin user"""
    admin = db.query(User).filter(User.student_id == "admin").first()
    if not admin:
        admin = User(
            student_id="admin",
            email="admin@fittrack.cuet.ac.bd",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            department="Administration",
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user created (student_id: admin, password: admin123)")
    else:
        print("ℹ️ Admin user already exists")


def seed_equipment(db: Session):
    """Create initial equipment catalog"""
    equipment_data = [
        {
            "name": "Treadmill",
            "category": "Cardio",
            "description": "Motorized treadmill for walking, jogging, and running exercises.",
            "muscle_groups": "Legs, Cardiovascular System",
            "difficulty_level": "Beginner",
            "instructions": "1. Step onto the treadmill and clip the safety key. 2. Start at a slow speed. 3. Gradually increase speed and incline as desired.",
            "safety_tips": "Always use the safety clip. Don't look down while running. Start slow and warm up properly.",
            "quantity": 5,
            "location": "Cardio Zone"
        },
        {
            "name": "Stationary Bike",
            "category": "Cardio",
            "description": "Indoor cycling bike for low-impact cardiovascular exercise.",
            "muscle_groups": "Quadriceps, Hamstrings, Calves",
            "difficulty_level": "Beginner",
            "instructions": "1. Adjust seat height. 2. Start pedaling at a comfortable pace. 3. Adjust resistance as needed.",
            "safety_tips": "Set proper seat height to avoid knee strain. Keep a steady pace.",
            "quantity": 4,
            "location": "Cardio Zone"
        },
        {
            "name": "Bench Press Station",
            "category": "Strength",
            "description": "Flat bench with barbell rack for chest pressing exercises.",
            "muscle_groups": "Chest, Triceps, Shoulders",
            "difficulty_level": "Intermediate",
            "instructions": "1. Lie flat on bench. 2. Grip bar slightly wider than shoulder width. 3. Lower bar to chest. 4. Press up to starting position.",
            "safety_tips": "Always use a spotter for heavy weights. Keep feet flat on floor. Don't bounce bar off chest.",
            "quantity": 3,
            "location": "Free Weights Area"
        },
        {
            "name": "Squat Rack",
            "category": "Strength",
            "description": "Power rack for squats and other barbell exercises.",
            "muscle_groups": "Quadriceps, Hamstrings, Glutes, Core",
            "difficulty_level": "Intermediate",
            "instructions": "1. Set safety bars at appropriate height. 2. Position bar on upper back. 3. Squat down keeping knees over toes. 4. Drive up through heels.",
            "safety_tips": "Set safety bars before lifting. Keep core tight. Don't let knees cave inward.",
            "quantity": 2,
            "location": "Free Weights Area"
        },
        {
            "name": "Lat Pulldown Machine",
            "category": "Machines",
            "description": "Cable machine for back and lat exercises.",
            "muscle_groups": "Latissimus Dorsi, Biceps, Rear Deltoids",
            "difficulty_level": "Beginner",
            "instructions": "1. Sit and secure thighs under pad. 2. Grip bar wide. 3. Pull bar down to upper chest. 4. Control the weight back up.",
            "safety_tips": "Don't pull bar behind neck. Control the weight on the way up.",
            "quantity": 2,
            "location": "Machine Area"
        },
        {
            "name": "Dumbbells Set",
            "category": "Free Weights",
            "description": "Complete set of dumbbells from 2kg to 40kg.",
            "muscle_groups": "Full Body",
            "difficulty_level": "Beginner",
            "instructions": "Various exercises possible. Start with lighter weights to learn proper form.",
            "safety_tips": "Select appropriate weight. Don't swing weights. Maintain proper form.",
            "quantity": 20,
            "location": "Free Weights Area"
        },
        {
            "name": "Cable Crossover Machine",
            "category": "Machines",
            "description": "Dual cable system for various pulling and pushing exercises.",
            "muscle_groups": "Chest, Back, Shoulders, Arms",
            "difficulty_level": "Intermediate",
            "instructions": "1. Set pulleys to desired height. 2. Select weight. 3. Perform controlled movements.",
            "safety_tips": "Start with lighter weight to learn movement patterns. Keep controlled movements.",
            "quantity": 1,
            "location": "Machine Area"
        },
        {
            "name": "Leg Press Machine",
            "category": "Machines",
            "description": "Machine for leg pressing exercises targeting lower body.",
            "muscle_groups": "Quadriceps, Hamstrings, Glutes",
            "difficulty_level": "Beginner",
            "instructions": "1. Sit and place feet shoulder-width apart. 2. Lower platform by bending knees. 3. Press back up without locking knees.",
            "safety_tips": "Don't lock knees at top. Keep lower back pressed against seat. Use appropriate weight.",
            "quantity": 2,
            "location": "Machine Area"
        },
        {
            "name": "Pull-up Bar",
            "category": "Bodyweight",
            "description": "Fixed bar for pull-ups, chin-ups, and hanging exercises.",
            "muscle_groups": "Back, Biceps, Core",
            "difficulty_level": "Intermediate",
            "instructions": "1. Grip bar with hands shoulder-width or wider. 2. Pull yourself up until chin is over bar. 3. Lower with control.",
            "safety_tips": "Avoid kipping if you're a beginner. Don't drop from the bar.",
            "quantity": 3,
            "location": "Functional Training Area"
        },
        {
            "name": "Rowing Machine",
            "category": "Cardio",
            "description": "Indoor rowing machine for full-body cardio workout.",
            "muscle_groups": "Back, Arms, Legs, Core",
            "difficulty_level": "Beginner",
            "instructions": "1. Secure feet in straps. 2. Push with legs first, then pull with arms. 3. Reverse the motion to return.",
            "safety_tips": "Maintain proper posture. Drive with legs, not just arms. Keep a steady rhythm.",
            "quantity": 3,
            "location": "Cardio Zone"
        },
        {
            "name": "Kettlebells Set",
            "category": "Free Weights",
            "description": "Set of kettlebells for functional training and conditioning.",
            "muscle_groups": "Full Body",
            "difficulty_level": "Intermediate",
            "instructions": "Various exercises possible including swings, cleans, and snatches.",
            "safety_tips": "Learn proper swing technique first. Keep core engaged. Use hip drive for swings.",
            "quantity": 10,
            "location": "Functional Training Area"
        },
        {
            "name": "Smith Machine",
            "category": "Machines",
            "description": "Guided barbell machine for various exercises with built-in safety.",
            "muscle_groups": "Full Body",
            "difficulty_level": "Beginner",
            "instructions": "1. Adjust bar height. 2. Rack weight. 3. Perform exercise with guided bar path.",
            "safety_tips": "Set safety stops properly. Rotate bar to lock if needed.",
            "quantity": 1,
            "location": "Machine Area"
        },
        {
            "name": "Elliptical Trainer",
            "category": "Cardio",
            "description": "Low-impact cardio machine simulating walking/running motion.",
            "muscle_groups": "Legs, Glutes, Arms",
            "difficulty_level": "Beginner",
            "instructions": "1. Step on and hold handles. 2. Start moving in smooth elliptical motion. 3. Adjust resistance as needed.",
            "safety_tips": "Maintain upright posture. Don't lean too heavily on handles.",
            "quantity": 3,
            "location": "Cardio Zone"
        },
        {
            "name": "Adjustable Bench",
            "category": "Free Weights",
            "description": "Adjustable bench for various dumbbell and bodyweight exercises.",
            "muscle_groups": "Full Body",
            "difficulty_level": "Beginner",
            "instructions": "Adjust to flat, incline, or decline position as needed for different exercises.",
            "safety_tips": "Ensure bench is locked in position before use. Place feet firmly on floor.",
            "quantity": 4,
            "location": "Free Weights Area"
        }
    ]
    
    existing_count = db.query(Equipment).count()
    if existing_count == 0:
        for eq_data in equipment_data:
            equipment = Equipment(
                **eq_data,
                available_quantity=eq_data["quantity"],
                is_available=True
            )
            db.add(equipment)
        db.commit()
        print(f"✅ {len(equipment_data)} equipment items created")
    else:
        print(f"ℹ️ Equipment already exists ({existing_count} items)")


def seed_gym_status(db: Session):
    """Create initial gym status"""
    status = db.query(GymStatus).first()
    if not status:
        status = GymStatus(
            is_open=True,
            status_message="Gym is open",
            current_occupancy=0,
            max_capacity=100,
            special_notice="Welcome to FitTrack CUET Gymnasium!"
        )
        db.add(status)
        db.commit()
        print("✅ Gym status initialized")
    else:
        print("ℹ️ Gym status already exists")


def seed_welcome_announcement(db: Session):
    """Create welcome announcement"""
    announcement = db.query(Announcement).first()
    if not announcement:
        announcement = Announcement(
            title="Welcome to FitTrack CUET",
            content="Welcome to the FitTrack CUET Gymnasium Management System! We're excited to have you here. Check out our equipment catalog, track your workouts, and chat with our AI fitness instructor for personalized advice.",
            category="General",
            priority="normal",
            is_active=True,
            is_pinned=True
        )
        db.add(announcement)
        db.commit()
        print("✅ Welcome announcement created")
    else:
        print("ℹ️ Announcements already exist")


def seed_all():
    """Run all seed functions"""
    print("\n🌱 Starting database seeding...\n")
    
    # Create tables
    create_tables()
    print("✅ Database tables created/verified\n")
    
    # Create session
    db = SessionLocal()
    
    try:
        seed_admin_user(db)
        seed_equipment(db)
        seed_gym_status(db)
        seed_welcome_announcement(db)
        
        print("\n✅ Database seeding completed!\n")
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}\n")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
