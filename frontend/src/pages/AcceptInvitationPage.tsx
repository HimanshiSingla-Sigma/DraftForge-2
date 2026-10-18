import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VerifyInvitationResponse } from '../types';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Scale,
  AlertTriangle,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  Building,
  Moon,
  ChevronLeft,
} from 'lucide-react';

interface AcceptInvitationPageProps {
  onBackToLogin?: () => void;
}

export const AcceptInvitationPage: React.FC<AcceptInvitationPageProps> = ({ onBackToLogin }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [token, setToken] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verification, setVerification] = useState<VerifyInvitationResponse | null>(null);

  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawToken = params.get('token') || '';
    setToken(rawToken);

    if (!rawToken.trim()) {
      setVerifying(false);
      setVerification({
        valid: false,
        message: 'No invitation token was detected in the URL. Please verify your invitation link.',
        section_ids: [],
        section_names: [],
      });
      return;
    }

    api.verifyInvitation(rawToken)
      .then((res) => {
        setVerification(res.data);
        if (res.data.valid && res.data.email) {
          const defaultName = res.data.email.split('@')[0].replace(/[._]/g, ' ');
          setFullName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
        }
      })
      .catch((err) => {
        setVerification({
          valid: false,
          message: err.response?.data?.detail || 'Unable to verify invitation link. Server error occurred.',
          section_ids: [],
          section_names: [],
        });
      })
      .finally(() => {
        setVerifying(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.acceptInvitation({
        token,
        password,
        full_name: fullName.trim() || undefined,
      });

      showToast(`Welcome to DraftForge, ${res.data.full_name || 'Scholar'}! Account activated.`, 'success');

      // Update auth context
      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        full_name: res.data.full_name,
      });

      // Navigate to portal dashboard
      window.location.href = '/';
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Account activation failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      window.location.href = '/';
    }
  };

  const isTeacher = verification?.role === 'TEACHER';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFFFFF] text-[#20344A] font-sans selection:bg-[#C78335] selection:text-white">
      {/* Left Column: Hero / Brand Showcase (Editorial Aesthetic) */}
      <div className="w-full lg:w-1/2 xl:w-[54%] min-h-[520px] lg:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-[#FBF8F2] border-b lg:border-b-0 lg:border-r border-[#E5DED2]">
        {/* Soft Background Grid Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(32, 52, 74, 0.10) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(32, 52, 74, 0.10) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Subtle Radial Auras */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#20344A]/[0.05] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#C78335]/[0.08] blur-3xl pointer-events-none" />

        {/* Floating Wireframe Badges */}
        <div className="absolute top-16 right-12 w-28 h-28 rounded-2xl border border-[#20344A]/10 -rotate-12 pointer-events-none backdrop-blur-[1px]" />
        <div className="absolute bottom-32 left-10 w-24 h-24 rounded-2xl border border-[#20344A]/10 rotate-6 pointer-events-none backdrop-blur-[1px]" />

        {/* Ambient Accent Dots */}
        <div className="absolute top-[30%] right-[24%] w-2.5 h-2.5 rounded-full bg-[#C78335]/60 pointer-events-none" />
        <div className="absolute bottom-[20%] left-[28%] w-2 h-2 rounded-full bg-[#20344A]/25 pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[#20344A] flex items-center justify-center text-[#C78335] shadow-xs">
            <Scale className="w-5 h-5 text-[#C78335]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-base text-[#20344A] tracking-tight">
              DraftForge
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/20 font-semibold">
              Academic
            </span>
          </div>
        </div>

        {/* Main Headline & Narrative */}
        <div className="my-auto py-12 lg:py-0 space-y-6 max-w-lg relative z-10">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#20344A] tracking-tight leading-[1.12]">
            Every draft, <br />
            <span className="italic font-serif text-[#C78335]">backed by</span> <br />
            <span className="italic font-serif text-[#C78335]">evidence.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#74777D] leading-relaxed max-w-md font-sans">
            AI-powered statutory analysis and drafting for legal minds. Validate arguments, eliminate loopholes, and benchmark against Bharatiya Nyaya Sanhita.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="pt-8 border-t border-[#E5DED2] grid grid-cols-3 gap-2 sm:gap-4 items-center relative z-10">
          <div className="absolute left-[31%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C78335]/60 pointer-events-none" />

          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#20344A]">
              95%+
            </div>
            <div className="text-[10px] font-mono tracking-wider text-[#74777D] uppercase mt-1 leading-tight">
              Citation Accuracy
            </div>
          </div>

          <div className="border-l border-[#E5DED2] pl-3 sm:pl-5">
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#20344A]">
              &lt;8s
            </div>
            <div className="text-[10px] font-mono tracking-wider text-[#74777D] uppercase mt-1 leading-tight">
              Query Response
            </div>
          </div>

          <div className="border-l border-[#E5DED2] pl-3 sm:pl-5">
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#20344A]">
              Zero
            </div>
            <div className="text-[10px] font-mono tracking-wider text-[#74777D] uppercase mt-1 leading-tight">
              Hallucinations
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Interaction Panel */}
      <div className="w-full lg:w-1/2 xl:w-[46%] min-h-screen p-6 sm:p-12 lg:p-16 flex flex-col justify-between bg-white relative">
        {/* Top Header Row (Back Link & Subtle Theme Icon) */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReturnToLogin}
            className="flex items-center gap-1.5 text-xs text-[#74777D] hover:text-[#20344A] font-medium transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Sign In</span>
          </button>

          <button
            type="button"
            className="p-2 rounded-full text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2] transition-colors cursor-pointer"
            title="Academic Display Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Center Container: Verifying / Error / Activation Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          {verifying ? (
            /* Verifying State */
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <LoadingSpinner size="lg" />
              <h2 className="font-serif text-xl font-medium text-[#20344A]">
                Verifying University Invitation...
              </h2>
              <p className="text-xs text-[#74777D]">
                Authenticating single-use security token with DraftForge academic services.
              </p>
            </div>
          ) : !verification || !verification.valid ? (
            /* Invalid or Expired State */
            <div className="space-y-6 animate-scale-in">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-rose-600">
                  Verification Failed
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
                  Invitation Invalid or Expired
                </h2>
                <p className="text-xs text-[#74777D] leading-relaxed">
                  {verification?.message ||
                    'This invitation token could not be verified. It may have expired (72-hour window), already been redeemed, or been revoked by the department administrator.'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] text-xs text-[#20344A] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#20344A]">
                  <Building className="w-4 h-4 text-[#C78335]" />
                  <span>The NorthCap University</span>
                </div>
                <p className="text-[11px] text-[#74777D] leading-relaxed">
                  To request a refreshed invitation link, please contact your course instructor or the academic administrator at{' '}
                  <span className="font-semibold text-[#20344A]">singlahimanshi2@gmail.com</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReturnToLogin}
                className="w-full py-3 bg-[#20344A] hover:bg-[#152434] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            /* Valid Token: Activation Form */
            <div className="space-y-6 animate-scale-in">
              {/* Header */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[#C78335]">
                  {isTeacher ? 'Faculty Onboarding' : 'Student Onboarding'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
                  Activate Your Account
                </h2>
                <p className="text-xs text-[#74777D]">
                  Complete your profile credentials to access your allocated curriculum and workspace.
                </p>
              </div>

              {/* Verified Invitation Overview Card */}
              <div className="p-4 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
                  <span className="text-[#74777D] font-medium">Invited Email:</span>
                  <span className="font-mono font-semibold text-[#20344A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68]" />
                    <span>{verification.email}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
                  <span className="text-[#74777D] font-medium">Assigned Role:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono border ${
                      isTeacher
                        ? 'bg-[#FBF0E4] text-[#C78335] border-[#C78335]/30'
                        : 'bg-[#E8F3ED] text-[#557B68] border-[#557B68]/30'
                    } flex items-center gap-1`}
                  >
                    {isTeacher ? <GraduationCap className="w-3 h-3 text-[#C78335]" /> : <User className="w-3 h-3 text-[#557B68]" />}
                    <span>{verification.role}</span>
                  </span>
                </div>

                {verification.section_names && verification.section_names.length > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
                    <span className="text-[#74777D] font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#20344A]" />
                      <span>Course Section:</span>
                    </span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {verification.section_names.map((secName, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white border border-[#E5DED2] text-[11px] font-semibold text-[#20344A]"
                        >
                          {secName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {verification.inviter_name && (
                  <div className="flex items-center justify-between text-[11px] text-[#74777D]">
                    <span>Authorized By:</span>
                    <span className="font-medium text-[#20344A]">{verification.inviter_name}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#FFDAD6] border border-[#BA1A1A]/30 text-xs text-[#BA1A1A] font-medium text-center animate-fade-in">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#20344A] mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adv. Rohit Deshmukh"
                    className="w-full bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] focus:bg-white border border-[#E5DED2] rounded-lg px-3.5 py-2.5 text-xs text-[#20344A] placeholder-[#9CA3AF] focus:border-[#20344A] focus:ring-1 focus:ring-[#20344A]/15 focus:outline-none transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20344A] mb-1.5">
                    Set Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] focus:bg-white border border-[#E5DED2] rounded-lg px-3.5 pr-10 py-2.5 text-xs text-[#20344A] placeholder-[#9CA3AF] focus:border-[#20344A] focus:ring-1 focus:ring-[#20344A]/15 focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#74777D] hover:text-[#20344A] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#20344A] mb-1.5">
                    Confirm Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] focus:bg-white border border-[#E5DED2] rounded-lg px-3.5 pr-10 py-2.5 text-xs text-[#20344A] placeholder-[#9CA3AF] focus:border-[#20344A] focus:ring-1 focus:ring-[#20344A]/15 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#20344A] hover:bg-[#152434] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : <span>Accept Invitation & Enter Studio</span>}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  className="text-xs text-[#74777D] hover:text-[#20344A] font-medium transition-colors cursor-pointer"
                >
                  Already have an active account? Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#E5DED2] text-center">
          <p className="text-[11px] text-[#74777D] font-mono">
            DraftForge Legal AI &bull; Protected Institutional Environment
          </p>
        </div>
      </div>
    </div>
  );
};
