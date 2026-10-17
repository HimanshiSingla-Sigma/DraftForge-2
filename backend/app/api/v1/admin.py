from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Request, status
from app.core.exceptions import PermissionDeniedError, ValidationError
from app.core.logging import get_logger
from app.dependencies import require_admin
from app.models.database.models import UserProfileDB
from app.models.schemas.access_control import (
    AdminOverviewStats,
    AdminTransferRequest,
    AssignTeacherSectionsRequest,
    AuditLogResponse,
    InvitationResponse,
    InviteTeacherRequest,
    SectionCreateRequest,
    SectionResponse,
    StudentOverviewResponse,
    TeacherOverviewResponse,
)
from app.services.admin_service import AdminService
from app.services.invitation_service import InvitationService
from app.services.section_service import SectionService

logger = get_logger("admin_router")
router = APIRouter(prefix="/admin", tags=["Admin Operations"])

admin_service = AdminService()
section_service = SectionService()
invitation_service = InvitationService()


@router.get("/stats", response_model=AdminOverviewStats)
async def get_admin_stats(
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Returns administrative dashboard summary counters: teachers, students,
    active sections, and invitation states.
    """
    return admin_service.get_overview_stats()


@router.get("/teachers", response_model=List[TeacherOverviewResponse])
async def list_teachers(
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Returns all registered teachers along with their assigned course sections.
    """
    return admin_service.list_teachers_overview()


@router.post("/teachers/invite", status_code=status.HTTP_201_CREATED)
async def invite_teacher(
    payload: InviteTeacherRequest,
    request: Request,
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Sends an onboarding invitation to an academic instructor.
    Enforces official university domain (@ncuindia.edu).
    """
    ip_address = request.client.host if request.client else None
    result = invitation_service.invite_teacher(
        admin_id=admin.id,
        admin_email=admin.email,
        teacher_email=payload.email,
        section_ids=payload.section_ids,
        full_name=payload.full_name,
        ip_address=ip_address,
    )
    email_sent = result.get("email_sent", False)
    msg = (
        f"Faculty invitation dispatched to {payload.email}."
        if email_sent
        else f"Faculty invitation created for {payload.email}. (Email delivery was not possible; please copy the activation link below)."
    )
    return {
        "status": "success",
        "message": msg,
        "invitation": result,
        "invitation_url": result.get("invitation_url"),
        "email_sent": email_sent,
    }


@router.get("/students", response_model=List[StudentOverviewResponse])
async def list_students(
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Returns all registered students along with enrolled sections and draft/submission counts.
    """
    return admin_service.list_students_overview()


@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    payload: SectionCreateRequest,
    request: Request,
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Creates a new academic course section (e.g., LAW-2025-A).
    """
    ip_address = request.client.host if request.client else None
    section = section_service.create_section(
        name=payload.name,
        code=payload.code,
        academic_year=payload.academic_year,
        description=payload.description,
        admin_id=admin.id,
        admin_email=admin.email,
        ip_address=ip_address,
    )
    return SectionResponse(
        id=section["id"],
        name=section["name"],
        code=section["code"],
        academic_year=section["academic_year"],
        description=section.get("description"),
        is_active=section.get("is_active", True),
        teachers_count=0,
        students_count=0,
        created_at=section.get("created_at"),
    )


@router.get("/sections", response_model=List[SectionResponse])
async def list_sections(
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Lists all active academic sections with real-time teacher and student enrollment counts.
    """
    sections = section_service.list_sections_with_counts()
    return [SectionResponse(**s) for s in sections]


@router.post("/teachers/{teacher_id}/sections")
async def assign_teacher_sections(
    teacher_id: str,
    payload: AssignTeacherSectionsRequest,
    request: Request,
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Assigns or updates a teacher's allocated academic sections.
    """
    ip_address = request.client.host if request.client else None
    assigned = section_service.assign_teacher_sections(
        teacher_id=teacher_id,
        section_ids=payload.section_ids,
        admin_id=admin.id,
        admin_email=admin.email,
        ip_address=ip_address,
    )
    return {"status": "success", "teacher_id": teacher_id, "assigned_sections": assigned}


@router.get("/invitations", response_model=List[InvitationResponse])
async def list_invitations(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Lists all pending, accepted, or expired invitations with inviter details.
    """
    invitations = invitation_service.invitation_repo.list_invitations(
        role=role,
        status=status,
        limit=200,
    )
    # Populate section names for display
    all_sections = {s["id"]: s["name"] for s in section_service.section_repo.list_active()}
    for inv in invitations:
        inv["section_names"] = [all_sections[sid] for sid in inv.get("section_ids") or [] if sid in all_sections]
    return [InvitationResponse(**inv) for inv in invitations]


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = Query(None),
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Returns chronological security audit trail logs for administrative governance.
    """
    logs = admin_service.audit_repo.list_logs(limit=limit, action=action)
    return [AuditLogResponse(**log) for log in logs]


@router.post("/transfer")
async def transfer_admin(
    payload: AdminTransferRequest,
    request: Request,
    admin: UserProfileDB = Depends(require_admin),
):
    """
    Formally transfers root administrator ownership to another verified faculty member.
    The previous administrator is gracefully demoted to TEACHER.
    """
    ip_address = request.client.host if request.client else None
    result = admin_service.transfer_admin_role(
        current_admin_id=admin.id,
        current_admin_email=admin.email,
        new_admin_email=payload.new_admin_email,
        confirm_email=payload.confirm_email,
        reason=payload.reason,
        ip_address=ip_address,
    )
    return {"status": "success", "message": "Admin privileges transferred successfully.", "result": result}
