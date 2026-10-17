from fastapi import APIRouter, Depends, Query, Request, status
from app.core.exceptions import PermissionDeniedError, ResourceNotFoundError
from app.core.logging import get_logger
from app.dependencies import get_current_user
from app.models.database.models import UserProfileDB
from app.models.schemas.access_control import (
    AcceptInvitationRequest,
    InvitationResponse,
    VerifyInvitationResponse,
)
from app.models.schemas.auth import AuthTokenResponse
from app.services.invitation_service import InvitationService

logger = get_logger("invitations_router")
router = APIRouter(prefix="/invitations", tags=["Invitations"])
invitation_service = InvitationService()


@router.get("/verify", response_model=VerifyInvitationResponse)
async def verify_invitation(token: str = Query(..., min_length=1)):
    """
    Validates an invitation token hash, expiration, and status.
    Returns invitation payload if valid, or reason if invalid.
    """
    result = invitation_service.verify_token(token)
    return VerifyInvitationResponse(**result)


@router.post("/accept", response_model=AuthTokenResponse, status_code=status.HTTP_200_OK)
async def accept_invitation(payload: AcceptInvitationRequest, request: Request):
    """
    Consumes a single-use invitation token, provisions the Supabase Auth user,
    upserts their database profile, assigns them to their section(s), and returns
    an active JWT session.
    """
    ip_address = request.client.host if request.client else None
    result = invitation_service.accept_invitation(
        raw_token=payload.token,
        password=payload.password,
        full_name=payload.full_name,
        ip_address=ip_address,
    )
    return AuthTokenResponse(**result)


@router.post("/{invitation_id}/resend")
async def resend_invitation(
    invitation_id: str,
    request: Request,
    current_user: UserProfileDB = Depends(get_current_user),
):
    """
    Resends an existing invitation with a newly rotated token and updated expiry.
    Restricted to Admins or the Teacher who initiated the invitation.
    """
    invite = invitation_service.invitation_repo.get_by_id(invitation_id)
    if not invite:
        raise ResourceNotFoundError("Invitation", invitation_id)

    # Permission check: Admin or the inviter teacher
    is_admin = current_user.role.value == "ADMIN" if hasattr(current_user.role, "value") else current_user.role == "ADMIN"
    if not is_admin and invite.get("inviter_id") != current_user.id:
        raise PermissionDeniedError("You are not authorized to resend this invitation.")

    ip_address = request.client.host if request.client else None
    updated = invitation_service.resend_invitation(
        invitation_id=invitation_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        ip_address=ip_address,
    )
    email_sent = updated.get("email_sent", False)
    msg = (
        "Invitation refreshed and email resent."
        if email_sent
        else "Invitation refreshed. (Email delivery was not possible; please copy the activation link below)."
    )
    return {
        "status": "success",
        "message": msg,
        "invitation": updated,
        "invitation_url": updated.get("invitation_url"),
        "email_sent": email_sent,
    }


@router.post("/{invitation_id}/revoke")
async def revoke_invitation(
    invitation_id: str,
    request: Request,
    current_user: UserProfileDB = Depends(get_current_user),
):
    """
    Revokes an active invitation.
    Restricted to Admins or the Teacher who initiated the invitation.
    """
    invite = invitation_service.invitation_repo.get_by_id(invitation_id)
    if not invite:
        raise ResourceNotFoundError("Invitation", invitation_id)

    is_admin = current_user.role.value == "ADMIN" if hasattr(current_user.role, "value") else current_user.role == "ADMIN"
    if not is_admin and invite.get("inviter_id") != current_user.id:
        raise PermissionDeniedError("You are not authorized to revoke this invitation.")

    ip_address = request.client.host if request.client else None
    updated = invitation_service.revoke_invitation(
        invitation_id=invitation_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        ip_address=ip_address,
    )
    return {"status": "success", "message": "Invitation revoked successfully.", "invitation": updated}
