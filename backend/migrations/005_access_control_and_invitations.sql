-- Phase 11 & Access Control Schema: Sections, Memberships, Invitations, and Security Audit Logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
    END IF;
END$$;

-- 1. Class / Course Sections
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    academic_year VARCHAR(64) NOT NULL DEFAULT '2025-2026',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Teacher Section Assignments (Admins assign teachers to sections)
CREATE TABLE IF NOT EXISTS public.teacher_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, section_id)
);

-- 3. Student Section Memberships (Students enrolled in sections)
CREATE TABLE IF NOT EXISTS public.student_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- 4. Invitation Lifecycle Table (Single-use, hashed token storage)
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_ids JSONB DEFAULT '[]'::jsonb,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    status invitation_status NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    accepted_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Security & Governance Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action VARCHAR(128) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(255),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_sections_code ON public.sections(code);
CREATE INDEX IF NOT EXISTS idx_teacher_sections_teacher ON public.teacher_sections(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_sections_section ON public.teacher_sections(section_id);
CREATE INDEX IF NOT EXISTS idx_student_sections_student ON public.student_sections(student_id);
CREATE INDEX IF NOT EXISTS idx_student_sections_section ON public.student_sections(section_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON public.invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Section Policies: Everyone authenticated can view active sections, only admins can manage
DROP POLICY IF EXISTS "Admins full access to sections" ON public.sections;
CREATE POLICY "Admins full access to sections"
    ON public.sections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can read active sections" ON public.sections;
CREATE POLICY "Authenticated users can read active sections"
    ON public.sections
    FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Teacher Sections Policies:
DROP POLICY IF EXISTS "Admins full access to teacher_sections" ON public.teacher_sections;
CREATE POLICY "Admins full access to teacher_sections"
    ON public.teacher_sections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Teachers can view own section assignments" ON public.teacher_sections;
CREATE POLICY "Teachers can view own section assignments"
    ON public.teacher_sections
    FOR SELECT
    USING (teacher_id = auth.uid());

-- Student Sections Policies:
DROP POLICY IF EXISTS "Admins and teachers can view student sections" ON public.student_sections;
CREATE POLICY "Admins and teachers can view student sections"
    ON public.student_sections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'TEACHER')
        )
        OR student_id = auth.uid()
    );

DROP POLICY IF EXISTS "Admins and assigned teachers can insert student sections" ON public.student_sections;
CREATE POLICY "Admins and assigned teachers can insert student sections"
    ON public.student_sections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
        OR EXISTS (
            SELECT 1 FROM public.teacher_sections
            WHERE teacher_sections.teacher_id = auth.uid()
              AND teacher_sections.section_id = student_sections.section_id
        )
    );

-- Invitations Policies:
DROP POLICY IF EXISTS "Admins full access to invitations" ON public.invitations;
CREATE POLICY "Admins full access to invitations"
    ON public.invitations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Teachers can view and manage their own student invitations" ON public.invitations;
CREATE POLICY "Teachers can view and manage their own student invitations"
    ON public.invitations
    FOR ALL
    USING (
        inviter_id = auth.uid() AND role = 'STUDENT'
    );

-- Audit Logs Policies:
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );
