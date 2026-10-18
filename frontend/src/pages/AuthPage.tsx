import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import {
  Scale,
  Eye,
  EyeOff,
  ChevronLeft,
  KeyRound,
  Building,
  Moon,
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
          {/* Subtle floating dot between column 1 and 2 */}
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

      {/* Right Column: Authentication Card Panel */}
      <div className="w-full lg:w-1/2 xl:w-[46%] min-h-screen p-6 sm:p-12 lg:p-16 flex flex-col justify-between bg-white relative">
        {/* Top Header Row (Back Link & Subtle Theme Icon) */}
        <div className="flex items-center justify-between">
          {onBackToLanding ? (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs text-[#74777D] hover:text-[#20344A] font-medium transition-colors cursor-pointer group"
            >
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Return to Overview</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            className="p-2 rounded-full text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2] transition-colors cursor-pointer"
            title="Academic Display Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Center Container: Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[#C78335]">
              Beta Access
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
              Sign in to continue
            </h2>
            <p className="text-xs text-[#74777D]">
              Enter your details and university credentials to access the workspace.
            </p>
          </div>

          {/* Clean Tab Switcher */}
          <div className="flex p-1 bg-[#FBF8F2] rounded-lg border border-[#E5DED2]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#20344A] text-white font-semibold shadow-xs'
                  : 'text-[#74777D] hover:text-[#20344A]'
              }`}
            >
              Institutional Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('invitation');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'invitation'
                  ? 'bg-[#20344A] text-white font-semibold shadow-xs'
                  : 'text-[#74777D] hover:text-[#20344A]'
              }`}
            >
              Invitation Code
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#FFDAD6] border border-[#BA1A1A]/30 text-xs text-[#BA1A1A] font-medium text-center animate-fade-in">
              {error}
            </div>
          )}

          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#20344A] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] focus:bg-white border border-[#E5DED2] rounded-lg px-3.5 py-2.5 text-xs text-[#20344A] placeholder-[#9CA3AF] focus:border-[#20344A] focus:ring-1 focus:ring-[#20344A]/15 focus:outline-none transition-all font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#20344A]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#20344A] hover:bg-[#152434] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : <span>Sign In to Continue</span>}
              </button>
            </form>
          ) : (
            /* Invitation Code Form */
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] text-xs text-[#20344A] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#20344A]">
                  <Building className="w-4 h-4 text-[#C78335]" />
                  <span>NCU Invitation Policy</span>
                </div>
                <p className="text-[11px] text-[#74777D] leading-relaxed">
                  Public self-registration is closed. Faculty accounts require an invitation sent to your official <span className="font-semibold text-[#20344A]">@ncuindia.edu</span> email by the administrator. Students receive section invitation links directly from their assigned professor.
                </p>
              </div>

              <form onSubmit={handleRedeemInvitation} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#20344A] mb-1.5">
                    Invitation Code or URL
                  </label>
                  <input
                    type="text"
                    required
                    value={invitationInput}
                    onChange={(e) => setInvitationInput(e.target.value)}
                    placeholder="Paste your invitation token or link here"
                    className="w-full bg-[#FBF8F2]/60 hover:bg-[#FBF8F2] focus:bg-white border border-[#E5DED2] rounded-lg px-3.5 py-2.5 text-xs text-[#20344A] placeholder-[#9CA3AF] focus:border-[#20344A] focus:ring-1 focus:ring-[#20344A]/15 focus:outline-none transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#20344A] hover:bg-[#152434] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
                >
                  <KeyRound className="w-4 h-4 text-[#C78335]" />
                  <span>Verify & Activate Account</span>
                </button>
              </form>
            </div>
          )}

          {/* Consent / Policy Notice */}
          <p className="text-[11px] text-[#74777D] text-center">
            By continuing you consent to academic telemetry and university guidelines.
          </p>
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