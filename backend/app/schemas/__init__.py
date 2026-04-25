"""
Schemas package - Pydantic models for request/response validation
"""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    Token,
    TokenData,
    PasswordChange
)
from app.schemas.workout import (
    ExerciseBase,
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseResponse,
    WorkoutBase,
    WorkoutCreate,
    WorkoutUpdate,
    WorkoutResponse,
    WorkoutListResponse
)
from app.schemas.equipment import (
    EquipmentBase,
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentListResponse
)
from app.schemas.medical_profile import (
    MedicalProfileBase,
    MedicalProfileCreate,
    MedicalProfileUpdate,
    MedicalProfileResponse,
    HealthMetrics
)
from app.schemas.diet_plan import (
    MealItem,
    Meal,
    DietPlanBase,
    DietPlanCreate,
    DietPlanUpdate,
    DietPlanResponse,
    DietPreferenceBase,
    DietPreferenceResponse
)
from app.schemas.gym_status import (
    GymStatusBase,
    GymStatusUpdate,
    GymStatusResponse,
    AnnouncementBase,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    AnnouncementListResponse
)
from app.schemas.chat import (
    ChatMessageBase,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatHistoryResponse,
    ChatFeedback,
    AIQueryRequest,
    AIResponse
)
