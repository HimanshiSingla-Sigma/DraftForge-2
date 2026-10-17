import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VerifyInvitationResponse } from '../types';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="tactile-card bg-white p-8 max-w-md w-full text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h2 className="font-serif text-lg font-bold text-[#0B192C]">
            Verifying University Invitation...
          </h2>
          <p className="text-xs text-[#5A6A80]">
            Checking cryptographic token signatures with DraftForge security services.
          </p>
        </div>
      </div>
    );
  }

  // Invalid Token State
  if (!verification || !verification.valid) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="tactile-card bg-white p-8 max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-center mx-auto shadow-[0_4px_#DC2626]">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-black text-[#0B192C]">
              Invitation Invalid or Expired
            </h2>
            <p className="text-xs text-[#5A6A80] leading-relaxed">
              {verification?.message ||
                'This invitation token could not be verified. It may have expired (72-hour window), already been redeemed, or been revoked by the department administrator.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F0EA] border-2 border-[#E6E2D8] text-left text-xs space-y-2 font-mono text-[#0B192C]">
            <div className="flex items-center gap-2 font-bold text-[#1E3E62]">
              <Building className="w-4 h-4 text-[#F59E0B]" />
              <span>The NorthCap University</span>
            </div>
            <p className="text-[11px] text-[#5A6A80] leading-tight">
              To request a new invitation link, please contact your course instructor or the academic administrator at{' '}
              <span className="font-semibold text-[#0B192C]">singlahimanshi2@gmail.com</span>.
            </p>
          </div>

          <button
            onClick={handleReturnToLogin}
            className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all cursor-pointer"
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
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="tactile-card bg-white p-8 max-w-lg w-full space-y-6 animate-scale-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] p-0.5 mx-auto shadow-[0_4px_#0B192C] flex items-center justify-center">
            <Scale className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3E62]/10 border border-[#1E3E62]/30 text-[#1E3E62] text-[10px] font-bold font-mono uppercase tracking-wider">
            <Building className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>The NorthCap University</span>
          </div>
          <h1 className="font-serif text-2xl font-black text-[#0B192C] tracking-tight">
            Activate Your University Account
          </h1>
          <p className="text-xs text-[#5A6A80]">
            Complete your onboarding to join the DraftForge legal drafting studio.
          </p>
        </div>

        {/* Invitation Metadata Overview Card */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E6E2D8]">
            <span className="text-[#5A6A80] font-medium">Invited Email:</span>
            <span className="font-mono font-bold text-[#0B192C] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              {verification.email}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E6E2D8]">
            <span className="text-[#5A6A80] font-medium">Assigned Role:</span>
            <span
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                isTeacher
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              } flex items-center gap-1`}
            >
              {isTeacher ? <GraduationCap className="w-3 h-3 text-[#B45309]" /> : <User className="w-3 h-3 text-[#1E3E62]" />}
              {verification.role}
            </span>
          </div>

          {verification.section_names && verification.section_names.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-[#5A6A80] font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#1E3E62]" />
                Course Sections Enrolled:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {verification.section_names.map((secName, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E6E2D8] text-xs font-bold text-[#0B192C] shadow-xs"
                  >
                    {secName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {verification.inviter_name && (
            <div className="flex items-center justify-between text-[11px] text-[#5A6A80] pt-1">
              <span>Authorized By:</span>
              <span className="font-semibold text-[#0B192C]">{verification.inviter_name}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-700 font-medium text-center animate-fade-in font-mono">
            {error}
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5A6A80] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adv. Rohit Deshmukh"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
              Set Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5A6A80] absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#5A6A80] hover:text-[#0B192C] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
              Confirm Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5A6A80] absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <ArrowRight className="w-4 h-4 text-[#F59E0B]" />}
            <span>Accept Invitation & Enter Studio</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="text-xs text-[#5A6A80] hover:text-[#0B192C] font-semibold transition-colors cursor-pointer"
          >
            Already have an active account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
