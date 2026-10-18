import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AcceptInvitationPage } from './pages/AcceptInvitationPage';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER' || isAdmin;

  // Determine initial tab based on role
  const getInitialTab = () => {
    if (isAdmin) return 'admin_dashboard';
    if (isTeacher) return 'teacher_assignments';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unauthView, setUnauthView] = useState<'landing' | 'auth'>('landing');

  // Check if current URL is an invitation acceptance flow
  const isInvitationRoute =
    window.location.pathname.includes('/accept-invitation') ||
    window.location.search.includes('token=');

  useEffect(() => {
    if (isAdmin) {
      setActiveTab((prev) => (prev === 'workspace' || prev === 'dashboard' ? 'admin_dashboard' : prev));
    } else if (isTeacher) {
      setActiveTab((prev) => (prev === 'workspace' || prev === 'dashboard' ? 'teacher_assignments' : prev));
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.role, isAdmin, isTeacher]);

  // Route to AcceptInvitationPage if invitation token URL detected
  if (isInvitationRoute && !isAuthenticated) {
    return <AcceptInvitationPage onBackToLogin={() => setUnauthView('auth')} />;
  }

  if (!isAuthenticated) {
    if (unauthView === 'auth') {
      return <AuthPage onBackToLanding={() => setUnauthView('landing')} />;
    }
    return <LandingPage onOpenAuth={() => setUnauthView('auth')} />;
  }

  const isTeacherTab = [
    'teacher_assignments',
    'teacher_submissions',
    'teacher_sections',
    'teacher_analytics',
    'teacher_reference',
    'teacher_references',
  ].includes(activeTab);

  const isAdminTab = activeTab === 'admin_dashboard';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0B192C] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#0B192C]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 bg-[#FAF8F5] overflow-y-auto overflow-x-hidden relative">
          {isAdminTab && isAdmin ? (
            <AdminDashboard />
          ) : isTeacherTab && isTeacher ? (
            <TeacherDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : (
            <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;