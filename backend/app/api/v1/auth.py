from fastapi import APIRouter, Depends, status
from supabase import create_client
from app.config import get_settings
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.db.repositories.user_repository import UserRepository
from app.dependencies import get_current_user
from app.models.database.models import UserProfileDB
from app.models.schemas.auth import AuthTokenResponse, UserLoginRequest, UserRegisterRequest
from app.core.logging import get_logger

logger = get_logger("auth_router")
router = APIRouter(prefix="/auth", tags=["Authentication"])
user_repo = UserRepository()
settings = get_settings()


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest):
    """
    Public self-registration is strictly disabled to prevent unauthorized role creation.
    Accounts must be provisioned via an authorized university invitation link.
    """
    logger.warning(f"Rejected public registration attempt for email: {payload.email}")
    raise PermissionDeniedError(
        "Public self-registration is disabled. An authorized university invitation is required to register. "
        "Please check your email for an invitation link or contact your academic administrator."
    )



@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: UserLoginRequest):
    """
    Authenticates an existing user with Supabase Auth and returns JWT token.
    Uses an isolated ephemeral client to avoid state/token pollution.
    """
    auth_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    try:
        auth_response = auth_client.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
    except Exception as exc:
        logger.error(f"Supabase login error: {exc}")
        raise AuthenticationError("Invalid email or password.") from exc

    if not auth_response.user or not auth_response.session:
        raise AuthenticationError("Authentication failed.")

    user_id = str(auth_response.user.id)
    profile = user_repo.get_by_id(user_id)
    if not profile:
        profile = user_repo.upsert_profile(
            user_id=user_id,
            email=payload.email,
            role=auth_response.user.user_metadata.get("role", "STUDENT"),
            full_name=auth_response.user.user_metadata.get("full_name")
        )

    return AuthTokenResponse(
        access_token=auth_response.session.access_token,
        user_id=user_id,
        email=profile["email"],
        role=profile["role"],
        full_name=profile.get("full_name"),
    )


@router.get("/me")
async def get_my_profile(
    current_user: UserProfileDB = Depends(get_current_user),
):
    """
    Returns the authenticated user's verified database profile and role.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role,
        "full_name": current_user.full_name,
    }