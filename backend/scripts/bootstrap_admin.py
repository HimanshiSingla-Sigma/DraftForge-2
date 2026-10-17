#!/usr/bin/env python3
"""
DraftForge Initial Administrator Bootstrap Script

Provisions or upgrades the designated INITIAL_ADMIN_EMAIL to the ADMIN role.
Usage:
    python backend/scripts/bootstrap_admin.py [--password PASSWORD] [--name NAME]
"""

import argparse
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import get_settings
from app.services.admin_service import AdminService
from app.core.logging import get_logger

logger = get_logger("bootstrap_admin_script")


def main():
    parser = argparse.ArgumentParser(description="Bootstrap DraftForge Initial Administrator")
    parser.add_argument("--password", type=str, default=None, help="Initial password for newly provisioned admin")
    parser.add_argument("--name", type=str, default="Chief Administrator", help="Full name for admin account")
    args = parser.parse_args()

    settings = get_settings()
    admin_email = settings.INITIAL_ADMIN_EMAIL
    print("=" * 60)
    print("DraftForge — Secure Administrator Bootstrap Procedure")
    print("=" * 60)
    print(f"Target Initial Admin Email: {admin_email}")
    print(f"Allowed College Domain(s): {settings.ALLOWED_COLLEGE_EMAIL_DOMAINS}")

    admin_service = AdminService()
    try:
        result = admin_service.bootstrap_initial_admin(
            admin_password=args.password,
            full_name=args.name,
            ip_address="127.0.0.1",
        )
        print("\n[SUCCESS] Administrator Provisioning Status:")
        print(f"  • Status:  {result.get('status')}")
        print(f"  • User ID: {result.get('user_id')}")
        print(f"  • Email:   {result.get('email')}")
        print(f"  • Role:    {result.get('role')}")
        print("=" * 60)
    except Exception as exc:
        print(f"\n[ERROR] Bootstrap procedure failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
