"""
FitTrack CUET Backend - Main Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import create_tables, engine
from app.api import auth, users, workouts, equipment, medical_profile, diet, admin, ai_instructor, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print("🏋️ Starting FitTrack CUET Backend...")
    create_tables()
    print("✅ Database tables created/verified")
    yield
    # Shutdown
    print("👋 Shutting down FitTrack CUET Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## FitTrack CUET - Gymnasium Management System API
    
    A comprehensive backend for managing a university gymnasium with features including:
    
    - **Authentication**: User registration, login, JWT-based authentication
    - **User Management**: Profile management, admin controls
    - **Workouts**: Create, track, and manage workout routines
    - **Equipment**: Browse and manage gym equipment catalog
    - **Medical Profiles**: Store health information safely
    - **Diet Plans**: Personalized nutrition planning
    - **AI Instructor**: AI-powered fitness assistant using Gemini
    - **Admin Dashboard**: Gym status, announcements, analytics
    
    ### Authentication
    Most endpoints require authentication via Bearer token.
    Include the token in the Authorization header: `Bearer <token>`
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    redirect_slashes=False
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(equipment.router)
app.include_router(medical_profile.router)
app.include_router(diet.router)
app.include_router(admin.router)
app.include_router(ai_instructor.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Gymnasium Management System API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/api")
async def api_info():
    """API information endpoint"""
    return {
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users",
            "workouts": "/api/workouts",
            "equipment": "/api/equipment",
            "medical_profile": "/api/medical-profile",
            "diet": "/api/diet",
            "admin": "/api/admin",
            "ai_instructor": "/api/ai-instructor"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
