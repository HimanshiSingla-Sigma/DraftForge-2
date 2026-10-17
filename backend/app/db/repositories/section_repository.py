from typing import Any, Dict, List, Optional
from app.db.repositories.base_repository import BaseRepository


class SectionRepository(BaseRepository):
    def __init__(self):
        super().__init__(table_name="sections")

    def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        response = self.client.table(self.table_name).select("*").eq("code", code).execute()
        return response.data[0] if response.data else None

    def list_active(self) -> List[Dict[str, Any]]:
        response = (
            self.client.table(self.table_name)
            .select("*")
            .eq("is_active", True)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    # Teacher Section Assignments
    def assign_teacher_to_section(self, teacher_id: str, section_id: str) -> Dict[str, Any]:
        payload = {"teacher_id": teacher_id, "section_id": section_id}
        response = self.client.table("teacher_sections").upsert(payload, on_conflict="teacher_id,section_id").execute()
        return response.data[0] if response.data else payload

    def remove_teacher_from_section(self, teacher_id: str, section_id: str) -> bool:
        response = (
            self.client.table("teacher_sections")
            .delete()
            .eq("teacher_id", teacher_id)
            .eq("section_id", section_id)
            .execute()
        )
        return bool(response.data)

    def set_teacher_sections(self, teacher_id: str, section_ids: List[str]) -> List[str]:
        # Delete existing assignments
        self.client.table("teacher_sections").delete().eq("teacher_id", teacher_id).execute()
        # Insert new assignments
        if section_ids:
            payloads = [{"teacher_id": teacher_id, "section_id": sid} for sid in section_ids]
            self.client.table("teacher_sections").insert(payloads).execute()
        return section_ids

    def get_teacher_sections(self, teacher_id: str) -> List[Dict[str, Any]]:
        response = (
            self.client.table("teacher_sections")
            .select("section_id, sections(id, name, code, academic_year, description)")
            .eq("teacher_id", teacher_id)
            .execute()
        )
        sections = []
        for row in response.data or []:
            sec = row.get("sections")
            if sec:
                sections.append(sec)
        return sections

    def is_teacher_assigned(self, teacher_id: str, section_id: str) -> bool:
        response = (
            self.client.table("teacher_sections")
            .select("id")
            .eq("teacher_id", teacher_id)
            .eq("section_id", section_id)
            .execute()
        )
        return bool(response.data)

    # Student Section Memberships
    def enroll_student_in_section(self, student_id: str, section_id: str) -> Dict[str, Any]:
        payload = {"student_id": student_id, "section_id": section_id}
        response = self.client.table("student_sections").upsert(payload, on_conflict="student_id,section_id").execute()
        return response.data[0] if response.data else payload

    def get_student_sections(self, student_id: str) -> List[Dict[str, Any]]:
        response = (
            self.client.table("student_sections")
            .select("section_id, sections(id, name, code, academic_year, description)")
            .eq("student_id", student_id)
            .execute()
        )
        sections = []
        for row in response.data or []:
            sec = row.get("sections")
            if sec:
                sections.append(sec)
        return sections

    def get_students_for_section(self, section_id: str) -> List[Dict[str, Any]]:
        response = (
            self.client.table("student_sections")
            .select("student_id, enrolled_at, profiles(id, email, full_name, created_at)")
            .eq("section_id", section_id)
            .execute()
        )
        students = []
        for row in response.data or []:
            profile = row.get("profiles") or {}
            students.append({
                "id": row.get("student_id"),
                "email": profile.get("email", ""),
                "full_name": profile.get("full_name"),
                "enrolled_at": row.get("enrolled_at"),
            })
        return students

    def get_section_counts(self, section_id: str) -> Dict[str, int]:
        teachers_res = self.client.table("teacher_sections").select("id", count="exact").eq("section_id", section_id).execute()
        students_res = self.client.table("student_sections").select("id", count="exact").eq("section_id", section_id).execute()
        return {
            "teachers_count": teachers_res.count or len(teachers_res.data or []),
            "students_count": students_res.count or len(students_res.data or []),
        }
