"""
Script to update medical_profiles table structure
"""
import psycopg2
from psycopg2 import sql

# Database connection
DATABASE_URL = "postgresql://postgres:admin@localhost:5432/fittrack_cuet"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("🔄 Updating medical_profiles table...")
    
    # Drop existing columns
    try:
        cur.execute("ALTER TABLE medical_profiles DROP COLUMN IF EXISTS medications CASCADE")
        cur.execute("ALTER TABLE medical_profiles DROP COLUMN IF EXISTS injuries CASCADE")
        cur.execute("ALTER TABLE medical_profiles DROP COLUMN IF EXISTS emergency_contact_name CASCADE")
        cur.execute("ALTER TABLE medical_profiles DROP COLUMN IF EXISTS emergency_contact_phone CASCADE")
        cur.execute("ALTER TABLE medical_profiles DROP COLUMN IF EXISTS emergency_contact_relation CASCADE")
        print("✅ Dropped old columns")
    except Exception as e:
        print(f"⚠️  Error dropping columns: {e}")
    
    # Add new columns if they don't exist
    try:
        # Change medical_conditions to JSON
        cur.execute("""
            ALTER TABLE medical_profiles 
            ALTER COLUMN medical_conditions TYPE JSONB USING 
            CASE 
                WHEN medical_conditions IS NULL THEN NULL
                WHEN medical_conditions = '' THEN '[]'::jsonb
                ELSE ('["' || medical_conditions || '"]')::jsonb
            END
        """)
        print("✅ Converted medical_conditions to JSONB")
    except Exception as e:
        print(f"⚠️  Error converting medical_conditions: {e}")
    
    try:
        # Change allergies to JSON
        cur.execute("""
            ALTER TABLE medical_profiles 
            ALTER COLUMN allergies TYPE JSONB USING 
            CASE 
                WHEN allergies IS NULL THEN NULL
                WHEN allergies = '' THEN '[]'::jsonb
                ELSE ('["' || allergies || '"]')::jsonb
            END
        """)
        print("✅ Converted allergies to JSONB")
    except Exception as e:
        print(f"⚠️  Error converting allergies: {e}")
    
    # Add new columns
    new_columns = [
        ("conditions_details", "TEXT"),
        ("past_injuries", "TEXT"),
        ("current_medications", "TEXT"),
        ("physical_limitations", "TEXT"),
        ("emergency_contact", "JSONB"),
    ]
    
    for col_name, col_type in new_columns:
        try:
            cur.execute(f"""
                ALTER TABLE medical_profiles 
                ADD COLUMN IF NOT EXISTS {col_name} {col_type}
            """)
            print(f"✅ Added column: {col_name}")
        except Exception as e:
            print(f"⚠️  Error adding {col_name}: {e}")
    
    conn.commit()
    print("✅ Successfully updated medical_profiles table!")
    
    # Show current table structure
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'medical_profiles'
        ORDER BY ordinal_position
    """)
    
    print("\n📋 Current table structure:")
    for row in cur.fetchall():
        print(f"  - {row[0]}: {row[1]}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    if conn:
        conn.rollback()
finally:
    if cur:
        cur.close()
    if conn:
        conn.close()
