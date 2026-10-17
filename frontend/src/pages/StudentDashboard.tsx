import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProgress } from '../types';
import { DraftWorkspace } from '../components/student/DraftWorkspace';
import { StudentAssignmentsView } from '../components/student/StudentAssignmentsView';
import { EvaluationCard } from '../components/student/EvaluationCard';
import { LoopholeViewer } from '../components/student/LoopholeViewer';
import { TutorChat } from '../components/student/TutorChat';
import { RoadmapView } from '../components/student/RoadmapView';
import { QuizRunner } from '../components/student/QuizRunner';
import { SkillAnalyticsView } from '../components/student/SkillAnalyticsView';
import { ReferenceCorpusView } from '../components/student/ReferenceCorpusView';
import {
  FileEdit,
  GraduationCap,
  MessageSquare,
  FolderArchive,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [learningSubtab, setLearningSubtab] = useState<'roadmap' | 'tutor'>('roadmap');

  // Real Metric States loaded from backend
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [skillsCount, setSkillsCount] = useState<number>(0);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  const fetchQuickMetrics = async () => {
    setMetricsLoading(true);
    try {
      const [progRes, draftRes, skillRes, assignRes] = await Promise.allSettled([
        api.getProgress(),
        api.getDrafts(),
        api.getSkills(),
        api.getAssignments(),
      ]);

      if (progRes.status === 'fulfilled' && progRes.value.data) {
        setProgress(progRes.value.data);
      }
      if (draftRes.status === 'fulfilled' && draftRes.value.data) {
        setDraftsCount(draftRes.value.data.length || 0);
      }
      if (skillRes.status === 'fulfilled' && skillRes.value.data) {
        setSkillsCount(skillRes.value.data.length || 0);
      }
      if (assignRes.status === 'fulfilled' && assignRes.value.data) {
        setAssignmentsCount(assignRes.value.data.length || 0);
      }
    } catch {
      // graceful fallback to zero metrics
    } finally {
      setMetricsLoading(false);
    }
  };

  // Re-fetch on tab switch
  useEffect(() => {
    fetchQuickMetrics();
  }, [activeTab]);

  // Re-fetch on custom draftforge events and window focus
  useEffect(() => {
    const handleMetricUpdate = () => {
      fetchQuickMetrics();
    };
    window.addEventListener('draftforge:metric_update', handleMetricUpdate);
    window.addEventListener('focus', handleMetricUpdate);
    return () => {
      window.removeEventListener('draftforge:metric_update', handleMetricUpdate);
      window.removeEventListener('focus', handleMetricUpdate);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSelectEvaluation = (id: string) => {
    setSelectedEvaluationId(id);
    setActiveTab('evaluations');
  };

  const handleNavigateToLoopholes = (id: string) => {
    setSelectedEvaluationId(id);
    setActiveTab('loopholes');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. STUDENT EXECUTIVE HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] overflow-hidden">
        <div className="relative z-0 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F3F0EA] text-[#1E3E62] border border-[#E6E2D8] uppercase tracking-wider font-mono">
                Legal Drafting Studio
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#059669] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Qdrant & Neo4j Active</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
              {getGreeting()},{' '}
              <span className="text-[#1E3E62] underline decoration-[#F59E0B] decoration-2">
                {user?.full_name || 'Legal Scholar'}
              </span>
            </h1>

            <p className="text-xs text-[#0B192C]/70 max-w-xl leading-relaxed font-sans">
              Continue crafting evidence-grounded legal drafts. Review automated 100-point rubric evaluations, explore graph loopholes, and elevate your statutory drafting proficiency.
            </p>

            {/* Quick Action Navigation Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'workspace'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-white text-[#0B192C] border-2 border-[#E6E2D8]'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Open Workspace</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-white text-[#0B192C] border-2 border-[#E6E2D8]'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-[#1E3E62]" />
                <span>Coursework ({assignmentsCount})</span>
              </button>

              <button
                onClick={() => {
                  setLearningSubtab('roadmap');
                  setActiveTab('learning');
                }}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'learning'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-white text-[#0B192C] border-2 border-[#E6E2D8]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#B45309]" />
                <span>5-Phase Roadmap</span>
              </button>

              <button
                onClick={() => setActiveTab('quizzes')}
                className={`tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'quizzes'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'bg-[#F3F0EA] hover:bg-white text-[#0B192C] border-2 border-[#E6E2D8]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Quizzes</span>
              </button>
            </div>
          </div>

          {/* Right Real Metrics Ribbon */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3F0EA] p-4 rounded-2xl border-2 border-[#E6E2D8] shadow-sm flex-1">
              <div className="p-2.5 rounded-xl bg-white border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-semibold font-mono block">
                  Total Drafts
                </span>
                <span className="text-xl font-serif font-extrabold text-[#0B192C]">
                  {draftsCount || (progress && progress.total_evaluations > 0 ? progress.total_evaluations : 0)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-semibold font-mono block">
                  Evaluations
                </span>
                <span className="text-xl font-serif font-extrabold text-[#1E3E62]">
                  {progress?.total_evaluations ?? 0}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-semibold font-mono block">
                  Average Score
                </span>
                <span className="text-xl font-serif font-extrabold text-[#059669]">
                  {progress ? Math.round(progress.average_score) : 0}
                  <span className="text-[10px] font-normal text-[#0B192C]/60">/100</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border-2 border-[#E6E2D8] text-center space-y-1 shadow-[0_2px_#E6E2D8]">
                <span className="text-[10px] text-[#0B192C]/60 uppercase font-semibold font-mono block">
                  Skills Active
                </span>
                <span className="text-xl font-serif font-extrabold text-[#7C3AED]">
                  {skillsCount || (progress ? ((progress.mastered_skills_count || 0) + (progress.weak_skills_count || 0)) : 0)}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchQuickMetrics()}
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
      {/* 2. ACTIVE TAB RENDERER */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Tab: Legal Drafting Workspace */}
        {activeTab === 'workspace' && (
          <DraftWorkspace
            onSelectEvaluation={handleSelectEvaluation}
            onNavigateToLoopholes={handleNavigateToLoopholes}
          />
        )}

        {/* Tab: Class Assignments */}
        {activeTab === 'assignments' && (
          <StudentAssignmentsView
            onSelectEvaluation={handleSelectEvaluation}
            onNavigateToWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {/* Tab: Evaluation & Evidence */}
        {activeTab === 'evaluations' && (
          <EvaluationCard
            evaluationId={selectedEvaluationId}
            onNavigateToLoopholes={handleNavigateToLoopholes}
            onNavigateToWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {/* Tab: Neo4j GraphRAG Loopholes */}
        {activeTab === 'loopholes' && (
          <LoopholeViewer
            evaluationId={selectedEvaluationId}
            onNavigateToWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {/* Tab: AI Roadmap & Socratic Tutor */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            {/* Subtab Bar */}
            <div className="flex items-center gap-2 p-1.5 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8] w-fit shadow-sm">
              <button
                onClick={() => setLearningSubtab('roadmap')}
                className={`tactile-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  learningSubtab === 'roadmap'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>5-Phase Learning Roadmap</span>
              </button>
              <button
                onClick={() => setLearningSubtab('tutor')}
                className={`tactile-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  learningSubtab === 'tutor'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1E3E62]" />
                <span>Socratic AI Tutor Chat</span>
              </button>
            </div>

            {learningSubtab === 'roadmap' ? <RoadmapView /> : <TutorChat />}
          </div>
        )}

        {/* Tab: Interactive Quizzes */}
        {activeTab === 'quizzes' && <QuizRunner />}

        {/* Tab: Skills & Leaderboard */}
        {activeTab === 'progress' && <SkillAnalyticsView />}

        {/* Tab: Legal Reference Corpus */}
        {activeTab === 'reference_corpus' && <ReferenceCorpusView />}
      </div>
    </div>
  );
};