import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  Shield,
  GraduationCap,
  Search,
} from 'lucide-react';
import { HealthModal } from './HealthModal';
import { ClassifierModal } from './ClassifierModal';

interface NavbarProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { user, logout } = useAuth();
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isClassifierOpen, setIsClassifierOpen] = useState(false);

  const getRoleBadge = () => {
    if (user?.role === 'TEACHER') return { label: 'Faculty', icon: <GraduationCap className="w-3 h-3 text-[#C78335]" /> };
    if (user?.role === 'ADMIN') return { label: 'Administrator', icon: <Shield className="w-3 h-3 text-[#20344A]" /> };
    return { label: '1L Scholar', icon: <User className="w-3 h-3 text-[#557B68]" /> };
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      <header className="h-16 border-b border-[#E5DED2] bg-[#FBF8F2] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_8px_rgba(32,52,74,0.04)] font-sans">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          {setIsMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#20344A] hover:bg-[#F5F0E7] rounded-lg bg-white border border-[#E5DED2] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          <div
            onClick={() => {
              if (user?.role === 'ADMIN') setActiveTab('admin_dashboard');
              else if (user?.role === 'TEACHER') setActiveTab('teacher_assignments');
              else setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#20344A] flex items-center justify-center shadow-sm group-hover:bg-[#101D29] transition-colors">
              <Scale className="w-4 h-4 text-[#C78335]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-tight text-[#20344A] font-normal leading-none group-hover:text-[#101D29] transition-colors">
                  DraftForge AI
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5E8D3] text-[#8A5100] uppercase tracking-wider font-sans">
                  Juris Education
                </span>
              </div>
              <p className="text-[11px] text-[#687584] hidden sm:block font-sans mt-0.5">
                Academic Legal Drafting & Evaluation
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Shortcut (Editorial Jurisprudence Spec) */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-[#687584] pointer-events-none" />
          <input
            type="text"
            placeholder="Search briefs, rubrics, precedents..."
            onClick={() => setActiveTab('workspace')}
            className="bg-white border border-[#E5DED2] rounded-md pl-9 pr-12 py-1.5 text-xs text-[#20344A] placeholder:text-[#687584] focus:outline-none focus:border-[#20344A] w-64 lg:w-72 transition-all font-sans cursor-pointer"
          />
          <span className="absolute right-2 px-1.5 py-0.5 bg-[#F5F0E7] border border-[#E5DED2] rounded text-[10px] text-[#687584] font-mono">
            ⌘K
          </span>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Classifier Tool Button */}
          <button
            onClick={() => setIsClassifierOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F0E7] text-[#20344A] text-xs font-medium border border-[#E5DED2] shadow-sm transition-all group font-sans"
            title="Classify legal text into document type"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C78335] group-hover:rotate-12 transition-transform" />
            <span>Classify Document</span>
          </button>

          {/* System Health Check Button */}
          <button
            onClick={() => setIsHealthOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF3F0] hover:bg-[#E0ECE6] text-[#557B68] text-xs font-medium border border-[#557B68]/30 shadow-sm transition-all font-sans"
            title="System Telemetry & Architecture Health"
          >
            <span className="w-2 h-2 rounded-full bg-[#557B68] animate-pulse" />
            <span className="hidden sm:inline">Platform Verified</span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-[#E5DED2]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#20344A] flex items-center justify-center text-white text-xs font-semibold shadow-sm font-serif">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-[#20344A] truncate max-w-[130px] font-sans">
                  {user?.full_name || user?.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#687584] font-sans">
                  {roleBadge.icon}
                  <span>{roleBadge.label}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1.5 text-[#687584] hover:text-[#B45D4D] hover:bg-[#F5F0E7] rounded-md transition-all border border-[#E5DED2] bg-white shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <HealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
      <ClassifierModal isOpen={isClassifierOpen} onClose={() => setIsClassifierOpen(false)} />
    </>
  );
};