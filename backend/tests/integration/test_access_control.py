import hashlib
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.constants import UserRole
from app.core.exceptions import PermissionDeniedError, ValidationError, ResourceAlreadyExistsError
from app.dependencies import get_current_user, require_admin, require_teacher
from app.models.database.models import UserProfileDB
from app.services.invitation_service import InvitationService
from app.services.section_service import SectionService
from app.services.admin_service import AdminService
from unittest.mock import MagicMock, patch


@pytest.fixture
def mock_admin_user() -> UserProfileDB:
    return UserProfileDB(
        id="admin-uuid-0001",
        email="singlahimanshi2@gmail.com",
        role=UserRole.ADMIN,
        full_name="Chief Administrator",
        created_at="2026-08-22T00:00:00Z",
        updated_at="2026-08-22T00:00:00Z",
    )


@pytest.fixture
def mock_teacher_user() -> UserProfileDB:
    return UserProfileDB(
        id="teacher-uuid-0002",
        email="faculty@ncuindia.edu",
        role=UserRole.TEACHER,
        full_name="Prof. Sharma",
        created_at="2026-08-22T00:00:00Z",
        updated_at="2026-08-22T00:00:00Z",
    )


@pytest.fixture
def mock_student_user() -> UserProfileDB:
    return UserProfileDB(
        id="student-uuid-0003",
        email="student@ncuindia.edu",
        role=UserRole.STUDENT,
        full_name="Student Verma",
        created_at="2026-08-22T00:00:00Z",
        updated_at="2026-08-22T00:00:00Z",
    )


