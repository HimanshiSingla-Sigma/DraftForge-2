from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, Field
from app.core.exceptions import PermissionDeniedError, ResourceNotFoundError
from app.dependencies import get_current_user, require_teacher
from app.models.database.models import UserProfileDB
from app.models.schemas.analytics import CohortAnalyticsResponse
from app.models.schemas.assignment import AssignmentResponse
from app.models.schemas.access_control import InvitationResponse, SectionResponse
from app.services.analytics_service import AnalyticsService
from app.services.assignment_service import AssignmentService
from app.services.invitation_service import InvitationService
from app.services.section_service import SectionService

router = APIRouter(prefix="/teachers", tags=["Teacher Portal"])
assignment_service = AssignmentService()
analytics_service = AnalyticsService()
section_service = SectionService()
invitation_service = InvitationService()


class StudentInvitePayload(BaseModel):
    email: str = Field(..., min_length=5)
    full_name: Optional[str] = None


@router.get("/assignments", response_model=List[AssignmentResponse], dependencies=[Depends(require_teacher)])
async def list_teacher_assignments(
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Retrieves all assignments managed by the authenticated teacher.
    """
    return assignment_service.list_teacher_assignments(teacher_id=current_user.id)


@router.get("/cohort-analytics", response_model=CohortAnalyticsResponse, dependencies=[Depends(require_teacher)])
async def get_cohort_analytics(
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Retrieves class-wide performance metrics, average scores, and weak-skill distributions.
    """
    return analytics_service.get_cohort_analytics()


# =========================================================================
# SECTION & STUDENT MANAGEMENT (Teacher Portal)
# =========================================================================

@router.get("/sections", response_model=List[SectionResponse], dependencies=[Depends(require_teacher)])
async def list_my_sections(
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Retrieves academic sections assigned to the authenticated teacher,
    populated with current enrollment counts.
    """
    is_admin = current_user.role.value == "ADMIN" if hasattr(current_user.role, "value") else current_user.role == "ADMIN"
    if is_admin:
        sections = section_service.list_sections_with_counts()
        return [SectionResponse(**s) for s in sections]

    raw_sections = section_service.get_teacher_sections(current_user.id)
    results = []
    for sec in raw_sections:
        counts = section_service.section_repo.get_section_counts(sec["id"])
        sec_copy = dict(sec)
        sec_copy["teachers_count"] = counts["teachers_count"]
        sec_copy["students_count"] = counts["students_count"]
        sec_copy["is_active"] = sec.get("is_active", True)
        results.append(SectionResponse(**sec_copy))
    return results


@router.get("/sections/{section_id}/students", dependencies=[Depends(require_teacher)])
async def list_section_students(
    section_id: str,
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Lists students enrolled in a specific section.
    Enforces authorization: teachers can only view students in their assigned sections.
    """
    is_admin = current_user.role.value == "ADMIN" if hasattr(current_user.role, "value") else current_user.role == "ADMIN"
    if not is_admin:
        if not section_service.section_repo.is_teacher_assigned(current_user.id, section_id):
            raise PermissionDeniedError("You are not assigned to this course section.")

    return section_service.get_section_students(section_id)


@router.post("/sections/{section_id}/invite-student", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_teacher)])
async def invite_student_to_section(
    section_id: str,
    payload: StudentInvitePayload,
    request: Request,
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Dispatches a single-use onboarding invitation link to a student for an assigned section.
    Enforces authorization to prevent unauthorized cross-section invitations.
    """
    ip_address = request.client.host if request.client else None
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    invitation = invitation_service.invite_student(
        inviter_id=current_user.id,
        inviter_email=current_user.email,
        inviter_role=role_str,
        student_email=payload.email,
        section_id=section_id,
        full_name=payload.full_name,
        ip_address=ip_address,
    )
    return {
        "status": "success",
        "message": f"Invitation dispatched to {payload.email}",
        "invitation": invitation,
    }


@router.get("/invitations", response_model=List[InvitationResponse], dependencies=[Depends(require_teacher)])
async def list_my_invitations(
    current_user: UserProfileDB = Depends(get_current_user)
):
    """
    Retrieves all student invitations initiated by the authenticated teacher.
    """
    is_admin = current_user.role.value == "ADMIN" if hasattr(current_user.role, "value") else current_user.role == "ADMIN"
    all_sections = {s["id"]: s["name"] for s in section_service.section_repo.list_active()}
    if is_admin:
        invitations = invitation_service.invitation_repo.list_invitations(limit=200)
    else:
        teacher_sections = section_service.get_teacher_sections(current_user.id)
        teacher_sec_ids = {sec["id"] for sec in teacher_sections}
        all_invitations = invitation_service.invitation_repo.list_invitations(limit=200)
        invitations = []
        for inv in all_invitations:
            inv_sec_ids = inv.get("section_ids") or []
            is_my_section = any(sid in teacher_sec_ids for sid in inv_sec_ids)
            if inv.get("inviter_id") == current_user.id or is_my_section:
                invitations.append(inv)

    for inv in invitations:
        inv["section_names"] = [all_sections[sid] for sid in inv.get("section_ids") or [] if sid in all_sections]
    return [InvitationResponse(**inv) for inv in invitations]