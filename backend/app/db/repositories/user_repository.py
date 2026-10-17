from typing import Any, Dict, List, Optional
from app.db.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__(table_name="profiles")

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        response = self.client.table(self.table_name).select("*").eq("email", email).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    def upsert_profile(self, user_id: str, email: str, role: str, full_name: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "id": user_id,
            "email": email,
            "role": role,
            "full_name": full_name,
        }
        response = self.client.table(self.table_name).upsert(payload).execute()
        return response.data[0]

    def list_by_role(self, role: str, limit: int = 100) -> List[Dict[str, Any]]:
        response = (
            self.client.table(self.table_name)
            .select("*")
            .eq("role", role)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []

    def count_by_role(self, role: str) -> int:
        response = (
            self.client.table(self.table_name)
            .select("id", count="exact")
            .eq("role", role)
            .execute()
        )
        return response.count or len(response.data or [])

    def update_role(self, user_id: str, new_role: str) -> Optional[Dict[str, Any]]:
        response = (
            self.client.table(self.table_name)
            .update({"role": new_role})
            .eq("id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def deactivate_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        response = (
            self.client.table(self.table_name)
            .update({"metadata": {"is_deactivated": True}})
            .eq("id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None