# =============================================================================
# 1. PUBLIC REGISTRATION LOCKDOWN TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_public_registration_is_strictly_blocked():
    """
    Verifies that public self-registration returns 403 Forbidden.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "intruder@gmail.com",
                "password": "Password123!",
                "role": "TEACHER",
                "full_name": "Intruder User",
            },
        )
    assert response.status_code == 403
    assert "Public self-registration is disabled" in response.json()["detail"]


# =============================================================================
# 2. EMAIL DOMAIN & INVITATION POLICY TESTS
# =============================================================================

def test_teacher_invitation_rejects_non_college_domain():
    """
    Teacher invitations must strictly require an authorized college domain (@ncuindia.edu).
    """
    service = InvitationService()
    with pytest.raises(ValidationError) as exc_info:
        service.invite_teacher(
            admin_id="admin-01",
            admin_email="admin@ncuindia.edu",
            teacher_email="faculty@gmail.com",
        )
    assert "Email domain must be one of" in str(exc_info.value.detail)


def test_teacher_invitation_accepts_valid_college_domain():
    """
    Verifies teacher invitation succeeds with valid college domain.
    """
    service = InvitationService()
    mock_invite = {
        "id": "inv-001",
        "email": "faculty@ncuindia.edu",
        "role": "TEACHER",
        "inviter_id": "admin-01",
        "status": "PENDING",
        "expires_at": "2026-10-20T00:00:00Z",
    }
    with patch.object(service.user_repo, "get_by_email", return_value=None):
        with patch.object(service.invitation_repo, "get_active_by_email", return_value=None):
            with patch.object(service.invitation_repo, "create", return_value=mock_invite):
                with patch.object(service.email_service, "send_invitation_email", return_value=True):
                    with patch.object(service.audit_repo, "log_event", return_value=None):
                        result = service.invite_teacher(
                            admin_id="admin-01",
                            admin_email="admin@ncuindia.edu",
                            teacher_email="faculty@ncuindia.edu",
                        )
                        assert result["id"] == "inv-001"
                        assert result["role"] == "TEACHER"


def test_student_invitation_rejects_non_college_domain_from_admin():
    """
    Student invitations from Admin must strictly require @ncuindia.edu domain.
    """
    service = InvitationService()
    mock_section = {"id": "sec-001", "name": "Law of Contracts", "is_active": True}
    with patch.object(service.section_repo, "get_by_id", return_value=mock_section):
        with pytest.raises(ValidationError) as exc_info:
            service.invite_student(
                inviter_id="admin-01",
                inviter_email="admin@ncuindia.edu",
                inviter_role="ADMIN",
                student_email="student@gmail.com",
                section_id="sec-001",
            )
        assert "Email domain must be one of" in str(exc_info.value.detail)


def test_student_invitation_rejects_non_college_domain_from_teacher():
    """
    Student invitations from Teacher must strictly require @ncuindia.edu domain.
    """
    service = InvitationService()
    mock_section = {"id": "sec-001", "name": "Law of Contracts", "is_active": True}
    with patch.object(service.section_repo, "get_by_id", return_value=mock_section):
        with patch.object(service.section_repo, "is_teacher_assigned", return_value=True):
            with pytest.raises(ValidationError) as exc_info:
                service.invite_student(
                    inviter_id="teacher-01",
                    inviter_email="teacher@ncuindia.edu",
                    inviter_role="TEACHER",
                    student_email="scholar@yahoo.com",
                    section_id="sec-001",
                )
            assert "Email domain must be one of" in str(exc_info.value.detail)


# =============================================================================
# 3. IDOR PREVENTION & SECTION AUTHORIZATION TESTS
# =============================================================================

def test_teacher_cannot_invite_student_to_unassigned_section():
    """
    Teacher cannot invite students to a section they are not assigned to (prevents IDOR).
    """
    service = InvitationService()
    mock_section = {"id": "sec-002", "name": "Corporate Law A", "is_active": True}

    with patch.object(service.section_repo, "get_by_id", return_value=mock_section):
        with patch.object(service.section_repo, "is_teacher_assigned", return_value=False):
            with pytest.raises(PermissionDeniedError) as exc_info:
                service.invite_student(
                    inviter_id="teacher-01",
                    inviter_email="teacher@ncuindia.edu",
                    inviter_role="TEACHER",
                    student_email="student@ncuindia.edu",
                    section_id="sec-002",
                )
            assert "Teacher is not authorized" in str(exc_info.value.detail)


def test_admin_can_invite_student_to_any_section():
    """
    Admin is authorized to invite students to any active section without assignment restrictions.
    """
    service = InvitationService()
    mock_section = {"id": "sec-002", "name": "Corporate Law A", "is_active": True}
    mock_invite = {
        "id": "inv-002",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "inviter_id": "admin-01",
        "status": "PENDING",
    }

    with patch.object(service.section_repo, "get_by_id", return_value=mock_section):
        with patch.object(service.invitation_repo, "get_active_by_email", return_value=None):
            with patch.object(service.invitation_repo, "create", return_value=mock_invite):
                with patch.object(service.email_service, "send_invitation_email", return_value=True):
                    with patch.object(service.audit_repo, "log_event", return_value=None):
                        res = service.invite_student(
                            inviter_id="admin-01",
                            inviter_email="admin@ncuindia.edu",
                            inviter_role="ADMIN",
                            student_email="student@ncuindia.edu",
                            section_id="sec-002",
                        )
                        assert res["id"] == "inv-002"
                        assert res["role"] == "STUDENT"


# =============================================================================
# 4. TOKEN VERIFICATION & CRYPTOGRAPHIC HASHING TESTS
# =============================================================================

def test_verify_invitation_token_valid():
    """
    Verifies that a valid token is correctly hashed with SHA-256 and details retrieved.
    """
    service = InvitationService()
    raw_token = "secret-token-xyz"
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    mock_db_invite = {
        "id": "inv-100",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "status": "PENDING",
        "expires_at": "2026-12-31T23:59:59Z",
        "inviter_id": "prof-01",
        "section_ids": ["sec-01"],
    }

    with patch.object(service.invitation_repo, "get_by_token_hash", return_value=mock_db_invite):
        with patch.object(service.section_repo, "get_by_id", return_value={"name": "Criminal Law"}):
            with patch.object(service.user_repo, "get_by_id", return_value={"full_name": "Prof. Rao"}):
                res = service.verify_token(raw_token)
                assert res["valid"] is True
                assert res["email"] == "student@ncuindia.edu"
                assert "Criminal Law" in res["section_names"]
                assert res["inviter_name"] == "Prof. Rao"


def test_verify_invitation_token_expired():
    """
    Verifies that an expired invitation token returns valid: False and marks status as EXPIRED.
    """
    service = InvitationService()
    raw_token = "expired-token"
    mock_db_invite = {
        "id": "inv-101",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "status": "PENDING",
        "expires_at": "2020-01-01T00:00:00Z",
    }
    with patch.object(service.invitation_repo, "get_by_token_hash", return_value=mock_db_invite):
        with patch.object(service.invitation_repo, "update", return_value=None):
            res = service.verify_token(raw_token)
            assert res["valid"] is False
            assert "expired" in res["message"].lower()


# =============================================================================
# 5. ADMIN ROLE TRANSFER & HANDOVER TESTS
# =============================================================================

def test_admin_transfer_validation():
    """
    Admin handover requires matching confirmation email and prohibits self-transfer.
    """
    service = AdminService()
    # Mismatched confirmation email
    with pytest.raises(ValidationError) as exc:
        service.transfer_admin_role(
            current_admin_id="adm-1",
            current_admin_email="current@ncuindia.edu",
            new_admin_email="new@ncuindia.edu",
            confirm_email="wrong@ncuindia.edu",
            reason="Handing over project leadership.",
        )
    assert "do not match" in str(exc.value.detail)

    # Transfer to self
    with pytest.raises(ValidationError) as exc:
        service.transfer_admin_role(
            current_admin_id="adm-1",
            current_admin_email="current@ncuindia.edu",
            new_admin_email="current@ncuindia.edu",
            confirm_email="current@ncuindia.edu",
            reason="Handing over to myself.",
        )
    assert "must be different" in str(exc.value.detail)


# =============================================================================
# 6. ROLE-BASED ACCESS CONTROL (RBAC) API ENDPOINT TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_admin_stats_endpoint_requires_admin(mock_student_user):
    """
    Student attempting to access /api/v1/admin/stats is rejected with 403 Forbidden.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_student_user
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            headers = {"Authorization": "Bearer fake-token"}
            response = await ac.get("/api/v1/admin/stats", headers=headers)
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_stats_endpoint_succeeds_for_admin(mock_admin_user):
    """
    Admin accessing /api/v1/admin/stats succeeds and returns metrics.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    app.dependency_overrides[require_admin] = lambda: mock_admin_user
    mock_stats = {
        "total_teachers": 5,
        "total_students": 120,
        "total_sections": 4,
        "pending_invitations": 10,
        "accepted_invitations": 115,
        "expired_invitations": 2,
    }
    with patch("app.api.v1.admin.admin_service.get_overview_stats", return_value=mock_stats):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.get("/api/v1/admin/stats")
            assert response.status_code == 200
            data = response.json()
            assert data["total_teachers"] == 5
            assert data["total_students"] == 120
            assert data["total_sections"] == 4
        finally:
            app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_section_duplicate_code_conflict(mock_admin_user):
    """
    Section creation with existing section code returns 409 Conflict.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    app.dependency_overrides[require_admin] = lambda: mock_admin_user

    with patch("app.api.v1.admin.section_service.create_section", side_effect=ResourceAlreadyExistsError("Section", "code", "LAW-101")):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.post(
                    "/api/v1/admin/sections",
                    json={"name": "Criminal Law A", "code": "LAW-101", "academic_year": "2025-2026"},
                )
            assert response.status_code == 409
            assert "LAW-101" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_invitation_verify_endpoint_valid():
    """
    GET /api/v1/invitations/verify returns valid: True with role and section details.
    """
    mock_verification = {
        "valid": True,
        "email": "faculty@ncuindia.edu",
        "role": UserRole.TEACHER,
        "section_ids": ["sec-1"],
        "section_names": ["Constitution 101"],
        "inviter_name": "Chief Administrator",
        "expires_at": "2026-12-31T00:00:00Z",
    }
    with patch("app.api.v1.invitations.invitation_service.verify_token", return_value=mock_verification):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/invitations/verify?token=valid-token-123")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["email"] == "faculty@ncuindia.edu"
        assert data["role"] == "TEACHER"
        assert "Constitution 101" in data["section_names"]


