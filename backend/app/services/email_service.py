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
        inviter_email: Optional[str] = None,
        inviter_name: Optional[str] = None,
        section_names: Optional[list[str]] = None,
    ) -> bool:
        """
        Sends an official DraftForge invitation email to a Teacher or Student.
        - Teacher invitation: Dispatched on behalf of Admin (singlahimanshi2@gmail.com).
        - Student invitation: Dispatched on behalf of the specific Faculty Instructor (teacher's email & name).
        """
        sections_str = ", ".join(section_names) if section_names else "Assigned Academic Curriculum"
        is_teacher_invite = role.upper() == "TEACHER"

        if is_teacher_invite:
            role_title = "Faculty Instructor"
            effective_inviter_email = inviter_email or self.settings.INITIAL_ADMIN_EMAIL or "singlahimanshi2@gmail.com"
            effective_inviter_name = inviter_name or "Himanshi Singla (DraftForge Administration)"
            subject = "Official Faculty Invitation: Join DraftForge Academic Portal"
            badge_text = "Primary Administration Invitation"
            inviter_meta_label = "Authorized Administrator"
            context_desc = (
                f"You have been granted faculty privileges by platform administrator <strong>{effective_inviter_name}</strong> "
                f"(<a href='mailto:{effective_inviter_email}'>{effective_inviter_email}</a>)."
            )
        else:
            role_title = "Legal Scholar Student"
            effective_inviter_email = inviter_email or "faculty@ncuindia.edu"
            effective_inviter_name = inviter_name or effective_inviter_email or "Course Faculty"
            subject = f"Course Invitation from {effective_inviter_name}: Join DraftForge for {sections_str}"
            badge_text = "Course Faculty Invitation"
            inviter_meta_label = "Course Instructor"
            context_desc = (
                f"You have been formally invited to join your course section by your faculty instructor, <strong>{effective_inviter_name}</strong> "
                f"(<a href='mailto:{effective_inviter_email}'>{effective_inviter_email}</a>)."
            )

        text_content = f"""DraftForge — Legal Drafting & Statutory Evaluation System

Hello,

You have been formally invited to join DraftForge as a {role_title}.

{inviter_meta_label}: {effective_inviter_name} ({effective_inviter_email})
Course / Section Assignment: {sections_str}
Authorized Recipient: {recipient_email}

To activate your account and access your curriculum workspace, please click the secure link below:
{invitation_url}

IMPORTANT SECURITY NOTICE:
• This single-use invitation link expires in {expires_hours} hours.
• Do not forward or share this link. It is bound specifically to your authorized email address: {recipient_email}.
• Direct inquiries or replies to this email will be routed to: {effective_inviter_email}.

Best regards,
{effective_inviter_name}
The DraftForge Academic Team
"""

        html_content = f"""<!DOCTYPE html>
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
    .reply-box {{ background: #F0FDF4; border: 1px solid #BBF7D0; padding: 10px 14px; border-radius: 10px; font-size: 12px; color: #166534; margin-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DraftForge</h1>
      <p>Legal Drafting & Statutory Evaluation System</p>
    </div>
    <div class="content">
      <span class="badge">{badge_text}</span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 12px; color: #0B192C;">
        Welcome to DraftForge
      </h2>
      <p>
        {context_desc}
      </p>

      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Invited Role:</span> <span class="meta-val">{role_title}</span></div>
        <div class="meta-row"><span class="meta-label">{inviter_meta_label}:</span> <span class="meta-val">{effective_inviter_name}</span></div>
        <div class="meta-row"><span class="meta-label">Direct Contact:</span> <span class="meta-val"><a href="mailto:{effective_inviter_email}" style="color: #1E3E62; text-decoration: underline;">{effective_inviter_email}</a></span></div>
        <div class="meta-row"><span class="meta-label">Authorized Account:</span> <span class="meta-val"><code>{recipient_email}</code></span></div>
        <div class="meta-row"><span class="meta-label">Assigned Curriculum:</span> <span class="meta-val">{sections_str}</span></div>
        <div class="meta-row"><span class="meta-label">Link Valid For:</span> <span class="meta-val">{expires_hours} Hours</span></div>
      </div>

      <div class="btn-container">
        <a href="{invitation_url}" class="btn" target="_blank">Activate Your Account &rarr;</a>
      </div>

      <div class="reply-box">
        💬 <strong>Need Direct Assistance?</strong> Replying directly to this email will route your response to {effective_inviter_name} at <code>{effective_inviter_email}</code>.
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This invitation is single-use and securely bound to <code>{recipient_email}</code>. Do not share or forward this link.
      </div>
    </div>
    <div class="footer">
      DraftForge Legal AI Platform &bull; The NorthCap University<br>
      If you did not expect this invitation, please contact your university administration.
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
            inviter_email=effective_inviter_email,
            inviter_display=effective_inviter_name,
            reply_to=effective_inviter_email,
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
            inviter_email=self.settings.INITIAL_ADMIN_EMAIL or "singlahimanshi2@gmail.com",
            inviter_display="DraftForge Security",
            reply_to=self.settings.INITIAL_ADMIN_EMAIL or "singlahimanshi2@gmail.com",
        )

    def _dispatch(
        self,
        recipient_email: str,
        subject: str,
        text_content: str,
        html_content: str,
        inviter_email: Optional[str] = None,
        inviter_display: Optional[str] = None,
        reply_to: Optional[str] = None,
    ) -> bool:
        provider = (self.settings.EMAIL_PROVIDER or "").strip().lower()

        # If RESEND_API_KEY is present and provider is unset, smtp, or resend, prioritize Resend (works on Render)
        if self.settings.RESEND_API_KEY and provider in ("resend", "smtp", ""):
            return self._dispatch_resend(
                recipient_email=recipient_email,
                subject=subject,
                text_content=text_content,
                html_content=html_content,
                inviter_email=inviter_email,
                inviter_display=inviter_display,
                reply_to=reply_to,
            )

        # 1. CONSOLE PROVIDER (Local Dev / Offline Staging)
        if provider == "console" or not provider:
            logger.info(
                f"[EMAIL DISPATCH - CONSOLE] To: {recipient_email} | From: {inviter_display} <{inviter_email}> | Reply-To: {reply_to}\n"
                f"Subject: {subject}\n"
                f"--- Body Preview ---\n{text_content.strip()}\n-------------------"
            )
            return True

        # 2. RESEND PROVIDER (Explicitly selected)
        elif provider == "resend":
            return self._dispatch_resend(
                recipient_email=recipient_email,
                subject=subject,
                text_content=text_content,
                html_content=html_content,
                inviter_email=inviter_email,
                inviter_display=inviter_display,
                reply_to=reply_to,
            )

        # 3. BREVO / SENDINBLUE PROVIDER (HTTPS REST API - Free tier 300 emails/day)
        elif provider in ("brevo", "sendinblue"):
            if not self.settings.BREVO_API_KEY:
                logger.error("EMAIL_PROVIDER is set to 'brevo' but BREVO_API_KEY is not configured.")
                self._fallback_console(recipient_email, subject, text_content)
                return False
            try:
                from_email = self.settings.BREVO_FROM_EMAIL or self.settings.SMTP_FROM_EMAIL or "noreply@draftforge.ai"
                from_name = self.settings.SMTP_FROM_NAME or "DraftForge Legal AI"
                sender_display = f"{inviter_display} via DraftForge" if inviter_display else from_name
                effective_reply_to = reply_to or inviter_email
                headers = {
                    "api-key": self.settings.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
                payload = {
                    "sender": {"name": sender_display, "email": from_email},
                    "to": [{"email": recipient_email}],
                    "subject": subject,
                    "htmlContent": html_content,
                    "textContent": text_content,
                }
                if effective_reply_to:
                    payload["replyTo"] = {"email": effective_reply_to, "name": sender_display}

                resp = httpx.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers, timeout=15)
                if resp.status_code in (200, 201):
                    logger.info(f"Successfully delivered email via Brevo to {recipient_email} (From: {sender_display}, Reply-To: {effective_reply_to})")
                    return True
                else:
                    logger.error(f"Brevo HTTP error {resp.status_code}: {resp.text}")
                    self._fallback_console(recipient_email, subject, text_content)
                    return False
            except Exception as exc:
                logger.error(f"Brevo dispatch exception to {recipient_email}: {exc}")
                self._fallback_console(recipient_email, subject, text_content)
                return False

        # 4. SENDGRID PROVIDER (HTTPS REST API)
        elif provider == "sendgrid":
            if not self.settings.SENDGRID_API_KEY:
                logger.error("EMAIL_PROVIDER is set to 'sendgrid' but SENDGRID_API_KEY is not configured.")
                self._fallback_console(recipient_email, subject, text_content)
                return False
            try:
                from_email = self.settings.SENDGRID_FROM_EMAIL or self.settings.SMTP_FROM_EMAIL or "noreply@draftforge.ai"
                from_name = self.settings.SMTP_FROM_NAME or "DraftForge Legal AI"
                sender_display = f"{inviter_display} via DraftForge" if inviter_display else from_name
                effective_reply_to = reply_to or inviter_email
                headers = {
                    "Authorization": f"Bearer {self.settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "personalizations": [{"to": [{"email": recipient_email}]}],
                    "from": {"name": sender_display, "email": from_email},
                    "subject": subject,
                    "content": [
                        {"type": "text/plain", "value": text_content},
                        {"type": "text/html", "value": html_content},
                    ],
                }
                if effective_reply_to:
                    payload["reply_to"] = {"email": effective_reply_to, "name": sender_display}

                resp = httpx.post("https://api.sendgrid.com/v3/mail/send", json=payload, headers=headers, timeout=15)
                if resp.status_code in (200, 201, 202):
                    logger.info(f"Successfully delivered email via SendGrid to {recipient_email} (From: {sender_display}, Reply-To: {effective_reply_to})")
                    return True
                else:
                    logger.error(f"SendGrid HTTP error {resp.status_code}: {resp.text}")
                    self._fallback_console(recipient_email, subject, text_content)
                    return False
            except Exception as exc:
                logger.error(f"SendGrid dispatch exception to {recipient_email}: {exc}")
                self._fallback_console(recipient_email, subject, text_content)
                return False

        # 5. SMTP PROVIDER (Direct TCP Socket)
        elif provider == "smtp":
            if not self.settings.SMTP_HOST:
                logger.error("SMTP_HOST is not configured in settings.")
                self._fallback_console(recipient_email, subject, text_content)
                return False
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                from_email = self.settings.SMTP_FROM_EMAIL or "noreply@draftforge.ai"
                from_name = self.settings.SMTP_FROM_NAME or "DraftForge Legal AI"
                sender_display = f"{inviter_display} via DraftForge" if inviter_display else from_name
                effective_reply_to = reply_to or inviter_email
                msg["From"] = f"{sender_display} <{from_email}>"
                if effective_reply_to:
                    msg["Reply-To"] = effective_reply_to
                msg["To"] = recipient_email

                part1 = MIMEText(text_content, "plain")
                part2 = MIMEText(html_content, "html")
                msg.attach(part1)
                msg.attach(part2)

                port = int(self.settings.SMTP_PORT or 587)
                if port == 465:
                    server = smtplib.SMTP_SSL(self.settings.SMTP_HOST, port, timeout=15)
                else:
                    server = smtplib.SMTP(self.settings.SMTP_HOST, port, timeout=15)
                    if self.settings.SMTP_USE_TLS:
                        server.starttls()

                if self.settings.SMTP_USERNAME and self.settings.SMTP_PASSWORD:
                    server.login(self.settings.SMTP_USERNAME, self.settings.SMTP_PASSWORD)
                server.sendmail(from_email, [recipient_email], msg.as_string())
                server.quit()
                logger.info(f"Successfully delivered email via SMTP to {recipient_email} (From: {sender_display}, Reply-To: {effective_reply_to})")
                return True
            except OSError as exc:
                logger.error(
                    f"SMTP delivery failed to {recipient_email}: {exc}. "
                    "NOTE: Render and major cloud providers block outbound SMTP ports 25, 465, and 587. "
                    "To send emails from Render, switch EMAIL_PROVIDER to 'resend', 'brevo', 'sendgrid', or 'console'."
                )
                if self.settings.RESEND_API_KEY:
                    logger.info("RESEND_API_KEY detected. Automatically retrying delivery via Resend API...")
                    return self._dispatch_resend(
                        recipient_email=recipient_email,
                        subject=subject,
                        text_content=text_content,
                        html_content=html_content,
                        inviter_email=inviter_email,
                        inviter_display=inviter_display,
                        reply_to=reply_to,
                    )
                self._fallback_console(recipient_email, subject, text_content)
                return False
            except Exception as exc:
                logger.error(f"SMTP delivery failed to {recipient_email}: {exc}")
                self._fallback_console(recipient_email, subject, text_content)
                return False

        logger.warning(f"Unknown email provider '{provider}', falling back to console log.")
        self._fallback_console(recipient_email, subject, text_content)
        return True

    def _dispatch_resend(
        self,
        recipient_email: str,
        subject: str,
        text_content: str,
        html_content: str,
        inviter_email: Optional[str] = None,
        inviter_display: Optional[str] = None,
        reply_to: Optional[str] = None,
    ) -> bool:
        if not self.settings.RESEND_API_KEY:
            logger.error("EMAIL_PROVIDER is set to 'resend' but RESEND_API_KEY is not configured.")
            self._fallback_console(recipient_email, subject, text_content)
            return False
        try:
            configured_from = self.settings.RESEND_FROM_EMAIL or self.settings.SMTP_FROM_EMAIL
            from_email = configured_from
            if not from_email or "draftforge.ai" in from_email:
                from_email = "onboarding@resend.dev"

            # Check if inviter_email has custom domain matching verified from_email domain
            if inviter_email and "@" in inviter_email and configured_from and "@" in configured_from:
                inviter_domain = inviter_email.split("@")[1].lower()
                from_domain = configured_from.split("@")[1].lower()
                if inviter_domain == from_domain and from_domain != "resend.dev":
                    from_email = inviter_email

            from_name = self.settings.SMTP_FROM_NAME or "DraftForge Legal AI"
            sender_display = f"{inviter_display} via DraftForge" if inviter_display else from_name
            effective_reply_to = reply_to or inviter_email

            headers = {
                "Authorization": f"Bearer {self.settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "from": f"{sender_display} <{from_email}>",
                "to": [recipient_email],
                "subject": subject,
                "html": html_content,
                "text": text_content,
            }
            if effective_reply_to:
                payload["reply_to"] = effective_reply_to

            resp = httpx.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=15)
            if resp.status_code in (200, 201):
                logger.info(f"Successfully delivered email via Resend to {recipient_email} (From: {sender_display}, Reply-To: {effective_reply_to})")
                return True
            else:
                if resp.status_code == 403:
                    logger.error(
                        f"Resend 403 Forbidden for {recipient_email}: {resp.text}\n"
                        "NOTE: Resend sandbox ('onboarding@resend.dev') only delivers to your registered account email. "
                        "To deliver to external domains like @ncuindia.edu, add and verify your domain at https://resend.com/domains."
                    )
                else:
                    logger.error(f"Resend HTTP error {resp.status_code}: {resp.text}")
                self._fallback_console(recipient_email, subject, text_content)
                return False
        except Exception as exc:
            logger.error(f"Resend dispatch exception to {recipient_email}: {exc}")
            self._fallback_console(recipient_email, subject, text_content)
            return False

    def _fallback_console(self, recipient_email: str, subject: str, text_content: str) -> None:
        """
        Safety fallback to ensure invitation activation links and important messages
        are always logged in server stdout even if outbound mail transport fails.
        """
        logger.warning(
            f"[EMAIL DISPATCH - CONSOLE FALLBACK] To: {recipient_email} | Subject: {subject}\n"
            f"--- Body Preview ---\n{text_content.strip()}\n-------------------"
        )
