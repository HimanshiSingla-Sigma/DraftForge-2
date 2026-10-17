from unittest.mock import patch, MagicMock
import pytest
from app.services.email_service import EmailService
from app.services.invitation_service import InvitationService


def test_console_email_dispatch():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "console"
    result = service._dispatch(
        recipient_email="test@ncuindia.edu",
        subject="Test Subject",
        text_content="Hello world",
        html_content="<p>Hello world</p>",
    )
    assert result is True


def test_smtp_network_unreachable_catches_oserror_and_returns_false():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "smtp"
    service.settings.SMTP_HOST = "smtp.gmail.com"
    service.settings.SMTP_PORT = 587
    service.settings.RESEND_API_KEY = ""

    with patch("smtplib.SMTP", side_effect=OSError(101, "Network is unreachable")):
        result = service._dispatch(
            recipient_email="student@ncuindia.edu",
            subject="Invitation",
            text_content="Your link: https://draftforge.ai/invite?token=123",
            html_content="<p>Link</p>",
        )
        assert result is False


def test_smtp_network_unreachable_auto_retries_resend():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "smtp"
    service.settings.SMTP_HOST = "smtp.gmail.com"
    service.settings.SMTP_PORT = 587
    service.settings.RESEND_API_KEY = "re_test_key"

    mock_resp = MagicMock(status_code=200)
    with patch("smtplib.SMTP", side_effect=OSError(101, "Network is unreachable")):
        with patch("httpx.post", return_value=mock_resp):
            result = service._dispatch(
                recipient_email="student@ncuindia.edu",
                subject="Invitation",
                text_content="Your link",
                html_content="<p>Link</p>",
            )
            assert result is True


def test_resend_email_dispatch_success():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "resend"
    service.settings.RESEND_API_KEY = "re_test_key"
    service.settings.RESEND_FROM_EMAIL = "onboarding@resend.dev"

    mock_resp = MagicMock(status_code=200)
    with patch("httpx.post", return_value=mock_resp):
        result = service._dispatch(
            recipient_email="student@ncuindia.edu",
            subject="Invitation",
            text_content="Your link",
            html_content="<p>Link</p>",
        )
        assert result is True


def test_resend_email_dispatch_api_error_does_not_crash():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "resend"
    service.settings.RESEND_API_KEY = "re_test_key"

    mock_resp = MagicMock(status_code=403, text='{"message": "domain unverified"}')
    with patch("httpx.post", return_value=mock_resp):
        result = service._dispatch(
            recipient_email="student@ncuindia.edu",
            subject="Invitation",
            text_content="Your link",
            html_content="<p>Link</p>",
        )
        assert result is False


def test_brevo_email_dispatch_success():
    service = EmailService()
    service.settings.EMAIL_PROVIDER = "brevo"
    service.settings.BREVO_API_KEY = "xkeysib-test"
    service.settings.BREVO_FROM_EMAIL = "noreply@ncuindia.edu"

    mock_resp = MagicMock(status_code=201)
    with patch("httpx.post", return_value=mock_resp):
        result = service._dispatch(
            recipient_email="student@ncuindia.edu",
            subject="Invitation",
            text_content="Your link",
            html_content="<p>Link</p>",
        )
        assert result is True


def test_invitation_service_student_invite_email_failure_does_not_crash():
    service = InvitationService()
    mock_section = {"id": "sec-001", "name": "Constitutional Law", "is_active": True}
    mock_invite = {
        "id": "inv-999",
        "email": "student@ncuindia.edu",
        "role": "STUDENT",
        "section_ids": ["sec-001"],
        "status": "PENDING",
    }

    with patch.object(service.section_repo, "get_by_id", return_value=mock_section):
        with patch.object(service.invitation_repo, "get_active_by_email", return_value=None):
            with patch.object(service.invitation_repo, "create", return_value=mock_invite):
                with patch.object(service.email_service, "send_invitation_email", return_value=False):
                    with patch.object(service.audit_repo, "log_event", return_value=None):
                        res = service.invite_student(
                            inviter_id="admin-01",
                            inviter_email="admin@ncuindia.edu",
                            inviter_role="ADMIN",
                            student_email="student@ncuindia.edu",
                            section_id="sec-001",
                        )
                        assert res["id"] == "inv-999"
                        assert res["email_sent"] is False
                        assert "accept-invitation?token=" in res["invitation_url"]
