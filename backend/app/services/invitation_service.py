from datetime import datetime, timedelta, timezone
import hashlib
import re
import secrets
from typing import Any, Dict, List, Optional
from app.config import get_settings
from app.core.constants import UserRole
from app.core.exceptions import (
    AuthenticationError,
    PermissionDeniedError,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.logging import get_logger
from app.db.repositories.audit_repository import AuditRepository
from app.db.repositories.invitation_repository import InvitationRepository
from app.db.repositories.section_repository import SectionRepository
from app.db.repositories.user_repository import UserRepository
from supabase import create_client
from app.db.supabase import get_supabase_admin_client
from app.services.email_service import EmailService

logger = get_logger("invitation_service")


class InvitationService:
    def __init__(self):
        self.settings = get_settings()
        self.invitation_repo = InvitationRepository()
        self.section_repo = SectionRepository()
        self.user_repo = UserRepository()
        self.audit_repo = AuditRepository()
        self.email_service = EmailService()

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.strip().encode("utf-8")).hexdigest()

    def _generate_token(self) -> str:
        return secrets.token_urlsafe(32)

    def _validate_email_syntax(self, email: str) -> str:
        norm = self.settings.normalize_email(email)
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(pattern, norm):
            raise ValidationError(f"Invalid email address syntax: '{email}'")
        return norm

    # =========================================================================
    # 1. INVITE TEACHER (Admin Only)
    # =========================================================================
    def invite_teacher(
        self,
        admin_id: str,
        admin_email: str,
        teacher_email: str,
        section_ids: Optional[List[str]] = None,
        full_name: Optional[str] = None,
        admin_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        norm_email = self._validate_email_syntax(teacher_email)

        # Enforce official NCU college domain validation on backend
        if not self.settings.is_allowed_college_email(norm_email):
            allowed = ", ".join(self.settings.get_allowed_college_domains_list())
            raise ValidationError(
                f"Teacher invitation rejected: Email domain must be one of [{allowed}]. Provided: '{norm_email}'"
            )

        # Verify teacher account doesn't already exist with active role
        existing_profile = self.user_repo.get_by_email(norm_email)
        if existing_profile and existing_profile.get("role") in ("TEACHER", "ADMIN"):
            raise ValidationError(f"An active account with role '{existing_profile['role']}' already exists for {norm_email}.")

        # Check existing active invitation
        existing_invite = self.invitation_repo.get_active_by_email(norm_email)
        if existing_invite:
            raw_token = self._generate_token()
            token_hash = self._hash_token(raw_token)
            expires_at = datetime.now(timezone.utc) + timedelta(hours=self.settings.INVITATION_EXPIRY_HOURS)

            clean_section_ids = []
            section_names = []
            if section_ids:
                for sid in section_ids:
                    sec = self.section_repo.get_by_id(sid)
                    if sec and sec.get("is_active"):
                        clean_section_ids.append(sid)
                        section_names.append(sec["name"])

            self.invitation_repo.update(existing_invite["id"], {
                "role": UserRole.TEACHER.value,
                "inviter_id": admin_id,
                "section_ids": clean_section_ids,
                "token_hash": token_hash,
                "status": "PENDING",
                "expires_at": expires_at.isoformat(),
                "metadata": {"full_name": full_name or existing_invite.get("metadata", {}).get("full_name") or ""},
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

            invitation_url = f"{self.settings.APP_BASE_URL.rstrip('/')}/accept-invitation?token={raw_token}"

            email_sent = False
            try:
                email_sent = self.email_service.send_invitation_email(
                    recipient_email=norm_email,
                    role="TEACHER",
                    invitation_url=invitation_url,
                    expires_hours=self.settings.INVITATION_EXPIRY_HOURS,
                    inviter_email=admin_email,
                    inviter_name=admin_name or "Himanshi Singla",
                    section_names=section_names,
                )
            except Exception as exc:
                logger.error(f"Email dispatch failed for teacher invite {existing_invite['id']}: {exc}")
                email_sent = False

            if not email_sent:
                logger.warning(f"Faculty invitation link for {norm_email}: {invitation_url}")

            self.audit_repo.log_event(
                action="RESEND_INVITATION",
                actor_id=admin_id,
                actor_email=admin_email,
                target_type="INVITATION",
                target_id=existing_invite["id"],
                details={"email": norm_email, "role": "TEACHER", "sections": clean_section_ids},
                ip_address=ip_address,
            )

            return {
                "invitation_id": existing_invite["id"],
                "email": norm_email,
                "role": UserRole.TEACHER.value,
                "status": "PENDING",
                "expires_at": expires_at.isoformat(),
                "invitation_url": invitation_url,
                "email_sent": bool(email_sent),
            }

        # Validate section IDs if provided
        clean_section_ids = []
        section_names = []
        if section_ids:
            for sid in section_ids:
                sec = self.section_repo.get_by_id(sid)
                if sec and sec.get("is_active"):
                    clean_section_ids.append(sid)
                    section_names.append(sec["name"])

        # Create token and hash
        raw_token = self._generate_token()
        token_hash = self._hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=self.settings.INVITATION_EXPIRY_HOURS)

        payload = {
            "email": norm_email,
            "role": UserRole.TEACHER.value,
            "inviter_id": admin_id,
            "section_ids": clean_section_ids,
            "token_hash": token_hash,
            "status": "PENDING",
            "expires_at": expires_at.isoformat(),
            "metadata": {"full_name": full_name or ""},
        }

        invitation = self.invitation_repo.create(payload)

        # Construct invitation URL
        invitation_url = f"{self.settings.APP_BASE_URL.rstrip('/')}/accept-invitation?token={raw_token}"

        # Dispatch email
        email_sent = False
        try:
            email_sent = self.email_service.send_invitation_email(
                recipient_email=norm_email,
                role="TEACHER",
                invitation_url=invitation_url,
                expires_hours=self.settings.INVITATION_EXPIRY_HOURS,
                inviter_email=admin_email,
                inviter_name=admin_name or "Himanshi Singla",
                section_names=section_names,
            )
        except Exception as exc:
            logger.error(f"Email dispatch failed for teacher invite {invitation['id']}: {exc}")
            email_sent = False

        if not email_sent:
            logger.warning(f"Faculty invitation link for {norm_email}: {invitation_url}")

        # Audit log
        self.audit_repo.log_event(
            action="INVITE_TEACHER",
            actor_id=admin_id,
            actor_email=admin_email,
            target_type="INVITATION",
            target_id=invitation["id"],
            details={"email": norm_email, "section_ids": clean_section_ids},
            ip_address=ip_address,
        )

        invitation["invitation_url"] = invitation_url
        invitation["email_sent"] = bool(email_sent)
        return invitation

    # =========================================================================
    # 2. INVITE STUDENT (Teacher or Admin)
    # =========================================================================
    def invite_student(
        self,
        inviter_id: str,
        inviter_email: str,
        inviter_role: str,
        student_email: str,
        section_id: str,
        full_name: Optional[str] = None,
        inviter_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        norm_email = self._validate_email_syntax(student_email)

        # Validate section exists and is active
        sec = self.section_repo.get_by_id(section_id)
        if not sec or not sec.get("is_active"):
            raise ResourceNotFoundError("Section", section_id)

        # If inviter is TEACHER, verify they are assigned to this section (prevent IDOR)
        if inviter_role.upper() == "TEACHER":
            if not self.section_repo.is_teacher_assigned(inviter_id, section_id):
                raise PermissionDeniedError(f"Teacher is not authorized to invite students to section '{sec['name']}'.")

        # Check student email policy
        if self.settings.STUDENT_EMAIL_POLICY.upper() == "COLLEGE_DOMAIN_ONLY":
            if not self.settings.is_allowed_college_email(norm_email):
                allowed = ", ".join(self.settings.get_allowed_college_domains_list())
                raise ValidationError(f"Student email policy requires a college domain in [{allowed}].")

        # Check existing active invitation
        existing_invite = self.invitation_repo.get_active_by_email(norm_email)
        if existing_invite:
            raw_token = self._generate_token()
            token_hash = self._hash_token(raw_token)
            expires_at = datetime.now(timezone.utc) + timedelta(hours=self.settings.INVITATION_EXPIRY_HOURS)

            existing_sections = existing_invite.get("section_ids") or []
            if section_id not in existing_sections:
                existing_sections.append(section_id)

            self.invitation_repo.update(existing_invite["id"], {
                "role": UserRole.STUDENT.value,
                "inviter_id": inviter_id,
                "section_ids": existing_sections,
                "token_hash": token_hash,
                "status": "PENDING",
                "expires_at": expires_at.isoformat(),
                "metadata": {"full_name": full_name or existing_invite.get("metadata", {}).get("full_name") or ""},
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

            invitation_url = f"{self.settings.APP_BASE_URL.rstrip('/')}/accept-invitation?token={raw_token}"

            email_sent = False
            try:
                email_sent = self.email_service.send_invitation_email(
                    recipient_email=norm_email,
                    role="STUDENT",
                    invitation_url=invitation_url,
                    expires_hours=self.settings.INVITATION_EXPIRY_HOURS,
                    inviter_email=inviter_email,
                    inviter_name=inviter_name or inviter_email,
                    section_names=[sec["name"]],
                )
            except Exception as exc:
                logger.error(f"Email dispatch failed for student invite {existing_invite['id']}: {exc}")
                email_sent = False

            if not email_sent:
                logger.warning(f"Student invitation link for {norm_email}: {invitation_url}")

            self.audit_repo.log_event(
                action="RESEND_INVITATION",
                actor_id=inviter_id,
                actor_email=inviter_email,
                target_type="INVITATION",
                target_id=existing_invite["id"],
                details={"email": norm_email, "role": "STUDENT", "section_id": section_id},
                ip_address=ip_address,
            )

            return {
                "invitation_id": existing_invite["id"],
                "email": norm_email,
                "role": UserRole.STUDENT.value,
                "status": "PENDING",
                "expires_at": expires_at.isoformat(),
                "section_ids": existing_sections,
                "invitation_url": invitation_url,
                "email_sent": bool(email_sent),
            }

        raw_token = self._generate_token()
        token_hash = self._hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=self.settings.INVITATION_EXPIRY_HOURS)

        payload = {
            "email": norm_email,
            "role": UserRole.STUDENT.value,
            "inviter_id": inviter_id,
            "section_ids": [section_id],
            "token_hash": token_hash,
            "status": "PENDING",
            "expires_at": expires_at.isoformat(),
            "metadata": {"full_name": full_name or ""},
        }

        invitation = self.invitation_repo.create(payload)

        invitation_url = f"{self.settings.APP_BASE_URL.rstrip('/')}/accept-invitation?token={raw_token}"

        email_sent = False
        try:
            email_sent = self.email_service.send_invitation_email(
                recipient_email=norm_email,
                role="STUDENT",
                invitation_url=invitation_url,
                expires_hours=self.settings.INVITATION_EXPIRY_HOURS,
                inviter_email=inviter_email,
                inviter_name=inviter_name or inviter_email,
                section_names=[sec["name"]],
            )
        except Exception as exc:
            logger.error(f"Email dispatch failed for student invite {invitation['id']}: {exc}")
            email_sent = False

        if not email_sent:
            logger.warning(f"Student invitation link for {norm_email}: {invitation_url}")

        self.audit_repo.log_event(
            action="INVITE_STUDENT",
            actor_id=inviter_id,
            actor_email=inviter_email,
            target_type="INVITATION",
            target_id=invitation["id"],
            details={"email": norm_email, "section_id": section_id},
            ip_address=ip_address,
        )

        invitation["invitation_url"] = invitation_url
        invitation["email_sent"] = bool(email_sent)
        return invitation

    # =========================================================================
    # 3. VERIFY INVITATION TOKEN
    # =========================================================================
    def verify_token(self, raw_token: str) -> Dict[str, Any]:
        if not raw_token or not raw_token.strip():
            return {"valid": False, "message": "Missing invitation token."}

        token_hash = self._hash_token(raw_token)
        invite = self.invitation_repo.get_by_token_hash(token_hash)
        if not invite:
            return {"valid": False, "message": "Invalid invitation link."}

        if invite.get("status") != "PENDING":
            return {"valid": False, "message": f"Invitation is {invite.get('status').lower()} and cannot be used."}

        # Check expiration
        expires_at_str = invite.get("expires_at")
        if expires_at_str:
            expires_at = datetime.fromisoformat(str(expires_at_str).replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > expires_at:
                self.invitation_repo.update(invite["id"], {"status": "EXPIRED"})
                return {"valid": False, "message": "This invitation link has expired."}

        # Retrieve section names
        section_ids = invite.get("section_ids") or []
        section_names = []
        for sid in section_ids:
            sec = self.section_repo.get_by_id(sid)
            if sec:
                section_names.append(sec["name"])

        # Retrieve inviter details
        inviter_name = None
        inviter = self.user_repo.get_by_id(invite["inviter_id"])
        if inviter:
            inviter_name = inviter.get("full_name") or inviter.get("email")

        return {
            "valid": True,
            "email": invite["email"],
            "role": invite["role"],
            "section_ids": section_ids,
            "section_names": section_names,
            "inviter_name": inviter_name,
            "expires_at": invite["expires_at"],
        }

    # =========================================================================
    # 4. ACCEPT INVITATION & COMPLETE ONBOARDING
    # =========================================================================
    def accept_invitation(
        self,
        raw_token: str,
        password: str,
        full_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        token_hash = self._hash_token(raw_token)
        invite = self.invitation_repo.get_by_token_hash(token_hash)
        if not invite:
            raise ValidationError("Invalid or non-existent invitation token.")

        if invite.get("status") != "PENDING":
            raise ValidationError(f"This invitation is {invite.get('status').lower()} and cannot be accepted.")

        expires_at = datetime.fromisoformat(str(invite["expires_at"]).replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            self.invitation_repo.update(invite["id"], {"status": "EXPIRED"})
            raise ValidationError("This invitation token has expired.")

        email = invite["email"].strip().lower()
        role = invite["role"]
        assigned_name = full_name or invite.get("metadata", {}).get("full_name") or email.split("@")[0]

        supabase = get_supabase_admin_client()

        # Check if user already exists in Supabase Auth or Profiles
        user_id = None
        existing_profile = self.user_repo.get_by_email(email)

        if existing_profile:
            user_id = existing_profile["id"]
            # Update password and metadata in Supabase Auth
            try:
                supabase.auth.admin.update_user_by_id(
                    user_id,
                    {
                        "password": password,
                        "user_metadata": {"role": role, "full_name": assigned_name},
                    },
                )
            except Exception as exc:
                logger.warning(f"Could not update Supabase Auth user by id: {exc}")
        else:
            # Create user via Supabase Auth Admin API (automatically verifies email)
            try:
                auth_user = supabase.auth.admin.create_user({
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {
                        "role": role,
                        "full_name": assigned_name,
                    },
                })
                user_id = str(auth_user.user.id)
            except Exception as exc:
                logger.error(f"Supabase Auth admin creation failed: {exc}")
                raise AuthenticationError(f"Account activation failed: {str(exc)}") from exc

        # Upsert user profile in PostgreSQL
        self.user_repo.upsert_profile(
            user_id=user_id,
            email=email,
            role=role,
            full_name=assigned_name,
        )

        # Enroll in assigned sections
        section_ids = invite.get("section_ids") or []
        if role == "TEACHER":
            for sid in section_ids:
                self.section_repo.assign_teacher_to_section(user_id, sid)
        elif role == "STUDENT":
            for sid in section_ids:
                self.section_repo.enroll_student_in_section(user_id, sid)

        # Atomically mark invitation as ACCEPTED
        self.invitation_repo.accept_invitation(invite["id"], user_id)

        # Audit log
        self.audit_repo.log_event(
            action="ACCEPT_INVITATION",
            actor_id=user_id,
            actor_email=email,
            target_type="USER",
            target_id=user_id,
            details={"role": role, "invitation_id": invite["id"], "sections": section_ids},
            ip_address=ip_address,
        )

        # Establish authenticated session using isolated client
        auth_client = create_client(self.settings.SUPABASE_URL, self.settings.SUPABASE_ANON_KEY)
        auth_session = auth_client.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        return {
            "access_token": auth_session.session.access_token,
            "user_id": user_id,
            "email": email,
            "role": role,
            "full_name": assigned_name,
        }

    # =========================================================================
    # 5. RESEND INVITATION
    # =========================================================================
    def resend_invitation(
        self,
        invitation_id: str,
        actor_id: str,
        actor_email: str,
        actor_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        invite = self.invitation_repo.get_by_id(invitation_id)
        if not invite:
            raise ResourceNotFoundError("Invitation", invitation_id)

        # Rotate token
        new_raw_token = self._generate_token()
        new_token_hash = self._hash_token(new_raw_token)
        new_expires = datetime.now(timezone.utc) + timedelta(hours=self.settings.INVITATION_EXPIRY_HOURS)

        updated = self.invitation_repo.refresh_invitation_token(
            invitation_id=invitation_id,
            new_token_hash=new_token_hash,
            new_expires_at=new_expires,
        )

        invitation_url = f"{self.settings.APP_BASE_URL.rstrip('/')}/accept-invitation?token={new_raw_token}"

        section_names = []
        for sid in invite.get("section_ids") or []:
            sec = self.section_repo.get_by_id(sid)
            if sec:
                section_names.append(sec["name"])

        email_sent = False
        try:
            effective_inviter_email = actor_email
            effective_inviter_name = actor_name or actor_email
            if invite.get("role") == "TEACHER" and not actor_name:
                effective_inviter_name = "Himanshi Singla (DraftForge Administration)"
                effective_inviter_email = actor_email or "singlahimanshi2@gmail.com"

            email_sent = self.email_service.send_invitation_email(
                recipient_email=invite["email"],
                role=invite["role"],
                invitation_url=invitation_url,
                expires_hours=self.settings.INVITATION_EXPIRY_HOURS,
                inviter_email=effective_inviter_email,
                inviter_name=effective_inviter_name,
                section_names=section_names,
            )
        except Exception as exc:
            logger.error(f"Email dispatch exception on resend for {invitation_id}: {exc}")
            email_sent = False

        if not email_sent:
            logger.warning(f"Resent invitation link for {invite['email']}: {invitation_url}")

        self.audit_repo.log_event(
            action="RESEND_INVITATION",
            actor_id=actor_id,
            actor_email=actor_email,
            target_type="INVITATION",
            target_id=invitation_id,
            details={"email": invite["email"], "new_expires_at": new_expires.isoformat()},
            ip_address=ip_address,
        )

        res = dict(updated or invite)
        res["invitation_url"] = invitation_url
        res["email_sent"] = bool(email_sent)
        return res

    # =========================================================================
    # 6. REVOKE INVITATION
    # =========================================================================
    def revoke_invitation(
        self,
        invitation_id: str,
        actor_id: str,
        actor_email: str,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        invite = self.invitation_repo.get_by_id(invitation_id)
        if not invite:
            raise ResourceNotFoundError("Invitation", invitation_id)

        updated = self.invitation_repo.revoke_invitation(invitation_id)

        self.audit_repo.log_event(
            action="REVOKE_INVITATION",
            actor_id=actor_id,
            actor_email=actor_email,
            target_type="INVITATION",
            target_id=invitation_id,
            details={"email": invite["email"]},
            ip_address=ip_address,
        )

        return updated or invite