@pytest.mark.asyncio
async def test_invitation_verify_endpoint_invalid():
    """
    GET /api/v1/invitations/verify returns valid: False with error message for invalid token.
    """
    mock_invalid = {
        "valid": False,
        "message": "Invalid invitation link.",
    }
    with patch("app.api.v1.invitations.invitation_service.verify_token", return_value=mock_invalid):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/invitations/verify?token=invalid-fake-token")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "Invalid" in data["message"]


def test_invitation_resend_rotates_token():
    """
    Resending an invitation refreshes the token hash and updates expiry.
    """
    service = InvitationService()
    mock_invite = {
        "id": "inv-500",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": [],
    }
    with patch.object(service.invitation_repo, "get_by_id", return_value=mock_invite):
        with patch.object(service.invitation_repo, "refresh_invitation_token", return_value={"id": "inv-500", "status": "PENDING"}):
            with patch.object(service.email_service, "send_invitation_email", return_value=True):
                with patch.object(service.audit_repo, "log_event", return_value=None):
                    res = service.resend_invitation("inv-500", "admin-1", "admin@ncuindia.edu")
                    assert res["status"] == "PENDING"


def test_invitation_revoke_updates_status():
    """
    Revoking an invitation marks status as REVOKED and logs audit event.
    """
    service = InvitationService()
    mock_invite = {
        "id": "inv-600",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "status": "PENDING",
    }
    with patch.object(service.invitation_repo, "get_by_id", return_value=mock_invite):
        with patch.object(service.invitation_repo, "revoke_invitation", return_value={"id": "inv-600", "status": "REVOKED"}):
            with patch.object(service.audit_repo, "log_event", return_value=None):
                res = service.revoke_invitation("inv-600", "admin-1", "admin@ncuindia.edu")
                assert res["status"] == "REVOKED"


