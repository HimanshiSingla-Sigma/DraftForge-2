import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VerifyInvitationResponse } from '../types';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LegalBackgroundAnimation } from '../components/common/LegalBackgroundAnimation';
import {
  Scale,
  AlertTriangle,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Layers,
  Building,
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

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <LegalBackgroundAnimation />
        <div className="bg-[#FFFFFF] p-8 max-w-md w-full text-center space-y-4 rounded-lg border border-[#E5DED2] shadow-sm relative z-10 animate-scale-in">
          <LoadingSpinner size="lg" />
          <h2 className="font-serif text-lg font-medium text-[#20344A]">
            Verifying University Invitation...
          </h2>
          <p className="text-xs text-[#74777D]">
            Authenticating cryptographic token with DraftForge academic services.
          </p>
        </div>
      </div>
    );
  }

  // Invalid Token State
  if (!verification || !verification.valid) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <LegalBackgroundAnimation />
        <div className="bg-[#FFFFFF] p-8 max-w-md w-full text-center space-y-6 rounded-lg border border-[#E5DED2] shadow-sm relative z-10 animate-scale-in">
          <div className="w-12 h-12 rounded bg-[#FFDAD6] border border-[#BA1A1A]/30 flex items-center justify-center mx-auto text-[#BA1A1A]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-medium text-[#20344A]">
              Invitation Invalid or Expired
            </h2>
            <p className="text-xs text-[#74777D] leading-relaxed">
              {verification?.message ||
                'This invitation token could not be verified. It may have expired (72-hour window), already been redeemed, or been revoked by the department administrator.'}
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#FBF8F2] border border-[#E5DED2] text-left text-xs space-y-1.5 text-[#20344A]">
            <div className="flex items-center gap-1.5 font-semibold text-[#20344A]">
              <Building className="w-4 h-4 text-[#C78335]" />
              <span>The NorthCap University</span>
            </div>
            <p className="text-[11px] text-[#74777D] leading-relaxed">
              To request a new invitation link, please contact your course instructor or the academic administrator at{' '}
              <span className="font-semibold text-[#20344A]">singlahimanshi2@gmail.com</span>.
            </p>
          </div>

          <button
            onClick={handleReturnToLogin}
            className="w-full py-2.5 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all cursor-pointer shadow-sm"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Valid Token State
  const isTeacher = verification.role === 'TEACHER';

  return (
    <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <LegalBackgroundAnimation />
      <div className="bg-[#FFFFFF] p-8 max-w-lg w-full space-y-6 rounded-lg border border-[#E5DED2] shadow-sm animate-scale-in relative z-10">
        {/* Top Hairline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#20344A] rounded-t-lg" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-[#FBF0E4] border border-[#C78335]/30 mx-auto flex items-center justify-center text-[#C78335]">
            <Scale className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FBF0E4] border border-[#C78335]/30 text-[#C78335] text-[10px] font-semibold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>The NorthCap University</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-[#20344A] tracking-tight">
            Activate Your University Account
          </h1>
          <p className="text-xs text-[#74777D]">
            Complete your scholar onboarding to enter the DraftForge legal studio.
          </p>
        </div>

        {/* Invitation Metadata Overview Card */}
        <div className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5DED2]">
            <span className="text-[#74777D]">Invited Email:</span>
            <span className="font-mono font-semibold text-[#20344A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68] inline" />
              {verification.email}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5DED2]">
            <span className="text-[#74777D]">Assigned Role:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isTeacher
                  ? 'bg-[#FBF0E4] text-[#C78335] border-[#C78335]/30'
                  : 'bg-[#E8F3ED] text-[#557B68] border-[#557B68]/30'
              } flex items-center gap-1`}
            >
              {isTeacher ? <GraduationCap className="w-3 h-3 text-[#C78335]" /> : <User className="w-3 h-3 text-[#557B68]" />}
              {verification.role}
            </span>
          </div>

          {verification.section_names && verification.section_names.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-[#74777D] flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#20344A]" />
                Enrolled Course Sections:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {verification.section_names.map((secName, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white border border-[#E5DED2] text-xs font-semibold text-[#20344A]"
                  >
                    {secName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {verification.inviter_name && (
            <div className="flex items-center justify-between text-[11px] text-[#74777D] pt-1">
              <span>Authorized By:</span>
              <span className="font-medium text-[#20344A]">{verification.inviter_name}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded bg-[#FFDAD6] border border-[#BA1A1A]/30 text-xs text-[#BA1A1A] font-medium text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#20344A] mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#74777D] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adv. Rohit Deshmukh"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-9 pr-3 py-2 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#20344A] mb-1">
              Set Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#74777D] absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-9 pr-9 py-2 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none transition-colors font-mono"
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
            <label className="block text-xs font-semibold text-[#20344A] mb-1">
              Confirm Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#74777D] absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-9 pr-3 py-2 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm mt-3 cursor-pointer"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <ArrowRight className="w-4 h-4 text-[#C78335]" />}
            <span>Accept Invitation & Enter Studio</span>
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
    </div>
  );
};
