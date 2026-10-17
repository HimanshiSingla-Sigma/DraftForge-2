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
} from 'lucide-react';

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

  // Invite Teacher Handler
  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitingTeacher(true);
    try {
      await api.inviteTeacher({
        email: teacherEmail.trim().toLowerCase(),
        full_name: teacherFullName.trim() || undefined,
        section_ids: teacherSectionIds,
      });
      showToast(`Faculty invitation dispatched to ${teacherEmail}.`, 'success');
      setTeacherEmail('');
      setTeacherFullName('');
      setTeacherSectionIds([]);
      setIsInviteTeacherOpen(false);
      loadStats();
      if (activeAdminTab === 'invitations' || activeAdminTab === 'teachers') {
        loadTabData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to invite faculty member.';
      showToast(msg, 'error');
    } finally {
      setInvitingTeacher(false);
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
      await api.resendInvitation(id);
      showToast('Invitation token refreshed and resent.', 'success');
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
      <div className="tactile-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-[0_3px_#0B192C]">
              <Shield className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-black text-[#0B192C]">
                  Administrator Oversight Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-mono uppercase tracking-wider">
                  Root Governance
                </span>
              </div>
              <p className="text-xs text-[#5A6A80] font-mono mt-0.5">
                The NorthCap University • Department of Law • Sector 23-A, Gurugram
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsInviteTeacherOpen(true)}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold border-b-4 border-[#0B192C] shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Invite NCU Faculty</span>
          </button>
          <button
            onClick={() => setIsCreateSectionOpen(true)}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F0EA] text-[#0B192C] text-xs font-bold border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#1E3E62]" />
            <span>Add Course Section</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: 'Faculty Members',
            value: stats?.total_teachers ?? 0,
            icon: GraduationCap,
            color: 'text-[#1E3E62]',
          },
          {
            label: 'Enrolled Students',
            value: stats?.total_students ?? 0,
            icon: Users,
            color: 'text-emerald-700',
          },
          {
            label: 'Active Sections',
            value: stats?.total_sections ?? 0,
            icon: Layers,
            color: 'text-amber-700',
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
            color: 'text-emerald-600',
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
              className="tactile-card bg-white p-3.5 sm:p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5A6A80] uppercase tracking-wider font-mono">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-2">
                <span className="font-serif text-2xl font-black text-[#0B192C]">
                  {loadingStats ? '—' : kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b-2 border-[#E6E2D8] overflow-x-auto gap-2 text-xs font-bold font-mono">
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
              className={`flex items-center gap-2 py-3 px-4 border-b-2 -mb-[2px] whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#1E3E62] text-[#1E3E62] bg-white rounded-t-xl border-t-2 border-l-2 border-r-2 shadow-xs'
                  : 'border-transparent text-[#5A6A80] hover:text-[#0B192C]'
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
        <div className="tactile-card bg-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Course Sections Curriculum ({sections.length})
              </h3>
              <p className="text-xs text-[#5A6A80]">
                Configured cohort sections with active faculty allocations and student headcounts.
              </p>
            </div>
            <button
              onClick={() => setIsCreateSectionOpen(true)}
              className="tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold border-b-4 border-[#0B192C] shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>New Section</span>
            </button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6A80]">
              No academic sections configured yet. Click "New Section" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Section Title</th>
                    <th className="py-2.5 px-3">Academic Year</th>
                    <th className="py-2.5 px-3">Faculty Assigned</th>
                    <th className="py-2.5 px-3">Students Enrolled</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8]">
                  {sections.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#1E3E62]">
                        {s.code}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#0B192C]">
                        {s.name}
                        {s.description && (
                          <span className="block text-[11px] text-[#5A6A80] font-normal">
                            {s.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5A6A80]">
                        {s.academic_year}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0B192C]">
                        {s.teachers_count}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0B192C]">
                        {s.students_count}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
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
        <div className="tactile-card bg-white p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#E6E2D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Faculty Directory ({teachers.length})
              </h3>
              <p className="text-xs text-[#5A6A80]">
                Academic instructors, course section assignments, and onboarding status.
              </p>
            </div>
            <button
              onClick={() => setIsInviteTeacherOpen(true)}
              className="tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold border-b-4 border-[#0B192C] shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Invite Faculty Member</span>
            </button>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : teachers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6A80]">
              No faculty members provisioned yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Faculty Name</th>
                    <th className="py-2.5 px-3">NCU Email</th>
                    <th className="py-2.5 px-3">Assigned Sections</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8]">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#0B192C]">
                        {t.full_name || 'Academic Faculty'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5A6A80]">
                        {t.email}
                      </td>
                      <td className="py-3 px-3">
                        {t.assigned_sections && t.assigned_sections.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.assigned_sections.map((sec) => (
                              <span
                                key={sec.id}
                                className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E6E2D8] text-[10px] font-bold font-mono text-[#0B192C]"
                              >
                                {sec.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium">None assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTeacherForAssign(t);
                            setAssignSectionIds(t.assigned_sections.map((s) => s.id));
                            setIsAssignSectionsOpen(true);
                          }}
                          className="tactile-btn px-2.5 py-1 rounded-lg bg-white hover:bg-[#F3F0EA] border border-[#E6E2D8] text-[11px] font-bold text-[#1E3E62] cursor-pointer"
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
        <div className="tactile-card bg-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Student Roster Directory ({students.length})
              </h3>
              <p className="text-xs text-[#5A6A80]">
                All registered law scholars across all university course sections.
              </p>
            </div>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6A80]">
              No students enrolled in the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Enrolled Sections</th>
                    <th className="py-2.5 px-3">Drafts Created</th>
                    <th className="py-2.5 px-3">Assignments Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8]">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#0B192C]">
                        {st.full_name || 'Legal Scholar'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#5A6A80]">
                        {st.email}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {st.enrolled_sections.map((sec) => (
                            <span
                              key={sec.id}
                              className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E6E2D8] text-[10px] font-bold font-mono text-[#0B192C]"
                            >
                              {sec.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0B192C]">
                        {st.drafts_count}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0B192C]">
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
        <div className="tactile-card bg-white p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#E6E2D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Invitations Ledger ({invitations.length})
              </h3>
              <p className="text-xs text-[#5A6A80]">
                Audit log of all single-use invitation tokens, states, and expirations.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#5A6A80]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-2.5 py-1.5 text-xs text-[#0B192C] font-mono focus:outline-none"
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
            <div className="p-8 text-center text-xs text-[#5A6A80]">
              No invitations match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Recipient Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Section(s)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Invited By</th>
                    <th className="py-2.5 px-3">Expires At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8]">
                  {invitations.map((inv) => {
                    const isPending = inv.status === 'PENDING';
                    const isAccepted = inv.status === 'ACCEPTED';
                    return (
                      <tr key={inv.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#0B192C]">
                          {inv.email}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] ${
                              inv.role === 'TEACHER'
                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                : 'bg-blue-50 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-[#5A6A80]">
                            {inv.section_names && inv.section_names.length > 0
                              ? inv.section_names.join(', ')
                              : 'None'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isAccepted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#5A6A80] text-[11px]">
                          {inv.inviter_name || inv.inviter_email || 'Administrator'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#5A6A80]">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isPending && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResend(inv.id)}
                                className="tactile-btn px-2 py-1 rounded bg-white hover:bg-[#F3F0EA] border border-[#E6E2D8] text-[10px] font-bold text-[#0B192C] cursor-pointer"
                                title="Resend invitation link"
                              >
                                Resend
                              </button>
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                className="tactile-btn px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold text-rose-700 cursor-pointer"
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
        <div className="tactile-card bg-white p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Security & Administrative Audit Logs ({auditLogs.length})
              </h3>
              <p className="text-xs text-[#5A6A80]">
                Tamper-evident chronological records of administrative events, invitations, and role assignments.
              </p>
            </div>
          </div>

          {loadingData ? (
            <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6A80]">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor Email</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D8] font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-2.5 px-3 text-[#5A6A80] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1E3E62]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-[#0B192C]">
                        {log.actor_email || 'System'}
                      </td>
                      <td className="py-2.5 px-3 text-[#5A6A80]">
                        {log.target_type} {log.target_id ? `[${log.target_id.slice(0, 8)}]` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-[#5A6A80]">
                        {log.ip_address || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#0B192C]">
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
        <div className="tactile-card bg-white p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-[#E6E2D8]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Transfer Administrator Privileges
              </h3>
              <p className="text-xs text-[#5A6A80]">
                Formal handover mechanism for university deployment & institutional transfer.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Strict University Governance Policy</span>
            </div>
            <p className="leading-relaxed">
              Transferring administrator privileges will promote the designated user to primary <span className="font-bold">ADMIN</span> and demote your active account to <span className="font-bold">TEACHER</span>. This action is permanently audited.
            </p>
          </div>

          <form onSubmit={handleTransferAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                New Administrator Email Address
              </label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="faculty.head@ncuindia.edu"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#5A6A80] mt-1 block">
                The user must already have a verified profile in DraftForge.
              </span>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Confirm New Administrator Email
              </label>
              <input
                type="email"
                required
                value={confirmAdminEmail}
                onChange={(e) => setConfirmAdminEmail(e.target.value)}
                placeholder="Repeat new administrator email"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Reason for Handover (Audited)
              </label>
              <textarea
                required
                rows={3}
                minLength={10}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Official semester handover to Head of Department as per academic council guidelines."
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-3 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={transferring}
              className="tactile-btn w-full py-3 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs rounded-xl border-b-4 border-[#78350F] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {transferring ? <LoadingSpinner size="sm" /> : <KeyRound className="w-4 h-4 text-white" />}
              <span>Execute Official Admin Handover</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal: Create Academic Section */}
      {isCreateSectionOpen && createPortal(
        <div className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="tactile-card bg-white p-6 max-w-md w-full space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#1E3E62]" />
                <span>Create Course Section</span>
              </h3>
              <button
                onClick={() => setIsCreateSectionOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F3F0EA] text-[#5A6A80]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Section Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAW-2025-A"
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Law of Contracts & Drafting A"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  value={sectionYear}
                  onChange={(e) => setSectionYear(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs font-mono text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional section details or semester notes..."
                  value={sectionDesc}
                  onChange={(e) => setSectionDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-3 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSectionOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSection}
                  className="tactile-btn px-4 py-2 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingSection ? <LoadingSpinner size="sm" /> : <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />}
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
        <div className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="tactile-card bg-white p-6 max-w-md w-full space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#1E3E62]" />
                  <span>Invite Faculty Member</span>
                </h3>
                <span className="text-[11px] text-[#5A6A80] font-mono">
                  Enforces domain: @ncuindia.edu
                </span>
              </div>
              <button
                onClick={() => setIsInviteTeacherOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F3F0EA] text-[#5A6A80]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Official NCU Faculty Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="professor@ncuindia.edu"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs font-mono text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Faculty Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Meera Rao"
                  value={teacherFullName}
                  onChange={(e) => setTeacherFullName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Assign Initial Section(s)
                </label>
                {sections.length === 0 ? (
                  <span className="text-[11px] text-[#5A6A80] block">No sections available yet.</span>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border-2 border-[#E6E2D8] rounded-xl p-2 bg-[#FAF8F5]">
                    {sections.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-[#0B192C] cursor-pointer">
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
                          className="rounded border-[#E6E2D8] text-[#1E3E62]"
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
                  onClick={() => setIsInviteTeacherOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invitingTeacher}
                  className="tactile-btn px-4 py-2 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {invitingTeacher ? <LoadingSpinner size="sm" /> : <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  <span>Dispatch Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Modify Teacher Sections */}
      {isAssignSectionsOpen && selectedTeacherForAssign && createPortal(
        <div className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="tactile-card bg-white p-6 max-w-md w-full space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                  Modify Assigned Sections
                </h3>
                <span className="text-[11px] text-[#5A6A80] font-mono">
                  {selectedTeacherForAssign.email}
                </span>
              </div>
              <button
                onClick={() => setIsAssignSectionsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F3F0EA] text-[#5A6A80]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSections} className="space-y-4">
              <div className="space-y-1.5 max-h-56 overflow-y-auto border-2 border-[#E6E2D8] rounded-xl p-3 bg-[#FAF8F5]">
                {sections.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs text-[#0B192C] cursor-pointer py-1">
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
                      className="rounded border-[#E6E2D8] text-[#1E3E62]"
                    />
                    <span className="font-medium">{s.name} ({s.code})</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignSectionsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-4 py-2 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all cursor-pointer"
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
