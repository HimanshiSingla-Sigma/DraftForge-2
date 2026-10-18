import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import {
  AdminOverviewStats,
  Section,
  TeacherOverview,
  StudentOverview,
  Invitation,
  AuditLog,
} from '../types';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Shield,
  Users,
  GraduationCap,
  Layers,
  Mail,
  FileText,
  KeyRound,
  Plus,
  XCircle,
  CheckCircle2,
  Clock,
  UserPlus,
  Filter,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.178-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.635-.929-2.239-.244-.589-.493-.509-.678-.518-.176-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.145 4.549.718.311 1.279.497 1.716.636.721.229 1.377.197 1.896.119.578-.087 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.53 2 2.05 6.47 2.05 11.97c0 1.93.55 3.73 1.51 5.26L2 22l4.92-1.52c1.47.88 3.19 1.39 5.12 1.39 5.51 0 9.99-4.47 9.99-9.97C22.03 6.47 17.55 2 12.04 2zm0 18.23c-1.67 0-3.23-.48-4.56-1.31l-.33-.2-3.32 1.03 1.05-3.22-.22-.35c-.95-1.42-1.49-3.1-1.49-4.88 0-4.54 3.7-8.24 8.27-8.24 4.57 0 8.27 3.7 8.27 8.24 0 4.55-3.7 8.25-8.27 8.25z" />
  </svg>
);

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'sections' | 'teachers' | 'students' | 'invitations' | 'audit' | 'transfer'
  >('sections');

  // Stats
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Data sets
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<TeacherOverview[]>([]);
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Loading states
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Modals
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isInviteTeacherOpen, setIsInviteTeacherOpen] = useState(false);
  const [isAssignSectionsOpen, setIsAssignSectionsOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<TeacherOverview | null>(null);
  const [assignSectionIds, setAssignSectionIds] = useState<string[]>([]);

  // Create Section Form
  const [sectionName, setSectionName] = useState('');
  const [sectionCode, setSectionCode] = useState('');
  const [sectionYear, setSectionYear] = useState('2025-2026');
  const [sectionDesc, setSectionDesc] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);

  // Invite Teacher Form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherSectionIds, setTeacherSectionIds] = useState<string[]>([]);
  const [invitingTeacher, setInvitingTeacher] = useState(false);

  // Newly created/resent invitation link state (for banner)
  const [adminInviteResult, setAdminInviteResult] = useState<{
    email: string;
    url: string;
    emailSent: boolean;
    role: 'TEACHER' | 'STUDENT';
    details?: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // In-modal results for instant WhatsApp and Copy Link actions
  const [modalTeacherInviteResult, setModalTeacherInviteResult] = useState<{
    email: string;
    url: string;
    emailSent: boolean;
  } | null>(null);

  const [modalStudentInviteResult, setModalStudentInviteResult] = useState<{
    email: string;
    url: string;
    emailSent: boolean;
    sectionName?: string;
  } | null>(null);

  // Invite Student Form
  const [isInviteStudentOpen, setIsInviteStudentOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [studentSectionId, setStudentSectionId] = useState('');
  const [invitingStudent, setInvitingStudent] = useState(false);

  // Admin Transfer Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [confirmAdminEmail, setConfirmAdminEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Load Overview Metrics
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getAdminStats();
      setStats(res.data);
    } catch (err: any) {
      showToast('Failed to load administrative overview stats.', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Tab Data
  const loadTabData = async () => {
    setLoadingData(true);
    try {
      if (activeAdminTab === 'sections') {
        const res = await api.getAdminSections();
        setSections(res.data);
      } else if (activeAdminTab === 'teachers') {
        const [teachersRes, sectionsRes] = await Promise.all([
          api.getAdminTeachers(),
          api.getAdminSections(),
        ]);
        setTeachers(teachersRes.data);
        setSections(sectionsRes.data);
      } else if (activeAdminTab === 'students') {
        const res = await api.getAdminStudents();
        setStudents(res.data);
      } else if (activeAdminTab === 'invitations') {
        const res = await api.getAdminInvitations(undefined, statusFilter || undefined);
        setInvitations(res.data);
      } else if (activeAdminTab === 'audit') {
        const res = await api.getAuditLogs(150);
        setAuditLogs(res.data);
      }
    } catch (err: any) {
      showToast('Error retrieving administrative data.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeAdminTab, statusFilter]);

  // Create Section Handler
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSection(true);
    try {
      await api.createSection({
        name: sectionName.trim(),
        code: sectionCode.trim().toUpperCase(),
        academic_year: sectionYear.trim(),
        description: sectionDesc.trim() || undefined,
      });
      showToast(`Section ${sectionCode} created successfully.`, 'success');
      setSectionName('');
      setSectionCode('');
      setSectionDesc('');
      setIsCreateSectionOpen(false);
      loadTabData();
      loadStats();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create course section.';
      showToast(msg, 'error');
    } finally {
      setCreatingSection(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async (url: string) => {
    if (!url) {
      showToast('No invitation link available to copy.', 'error');
      return;
    }
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(true);
      showToast('Invitation link copied to clipboard!', 'success');
      setTimeout(() => setCopiedUrl(false), 2500);
    } else {
      showToast('Failed to copy invitation link. Please copy it manually.', 'error');
    }
  };

  const handleShareWhatsApp = (url: string, role: 'TEACHER' | 'STUDENT', details?: string) => {
    if (!url) {
      showToast('No invitation URL available to share.', 'error');
      return;
    }
    let roleText = '';
    if (role === 'TEACHER') {
      roleText = ' as a Faculty Member';
    } else if (role === 'STUDENT') {
      roleText = details ? ` for ${details}` : ' as a Legal Scholar Student';
    }
    const message = `You have been invited to join DraftForge${roleText}. Accept your invitation here: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Invite Teacher Handler
  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = teacherEmail.trim().toLowerCase();
    if (!email.endsWith('@ncuindia.edu')) {
      showToast('Faculty email must belong to the official university domain: @ncuindia.edu', 'error');
      return;
    }

    setInvitingTeacher(true);
    try {
      const res: any = await api.inviteTeacher({
        email: teacherEmail.trim().toLowerCase(),
        full_name: teacherFullName.trim() || undefined,
        section_ids: teacherSectionIds,
      });
      const data = res.data || {};
      const inviteUrl = data.invitation_url || data.invitation?.invitation_url;
      const emailSent = data.email_sent ?? data.invitation?.email_sent ?? false;

      if (emailSent) {
        showToast(`Faculty invitation dispatched to ${teacherEmail}.`, 'success');
      } else {
        showToast(`Faculty invitation created. Email delivery unavailable; link ready to share below.`, 'warning');
      }

      if (inviteUrl) {
        const payload = {
          email: teacherEmail.trim().toLowerCase(),
          url: inviteUrl,
          emailSent: !!emailSent,
          role: 'TEACHER' as const,
        };
        setAdminInviteResult(payload);
        setModalTeacherInviteResult({
          email: payload.email,
          url: payload.url,
          emailSent: payload.emailSent,
        });
      }
      loadStats();
      if (activeAdminTab === 'invitations' || activeAdminTab === 'teachers') {
        loadTabData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to invite faculty member.';
      showToast(msg, 'error');
    } finally {
      setInvitingTeacher(false);
    }
  };

  const handleOpenInviteTeacher = async () => {
    setModalTeacherInviteResult(null);
    if (sections.length === 0) {
      try {
        const res = await api.getAdminSections();
        setSections(res.data);
      } catch (e) {
        // ignore
      }
    }
    setIsInviteTeacherOpen(true);
  };

  const handleOpenInviteStudent = async () => {
    setModalStudentInviteResult(null);
    let currentSections = sections;
    if (currentSections.length === 0) {
      try {
        const res = await api.getAdminSections();
        currentSections = res.data;
        setSections(res.data);
      } catch (e) {
        // ignore
      }
    }
    if (currentSections.length > 0 && !studentSectionId) {
      setStudentSectionId(currentSections[0].id);
    }
    setIsInviteStudentOpen(true);
  };

  // Invite Student Handler (Admin)
  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentSectionId) {
      showToast('Please select a course section for this student.', 'error');
      return;
    }

    const email = studentEmail.trim().toLowerCase();
    if (!email.endsWith('@ncuindia.edu')) {
      showToast('Student email must belong to the official university domain: @ncuindia.edu', 'error');
      return;
    }

    setInvitingStudent(true);
    try {
      const res: any = await api.inviteStudentAsAdmin({
        email,
        full_name: studentFullName.trim() || undefined,
        section_id: studentSectionId,
      });
      const data = res.data || {};
      const inviteUrl = data.invitation_url || data.invitation?.invitation_url;
      const emailSent = data.email_sent ?? data.invitation?.email_sent ?? false;
      const secObj = sections.find((s) => s.id === studentSectionId);

      if (emailSent) {
        showToast(`Student invitation dispatched to ${email}.`, 'success');
      } else {
        showToast(`Student invitation created. Email delivery unavailable; link ready to share below.`, 'warning');
      }

      if (inviteUrl) {
        const payload = {
          email,
          url: inviteUrl,
          emailSent: !!emailSent,
          role: 'STUDENT' as const,
          details: secObj ? `${secObj.name} (${secObj.code})` : undefined,
        };
        setAdminInviteResult(payload);
        setModalStudentInviteResult({
          email,
          url: inviteUrl,
          emailSent: !!emailSent,
          sectionName: secObj ? secObj.name : undefined,
        });
      }
      loadStats();
      if (activeAdminTab === 'invitations' || activeAdminTab === 'students') {
        loadTabData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to dispatch student invitation.';
      showToast(msg, 'error');
    } finally {
      setInvitingStudent(false);
    }
  };

  // Assign Sections to Teacher
  const handleAssignSections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAssign) return;

    try {
      await api.assignTeacherSections(selectedTeacherForAssign.id, assignSectionIds);
      showToast(`Updated section assignments for ${selectedTeacherForAssign.email}.`, 'success');
      setIsAssignSectionsOpen(false);
      setSelectedTeacherForAssign(null);
      loadTabData();
    } catch (err: any) {
      showToast('Failed to update teacher sections.', 'error');
    }
  };

  // Resend / Revoke
  const handleResend = async (id: string) => {
    try {
      const res: any = await api.resendInvitation(id);
      const data = res.data || {};
      const inviteUrl = data.invitation_url || data.invitation?.invitation_url;
      const emailSent = data.email_sent ?? data.invitation?.email_sent ?? false;
      const inv = invitations.find((i) => i.id === id);
      const invRole = (inv?.role?.toUpperCase() === 'STUDENT' ? 'STUDENT' : 'TEACHER') as 'TEACHER' | 'STUDENT';
      const invDetails = inv?.section_names && inv.section_names.length > 0 ? inv.section_names.join(', ') : undefined;

      if (emailSent) {
        showToast('Invitation token refreshed and resent.', 'success');
      } else {
        showToast('Token refreshed! Email delivery unavailable; link ready to share below.', 'warning');
      }

      if (inviteUrl) {
        setAdminInviteResult({
          email: data.invitation?.email || inv?.email || 'Invited User',
          url: inviteUrl,
          emailSent: !!emailSent,
          role: invRole,
          details: invDetails,
        });
      }
      loadTabData();
    } catch (err: any) {
      showToast('Failed to resend invitation.', 'error');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await api.revokeInvitation(id);
      showToast('Invitation revoked.', 'info');
      loadTabData();
      loadStats();
    } catch (err: any) {
      showToast('Failed to revoke invitation.', 'error');
    }
  };

  // Admin Transfer Handler
  const handleTransferAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminEmail.trim().toLowerCase() !== confirmAdminEmail.trim().toLowerCase()) {
      showToast('New administrator email and confirmation email do not match.', 'error');
      return;
    }

    if (!window.confirm(`SECURITY WARNING: Are you certain you want to transfer primary root administrator privileges to ${newAdminEmail}? Your account will be demoted to TEACHER.`)) {
      return;
    }

    setTransferring(true);
    try {
      await api.transferAdmin({
        new_admin_email: newAdminEmail.trim().toLowerCase(),
        confirm_email: confirmAdminEmail.trim().toLowerCase(),
        reason: transferReason.trim(),
      });
      showToast('Administrator ownership successfully transferred. Demoting session to faculty.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to transfer administrative ownership.';
      showToast(msg, 'error');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Top University & Admin Title Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-[#F4EFEA] border border-[#E5DED2] flex items-center justify-center text-[#C78335] shadow-xs">
              <Shield className="w-4 h-4 text-[#C78335]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
                  Administrator Oversight Portal
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FBF0E4] text-[#C78335] border border-[#E5DED2] font-mono uppercase tracking-wider">
                  Root Governance
                </span>
              </div>
              <p className="text-xs text-[#74777D] font-mono mt-0.5">
                The NorthCap University • Department of Law • Sector 23-A, Gurugram
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenInviteTeacher}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
            <span>Invite NCU Faculty</span>
          </button>
          <button
            onClick={handleOpenInviteStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#557B68] hover:bg-[#436253] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-white" />
            <span>Invite Student</span>
          </button>
          <button
            onClick={() => setIsCreateSectionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] text-xs font-medium border border-[#E5DED2] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#20344A]" />
            <span>Add Course Section</span>
          </button>
        </div>
      </div>

      {/* Newly Created / Resent Invite URL Banner */}
      {adminInviteResult && (
        <div className="p-4 bg-[#FBF0E4] border border-[#C78335]/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C78335]" />
              <span className="font-semibold text-xs text-[#20344A]">
                {adminInviteResult.emailSent
                  ? `${adminInviteResult.role === 'TEACHER' ? 'Faculty' : 'Student'} Invitation Dispatched to ${adminInviteResult.email}`
                  : `${adminInviteResult.role === 'TEACHER' ? 'Faculty' : 'Student'} Invitation Ready for ${adminInviteResult.email}`}
              </span>
            </div>
            <button
              onClick={() => {
                setAdminInviteResult(null);
                setCopiedUrl(false);
              }}
              className="text-[#74777D] hover:text-[#20344A] text-xs font-medium cursor-pointer"
            >
              ✕ Dismiss
            </button>
          </div>
          <p className="text-[11px] text-[#74777D]">
            {adminInviteResult.emailSent
              ? 'An official invitation email was dispatched. You can also share the direct onboarding link via WhatsApp or copy it below:'
              : 'Direct onboarding link ready. Share this link with the recipient via WhatsApp or copy it below:'}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={adminInviteResult.url}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs font-mono text-[#20344A] select-all focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(adminInviteResult.url, adminInviteResult.role, adminInviteResult.details)}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                title="Share on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopyLink(adminInviteResult.url)}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                title="Copy invitation link"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#557B68]" /> : <Copy className="w-3.5 h-3.5 text-[#C78335]" />}
                <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: 'Faculty Members',
            value: stats?.total_teachers ?? 0,
            icon: GraduationCap,
            color: 'text-[#20344A]',
          },
          {
            label: 'Enrolled Students',
            value: stats?.total_students ?? 0,
            icon: Users,
            color: 'text-[#557B68]',
          },
          {
            label: 'Active Sections',
            value: stats?.total_sections ?? 0,
            icon: Layers,
            color: 'text-[#C78335]',
          },
          {
            label: 'Pending Invites',
            value: stats?.pending_invitations ?? 0,
            icon: Mail,
            color: 'text-blue-700',
          },
          {
            label: 'Accepted Accounts',
            value: stats?.accepted_invitations ?? 0,
            icon: CheckCircle2,
            color: 'text-[#557B68]',
          },
          {
            label: 'Expired Invites',
            value: stats?.expired_invitations ?? 0,
            icon: Clock,
            color: 'text-rose-600',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-3.5 sm:p-4 rounded-lg border border-[#E5DED2] shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-[#74777D] uppercase tracking-wider">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-2">
                <span className="font-serif text-2xl font-medium text-[#20344A]">
                  {loadingStats ? '—' : kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E5DED2] overflow-x-auto gap-2 text-xs font-mono font-medium">
        {[
          { id: 'sections', label: 'Academic Sections', icon: Layers },
          { id: 'teachers', label: 'Faculty Directory', icon: GraduationCap },
          { id: 'students', label: 'Student Directory', icon: Users },
          { id: 'invitations', label: 'Invitations Ledger', icon: Mail },
          { id: 'audit', label: 'Security Audit Trail', icon: FileText },
          { id: 'transfer', label: 'Ownership Handover', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveAdminTab(tab.id as any);
              }}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 -mb-[1px] whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#20344A] text-[#20344A] bg-white rounded-t border-t border-l border-r border-[#E5DED2] font-semibold'
                  : 'border-transparent text-[#74777D] hover:text-[#20344A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Academic Sections */}
      {activeAdminTab === 'sections' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Course Sections Curriculum ({sections.length})
              </h3>
              <p className="text-xs text-[#74777D]">
                Configured cohort sections with active faculty allocations and student headcounts.
              </p>
            </div>
            <button
              onClick={() => setIsCreateSectionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C78335]" />
              <span>New Section</span>
            </button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D]">
              No academic sections configured yet. Click "New Section" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Section Title</th>
                    <th className="py-2.5 px-3">Academic Year</th>
                    <th className="py-2.5 px-3">Faculty Assigned</th>
                    <th className="py-2.5 px-3">Students Enrolled</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED2]">
                  {sections.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FBF8F2] transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                        {s.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#20344A]">
                        {s.name}
                        {s.description && (
                          <span className="block text-[11px] text-[#74777D] font-normal">
                            {s.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#74777D]">
                        {s.academic_year}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                        {s.teachers_count}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                        {s.students_count}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F3ED] text-[#557B68] font-mono">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Faculty Directory */}
      {activeAdminTab === 'teachers' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DED2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Faculty Directory ({teachers.length})
              </h3>
              <p className="text-xs text-[#74777D]">
                Academic instructors, course section assignments, and onboarding status.
              </p>
            </div>
            <button
              onClick={() => setIsInviteTeacherOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
              <span>Invite Faculty Member</span>
            </button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : teachers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D]">
              No faculty members provisioned yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Faculty Name</th>
                    <th className="py-2.5 px-3">NCU Email</th>
                    <th className="py-2.5 px-3">Assigned Sections</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED2]">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FBF8F2] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#20344A]">
                        {t.full_name || 'Academic Faculty'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#74777D]">
                        {t.email}
                      </td>
                      <td className="py-3 px-3">
                        {t.assigned_sections && t.assigned_sections.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.assigned_sections.map((sec) => (
                              <span
                                key={sec.id}
                                className="px-2 py-0.5 rounded bg-[#FBF8F2] border border-[#E5DED2] text-[10px] font-mono text-[#20344A]"
                              >
                                {sec.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#C78335] font-medium">None assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTeacherForAssign(t);
                            setAssignSectionIds(t.assigned_sections.map((s) => s.id));
                            setIsAssignSectionsOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#F3EFE6] border border-[#E5DED2] text-[11px] font-medium text-[#20344A] cursor-pointer transition-colors shadow-xs"
                        >
                          Modify Sections
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Student Directory */}
      {activeAdminTab === 'students' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Student Roster Directory ({students.length})
              </h3>
              <p className="text-xs text-[#74777D]">
                All registered law scholars across all university course sections.
              </p>
            </div>
            <button
              onClick={handleOpenInviteStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#557B68] hover:bg-[#436253] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span>Invite Student</span>
            </button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D]">
              No students enrolled in the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Enrolled Sections</th>
                    <th className="py-2.5 px-3">Drafts Created</th>
                    <th className="py-2.5 px-3">Assignments Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED2]">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-[#FBF8F2] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#20344A]">
                        {st.full_name || 'Legal Scholar'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#74777D]">
                        {st.email}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {st.enrolled_sections.map((sec) => (
                            <span
                              key={sec.id}
                              className="px-2 py-0.5 rounded bg-[#FBF8F2] border border-[#E5DED2] text-[10px] font-mono text-[#20344A]"
                            >
                              {sec.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                        {st.drafts_count}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                        {st.submissions_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Invitations Ledger */}
      {activeAdminTab === 'invitations' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DED2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Invitations Ledger ({invitations.length})
              </h3>
              <p className="text-xs text-[#74777D]">
                Audit log of all single-use invitation tokens, states, and expirations.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#74777D]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FBF8F2] border border-[#E5DED2] rounded px-2.5 py-1.5 text-xs text-[#20344A] font-mono focus:border-[#20344A] focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D]">
              No invitations match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Recipient Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Section(s)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Invited By</th>
                    <th className="py-2.5 px-3">Expires At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED2]">
                  {invitations.map((inv) => {
                    const isPending = inv.status === 'PENDING';
                    const isAccepted = inv.status === 'ACCEPTED';
                    return (
                      <tr key={inv.id} className="hover:bg-[#FBF8F2] transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-[#20344A]">
                          {inv.email}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              inv.role === 'TEACHER'
                                ? 'bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30'
                                : 'bg-[#E8F3ED] text-[#557B68] border border-[#557B68]/30'
                            }`}
                          >
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-[#74777D]">
                            {inv.section_names && inv.section_names.length > 0
                              ? inv.section_names.join(', ')
                              : 'None'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase ${
                              isPending
                                ? 'bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30'
                                : isAccepted
                                ? 'bg-[#E8F3ED] text-[#557B68] border border-[#557B68]/30'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#74777D] text-[11px]">
                          {inv.inviter_name || inv.inviter_email || 'Administrator'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#74777D]">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isPending && (
                            <div className="flex items-center justify-end gap-1.5">
                              {adminInviteResult && adminInviteResult.email === inv.email && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleShareWhatsApp(adminInviteResult.url, adminInviteResult.role, adminInviteResult.details)}
                                    className="px-2 py-1 rounded bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-medium cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                                    title="Share on WhatsApp"
                                  >
                                    <WhatsAppIcon className="w-3 h-3 fill-current" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(adminInviteResult.url)}
                                    className="px-2 py-1 rounded bg-[#20344A] hover:bg-[#152434] text-white text-[10px] font-medium cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                                    title="Copy link"
                                  >
                                    {copiedUrl ? <Check className="w-3 h-3 text-[#557B68]" /> : <Copy className="w-3 h-3 text-[#C78335]" />}
                                    <span className="hidden sm:inline">{copiedUrl ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleResend(inv.id)}
                                className="px-2 py-1 rounded bg-white hover:bg-[#F3EFE6] border border-[#E5DED2] text-[10px] font-medium text-[#20344A] cursor-pointer shadow-xs transition-colors"
                                title="Resend invitation link"
                              >
                                Resend
                              </button>
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[10px] font-medium text-rose-700 cursor-pointer transition-colors"
                                title="Revoke invitation"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Security Audit Trail */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Security & Administrative Audit Logs ({auditLogs.length})
              </h3>
              <p className="text-xs text-[#74777D]">
                Tamper-evident chronological records of administrative events, invitations, and role assignments.
              </p>
            </div>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D]">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor Email</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED2] font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FBF8F2] transition-colors">
                      <td className="py-2.5 px-3 text-[#74777D] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#20344A]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-[#20344A]">
                        {log.actor_email || 'System'}
                      </td>
                      <td className="py-2.5 px-3 text-[#74777D]">
                        {log.target_type} {log.target_id ? `[${log.target_id.slice(0, 8)}]` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-[#74777D]">
                        {log.ip_address || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#20344A]">
                        <pre className="text-[10px] max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Ownership Handover & Transfer */}
      {activeAdminTab === 'transfer' && (
        <div className="bg-white rounded-lg border border-[#E5DED2] p-6 max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5DED2]">
            <div className="w-9 h-9 rounded bg-[#FBF0E4] border border-[#E5DED2] flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#C78335]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#20344A]">
                Transfer Administrator Privileges
              </h3>
              <p className="text-xs text-[#74777D]">
                Formal handover mechanism for university deployment & institutional transfer.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#FBF0E4] border border-[#C78335]/30 text-xs text-[#20344A] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#C78335]">
              <AlertTriangle className="w-4 h-4 text-[#C78335] shrink-0" />
              <span>Strict University Governance Policy</span>
            </div>
            <p className="leading-relaxed">
              Transferring administrator privileges will promote the designated user to primary <span className="font-semibold text-[#20344A]">ADMIN</span> and demote your active account to <span className="font-semibold text-[#20344A]">TEACHER</span>. This action is permanently audited.
            </p>
          </div>

          <form onSubmit={handleTransferAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                New Administrator Email Address
              </label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="faculty.head@ncuindia.edu"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#74777D] mt-1 block">
                The user must already have a verified profile in DraftForge.
              </span>
            </div>

            <div>
              <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                Confirm New Administrator Email
              </label>
              <input
                type="email"
                required
                value={confirmAdminEmail}
                onChange={(e) => setConfirmAdminEmail(e.target.value)}
                placeholder="Repeat new administrator email"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                Reason for Handover (Audited)
              </label>
              <textarea
                required
                rows={3}
                minLength={10}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Official semester handover to Head of Department as per academic council guidelines."
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-3 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={transferring}
              className="w-full py-2.5 bg-[#C78335] hover:bg-[#B3722A] text-white font-semibold text-xs rounded shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {transferring ? <LoadingSpinner size="sm" /> : <KeyRound className="w-4 h-4 text-white" />}
              <span>Execute Official Admin Handover</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal: Create Academic Section */}
      {isCreateSectionOpen && createPortal(
        <div className="fixed inset-0 bg-[#20344A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded-xl border border-[#E5DED2] shadow-xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <h3 className="font-serif text-lg font-medium text-[#20344A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C78335]" />
                <span>Create Course Section</span>
              </h3>
              <button
                onClick={() => setIsCreateSectionOpen(false)}
                className="p-1 rounded hover:bg-[#F3EFE6] text-[#74777D]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                  Section Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAW-2025-A"
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value)}
                  className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono font-medium text-[#20344A] focus:border-[#20344A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Law of Contracts & Drafting A"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  value={sectionYear}
                  onChange={(e) => setSectionYear(e.target.value)}
                  className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] focus:border-[#20344A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional section details or semester notes..."
                  value={sectionDesc}
                  onChange={(e) => setSectionDesc(e.target.value)}
                  className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-3 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSectionOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSection}
                  className="px-4 py-2 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingSection ? <LoadingSpinner size="sm" /> : <Plus className="w-3.5 h-3.5 text-[#C78335]" />}
                  <span>Create Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Invite NCU Teacher */}
      {isInviteTeacherOpen && createPortal(
        <div className="fixed inset-0 bg-[#20344A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded-xl border border-[#E5DED2] shadow-xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#C78335]" />
                  <span>{modalTeacherInviteResult ? 'Faculty Invitation Created' : 'Invite Faculty Member'}</span>
                </h3>
                <span className="text-[11px] text-[#74777D] font-mono">
                  Enforces domain: @ncuindia.edu
                </span>
              </div>
              <button
                onClick={() => {
                  setIsInviteTeacherOpen(false);
                  setModalTeacherInviteResult(null);
                  setTeacherEmail('');
                  setTeacherFullName('');
                  setTeacherSectionIds([]);
                }}
                className="p-1 rounded hover:bg-[#F3EFE6] text-[#74777D] cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {modalTeacherInviteResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#E8F3ED] border border-[#557B68]/30 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#557B68] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#20344A]">
                      {modalTeacherInviteResult.emailSent
                        ? 'Faculty Invitation Dispatched & Link Ready'
                        : 'Single-Use Faculty Link Ready for Sharing'}
                    </h4>
                    <p className="text-[11px] text-[#557B68]">
                      {modalTeacherInviteResult.emailSent
                        ? `An official email was sent to ${modalTeacherInviteResult.email}. You can also share the onboarding URL via WhatsApp or copy it below:`
                        : `Email delivery was unavailable, but the single-use onboarding URL for ${modalTeacherInviteResult.email} is active and expires in 72 hours:`}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Faculty Invitation URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalTeacherInviteResult.url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] select-all focus:border-[#20344A] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#74777D] mt-1 block">
                    Single-use token &bull; Valid for 72 hours &bull; Restricted to {modalTeacherInviteResult.email}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(modalTeacherInviteResult.url, 'TEACHER')}
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Share invitation on WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(modalTeacherInviteResult.url)}
                    className="flex-1 py-2 px-3 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Copy invitation link"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-[#557B68]" /> : <Copy className="w-4 h-4 text-[#C78335]" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5DED2]">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTeacherInviteResult(null);
                      setTeacherEmail('');
                      setTeacherFullName('');
                      setTeacherSectionIds([]);
                    }}
                    className="text-xs font-medium text-[#20344A] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
                    <span>Invite another faculty member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteTeacherOpen(false);
                      setModalTeacherInviteResult(null);
                      setTeacherEmail('');
                      setTeacherFullName('');
                      setTeacherSectionIds([]);
                    }}
                    className="px-4 py-1.5 bg-[#F3EFE6] hover:bg-[#E5DED2] text-[#20344A] text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Official NCU Faculty Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="professor@ncuindia.edu"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Faculty Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Meera Rao"
                    value={teacherFullName}
                    onChange={(e) => setTeacherFullName(e.target.value)}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Assign Initial Section(s)
                  </label>
                  {sections.length === 0 ? (
                    <span className="text-[11px] text-[#74777D] block">No sections available yet.</span>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto border border-[#E5DED2] rounded p-2 bg-[#FBF8F2]">
                      {sections.map((s) => (
                        <label key={s.id} className="flex items-center gap-2 text-xs text-[#20344A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherSectionIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeacherSectionIds([...teacherSectionIds, s.id]);
                              } else {
                                setTeacherSectionIds(teacherSectionIds.filter((id) => id !== s.id));
                              }
                            }}
                            className="rounded border-[#E5DED2] text-[#20344A]"
                          />
                          <span className="font-medium">{s.name} ({s.code})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteTeacherOpen(false);
                      setModalTeacherInviteResult(null);
                      setTeacherEmail('');
                      setTeacherFullName('');
                      setTeacherSectionIds([]);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={invitingTeacher}
                    className="px-4 py-2 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {invitingTeacher ? <LoadingSpinner size="sm" /> : <Mail className="w-3.5 h-3.5 text-[#C78335]" />}
                    <span>Dispatch Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Invite Student (Admin) */}
      {isInviteStudentOpen && createPortal(
        <div className="fixed inset-0 bg-[#20344A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded-xl border border-[#E5DED2] shadow-xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#557B68]" />
                  <span>{modalStudentInviteResult ? 'Student Invitation Created' : 'Invite Law Student'}</span>
                </h3>
                <span className="text-[11px] text-[#74777D] font-mono">
                  Enforces domain: @ncuindia.edu &bull; Enrolls into designated course section
                </span>
              </div>
              <button
                onClick={() => {
                  setIsInviteStudentOpen(false);
                  setModalStudentInviteResult(null);
                  setStudentEmail('');
                  setStudentFullName('');
                }}
                className="p-1 rounded hover:bg-[#F3EFE6] text-[#74777D] cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {modalStudentInviteResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#E8F3ED] border border-[#557B68]/30 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#557B68] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#20344A]">
                      {modalStudentInviteResult.emailSent
                        ? 'Student Invitation Dispatched & Link Ready'
                        : 'Single-Use Student Link Ready for Sharing'}
                    </h4>
                    <p className="text-[11px] text-[#557B68]">
                      {modalStudentInviteResult.emailSent
                        ? `An official email was sent to ${modalStudentInviteResult.email}${modalStudentInviteResult.sectionName ? ` for section ${modalStudentInviteResult.sectionName}` : ''}. You can also share the onboarding URL via WhatsApp or copy it below:`
                        : `Email delivery was unavailable, but the single-use student onboarding URL for ${modalStudentInviteResult.email} is active and expires in 72 hours:`}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Student Invitation URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalStudentInviteResult.url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] select-all focus:border-[#20344A] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#74777D] mt-1 block">
                    Single-use token &bull; Valid for 72 hours &bull; Restricted to {modalStudentInviteResult.email}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(modalStudentInviteResult.url, 'STUDENT', modalStudentInviteResult.sectionName)}
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Share invitation on WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(modalStudentInviteResult.url)}
                    className="flex-1 py-2 px-3 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Copy invitation link"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-[#557B68]" /> : <Copy className="w-4 h-4 text-[#C78335]" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5DED2]">
                  <button
                    type="button"
                    onClick={() => {
                      setModalStudentInviteResult(null);
                      setStudentEmail('');
                      setStudentFullName('');
                    }}
                    className="text-xs font-medium text-[#20344A] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
                    <span>Invite another student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteStudentOpen(false);
                      setModalStudentInviteResult(null);
                      setStudentEmail('');
                      setStudentFullName('');
                    }}
                    className="px-4 py-1.5 bg-[#F3EFE6] hover:bg-[#E5DED2] text-[#20344A] text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Select Course Section
                  </label>
                  {sections.length === 0 ? (
                    <div className="p-3 bg-[#FBF0E4] border border-[#C78335]/30 rounded text-xs text-[#20344A] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#C78335]" />
                      <span>No sections available. Please create a course section first.</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={studentSectionId}
                      onChange={(e) => setStudentSectionId(e.target.value)}
                      className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-medium text-[#20344A] focus:border-[#20344A] focus:outline-none"
                    >
                      <option value="" disabled>-- Select Section --</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Official NCU Student Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@ncuindia.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Student Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ananya Sen"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#FBF8F2] border border-[#E5DED2] rounded text-[11px] text-[#74777D] leading-relaxed">
                  A single-use onboarding invitation link valid for 72 hours will be generated. You can share it via WhatsApp or copy it directly.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteStudentOpen(false);
                      setModalStudentInviteResult(null);
                      setStudentEmail('');
                      setStudentFullName('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={invitingStudent || sections.length === 0}
                    className="px-4 py-2 bg-[#557B68] hover:bg-[#436253] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {invitingStudent ? <LoadingSpinner size="sm" /> : <Mail className="w-3.5 h-3.5 text-white" />}
                    <span>Dispatch Student Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Modify Teacher Sections */}
      {isAssignSectionsOpen && selectedTeacherForAssign && createPortal(
        <div className="fixed inset-0 bg-[#20344A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded-xl border border-[#E5DED2] shadow-xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#20344A]">
                  Modify Assigned Sections
                </h3>
                <span className="text-[11px] text-[#74777D] font-mono">
                  {selectedTeacherForAssign.email}
                </span>
              </div>
              <button
                onClick={() => setIsAssignSectionsOpen(false)}
                className="p-1 rounded hover:bg-[#F3EFE6] text-[#74777D]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSections} className="space-y-4">
              <div className="space-y-1.5 max-h-56 overflow-y-auto border border-[#E5DED2] rounded p-3 bg-[#FBF8F2]">
                {sections.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs text-[#20344A] cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={assignSectionIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignSectionIds([...assignSectionIds, s.id]);
                        } else {
                          setAssignSectionIds(assignSectionIds.filter((id) => id !== s.id));
                        }
                      }}
                      className="rounded border-[#E5DED2] text-[#20344A]"
                    />
                    <span className="font-medium">{s.name} ({s.code})</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignSectionsOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
