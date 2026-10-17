import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import {
  Scale,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  KeyRound,
  Building,
} from 'lucide-react';

interface AuthPageProps {
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'signin' | 'invitation'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Invitation token redeem input
  const [invitationInput, setInvitationInput] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        full_name: res.data.full_name,
      });
      showToast(`Welcome back, ${res.data.full_name || 'Legal Scholar'}!`, 'success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
      showToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const input = invitationInput.trim();
    if (!input) return;

    let token = input;
    if (input.includes('token=')) {
      const parsed = new URL(input, window.location.origin);
      token = parsed.searchParams.get('token') || input;
    }

    window.location.href = `/accept-invitation?token=${encodeURIComponent(token)}`;
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border-2 border-[#0B192C] shadow-[0_8px_#0B192C] relative z-10 space-y-6 animate-scale-in">
        {/* Back to Landing Page Link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-xs text-[#0B192C]/70 hover:text-[#0B192C] transition-colors cursor-pointer font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] p-0.5 mx-auto shadow-[0_4px_#0B192C] flex items-center justify-center">
            <Scale className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#0B192C] tracking-tight">
            Draft<span className="text-[#1E3E62] underline decoration-[#F59E0B] decoration-2">Forge</span>
          </h1>
          <p className="text-xs text-[#0B192C]/70 font-sans">
            The NorthCap University Legal Studio
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'tactile-btn bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                : 'text-[#0B192C]/70 hover:text-[#0B192C]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('invitation');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invitation'
                ? 'tactile-btn bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                : 'text-[#0B192C]/70 hover:text-[#0B192C]'
            }`}
          >
            Invitation Access
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border-2 border-[#DC2626]/40 text-xs text-[#DC2626] font-medium text-center animate-fade-in font-mono">
            {error}
          </div>
        )}

        {/* Tab 1: Sign In Form */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#0B192C]/50 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ncuindia.edu"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0B192C]/50 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#0B192C]/50 hover:text-[#0B192C] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? <LoadingSpinner size="sm" /> : <ArrowRight className="w-4 h-4 text-[#F59E0B]" />}
              <span>Sign In to Portal</span>
            </button>
          </form>
        ) : (
          /* Tab 2: Invitation Access Information & Token Paste */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F3F0EA] border-2 border-[#E6E2D8] text-xs text-[#0B192C] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1E3E62]">
                <Building className="w-4 h-4 text-[#F59E0B]" />
                <span>NCU Invitation Policy</span>
              </div>
              <p className="text-[11px] text-[#5A6A80] leading-relaxed">
                Public self-registration is closed. Faculty accounts require an invitation sent to your official <span className="font-semibold text-[#0B192C]">@ncuindia.edu</span> email by the administrator. Students receive section invitation links directly from their assigned professor.
              </p>
            </div>

            <form onSubmit={handleRedeemInvitation} className="space-y-3">
              <div>
                <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                  Have an Invitation Token or Link?
                </label>
                <input
                  type="text"
                  required
                  value={invitationInput}
                  onChange={(e) => setInvitationInput(e.target.value)}
                  placeholder="Paste your invitation token or link here"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2.5 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="tactile-btn w-full py-2.5 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#F59E0B]" />
                <span>Verify & Activate Account</span>
              </button>
            </form>
          </div>
        )}

        {/* Institutional Security Notice */}
        <div className="pt-3 border-t-2 border-[#E6E2D8] text-center">
          <p className="text-[11px] text-[#0B192C]/50 font-sans">
            DraftForge Legal Studio &bull; Protected Institutional Environment
          </p>
        </div>
      </div>
    </div>
  );
};