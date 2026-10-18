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
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  // Newly created/resent invitation link state (for banner and modal)
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    url: string;
    emailSent: boolean;
    sectionName?: string;
  } | null>(null);

  const [modalInviteResult, setModalInviteResult] = useState<{
    email: string;
    url: string;
    emailSent: boolean;
    sectionName?: string;
  } | null>(null);

  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

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

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;
    if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback to execCommand
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
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

  const handleShareWhatsApp = (url: string, sectionName?: string) => {
    if (!url) {
      showToast('No invitation URL available to share.', 'error');
      return;
    }
    const sectionText = sectionName ? ` for ${sectionName}` : '';
    const message = `You have been invited to join DraftForge${sectionText}. Accept your invitation here: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    const email = inviteEmail.trim().toLowerCase();
    if (!email.endsWith('@ncuindia.edu')) {
      showToast('Student email must belong to the official university domain: @ncuindia.edu', 'error');
      return;
    }

    setInviting(true);
    try {
      const res: any = await api.inviteStudentToSection(selectedSection.id, {
        email,
        full_name: inviteFullName.trim() || undefined,
      });
      const data = res.data || {};
      const inviteUrl = data.invitation_url || data.invitation?.invitation_url;
      const emailSent = data.email_sent ?? data.invitation?.email_sent ?? false;

      if (emailSent) {
        showToast(`Invitation email dispatched to ${email}`, 'success');
      } else {
        showToast(`Invitation created for ${email}. Email delivery was not possible; link ready to share.`, 'warning');
      }

      if (inviteUrl) {
        const payload = {
          email,
          url: inviteUrl,
          emailSent: !!emailSent,
          sectionName: selectedSection.name,
        };
        setInviteResult(payload);
        setModalInviteResult(payload);
      }
      loadInvitations();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to dispatch student invitation.';
      showToast(msg, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      const res: any = await api.resendInvitation(invitationId);
      const data = res.data || {};
      const inviteUrl = data.invitation_url || data.invitation?.invitation_url;
      const emailSent = data.email_sent ?? data.invitation?.email_sent ?? false;

      if (emailSent) {
        showToast('Invitation token refreshed and email resent.', 'success');
      } else {
        showToast('Token refreshed! Email delivery unavailable; link ready to copy/share below.', 'warning');
      }

      if (inviteUrl) {
        setInviteResult({
          email: data.invitation?.email || 'Student',
          url: inviteUrl,
          emailSent: !!emailSent,
          sectionName: selectedSection?.name,
        });
      }
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
      <div className="bg-white p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-[#20344A] tracking-tight font-medium">
              Course Sections & Roster
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#FBF0E4] text-[#C78335] border border-[#E5DED2] font-mono">
              Faculty Workspace
            </span>
          </div>
          <p className="text-xs text-[#74777D] mt-1">
            Manage your allocated academic sections, invite students, and inspect enrollment rosters.
          </p>
        </div>

        {selectedSection && (
          <button
            onClick={() => {
              setModalInviteResult(null);
              setIsInviteOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
            <span>Invite Student to Section</span>
          </button>
        )}
      </div>

      {/* Newly Created / Resent Invite URL Banner */}
      {inviteResult && (
        <div className="p-4 bg-[#FBF0E4] border border-[#C78335]/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C78335]" />
              <span className="font-semibold text-xs text-[#20344A]">
                {inviteResult.emailSent
                  ? `Invitation Dispatched to ${inviteResult.email}`
                  : `Invitation Ready for ${inviteResult.email}`}
              </span>
            </div>
            <button
              onClick={() => {
                setInviteResult(null);
                setCopiedUrl(false);
              }}
              className="text-[#74777D] hover:text-[#20344A] text-xs font-medium cursor-pointer"
            >
              ✕ Dismiss
            </button>
          </div>
          <p className="text-[11px] text-[#74777D]">
            {inviteResult.emailSent
              ? 'An official email was sent. You can also share the direct single-use onboarding URL via WhatsApp or copy it below:'
              : 'Direct onboarding link ready. Share this link with the student via WhatsApp or copy it below:'}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteResult.url}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs font-mono text-[#20344A] select-all focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(inviteResult.url, inviteResult.sectionName)}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
                title="Share via WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopyLink(inviteResult.url)}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#557B68]" /> : <Copy className="w-3.5 h-3.5 text-[#C78335]" />}
                <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections Selector Pills */}
      {loadingSections ? (
        <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5DED2] p-8 text-center space-y-2 shadow-xs">
          <BookOpen className="w-8 h-8 text-[#74777D] mx-auto" />
          <h3 className="font-serif text-base font-medium text-[#20344A]">No Sections Allocated</h3>
          <p className="text-xs text-[#74777D]">
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
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#20344A] text-white border-[#20344A] shadow-md'
                    : 'bg-white hover:bg-[#FBF8F2] text-[#20344A] border-[#E5DED2] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                      isSelected ? 'text-[#C78335]' : 'text-[#74777D]'
                    }`}>
                      {sec.code} • {sec.academic_year}
                    </span>
                    <h3 className={`font-serif text-base font-medium mt-0.5 ${isSelected ? 'text-white' : 'text-[#20344A]'}`}>
                      {sec.name}
                    </h3>
                  </div>
                  <Layers className={`w-4 h-4 ${isSelected ? 'text-[#C78335]' : 'text-[#20344A]'}`} />
                </div>

                <div className="mt-4 pt-3 border-t border-current/20 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {sec.students_count} Enrolled
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E8F3ED] text-[#557B68]'
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
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DED2]">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#20344A]" />
                  <span>Enrolled Students ({students.length})</span>
                </h3>
                <span className="text-xs text-[#74777D] font-mono">
                  {selectedSection.name} [{selectedSection.code}]
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#FBF8F2] border border-[#E5DED2] rounded pl-8 pr-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors w-full sm:w-56 font-sans"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="p-8 text-center"><LoadingSpinner size="md" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#74777D]">
                {searchQuery ? 'No enrolled students match your search filter.' : 'No students enrolled in this section yet. Use "Invite Student" to send access links.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DED2] text-[#74777D] font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Enrolled At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DED2]">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FBF8F2] transition-colors">
                        <td className="py-3 px-3 font-medium text-[#20344A]">
                          {st.full_name || 'Legal Scholar'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#74777D]">
                          {st.email}
                        </td>
                        <td className="py-3 px-3 text-[#74777D] text-[11px] font-mono">
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
          <div className="bg-white rounded-lg border border-[#E5DED2] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <h3 className="font-serif text-lg font-medium text-[#20344A] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#20344A]" />
                <span>My Invitations</span>
              </h3>
              <button
                onClick={loadInvitations}
                className="p-1 text-[#74777D] hover:text-[#20344A] rounded transition-colors"
                title="Refresh Invitations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingInvitations ? (
              <div className="p-8 text-center"><LoadingSpinner size="sm" /></div>
            ) : invitations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#74777D]">
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
                      className="p-3 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-[#20344A] truncate max-w-[180px]">
                          {inv.email}
                        </span>
                        <span
                          className={`text-[9px] font-medium px-2 py-0.5 rounded uppercase font-mono ${
                            isPending
                              ? 'bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30'
                              : isAccepted
                              ? 'bg-[#E8F3ED] text-[#557B68] border border-[#557B68]/30'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#74777D] flex items-center justify-between">
                        <span>Role: {inv.role}</span>
                        <span className="font-mono">
                          Exp: {new Date(inv.expires_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action buttons if Pending */}
                      {isPending && (
                        <div className="space-y-2 pt-2 border-t border-[#E5DED2]">
                          {inviteResult && inviteResult.email === inv.email && (
                            <div className="p-2 bg-[#FBF0E4] rounded border border-[#C78335]/30 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-medium text-[#20344A]">
                                <span className="flex items-center gap-1 text-[#C78335]">
                                  <CheckCircle2 className="w-3 h-3 text-[#557B68]" />
                                  <span>Active Onboarding Link</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleShareWhatsApp(inviteResult.url, inviteResult.sectionName)}
                                  className="flex-1 py-1 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-medium rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  title="Share on WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3 h-3 fill-current" />
                                  <span>WhatsApp</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(inviteResult.url)}
                                  className="flex-1 py-1 px-2 bg-[#20344A] hover:bg-[#152434] text-white text-[10px] font-medium rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  title="Copy invitation link"
                                >
                                  {copiedUrl ? <Check className="w-3 h-3 text-[#557B68]" /> : <Copy className="w-3 h-3 text-[#C78335]" />}
                                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResend(inv.id)}
                              className="px-2 py-0.5 rounded bg-white hover:bg-[#F3EFE6] text-[#20344A] text-[10px] font-medium border border-[#E5DED2] flex items-center gap-1 cursor-pointer"
                              title="Resend invitation email and extend expiry"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Resend</span>
                            </button>
                            <button
                              onClick={() => handleRevoke(inv.id)}
                              className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-medium border border-rose-200 flex items-center gap-1 cursor-pointer"
                              title="Revoke access link"
                            >
                              <XCircle className="w-2.5 h-2.5" />
                              <span>Revoke</span>
                            </button>
                          </div>
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
        <div className="fixed inset-0 bg-[#20344A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full rounded-xl border border-[#E5DED2] shadow-xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#20344A]">
                  {modalInviteResult ? 'Invitation Created' : `Invite Student to ${selectedSection.name}`}
                </h3>
                <span className="text-[11px] text-[#74777D] font-mono">
                  Section Code: {selectedSection.code}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsInviteOpen(false);
                  setModalInviteResult(null);
                  setInviteEmail('');
                  setInviteFullName('');
                }}
                className="p-1 rounded hover:bg-[#F3EFE6] text-[#74777D] transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {modalInviteResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#E8F3ED] border border-[#557B68]/30 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#557B68] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#20344A]">
                      {modalInviteResult.emailSent
                        ? 'Invitation Dispatched & Ready'
                        : 'Single-Use Link Ready for Sharing'}
                    </h4>
                    <p className="text-[11px] text-[#557B68]">
                      {modalInviteResult.emailSent
                        ? `An invitation email was dispatched to ${modalInviteResult.email}. You can also share the direct onboarding link via WhatsApp or copy it below:`
                        : `Email delivery was unavailable, but the single-use onboarding URL for ${modalInviteResult.email} is active and expires in 72 hours:`}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Invitation URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={modalInviteResult.url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] select-all focus:border-[#20344A] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#74777D] mt-1 block">
                    Single-use token &bull; Valid for 72 hours &bull; Restricted to {modalInviteResult.email}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(modalInviteResult.url, modalInviteResult.sectionName)}
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Share invitation link on WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(modalInviteResult.url)}
                    className="flex-1 py-2 px-3 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    title="Copy invitation link to clipboard"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-[#557B68]" /> : <Copy className="w-4 h-4 text-[#C78335]" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy Invitation Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5DED2]">
                  <button
                    type="button"
                    onClick={() => {
                      setModalInviteResult(null);
                      setInviteEmail('');
                      setInviteFullName('');
                    }}
                    className="text-xs font-medium text-[#20344A] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#C78335]" />
                    <span>Invite another student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteOpen(false);
                      setModalInviteResult(null);
                      setInviteEmail('');
                      setInviteFullName('');
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
                    Official NCU Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="rollnumber@ncuindia.edu"
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs font-mono text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors"
                  />
                  <span className="text-[10px] text-[#74777D] mt-1 block">
                    Enforces domain: @ncuindia.edu &bull; Link valid for 72 hours.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-serif font-medium text-[#20344A] mb-1.5">
                    Student Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="e.g. Ananya Sen"
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteOpen(false);
                      setModalInviteResult(null);
                      setInviteEmail('');
                      setInviteFullName('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {inviting ? <LoadingSpinner size="sm" /> : <Mail className="w-3.5 h-3.5 text-[#C78335]" />}
                    <span>{inviting ? 'Generating...' : 'Send Invitation'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
