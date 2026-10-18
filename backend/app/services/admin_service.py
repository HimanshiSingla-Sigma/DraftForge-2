from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.config import get_settings
from app.core.constants import UserRole
from app.core.exceptions import (
    PermissionDeniedError,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.logging import get_logger
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.invitation_repository import InvitationRepository
from app.db.repositories.section_repository import SectionRepository
from app.db.repositories.user_repository import UserRepository
from app.db.supabase import get_supabase_admin_client
from app.services.email_service import EmailService

logger = get_logger("admin_service")


class AdminService:
    def __init__(self):
        self.settings = get_settings()
        self.user_repo = UserRepository()
        self.section_repo = SectionRepository()
        self.invitation_repo = InvitationRepository()
        self.audit_repo = AuditRepository()
        self.email_service = EmailService()

    def get_overview_stats(self) -> Dict[str, int]:
        total_teachers = self.user_repo.count_by_role("TEACHER")
        total_students = self.user_repo.count_by_role("STUDENT")
        total_sections = len(self.section_repo.list_active())

        # Invitation counts
        invitations = self.invitation_repo.list_invitations(limit=1000)
        pending = sum(1 for i in invitations if i.get("status") == "PENDING")
        accepted = sum(1 for i in invitations if i.get("status") == "ACCEPTED")
        expired = sum(1 for i in invitations if i.get("status") == "EXPIRED")

        return {
            "total_teachers": total_teachers,
            "total_students": total_students,
            "total_sections": total_sections,
            "pending_invitations": pending,
            "accepted_invitations": accepted,
            "expired_invitations": expired,
        }

    def list_teachers_overview(self) -> List[Dict[str, Any]]:
        teachers = self.user_repo.list_by_role("TEACHER")
        results = []
        for t in teachers:
            sections = self.section_repo.get_teacher_sections(t["id"])
            sec_summary = [{"id": s["id"], "name": s["name"], "code": s["code"]} for s in sections]
            results.append({
                "id": t["id"],
                "email": t["email"],
                "full_name": t.get("full_name"),
                "assigned_sections": sec_summary,
                "is_active": not (t.get("metadata") or {}).get("is_deactivated", False),
                "created_at": t.get("created_at"),
            })
        return results

    def list_students_overview(self) -> List[Dict[str, Any]]:
        students = self.user_repo.list_by_role("STUDENT")
        client = self.user_repo.client
        results = []
        for s in students:
            sections = self.section_repo.get_student_sections(s["id"])
            sec_summary = [{"id": sec["id"], "name": sec["name"], "code": sec["code"]} for sec in sections]

            # Count drafts and submissions
            drafts_res = client.table("drafts").select("id", count="exact").eq("user_id", s["id"]).execute()
            subs_res = client.table("submissions").select("id", count="exact").eq("student_id", s["id"]).execute()

            results.append({
                "id": s["id"],
                "email": s["email"],
                "full_name": s.get("full_name"),
                "enrolled_sections": sec_summary,
                "drafts_count": drafts_res.count or len(drafts_res.data or []),
                "submissions_count": subs_res.count or len(subs_res.data or []),
                "created_at": s.get("created_at"),
            })
        return results

    # =========================================================================
    # FIRST-ADMIN SECURE PROVISIONING (Phase 4)
    # =========================================================================
    def bootstrap_initial_admin(
        self,
        admin_password: Optional[str] = None,
        full_name: str = "Chief Administrator",
        ip_address: Optional[str] = "127.0.0.1",
    ) -> Dict[str, Any]:
        """
        Secure, idempotent bootstrap process for the designated initial administrator.
        Uses INITIAL_ADMIN_EMAIL from server-side configuration.
        """
        target_email = self.settings.normalize_email(self.settings.INITIAL_ADMIN_EMAIL)
        if not target_email or "@" not in target_email:
            raise ValidationError(f"Invalid INITIAL_ADMIN_EMAIL in configuration: '{target_email}'")

        supabase = get_supabase_admin_client()
        existing_profile = self.user_repo.get_by_email(target_email)

        if existing_profile:
            user_id = existing_profile["id"]
            if existing_profile.get("role") == "ADMIN":
                logger.info(f"Initial admin '{target_email}' is already provisioned with role ADMIN.")
                return {
                    "status": "ALREADY_PROVISIONED",
                    "user_id": user_id,
                    "email": target_email,
                    "role": "ADMIN",
                }

            # Account exists with student/teacher role -> upgrade to ADMIN
            logger.info(f"Promoting existing user '{target_email}' to ADMIN.")
            self.user_repo.update_role(user_id, "ADMIN")

            try:
                supabase.auth.admin.update_user_by_id(
                    user_id,
                    {"user_metadata": {"role": "ADMIN", "full_name": existing_profile.get("full_name") or full_name}},
                )
            except Exception as exc:
                logger.warning(f"Could not update Supabase user metadata for admin: {exc}")

            self.audit_repo.log_event(
                action="BOOTSTRAP_INITIAL_ADMIN",
                actor_id=user_id,
                actor_email=target_email,
                target_type="USER",
                target_id=user_id,
                details={"email": target_email, "action": "UPGRADED_TO_ADMIN"},
                ip_address=ip_address,
            )

            return {
                "status": "UPGRADED_TO_ADMIN",
                "user_id": user_id,
                "email": target_email,
                "role": "ADMIN",
            }

        # User does not exist in profiles. Try checking Supabase Auth
        pwd = admin_password or "AdminForgePass2026!"
        try:
            auth_user = supabase.auth.admin.create_user({
                "email": target_email,
                "password": pwd,
                "email_confirm": True,
                "user_metadata": {
                    "role": "ADMIN",
                    "full_name": full_name,
                },
            })
            user_id = str(auth_user.user.id)
        except Exception as exc:
            # If user already exists in auth.users, fetch by email
            logger.warning(f"Supabase create_user note: {exc}")
            auth_users_res = supabase.auth.admin.list_users()
            matching = [u for u in auth_users_res if u.email and u.email.lower() == target_email]
            if matching:
                user_id = str(matching[0].id)
                if admin_password:
                    supabase.auth.admin.update_user_by_id(user_id, {"password": admin_password})
            else:
                raise RuntimeError(f"Failed to bootstrap admin user in Supabase Auth: {exc}") from exc

        # Create profile record in PostgreSQL
        profile = self.user_repo.upsert_profile(
            user_id=user_id,
            email=target_email,
            role="ADMIN",
            full_name=full_name,
        )

        self.audit_repo.log_event(
            action="BOOTSTRAP_INITIAL_ADMIN",
            actor_id=user_id,
            actor_email=target_email,
            target_type="USER",
            target_id=user_id,
            details={"email": target_email, "action": "CREATED_NEW_ADMIN"},
            ip_address=ip_address,
        )

        logger.info(f"Successfully provisioned initial administrator '{target_email}'.")
        return {
            "status": "PROVISIONED",
            "user_id": user_id,
            "email": target_email,
            "role": "ADMIN",
        }

    # =========================================================================
    # ADMIN TRANSFER & HANDOVER (Phase 12)
    # =========================================================================
    def transfer_admin_role(
        self,
        current_admin_id: str,
        current_admin_email: str,
        new_admin_email: str,
        confirm_email: str,
        reason: str,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        norm_new = self.settings.normalize_email(new_admin_email)
        norm_confirm = self.settings.normalize_email(confirm_email)

        if norm_new != norm_confirm:
            raise ValidationError("New administrator email and confirmation email do not match.")

        if norm_new == current_admin_email.lower():
            raise ValidationError("New administrator email must be different from current administrator.")

        # Lookup new admin profile
        new_profile = self.user_repo.get_by_email(norm_new)
        if not new_profile:
            raise ResourceNotFoundError("User with email", norm_new)

        new_user_id = new_profile["id"]
        supabase = get_supabase_admin_client()

        # Step 1: Promote new user to ADMIN
        self.user_repo.update_role(new_user_id, "ADMIN")
        try:
            supabase.auth.admin.update_user_by_id(
                new_user_id,
                {"user_metadata": {"role": "ADMIN"}},
            )
        except Exception as exc:
            logger.warning(f"Could not update user metadata for new admin: {exc}")

        # Step 2: Demote current admin to TEACHER only after new admin confirmed
        self.user_repo.update_role(current_admin_id, "TEACHER")
        try:
            supabase.auth.admin.update_user_by_id(
                current_admin_id,
                {"user_metadata": {"role": "TEACHER"}},
            )
        except Exception as exc:
            logger.warning(f"Could not update user metadata for demoted admin: {exc}")

        # Step 3: Audit log
        self.audit_repo.log_event(
            action="TRANSFER_ADMIN_ROLE",
            actor_id=current_admin_id,
            actor_email=current_admin_email,
            target_type="USER",
            target_id=new_user_id,
            details={
                "previous_admin": current_admin_email,
                "new_admin": norm_new,
                "reason": reason,
            },
            ip_address=ip_address,
        )

        # Step 4: Security Notification (HTTPS API with graceful fallback)
        try:
            self.email_service.send_security_notification(
                recipient_email=norm_new,
                subject="DraftForge Administration Transferred",
                message=f"You have been granted primary administrator privileges for DraftForge by {current_admin_email}. Reason: {reason}",
            )
            self.email_service.send_security_notification(
                recipient_email=current_admin_email,
                subject="DraftForge Administrator Transfer Complete",
                message=f"Administrator privileges were successfully transferred to {norm_new}. Your account role has transitioned to Faculty Instructor.",
            )
        except Exception as exc:
            logger.warning(f"Security notification email error: {exc}")

        return {
            "status": "TRANSFERRED",
            "previous_admin": current_admin_email,
            "new_admin": norm_new,
        }