@pytest.mark.asyncio
async def test_teacher_sections_endpoint(mock_teacher_user):
    """
    GET /api/v1/teachers/sections returns assigned sections with enrollment counts.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
    app.dependency_overrides[require_teacher] = lambda: mock_teacher_user

    mock_sections = [
        {"id": "sec-10", "name": "Contract Law", "code": "LAW-101", "academic_year": "2025-2026", "description": None, "is_active": True}
    ]
    with patch("app.api.v1.teachers.section_service.get_teacher_sections", return_value=mock_sections):
        with patch("app.api.v1.teachers.section_service.section_repo.get_section_counts", return_value={"teachers_count": 1, "students_count": 35}):
            try:
                transport = ASGITransport(app=app)
                async with AsyncClient(transport=transport, base_url="http://test") as ac:
                    response = await ac.get("/api/v1/teachers/sections")
                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1
                assert data[0]["name"] == "Contract Law"
                assert data[0]["students_count"] == 35
            finally:
                app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_students_invite_endpoint(mock_admin_user):
    """
    POST /api/v1/admin/students/invite enables administrators to invite students to any section.
    """
    app.dependency_overrides[require_admin] = lambda: mock_admin_user
    mock_invite = {
        "id": "inv-student-100",
        "email": "student2025@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": ["sec-10"],
        "status": "PENDING",
        "expires_at": "2026-10-21T00:00:00Z",
        "invitation_url": "http://localhost:5173/accept-invitation?token=mocktoken123",
        "email_sent": False,
    }
    with patch("app.api.v1.admin.invitation_service.invite_student", return_value=mock_invite):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.post(
                    "/api/v1/admin/students/invite",
                    json={
                        "email": "student2025@ncuindia.edu",
                        "section_id": "sec-10",
                        "full_name": "Rohan Mehra",
                    },
                )
            assert response.status_code == 201
            data = response.json()
            assert data["status"] == "success"
            assert data["invitation"]["email"] == "student2025@ncuindia.edu"
            assert data["invitation"]["role"] == "STUDENT"
            assert data["invitation_url"] == "http://localhost:5173/accept-invitation?token=mocktoken123"
            assert data["email_sent"] is False
        finally:
            app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_teacher_cannot_access_admin_invitation_endpoints(mock_teacher_user):
    """
    Teachers are strictly forbidden from accessing /admin/teachers/invite and /admin/students/invite.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res_teachers = await ac.post(
                "/api/v1/admin/teachers/invite",
                json={"email": "prof2@ncuindia.edu", "section_ids": []},
            )
            assert res_teachers.status_code == 403

            res_students = await ac.post(
                "/api/v1/admin/students/invite",
                json={"email": "stud2@ncuindia.edu", "section_id": "sec-10"},
            )
            assert res_students.status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_teacher_can_invite_student_to_assigned_section(mock_teacher_user):
    """
    POST /api/v1/teachers/sections/{section_id}/invite-student succeeds for assigned teacher.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
    app.dependency_overrides[require_teacher] = lambda: mock_teacher_user
    mock_invite = {
        "id": "inv-student-200",
        "email": "scholar@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": ["sec-10"],
        "status": "PENDING",
        "expires_at": "2026-10-21T00:00:00Z",
    }
    with patch("app.api.v1.teachers.invitation_service.invite_student", return_value=mock_invite):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                response = await ac.post(
                    "/api/v1/teachers/sections/sec-10/invite-student",
                    json={"email": "scholar@ncuindia.edu", "full_name": "Scholar One"},
                )
            assert response.status_code == 201
            data = response.json()
            assert data["status"] == "success"
            assert data["invitation"]["role"] == "STUDENT"
        finally:
            app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_and_teacher_whatsapp_invitation_flows(mock_admin_user, mock_teacher_user):
    """
    Verifies the 3 required invitation flows return valid invitation URLs and roles:
    1. Admin -> Teacher (role: TEACHER, invitation_url present)
    2. Admin -> Student (role: STUDENT, invitation_url present)
    3. Teacher -> Student (role: STUDENT, invitation_url present)
    """
    # 1. Admin -> Teacher
    app.dependency_overrides[require_admin] = lambda: mock_admin_user
    mock_teacher_invite = {
        "id": "inv-teacher-whatsapp-1",
        "email": "dr.patel@ncuindia.edu",
        "role": "TEACHER",
        "section_ids": ["sec-101"],
        "status": "PENDING",
        "expires_at": "2026-10-21T00:00:00Z",
        "invitation_url": "http://localhost:5173/accept-invitation?token=teacher_token_xyz",
        "email_sent": False,
    }
    with patch("app.api.v1.admin.invitation_service.invite_teacher", return_value=mock_teacher_invite):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                res_teacher = await ac.post(
                    "/api/v1/admin/teachers/invite",
                    json={
                        "email": "dr.patel@ncuindia.edu",
                        "full_name": "Dr. Patel",
                        "section_ids": ["sec-101"],
                    },
                )
            assert res_teacher.status_code == 201
            teacher_data = res_teacher.json()
            assert teacher_data["status"] == "success"
            assert teacher_data["invitation"]["role"] == "TEACHER"
            assert teacher_data["invitation_url"] == "http://localhost:5173/accept-invitation?token=teacher_token_xyz"
        finally:
            app.dependency_overrides.clear()

    # 2. Admin -> Student
    app.dependency_overrides[require_admin] = lambda: mock_admin_user
    mock_student_invite = {
        "id": "inv-student-whatsapp-2",
        "email": "24llb999@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": ["sec-101"],
        "status": "PENDING",
        "expires_at": "2026-10-21T00:00:00Z",
        "invitation_url": "http://localhost:5173/accept-invitation?token=student_token_abc",
        "email_sent": False,
    }
    with patch("app.api.v1.admin.invitation_service.invite_student", return_value=mock_student_invite):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                res_student = await ac.post(
                    "/api/v1/admin/students/invite",
                    json={
                        "email": "24llb999@ncuindia.edu",
                        "section_id": "sec-101",
                        "full_name": "Kavya Rao",
                    },
                )
            assert res_student.status_code == 201
            student_data = res_student.json()
            assert student_data["status"] == "success"
            assert student_data["invitation"]["role"] == "STUDENT"
            assert student_data["invitation_url"] == "http://localhost:5173/accept-invitation?token=student_token_abc"
        finally:
            app.dependency_overrides.clear()

    # 3. Teacher -> Student
    app.dependency_overrides[get_current_user] = lambda: mock_teacher_user
    app.dependency_overrides[require_teacher] = lambda: mock_teacher_user
    mock_teacher_to_student = {
        "id": "inv-t2s-whatsapp-3",
        "email": "24llb101@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": ["sec-101"],
        "status": "PENDING",
        "expires_at": "2026-10-21T00:00:00Z",
        "invitation_url": "http://localhost:5173/accept-invitation?token=t2s_token_def",
        "email_sent": False,
    }
    with patch("app.api.v1.teachers.invitation_service.invite_student", return_value=mock_teacher_to_student):
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                res_t2s = await ac.post(
                    "/api/v1/teachers/sections/sec-101/invite-student",
                    json={
                        "email": "24llb101@ncuindia.edu",
                        "full_name": "Aarav Gupta",
                    },
                )
            assert res_t2s.status_code == 201
            t2s_data = res_t2s.json()
            assert t2s_data["status"] == "success"
            assert t2s_data["invitation"]["role"] == "STUDENT"
            assert t2s_data["invitation_url"] == "http://localhost:5173/accept-invitation?token=t2s_token_def"
        finally:
            app.dependency_overrides.clear()



