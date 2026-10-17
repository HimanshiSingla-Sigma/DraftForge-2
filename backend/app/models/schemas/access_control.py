from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import UserRole, InvitationStatus


class SectionCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    code: str = Field(..., min_length=2, max_length=64)
    academic_year: str = Field(default="2025-2026", max_length=64)
    description: Optional[str] = None


class SectionUpdateRequest(BaseModel):
    name: Optional[str] = None
    academic_year: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: str
    name: str
    code: str
    academic_year: str
    description: Optional[str] = None
    is_active: bool = True
    teachers_count: int = 0
    students_count: int = 0
    created_at: Optional[Any] = None


class AssignTeacherSectionsRequest(BaseModel):
    teacher_id: str
    section_ids: List[str]


class InviteTeacherRequest(BaseModel):
    email: str = Field(..., min_length=5)
    section_ids: List[str] = Field(default_factory=list)
    full_name: Optional[str] = None


class InviteStudentRequest(BaseModel):
    email: str = Field(..., min_length=5)
    section_id: str
    full_name: Optional[str] = None


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: str
    email: str
    role: UserRole
    inviter_id: str
    inviter_email: Optional[str] = None
    section_ids: List[str] = Field(default_factory=list)
    section_names: List[str] = Field(default_factory=list)
    status: str
    expires_at: Any
    accepted_at: Optional[Any] = None
    created_at: Optional[Any] = None


class VerifyInvitationResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    role: Optional[UserRole] = None
    section_ids: List[str] = Field(default_factory=list)
    section_names: List[str] = Field(default_factory=list)
    inviter_name: Optional[str] = None
    expires_at: Optional[Any] = None
    message: Optional[str] = None


class AcceptInvitationRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class AdminOverviewStats(BaseModel):
    total_teachers: int = 0
    total_students: int = 0
    total_sections: int = 0
    pending_invitations: int = 0
    accepted_invitations: int = 0
    expired_invitations: int = 0


class TeacherOverviewResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    assigned_sections: List[Dict[str, str]] = Field(default_factory=list)
    is_active: bool = True
    created_at: Optional[Any] = None


class StudentOverviewResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    enrolled_sections: List[Dict[str, str]] = Field(default_factory=list)
    drafts_count: int = 0
    submissions_count: int = 0
    created_at: Optional[Any] = None


class AuditLogResponse(BaseModel):
    id: str
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    created_at: Optional[Any] = None


class AdminTransferRequest(BaseModel):
    new_admin_email: str
    confirm_email: str
    reason: str = Field(..., min_length=10)
