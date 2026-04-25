"""
Migration script to add last_active_at column to users table
Run this script to update the database schema
"""
import sys
from sqlalchemy import text
from app.core.database import engine

def migrate_add_last_active_at():
    """Add last_active_at column to users table"""
    try:
        with engine.connect() as connection:
            # Add the column
            connection.execute(text("""
                ALTER TABLE users 
                ADD COLUMN last_active_at TIMESTAMP NULL DEFAULT NULL
            """))
            connection.commit()
            print("✓ Successfully added 'last_active_at' column to users table")
    except Exception as e:
        print(f"✗ Error adding column: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_last_active_at()
