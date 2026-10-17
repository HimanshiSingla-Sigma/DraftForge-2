import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileEdit,
  ClipboardCheck,
  ShieldAlert,
  Shield,
  GraduationCap,
  HelpCircle,
  TrendingUp,
  FolderArchive,
  BookOpen,
  Users,
  UploadCloud,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  setIsCollapsed,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER' || isAdmin;

  const studentNavItems = [
    {
      id: 'workspace',
      label: 'Drafting Workspace',
      icon: FileEdit,
      badge: 'Editor',
      color: 'text-primary-400',
    },
    {
      id: 'assignments',
      label: 'Class Assignments',
      icon: FolderArchive,
      badge: 'Portal',
      color: 'text-accent-cyan',
    },
    {
      id: 'evaluations',
      label: 'Evaluation & Evidence',
      icon: ClipboardCheck,
      badge: '100 pts',
      color: 'text-accent-emerald',
    },
    {
      id: 'loopholes',
      label: 'GraphRAG Loopholes',
      icon: ShieldAlert,
      badge: 'Neo4j',
      color: 'text-accent-rose',
    },
    {
      id: 'learning',
      label: 'AI Roadmap & Tutor',
      icon: GraduationCap,
      badge: 'Socratic',
      color: 'text-indigo-400',
    },
    {
      id: 'quizzes',
      label: 'Interactive Quizzes',
      icon: HelpCircle,
      badge: 'Practice',
      color: 'text-accent-amber',
    },
    {
      id: 'progress',
      label: 'Skills & Leaderboard',
      icon: TrendingUp,
      badge: 'Analytics',
      color: 'text-accent-emerald',
    },
    {
      id: 'reference_corpus',
      label: 'Reference Corpus',
      icon: BookOpen,
      badge: 'RAG',
      color: 'text-slate-400',
    },
  ];

  const teacherNavItems = [
    {
      id: 'teacher_assignments',
      label: 'Manage Assignments',
      icon: FileCheck,
      badge: 'Faculty',
      color: 'text-accent-cyan',
    },
    {
      id: 'teacher_submissions',
      label: 'Submissions Auditor',
      icon: ClipboardCheck,
      badge: 'Grading',
      color: 'text-accent-emerald',
    },
    {
      id: 'teacher_sections',
      label: 'Sections & Rosters',
      icon: Layers,
      badge: 'Sections',
      color: 'text-[#1E3E62]',
    },
    {
      id: 'teacher_reference',
      label: 'Ingest Reference Corpus',
      icon: UploadCloud,
      badge: 'Qdrant RAG',
      color: 'text-indigo-400',
    },
    {
      id: 'teacher_analytics',
      label: 'Cohort Intelligence',
      icon: Users,
      badge: 'Analytics',
      color: 'text-accent-amber',
    },
    {
      id: 'workspace',
      label: 'Student Studio View',
      icon: FileEdit,
      badge: 'Student',
      color: 'text-[#1E3E62]',
    },
  ];

  const adminNavItems = [
    {
      id: 'admin_dashboard',
      label: 'Admin Command Center',
      icon: Shield,
      badge: 'NCU Admin',
      color: 'text-[#F59E0B]',
    },
    ...teacherNavItems,
  ];

  const navItems = isAdmin ? adminNavItems : isTeacher ? teacherNavItems : studentNavItems;

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0B192C]/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 bg-[#FAF8F5] border-r-2 border-[#E6E2D8] flex flex-col justify-between transition-all duration-300 ${
          isMobileMenuOpen
            ? 'translate-x-0 w-64'
            : ' -translate-x-full lg:translate-x-0 ' + (isCollapsed ? 'w-20' : 'w-64')
        }`}
      >
        {/* Nav Items */}
        <div className="p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 flex items-center justify-between">
            <span
              className={`text-[10px] font-bold text-[#5A6A80] uppercase tracking-wider font-mono ${
                isCollapsed ? 'hidden' : 'block'
              }`}
            >
              {isAdmin ? 'Root Administration' : isTeacher ? 'Faculty Portal' : 'Student Studio'}
            </span>
            {setIsCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1 rounded-lg text-[#5A6A80] hover:text-[#0B192C] hover:bg-[#F3F0EA] transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative group ${
                  isActive
                    ? 'tactile-btn bg-[#1E3E62] text-white border-2 border-[#0B192C] border-b-4 border-b-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'text-[#0B192C] hover:bg-white border-2 border-transparent hover:border-[#E6E2D8]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#F59E0B] text-[#0B192C] font-black shadow-sm'
                      : 'bg-[#F3F0EA] text-[#1E3E62] group-hover:bg-[#E6E2D8]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F3F0EA] text-[#5A6A80] border border-[#E6E2D8]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System Pro Card */}
        {!isCollapsed && (
          <div className="p-3.5 m-3 rounded-2xl bg-white border-2 border-[#E6E2D8] shadow-[0_3px_#E6E2D8]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <p className="font-serif text-xs font-black text-[#0B192C]">Hybrid Reasoning</p>
            </div>
            <p className="text-[10px] text-[#5A6A80] leading-relaxed mb-2">
              Deterministic rubrics verified against Qdrant RAG and Neo4j Aura graphs.
            </p>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#5A6A80] pt-2 border-t border-[#E6E2D8]">
              <span>FastEmbed (384-dim)</span>
              <span className="text-[#059669] font-bold">Ready</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};