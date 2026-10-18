import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CohortAnalytics } from '../types';
import { AssignmentManager } from '../components/teacher/AssignmentManager';
import { SubmissionsAuditor } from '../components/teacher/SubmissionsAuditor';
import { CohortAnalyticsView } from '../components/teacher/CohortAnalyticsView';
import { ReferenceUploader } from '../components/teacher/ReferenceUploader';
import { SectionRosterManager } from '../components/teacher/SectionRosterManager';
import {
  FileCheck,
  ClipboardCheck,
  UploadCloud,
  Users,
  Layers,
  RefreshCw,
  Scale,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

interface TeacherDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [cohort, setCohort] = useState<CohortAnalytics | null>(null);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  const fetchTeacherMetrics = async () => {
    setMetricsLoading(true);
    try {
      const [cRes, aRes] = await Promise.allSettled([
        api.getCohortAnalytics(),
        api.getTeacherAssignments(),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.data) setCohort(cRes.value.data);
      if (aRes.status === 'fulfilled' && aRes.value.data) setAssignmentsCount(aRes.value.data.length || 0);
    } catch {
      // graceful fallback
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherMetrics();
  }, [activeTab]);

  useEffect(() => {
    const handleUpdate = () => fetchTeacherMetrics();
    window.addEventListener('draftforge:metric_update', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('draftforge:metric_update', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleSelectAssignment = (id: string) => {
    setSelectedAssignmentId(id);
    setActiveTab('teacher_submissions');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL BANNER / SECTION IDENTITY (Faculty Portal Reference) */}
      {/* ========================================================================= */}
      <header className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#C78335] uppercase tracking-wider bg-[#FBF0E4] px-2 py-0.5 rounded">
                Juris Doctor · Faculty Studio
              </span>
              <span className="text-[#E5DED2]">•</span>
              <span className="text-[#74777D] font-mono">Course: LAW-702 Section 102</span>
              <span className="text-[#E5DED2]">•</span>
              <span className="text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Blind Grading FERPA Standard
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#20344A] tracking-tight font-medium">
              Legal Practice Workshop & Faculty Governance
            </h1>
            <p className="text-xs text-[#74777D]">
              Presiding Faculty:{' '}
              <span className="text-[#20344A] font-semibold">
                {user?.full_name || 'Prof. Faculty Instructor, J.D.'}
              </span>{' '}
              · Supervise student dockets, review 100-point rubric evaluations, and manage section rosters.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('teacher_sections')}
              className="px-3.5 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-[#20344A]" />
              <span>Section Roster ({cohort?.total_students ?? 0})</span>
            </button>

            <button
              onClick={() => fetchTeacherMetrics()}
              disabled={metricsLoading}
              title="Sync metrics with server"
              className="p-2 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium transition-colors flex items-center shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#20344A] ${metricsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Interior Portal Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#E5DED2]">
          <button
            onClick={() => setActiveTab('teacher_assignments')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher_assignments'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Manage Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_submissions')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher_submissions'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2]'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[#C78335]" />
            <span>Submissions Auditor</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_sections')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher_sections'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#557B68]" />
            <span>Section Roster & Invites</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_reference')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher_reference' || activeTab === 'teacher_references'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Precedent Library Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_analytics')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher_analytics'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A] hover:bg-[#FBF8F2]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Cohort Analytics</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PEDAGOGICAL METRIC STRIP (Restrained, Editorial Typography) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cohort Enrollment */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold">
              Cohort Enrollment
            </span>
            <Users className="w-4 h-4 text-[#74777D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#20344A]">
              {cohort?.total_students ?? 0}
            </span>
            <span className="text-xs text-[#74777D]">Enrolled Scholars</span>
          </div>
          <div className="mt-2 text-[11px] text-[#557B68] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#557B68]" />
            <span>Active Section Docket</span>
          </div>
        </div>

        {/* Metric 2: Active Assignments */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold">
              Assigned Briefs
            </span>
            <FileCheck className="w-4 h-4 text-[#C78335]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#20344A]">
              {assignmentsCount}
            </span>
            <span className="text-xs text-[#74777D]">Bench Prompts</span>
          </div>
          <div className="mt-2 text-[11px] text-[#74777D]">
            Curriculum Modules 1–4
          </div>
        </div>

        {/* Metric 3: Cohort Average Score */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold">
              Cohort Mean Score
            </span>
            <Scale className="w-4 h-4 text-[#557B68]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#557B68]">
              {cohort ? Math.round(cohort.cohort_average_score) : 0}
            </span>
            <span className="text-xs text-[#74777D]">/ 100 PTS</span>
          </div>
          <div className="mt-2 text-[11px] text-[#557B68]">
            Standard Rubric Distribution
          </div>
        </div>

        {/* Metric 4: Total Evaluations Logged */}
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold">
              Audits Concluded
            </span>
            <ClipboardCheck className="w-4 h-4 text-[#20344A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#20344A]">
              {cohort?.total_evaluations ?? 0}
            </span>
            <span className="text-xs text-[#74777D]">Submissions Logged</span>
          </div>
          <div className="mt-2 text-[11px] text-[#C78335]">
            Verified against Precedent Corpus
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE TAB VIEW CONTAINER */}
      {/* ========================================================================= */}
      <div>
        {activeTab === 'teacher_assignments' && (
          <AssignmentManager onSelectAssignment={handleSelectAssignment} />
        )}
        {activeTab === 'teacher_submissions' && (
          <SubmissionsAuditor assignmentId={selectedAssignmentId} />
        )}
        {activeTab === 'teacher_sections' && <SectionRosterManager />}
        {activeTab === 'teacher_analytics' && <CohortAnalyticsView />}
        {(activeTab === 'teacher_reference' || activeTab === 'teacher_references') && (
          <ReferenceUploader />
        )}
      </div>
    </div>
  );
};