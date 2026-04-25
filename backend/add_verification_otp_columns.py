import sys
from sqlalchemy import text
from app.core.database import engine

def migrate_add_verification_otp():
    """Add verification_otp and verification_otp_expires_at columns to users table"""
    try:
        with engine.connect() as connection:
            # Add the columns
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN verification_otp VARCHAR(6) NULL DEFAULT NULL"))
                connection.commit()
                print("Successfully added 'verification_otp' column")
            except Exception as e:
                print(f"Error adding verification_otp column, might already exist: {e}")
            
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN verification_otp_expires_at TIMESTAMP NULL DEFAULT NULL"))
                connection.commit()
                print("Successfully added 'verification_otp_expires_at' column")
            except Exception as e:
                print(f"Error adding verification_otp_expires_at column, might already exist: {e}")
                
    except Exception as e:
        print(f"Database connection error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_verification_otp()
