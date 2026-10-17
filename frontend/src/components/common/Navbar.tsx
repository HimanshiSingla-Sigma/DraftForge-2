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

  const getRoleIcon = () => {
    if (user?.role === 'TEACHER') return <GraduationCap className="w-3.5 h-3.5 text-accent-cyan" />;
    if (user?.role === 'ADMIN') return <Shield className="w-3.5 h-3.5 text-accent-amber" />;
    return <User className="w-3.5 h-3.5 text-primary-400" />;
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

  return (
    <>
      <header className="h-16 border-b-2 border-[#E6E2D8] bg-[#FAF8F5]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          {setIsMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#0B192C] hover:bg-[#F3F0EA] rounded-xl bg-white border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] tactile-btn"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          <div
            onClick={() => {
              if (user?.role === 'ADMIN') setActiveTab('admin_dashboard');
              else if (user?.role === 'TEACHER') setActiveTab('teacher_assignments');
              else setActiveTab('workspace');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-[0_3px_#0B192C] group-hover:translate-y-[-1px] transition-transform">
              <Scale className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-black tracking-tight text-[#0B192C] group-hover:text-[#1E3E62] transition-colors">
                  Draft<span className="text-[#F59E0B]">Forge</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 uppercase tracking-wider font-mono">
                  Legal Studio
                </span>
              </div>
              <p className="text-[10px] text-[#5A6A80] hidden sm:block font-medium">
                Deterministic Rubrics & Graph Reasoning
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & User Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Classifier Tool Button */}
          <button
            onClick={() => setIsClassifierOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F0EA] text-[#0B192C] text-xs font-bold border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] tactile-btn shadow-sm group"
            title="Classify legal text into document type"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
            <span>Classify Text</span>
          </button>

          {/* System Health Check Button */}
          <button
            onClick={() => setIsHealthOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] text-xs font-bold border-2 border-[#A7F3D0] border-b-4 border-b-[#6EE7B7] tactile-btn shadow-sm"
            title="Inspect Database, Qdrant & Neo4j Connectivity"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
            </span>
            <span className="hidden sm:inline">System Healthy</span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#E6E2D8]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center text-white text-xs font-black shadow-[0_2px_#0B192C]">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#0B192C] truncate max-w-[120px]">
                  {user?.full_name || user?.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#5A6A80] font-semibold font-mono">
                  {getRoleIcon()}
                  <span>{user?.role || 'STUDENT'}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-[#5A6A80] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] bg-white tactile-btn"
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