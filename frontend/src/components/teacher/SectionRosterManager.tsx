import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { Section, Invitation } from '../../types';
import { useToast } from '../common/Toast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
  Users,
  UserPlus,
  BookOpen,
  Mail,
  RefreshCw,
  XCircle,
  Layers,
  Search,
} from 'lucide-react';

export const SectionRosterManager: React.FC = () => {
  const { showToast } = useToast();

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Array<{ id: string; email: string; full_name: string | null; enrolled_at: string }>>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [loadingSections, setLoadingSections] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingInvitations, setLoadingInvitations] = useState<boolean>(false);

  // Invite Student Modal / Form State
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteFullName, setInviteFullName] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadSections = async () => {
    setLoadingSections(true);
    try {
      const res = await api.getTeacherSections();
      setSections(res.data);
      if (res.data.length > 0 && !selectedSection) {
        setSelectedSection(res.data[0]);
      }
    } catch (err: any) {
      showToast('Failed to load course sections.', 'error');
    } finally {
      setLoadingSections(false);
    }
  };

  const loadStudents = async (sectionId: string) => {
    setLoadingStudents(true);
    try {
      const res = await api.getSectionStudents(sectionId);
      setStudents(res.data);
    } catch (err: any) {
      showToast('Failed to load student roster.', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await api.getTeacherInvitations();
      setInvitations(res.data);
    } catch (err: any) {
      showToast('Failed to load pending invitations.', 'error');
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    loadSections();
    loadInvitations();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadStudents(selectedSection.id);
    }
  }, [selectedSection]);

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    setInviting(true);
    try {
      await api.inviteStudentToSection(selectedSection.id, {
        email: inviteEmail.trim().toLowerCase(),
        full_name: inviteFullName.trim() || undefined,
      });
      showToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
      setInviteFullName('');
      setIsInviteOpen(false);
      loadInvitations();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to dispatch student invitation.';
      showToast(msg, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await api.resendInvitation(invitationId);
      showToast('Invitation token refreshed and resent.', 'success');
      loadInvitations();
    } catch (err: any) {
      showToast('Failed to resend invitation.', 'error');
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await api.revokeInvitation(invitationId);
      showToast('Invitation revoked.', 'info');
      loadInvitations();
    } catch (err: any) {
      showToast('Failed to revoke invitation.', 'error');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.full_name && s.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="tactile-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-black text-[#0B192C]">
              Course Sections & Roster
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30 font-mono">
              Faculty Workspace
            </span>
          </div>
          <p className="text-xs text-[#5A6A80] mt-1">
            Manage your allocated academic sections, invite students, and inspect enrollment rosters.
          </p>
        </div>

        {selectedSection && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="tactile-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold border-b-4 border-[#0B192C] shadow-md transition-all cursor-pointer self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4 text-[#F59E0B]" />
            <span>Invite Student to Section</span>
          </button>
        )}
      </div>

      {/* Sections Selector Pills */}
      {loadingSections ? (
        <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
      ) : sections.length === 0 ? (
        <div className="tactile-card bg-white p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-[#5A6A80] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#0B192C]">No Sections Allocated</h3>
          <p className="text-xs text-[#5A6A80]">
            Your account does not have any active course sections assigned yet. Please contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const isSelected = selectedSection?.id === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSection(sec)}
                className={`tactile-card p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1E3E62] text-white border-[#0B192C] shadow-[0_6px_#0B192C]'
                    : 'bg-white hover:bg-[#F3F0EA] text-[#0B192C]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                      isSelected ? 'text-[#F59E0B]' : 'text-[#5A6A80]'
                    }`}>
                      {sec.code} • {sec.academic_year}
                    </span>
                    <h3 className={`font-serif text-base font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-[#0B192C]'}`}>
                      {sec.name}
                    </h3>
                  </div>
                  <Layers className={`w-5 h-5 ${isSelected ? 'text-[#F59E0B]' : 'text-[#1E3E62]'}`} />
                </div>

                <div className="mt-4 pt-3 border-t border-current/20 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {sec.students_count} Enrolled
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#1E3E62]/10 text-[#1E3E62]'
                  }`}>
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Grid: Student Roster & Sent Invitations */}
      {selectedSection && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Students Table (2 Columns) */}
          <div className="lg:col-span-2 tactile-card bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#E6E2D8]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1E3E62]" />
                  <span>Enrolled Students ({students.length})</span>
                </h3>
                <span className="text-xs text-[#5A6A80] font-mono">
                  {selectedSection.name} [{selectedSection.code}]
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#5A6A80] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors w-full sm:w-56 font-sans"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6A80]">
                {searchQuery ? 'No enrolled students match your search filter.' : 'No students enrolled in this section yet. Use "Invite Student" to send access links.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#E6E2D8] text-[#5A6A80] font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Enrolled At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2D8]">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#0B192C]">
                          {st.full_name || 'Legal Scholar'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#5A6A80]">
                          {st.email}
                        </td>
                        <td className="py-3 px-3 text-[#5A6A80] text-[11px] font-mono">
                          {new Date(st.enrolled_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section Invitations Ledger (1 Column) */}
          <div className="tactile-card bg-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1E3E62]" />
                <span>My Invitations</span>
              </h3>
              <button
                onClick={loadInvitations}
                className="p-1 text-[#5A6A80] hover:text-[#0B192C] rounded-lg transition-colors"
                title="Refresh Invitations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingInvitations ? (
              <div className="p-8 text-center"><LoadingSpinner size="sm" /></div>
            ) : invitations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6A80]">
                No pending or past invitations found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {invitations.map((inv) => {
                  const isPending = inv.status === 'PENDING';
                  const isAccepted = inv.status === 'ACCEPTED';

                  return (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#0B192C] truncate max-w-[180px]">
                          {inv.email}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase font-mono ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isAccepted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5A6A80] flex items-center justify-between">
                        <span>Role: {inv.role}</span>
                        <span className="font-mono">
                          Exp: {new Date(inv.expires_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action buttons if Pending */}
                      {isPending && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E6E2D8]">
                          <button
                            onClick={() => handleResend(inv.id)}
                            className="tactile-btn px-2 py-0.5 rounded-md bg-white hover:bg-[#F3F0EA] text-[#0B192C] text-[10px] font-bold border border-[#E6E2D8] flex items-center gap-1 cursor-pointer"
                            title="Resend invitation email and extend expiry"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Resend</span>
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.id)}
                            className="tactile-btn px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                            title="Revoke access link"
                          >
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Student Modal */}
      {isInviteOpen && selectedSection && createPortal(
        <div className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="tactile-card bg-white p-6 max-w-md w-full space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                  Invite Student to {selectedSection.name}
                </h3>
                <span className="text-[11px] text-[#5A6A80] font-mono">
                  Section Code: {selectedSection.code}
                </span>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F3F0EA] text-[#5A6A80] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Student Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@institution.edu"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-[#5A6A80] mt-1 block">
                  A single-use onboarding link valid for 72 hours will be dispatched.
                </span>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Student Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="tactile-btn px-4 py-2 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {inviting ? <LoadingSpinner size="sm" /> : <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  <span>Send Invitation</span>
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
