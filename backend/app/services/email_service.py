import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import httpx
from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger("email_service")


class EmailService:
    def __init__(self):
        self.settings = get_settings()

    def send_invitation_email(
        self,
        recipient_email: str,
        role: str,
        invitation_url: str,
        expires_hours: int,
        inviter_name: Optional[str] = None,
        section_names: Optional[list[str]] = None,
    ) -> bool:
        """
        Sends an official DraftForge invitation email to a Teacher or Student.
        Returns True on success, raises or returns False on failure.
        """
        role_title = "Faculty Instructor" if role.upper() == "TEACHER" else "Legal Scholar Student"
        sections_str = ", ".join(section_names) if section_names else "Assigned Academic Curriculum"
        inviter_display = inviter_name or "DraftForge Academic Administration"

        subject = f"Official Invitation: Join DraftForge as {role_title}"

        text_content = f"""
DraftForge — Evidence-Grounded Legal Drafting Platform

Hello,

You have been formally invited by {inviter_display} to join DraftForge as a {role_title}.

Course / Section Assignment: {sections_str}

To activate your account and access your curriculum workspace, please click the secure link below:
{invitation_url}

IMPORTANT SECURITY NOTICE:
• This single-use invitation link expires in {expires_hours} hours.
• Do not forward or share this link. It is bound specifically to your authorized email address: {recipient_email}.
• If this link expires, please request a new invitation from your institution administrator or course faculty.

Best regards,
The DraftForge Academic Team
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #0B192C; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 2px solid #E6E2D8; border-radius: 20px; box-shadow: 0 4px #E6E2D8; overflow: hidden; }}
    .header {{ background: #1E3E62; padding: 32px 24px; text-align: center; border-bottom: 4px solid #0B192C; }}
    .header h1 {{ color: #FAF8F5; font-size: 24px; margin: 0; font-family: Georgia, serif; letter-spacing: -0.5px; }}
    .header p {{ color: #F59E0B; font-size: 11px; margin: 6px 0 0; text-transform: uppercase; font-family: monospace; font-weight: bold; letter-spacing: 1px; }}
    .content {{ padding: 36px 32px; font-size: 14px; line-height: 1.6; }}
    .badge {{ display: inline-block; padding: 4px 12px; background: #F3F0EA; border: 1px solid #E6E2D8; border-radius: 999px; font-size: 11px; font-family: monospace; font-weight: bold; color: #1E3E62; margin-bottom: 16px; }}
    .meta-box {{ background: #FAF8F5; border: 2px solid #E6E2D8; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 13px; }}
    .meta-row {{ margin-bottom: 6px; }}
    .meta-label {{ color: #64748B; font-weight: 600; }}
    .meta-val {{ color: #0B192C; font-weight: bold; }}
    .btn-container {{ text-align: center; margin: 32px 0; }}
    .btn {{ display: inline-block; background: #1E3E62; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: bold; border-radius: 12px; border-bottom: 4px solid #0B192C; }}
    .footer {{ background: #F3F0EA; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 2px solid #E6E2D8; line-height: 1.5; }}
    .warning {{ color: #DC2626; font-size: 12px; background: #FEF2F2; border: 1px solid #FECACA; padding: 12px; border-radius: 10px; margin-top: 20px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DraftForge</h1>
      <p>Legal Drafting & Statutory Evaluation System</p>
    </div>
    <div class="content">
      <span class="badge">Official Academic Invitation</span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 12px; color: #0B192C;">
        Welcome to DraftForge
      </h2>
      <p>
        You have been formally invited to join the platform as a <strong>{role_title}</strong> by {inviter_display}.
      </p>

      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Invited Role:</span> <span class="meta-val">{role_title}</span></div>
        <div class="meta-row"><span class="meta-label">Authorized Email:</span> <span class="meta-val">{recipient_email}</span></div>
        <div class="meta-row"><span class="meta-label">Assigned Sections:</span> <span class="meta-val">{sections_str}</span></div>
        <div class="meta-row"><span class="meta-label">Link Valid For:</span> <span class="meta-val">{expires_hours} Hours</span></div>
      </div>

      <div class="btn-container">
        <a href="{invitation_url}" class="btn" target="_blank">Activate Your Account &rarr;</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This invitation is single-use and securely bound to <code>{recipient_email}</code>. Do not share or forward this link.
      </div>
    </div>
    <div class="footer">
      DraftForge Legal AI Platform &bull; The NorthCap University<br>
      If you did not expect this invitation, please contact your university IT department.
    </div>
  </div>
</body>
</html>
"""

        return self._dispatch(
            recipient_email=recipient_email,
            subject=subject,
            text_content=text_content,
            html_content=html_content,
        )

    def send_security_notification(
        self,
        recipient_email: str,
        subject: str,
        message: str,
    ) -> bool:
        """
        Sends administrative security notifications (e.g. role changes, admin transfers).
        """
        text_content = f"DraftForge Security Alert\n\n{message}\n\nDraftForge Security Team"
        html_content = f"""
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #FAF8F5; padding: 20px;">
  <div style="max-width: 500px; margin: auto; background: #fff; padding: 24px; border: 2px solid #E6E2D8; border-radius: 16px;">
    <h3 style="color: #0B192C; margin-top: 0;">DraftForge Security Notification</h3>
    <p style="color: #334155; line-height: 1.5; font-size: 13px;">{message}</p>
    <hr style="border: 0; border-top: 1px solid #E6E2D8; margin: 16px 0;">
    <p style="font-size: 11px; color: #64748B;">This is an automated security audit alert from DraftForge.</p>
  </div>
</body>
</html>
"""
        return self._dispatch(
            recipient_email=recipient_email,
            subject=subject,
            text_content=text_content,
            html_content=html_content,
        )

    def _dispatch(
        self,
        recipient_email: str,
        subject: str,
        text_content: str,
        html_content: str,
    ) -> bool:
        provider = (self.settings.EMAIL_PROVIDER or "console").lower()

        if provider == "console":
            logger.info(
                f"[EMAIL DISPATCH - CONSOLE] To: {recipient_email} | Subject: {subject}\n"
                f"--- Body Preview ---\n{text_content.strip()}\n-------------------"
            )
            return True

        elif provider == "smtp":
            if not self.settings.SMTP_HOST:
                logger.error("SMTP_HOST is not configured in settings.")
                return False
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{self.settings.SMTP_FROM_NAME} <{self.settings.SMTP_FROM_EMAIL}>"
                msg["To"] = recipient_email

                part1 = MIMEText(text_content, "plain")
                part2 = MIMEText(html_content, "html")
                msg.attach(part1)
                msg.attach(part2)

                server = smtplib.SMTP(self.settings.SMTP_HOST, self.settings.SMTP_PORT, timeout=15)
                if self.settings.SMTP_USE_TLS:
                    server.starttls()
                if self.settings.SMTP_USERNAME and self.settings.SMTP_PASSWORD:
                    server.login(self.settings.SMTP_USERNAME, self.settings.SMTP_PASSWORD)
                server.sendmail(self.settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
                server.quit()
                logger.info(f"Successfully delivered email via SMTP to {recipient_email}")
                return True
            except Exception as exc:
                logger.error(f"SMTP delivery failed to {recipient_email}: {exc}")
                raise RuntimeError(f"Email delivery failed: {str(exc)}") from exc

        elif provider == "resend":
            if not self.settings.RESEND_API_KEY:
                logger.error("RESEND_API_KEY is not configured.")
                return False
            try:
                headers = {
                    "Authorization": f"Bearer {self.settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "from": f"{self.settings.SMTP_FROM_NAME} <{self.settings.SMTP_FROM_EMAIL}>",
                    "to": [recipient_email],
                    "subject": subject,
                    "html": html_content,
                    "text": text_content,
                }
                resp = httpx.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=15)
                if resp.status_code in (200, 201):
                    logger.info(f"Successfully delivered email via Resend to {recipient_email}")
                    return True
                else:
                    logger.error(f"Resend returned status {resp.status_code}: {resp.text}")
                    raise RuntimeError(f"Resend error: {resp.text}")
            except Exception as exc:
                logger.error(f"Resend delivery failed to {recipient_email}: {exc}")
                raise RuntimeError(f"Email delivery failed: {str(exc)}") from exc

        logger.warning(f"Unknown email provider '{provider}', falling back to console log.")
        logger.info(f"[EMAIL TO {recipient_email}] {subject}")
        return True
