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

  // Re-fetch on tab change
  useEffect(() => {
    fetchTeacherMetrics();
  }, [activeTab]);

  // Re-fetch on metric updates and focus
  useEffect(() => {
    const handleUpdate = () => fetchTeacherMetrics();
    window.addEventListener('draftforge:metric_update', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('draftforge:metric_update', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSelectAssignment = (id: string) => {
    setSelectedAssignmentId(id);
    setActiveTab('teacher_submissions');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. TEACHER EXECUTIVE COMMAND BANNER */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. TEACHER EXECUTIVE COMMAND BANNER */}
      {/* ========================================================================= */}
      <div className="relative tactile-card bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30 uppercase tracking-wider font-mono">
                Faculty Governance Portal
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-0.5 rounded-full border border-[#059669]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Qdrant FastEmbed Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C] tracking-tight">
              {getGreeting()},{' '}
              <span className="text-[#1E3E62] underline decoration-[#F59E0B] decoration-2 underline-offset-4">
                {user?.full_name || 'Professor'}
              </span>
            </h1>

            <p className="text-xs text-[#0B192C]/70 max-w-xl leading-relaxed">
              Supervise student legal drafting submissions, review automated 100-point rubric evaluations, ingest statutory reference deeds into Qdrant, and track cohort skill distributions.
            </p>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab('teacher_assignments')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'teacher_assignments'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-[#FAF8F5] text-[#0B192C] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Manage Assignments</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher_submissions')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'teacher_submissions'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-[#FAF8F5] text-[#0B192C] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Submissions Auditor</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher_sections')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'teacher_sections'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-[#FAF8F5] text-[#0B192C] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#1E3E62]" />
                <span>Sections & Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher_reference')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'teacher_reference' || activeTab === 'teacher_references'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-[#FAF8F5] text-[#0B192C] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#1E3E62]" />
                <span>Ingest Reference Deeds</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher_analytics')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'teacher_analytics'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-[#FAF8F5] text-[#0B192C] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Cohort Analytics</span>
              </button>
            </div>
          </div>

          {/* Right Real Metrics Ribbon */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3F0EA] p-4 rounded-2xl border-2 border-[#E6E2D8] flex-1">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-bold font-mono block">
                  Active Briefs
                </span>
                <span className="text-xl font-serif font-extrabold text-[#0B192C]">{assignmentsCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-bold font-mono block">
                  Total Students
                </span>
                <span className="text-xl font-serif font-extrabold text-[#1E3E62]">
                  {cohort?.total_students ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-bold font-mono block">
                  Cohort Avg
                </span>
                <span className="text-xl font-serif font-extrabold text-emerald-700">
                  {cohort ? Math.round(cohort.cohort_average_score) : 0}
                  <span className="text-[10px] font-mono font-normal text-[#0B192C]/60">/100</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-bold font-mono block">
                  Evaluations
                </span>
                <span className="text-xl font-serif font-extrabold text-[#D97706]">
                  {cohort?.total_evaluations ?? 0}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchTeacherMetrics()}
              disabled={metricsLoading}
              title="Sync metrics with server"
              className="tactile-btn self-end sm:self-center p-2.5 rounded-xl bg-white hover:bg-[#F3F0EA] border-2 border-[#E6E2D8] text-[#0B192C] shadow-[0_2px_#E6E2D8] cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#1E3E62] ${metricsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE TEACHER TAB VIEW */}
      {/* ========================================================================= */}
      <div className="space-y-6">
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