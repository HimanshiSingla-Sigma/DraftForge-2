from typing import Any, Dict, List, Optional
from app.core.exceptions import ResourceAlreadyExistsError, ResourceNotFoundError
from app.db.repositories.section_repository import SectionRepository
from app.db.repositories.user_repository import UserRepository
from app.db.repositories.audit_repository import AuditRepository


class SectionService:
    def __init__(self):
        self.section_repo = SectionRepository()
        self.user_repo = UserRepository()
        self.audit_repo = AuditRepository()

    def create_section(
        self,
        name: str,
        code: str,
        academic_year: str = "2025-2026",
        description: Optional[str] = None,
        admin_id: Optional[str] = None,
        admin_email: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        clean_code = code.strip().upper()
        existing = self.section_repo.get_by_code(clean_code)
        if existing:
            raise ResourceAlreadyExistsError("Section", "code", clean_code)

        payload = {
            "name": name.strip(),
            "code": clean_code,
            "academic_year": academic_year.strip(),
            "description": description.strip() if description else None,
            "is_active": True,
        }
        section = self.section_repo.create(payload)

        self.audit_repo.log_event(
            action="CREATE_SECTION",
            actor_id=admin_id,
            actor_email=admin_email,
            target_type="SECTION",
            target_id=section["id"],
            details={"code": clean_code, "name": name},
            ip_address=ip_address,
        )

        return section

    def list_sections_with_counts(self) -> List[Dict[str, Any]]:
        sections = self.section_repo.list_active()
        results = []
        for sec in sections:
            counts = self.section_repo.get_section_counts(sec["id"])
            sec_dict = dict(sec)
            sec_dict["teachers_count"] = counts["teachers_count"]
            sec_dict["students_count"] = counts["students_count"]
            results.append(sec_dict)
        return results

    def assign_teacher_sections(
        self,
        teacher_id: str,
        section_ids: List[str],
        admin_id: Optional[str] = None,
        admin_email: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> List[str]:
        teacher = self.user_repo.get_by_id(teacher_id)
        if not teacher:
            raise ResourceNotFoundError("Teacher profile", teacher_id)

        # Validate section IDs
        clean_section_ids = []
        for sid in section_ids:
            sec = self.section_repo.get_by_id(sid)
            if sec and sec.get("is_active"):
                clean_section_ids.append(sid)

        assigned = self.section_repo.set_teacher_sections(teacher_id, clean_section_ids)

        self.audit_repo.log_event(
            action="ASSIGN_TEACHER_SECTIONS",
            actor_id=admin_id,
            actor_email=admin_email,
            target_type="USER",
            target_id=teacher_id,
            details={"section_ids": clean_section_ids},
            ip_address=ip_address,
        )

        return assigned

    def get_teacher_sections(self, teacher_id: str) -> List[Dict[str, Any]]:
        return self.section_repo.get_teacher_sections(teacher_id)

    def get_section_students(self, section_id: str) -> List[Dict[str, Any]]:
        return self.section_repo.get_students_for_section(section_id)
