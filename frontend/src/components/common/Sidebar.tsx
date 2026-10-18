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
  Layers,
  LayoutDashboard,
  CheckCircle2,
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
      id: 'dashboard',
      label: 'Student Dashboard',
      icon: LayoutDashboard,
      badge: 'Overview',
    },
    {
      id: 'workspace',
      label: 'Draft Studio',
      icon: FileEdit,
      badge: 'Editor',
    },
    {
      id: 'assignments',
      label: 'Course Assignments',
      icon: FolderArchive,
      badge: 'Docket',
    },
    {
      id: 'evaluations',
      label: 'Evaluation Report',
      icon: ClipboardCheck,
      badge: 'Rubric',
    },
    {
      id: 'loopholes',
      label: 'Doctrinal Fallacy Audit',
      icon: ShieldAlert,
      badge: 'Audit',
    },
    {
      id: 'learning',
      label: 'AI Legal Tutor',
      icon: GraduationCap,
      badge: 'Socratic',
    },
    {
      id: 'quizzes',
      label: 'Practice Exercises',
      icon: HelpCircle,
      badge: 'Drills',
    },
    {
      id: 'progress',
      label: 'Core Competencies',
      icon: TrendingUp,
      badge: 'Rank',
    },
    {
      id: 'reference_corpus',
      label: 'Precedent Library',
      icon: BookOpen,
      badge: 'Corpus',
    },
  ];

  const teacherNavItems = [
    {
      id: 'teacher_assignments',
      label: 'Manage Assignments',
      icon: FileCheck,
      badge: 'Faculty',
    },
    {
      id: 'teacher_submissions',
      label: 'Submissions Auditor',
      icon: ClipboardCheck,
      badge: 'Grading',
    },
    {
      id: 'teacher_sections',
      label: 'Section Roster',
      icon: Layers,
      badge: 'Roster',
    },
    {
      id: 'teacher_reference',
      label: 'Statutory Precedents',
      icon: UploadCloud,
      badge: 'Corpus',
    },
    {
      id: 'teacher_analytics',
      label: 'Cohort Overview',
      icon: Users,
      badge: 'Analytics',
    },
    {
      id: 'workspace',
      label: 'Student Studio View',
      icon: FileEdit,
      badge: 'Preview',
    },
  ];

  const adminNavItems = [
    {
      id: 'admin_dashboard',
      label: 'Institutional Admin',
      icon: Shield,
      badge: 'NCU Admin',
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
          className="fixed inset-0 bg-[#101D29]/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 bg-[#FBF8F2] border-r border-[#E5DED2] flex flex-col justify-between transition-all duration-300 font-sans ${
          isMobileMenuOpen
            ? 'translate-x-0 w-64'
            : ' -translate-x-full lg:translate-x-0 ' + (isCollapsed ? 'w-20' : 'w-64')
        }`}
      >
        {/* Nav Items */}
        <div className="p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 flex items-center justify-between">
            <span
              className={`text-[10px] font-semibold text-[#687584] uppercase tracking-wider font-sans ${
                isCollapsed ? 'hidden' : 'block'
              }`}
            >
              {isAdmin ? 'University Administration' : isTeacher ? 'Faculty Governance' : 'Academic Syllabus & Tools'}
            </span>
            {setIsCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1 rounded text-[#687584] hover:text-[#20344A] hover:bg-[#F5F0E7] transition-colors"
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all relative group cursor-pointer font-sans ${
                  isActive
                    ? 'bg-[#20344A] text-white shadow-sm'
                    : 'text-[#43566B] hover:bg-[#F5F0E7] hover:text-[#20344A]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#C78335]'
                      : 'text-[#687584] group-hover:text-[#20344A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#F5F0E7] text-[#687584] border border-[#E5DED2]'
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

        {/* Bottom Institutional Plaque */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-lg bg-white border border-[#E5DED2] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68]" />
                <span className="text-xs font-medium text-[#20344A] font-serif">Syllabus v4.2 Active</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#F5F0E7] border border-[#E5DED2] rounded text-[10px] font-sans font-medium text-[#20344A]">
                Law II
              </span>
            </div>
            <p className="text-[11px] text-[#687584] leading-relaxed font-sans">
              Formative IRAC evaluation & Bluebook citation rubrics calibrated for Michaelmas term.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};