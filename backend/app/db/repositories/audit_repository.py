from typing import Any, Dict, List, Optional
from app.db.repositories.base_repository import BaseRepository
from app.core.logging import get_logger

logger = get_logger("audit_repository")


class AuditRepository(BaseRepository):
    def __init__(self):
        super().__init__(table_name="audit_logs")

    def log_event(
        self,
        action: str,
        actor_id: Optional[str] = None,
        actor_email: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        payload = {
            "action": action,
            "actor_id": actor_id,
            "actor_email": actor_email,
            "target_type": target_type,
            "target_id": str(target_id) if target_id else None,
            "details": details or {},
            "ip_address": ip_address,
        }
        try:
            response = self.client.table(self.table_name).insert(payload).execute()
            return response.data[0] if response.data else None
        except Exception as exc:
            # Audit failures should never crash application flows, but must be logged
            logger.error(f"Failed to record audit event '{action}': {exc}")
            return None

    def list_logs(
        self,
        limit: int = 100,
        action: Optional[str] = None,
        target_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = self.client.table(self.table_name).select("*")
        if action:
            query = query.eq("action", action)
        if target_type:
            query = query.eq("target_type", target_type)
        response = query.order("created_at", desc=True).limit(limit).execute()
        return response.data or []
