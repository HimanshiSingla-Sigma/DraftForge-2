# DraftForge — Access Control, Administration & University Handover Manual

## 1. Executive Summary & Architecture Overview

**DraftForge** is an institutional AI-powered legal drafting education and evaluation platform engineered for law faculties. It pairs deterministic 100-point rubric evaluations (structure, essential statutory clauses, formatting, gap penalties) with hybrid vector retrieval (Qdrant + FastEmbed BAAI/bge-small-en-v1.5) and statutory loophole detection (Neo4j GraphRAG).

To meet institutional governance standards for university handover (specifically for **The NorthCap University**, domain `@ncuindia.edu`), DraftForge enforces an **invitation-only, three-tier role-based access control (RBAC)** architecture:

```
                      ┌────────────────────────────────────────┐
                      │             CHIEF ADMIN                │
                      │  (singlahimanshi2@gmail.com / Root)    │
                      └───────────────────┬────────────────────┘
                                          │
                                          │ Dispatches @ncuindia.edu Invites
                                          │ Configures Academic Sections
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          COLLEGE FACULTY               │
                      │          (Teacher Role)                │
                      └───────────────────┬────────────────────┘
                                          │
                                          │ Invites Enrolled Students
                                          │ Scoped strictly to assigned sections
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          LAW SCHOLARS                  │
                      │          (Student Role)                │
                      └────────────────────────────────────────┘
```

---

## 2. Security Guarantees & Access Policies

1. **Zero Public Self-Registration**:
   - `POST /api/v1/auth/register` is locked down. Any attempt to register outside an authorized invitation immediately returns `HTTP 403 Forbidden` (`PermissionDeniedError`).
   - Accounts can only be provisioned through single-use, cryptographically generated invitation links (`/accept-invitation?token=...`).

2. **Official College Email Enforcement**:
   - Instructors must possess an authorized university domain email (`@ncuindia.edu`). Attempts to invite teachers using unauthorized domains (e.g. `@gmail.com` or `@yahoo.com`) are rejected on the backend with `HTTP 400 Bad Request` (`ValidationError`).

3. **Insecure Direct Object Reference (IDOR) Prevention**:
   - Teachers are strictly authorized to invite students and view rosters *only* for course sections explicitly assigned to them in `teacher_sections`.
   - The backend cryptographically validates teacher assignment prior to generating invitations or exposing student rosters.

4. **Single-Use Cryptographic Token Hashing**:
   - Raw tokens are generated using cryptographically secure random bytes (`secrets.token_urlsafe(32)`).
   - Only the **SHA-256 hash** (`hashlib.sha256(token).hexdigest()`) is persisted in PostgreSQL.
   - Raw tokens are never logged or stored in plain text.
   - Tokens expire automatically after 72 hours (`INVITATION_EXPIRY_HOURS=72`).
   - Resending an invitation invalidates the prior token, refreshes the token hash, and resets the 72-hour expiration window.

5. **Tamper-Evident Chronological Audit Trail**:
   - All critical actions (`INVITE_TEACHER`, `INVITE_STUDENT`, `ACCEPT_INVITATION`, `RESEND_INVITATION`, `REVOKE_INVITATION`, `ASSIGN_TEACHER_SECTIONS`, `BOOTSTRAP_INITIAL_ADMIN`, `TRANSFER_ADMIN_ROLE`) are recorded in `audit_logs` with actor ID, email, target, IP address, and JSON details.

---

## 3. Environment Configuration

### Backend Configuration (`backend/.env`)

Configure the following variables in `backend/.env`:

| Variable | Type | Default / Recommended | Purpose |
| :--- | :--- | :--- | :--- |
| `ALLOWED_COLLEGE_EMAIL_DOMAINS` | `str` | `ncuindia.edu` | Comma-separated list of authorized university domains for faculty invitations. |
| `INITIAL_ADMIN_EMAIL` | `str` | `singlahimanshi2@gmail.com` | Designated initial administrative email for automated bootstrapping. |
| `INVITATION_EXPIRY_HOURS` | `int` | `72` | Time-to-live for invitation tokens (in hours). |
| `APP_BASE_URL` | `str` | `http://localhost:5173` | Public URL of the frontend application used to format invitation URLs. |
| `STUDENT_EMAIL_POLICY` | `str` | `ANY_VERIFIED` | Either `ANY_VERIFIED` or `COLLEGE_DOMAIN_ONLY`. |
| `EMAIL_PROVIDER` | `str` | `resend` | Dispatch engine: `resend` (HTTPS API via port 443, immune to firewall blocks), `console` (dev logs), or `smtp` (legacy). |
| `RESEND_API_KEY` | `str` | `re_...` | API key from Resend (https://resend.com) for reliable HTTPS delivery. |
| `RESEND_FROM_EMAIL` | `str` | `DraftForge <onboarding@resend.dev>` | From address for Resend. Use `onboarding@resend.dev` for sandbox/dev or your verified university domain in production. |
| `EMAIL_FALLBACK_TO_CONSOLE` | `bool` | `True` | Fallback to console dispatch if the external email API encounters a temporary network or domain error. |
| `SMTP_HOST` | `str` | `smtp.gmail.com` | Optional legacy SMTP host (Note: Outbound SMTP ports are blocked on Render/AWS). |
| `SMTP_PORT` | `int` | `587` | Legacy SMTP port. |
| `SMTP_FROM_EMAIL` | `str` | `noreply@ncuindia.edu` | Legacy SMTP from address. |

### Frontend Configuration (`frontend/.env`)

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend. |

---

## 4. Database Setup & SQL Migration

The access control schema is codified in versioned migration:
`backend/migrations/005_access_control_and_invitations.sql`

### How to Apply the Migration
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) for your project.
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Open `backend/migrations/005_access_control_and_invitations.sql`, copy all SQL contents, and paste into the query editor.
4. Click **Run**.

