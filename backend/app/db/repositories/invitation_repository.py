from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.db.repositories.base_repository import BaseRepository


class InvitationRepository(BaseRepository):
    def __init__(self):
        super().__init__(table_name="invitations")

    def get_by_token_hash(self, token_hash: str) -> Optional[Dict[str, Any]]:
        response = self.client.table(self.table_name).select("*").eq("token_hash", token_hash).execute()
        return response.data[0] if response.data else None

    def get_active_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        response = (
            self.client.table(self.table_name)
            .select("*")
            .eq("email", email.strip().lower())
            .eq("status", "PENDING")
            .gt("expires_at", now)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data[0] if response.data else None

    def list_invitations(
        self,
        role: Optional[str] = None,
        status: Optional[str] = None,
        inviter_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        query = self.client.table(self.table_name).select("*, profiles!inviter_id(email, full_name)")
        if role:
            query = query.eq("role", role)
        if status:
            query = query.eq("status", status)
        if inviter_id:
            query = query.eq("inviter_id", inviter_id)

        response = query.order("created_at", desc=True).limit(limit).execute()
        results = []
        for row in response.data or []:
            inviter = row.get("profiles") or {}
            row["inviter_email"] = inviter.get("email")
            row["inviter_name"] = inviter.get("full_name")
            results.append(row)
        return results

    def accept_invitation(self, invitation_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        response = (
            self.client.table(self.table_name)
            .update({
                "status": "ACCEPTED",
                "accepted_at": now,
                "accepted_user_id": user_id,
                "updated_at": now,
            })
            .eq("id", invitation_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def revoke_invitation(self, invitation_id: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        response = (
            self.client.table(self.table_name)
            .update({
                "status": "REVOKED",
                "updated_at": now,
            })
            .eq("id", invitation_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def refresh_invitation_token(
        self,
        invitation_id: str,
        new_token_hash: str,
        new_expires_at: datetime,
    ) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        response = (
            self.client.table(self.table_name)
            .update({
                "token_hash": new_token_hash,
                "status": "PENDING",
                "expires_at": new_expires_at.isoformat(),
                "updated_at": now,
            })
            .eq("id", invitation_id)
            .execute()
        )
        return response.data[0] if response.data else None
