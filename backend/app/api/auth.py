"""
Authentication API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from app.core.database import get_db
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    create_verification_otp,
    decode_token,
    get_current_user
)
from app.services.email_service import send_verification_email
from fastapi import BackgroundTasks
from pydantic import BaseModel
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    UserLogin, 
    Token,
    PasswordChange
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if student_id already exists
    existing_user = db.query(User).filter(User.student_id == user_data.student_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    otp = create_verification_otp()
    
    new_user = User(
        student_id=user_data.student_id,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        department=user_data.department,
        level=user_data.level,
        term=user_data.term,
        phone=user_data.phone,
        verification_otp=otp,
        verification_otp_expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    background_tasks.add_task(send_verification_email, new_user.email, otp)
    
    return {"message": "User registered successfully. Please check your email to verify your account."}


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login with student ID and password"""
    # Find user by student_id
    user = db.query(User).filter(User.student_id == user_data.student_id).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
        
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not verified. Please check your email to verify your account."
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

class VerifyEmailRequest(BaseModel):
    token: str

@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify user's email with token"""
    try:
        if not request.token or len(request.token) != 6:
            raise HTTPException(status_code=400, detail="Invalid OTP format")
            
        user = db.query(User).filter(User.verification_otp == request.token).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code")
            
        if user.is_email_verified:
            return {"message": "Email is already verified"}
            
        if user.verification_otp_expires_at and user.verification_otp_expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP code has expired")
            
        user.is_email_verified = True
        user.verification_otp = None
        user.verification_otp_expires_at = None
        db.commit()
        return {"message": "Email verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid request")


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 compatible token endpoint"""
    user = db.query(User).filter(User.student_id == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not verified"
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and update last_active_at timestamp"""
    current_user.last_active_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Logged out successfully"}