### Tables Created
- `sections`: Academic cohorts (e.g. `LAW-2025-A`, `Law of Contracts & Drafting A`).
- `teacher_sections`: Many-to-many junction assigning teachers to sections.
- `student_sections`: Many-to-many junction enrolling students into sections.
- `invitations`: Cryptographically hashed invitation ledger (`token_hash`, `email`, `role`, `section_ids`, `status`, `expires_at`).
- `audit_logs`: Chronological security audit trail.

---

## 5. Initial Administrator Bootstrap Procedure

The designated initial administrator (`INITIAL_ADMIN_EMAIL=singlahimanshi2@gmail.com`) can be provisioned or promoted idempotently via CLI script:

```bash
# From repository root
cd backend
.venv/bin/python scripts/bootstrap_admin.py --password "YourSecureAdminPassword123!" --name "Chief Administrator"
```

### Script Behavior
- If user does not exist: Creates user in Supabase Auth, confirms email, inserts profile in `profiles` with role `ADMIN`.
- If user already exists with `STUDENT` or `TEACHER` role: Upgrades role to `ADMIN` in both `profiles` and Supabase Auth metadata.
- If user already has `ADMIN` role: Reports `ALREADY_PROVISIONED` with zero disruption.
- Records audit event `BOOTSTRAP_INITIAL_ADMIN`.

---

## 6. End-to-End Onboarding Workflows

### Faculty (Teacher) Onboarding
1. **Admin Invites Teacher**:
   - Admin logs into `/` and opens **Admin Oversight Portal** (`/admin`).
   - Clicks **Invite NCU Faculty**.
   - Enters teacher email (`faculty@ncuindia.edu`), optional full name, and selects course sections.
   - Backend validates domain, hashes token, stores invite with `PENDING` status, and dispatches invitation email.
2. **Teacher Receives Email**:
   - Email contains branded DraftForge invitation link:
     `http://localhost:5173/accept-invitation?token={raw_token}`
3. **Teacher Redeems Token**:
   - Link opens `/accept-invitation?token=...`.
   - Frontend verifies token validity (`GET /api/v1/invitations/verify`).
   - Teacher sets password, enters legal name, and clicks **Accept Invitation & Enter Studio**.
   - Backend provisions Supabase Auth user, assigns them to selected sections in `teacher_sections`, marks invite `ACCEPTED`, records audit log, and returns active session.
   - Teacher is automatically redirected into **Faculty Portal**.

### Student Onboarding
1. **Teacher Invites Student**:
   - Faculty member navigates to **Sections & Rosters** in Teacher Portal.
   - Selects an assigned section (e.g. `LAW-2025-A`) and clicks **Invite Student to Section**.
   - Enters student email and full name.
   - Backend verifies teacher is assigned to section, generates token, and dispatches invitation email.
2. **Student Accepts**:
   - Student clicks link in email, sets password, and is automatically enrolled into `LAW-2025-A`.
   - Student lands in **Drafting Workspace** ready to complete assignments.

---

## 7. Administrative Ownership Transfer & Handover

When transferring the platform to the university IT department or a designated faculty dean:

1. **Pre-requisite**: Ensure the recipient faculty member has accepted their teacher invitation and has an active account.
2. **Execution via Admin Portal**:
   - Current Administrator navigates to **Administrator Oversight Portal** -> **Ownership Handover** tab.
   - Enters the new administrator's email twice to confirm.
   - Inputs mandatory audit reason (e.g., *"Official platform handover to Dean of Law School as per IT governance policy"*).
   - Clicks **Execute Official Admin Handover**.
3. **Automatic Safeguards**:
   - Backend atomically promotes the new user to `ADMIN`.
   - Current administrator is gracefully demoted to `TEACHER`.
   - Event is permanently logged in `audit_logs` with action `TRANSFER_ADMIN_ROLE`.

---

## 8. Verification & Test Suite

All 29 backend unit and integration tests, as well as the Vite frontend production build, run and pass cleanly:

```bash
# Run backend tests
cd backend
.venv/bin/pytest -v

# Run frontend build check
cd ../frontend
npm run build
```
