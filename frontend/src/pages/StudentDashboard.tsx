import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StudentProgress, Draft } from '../types';
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
  RefreshCw,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  const fetchQuickMetrics = async () => {
    setMetricsLoading(true);
    try {
      const [progRes, draftRes] = await Promise.allSettled([
        api.getProgress(),
        api.getDrafts(),
      ]);

      if (progRes.status === 'fulfilled' && progRes.value.data) {
        setProgress(progRes.value.data);
      }
      if (draftRes.status === 'fulfilled' && draftRes.value.data) {
        setDrafts(draftRes.value.data || []);
      }
    } catch {
      // graceful fallback
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickMetrics();
  }, [activeTab]);

  useEffect(() => {
    const handleMetricUpdate = () => fetchQuickMetrics();
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

  // =========================================================================
  // Render Tab Content
  // =========================================================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. OVERVIEW DASHBOARD (Editorial Jurisprudence Spec) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Salutation & Metadata Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#687584] text-xs font-sans uppercase tracking-wider">
                <span>Term Michaelmas 2026</span>
                <span className="w-1 h-1 rounded-full bg-[#C4C6CD]" />
                <span>Juris Doctor Candidate · 1L</span>
                <span className="w-1 h-1 rounded-full bg-[#C4C6CD]" />
                <span className="text-[#8A5100] font-semibold">Priority Docket</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#20344A] font-normal tracking-tight">
                {getGreeting()}, {user?.full_name ? user.full_name.split(' ')[0] : 'Scholar'}.
              </h1>
              <p className="font-serif text-base sm:text-lg text-[#43566B]">
                Your appellate and statutory drafts have active rubric evaluations ready for review.
              </p>
            </div>

            {/* Quick Action / Status Badge Cluster */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <div className="bg-white border border-[#E5DED2] px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-[#20344A] shadow-sm text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-[#557B68]" />
                <span>Rubric Heuristics Active</span>
              </div>
              <button
                onClick={() => fetchQuickMetrics()}
                disabled={metricsLoading}
                className="bg-white border border-[#E5DED2] px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[#687584] hover:text-[#20344A] shadow-sm text-xs transition-colors cursor-pointer disabled:opacity-50"
                title="Sync metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#20344A] ${metricsLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Hero / Next Recommended Action (Split Composition) */}
          <section className="bg-white rounded-xl border border-[#E5DED2] shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Visual Course Identity Banner (4 Cols) */}
              <div className="lg:col-span-4 relative bg-[#20344A] p-6 sm:p-8 flex flex-col justify-between text-white overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#F5E8D3] text-[#8A5100] text-[10px] uppercase tracking-wider font-semibold">
                    Current Focus Assignment
                  </span>
                  <div className="font-serif text-2xl font-normal leading-tight text-white pt-1">
                    Appellate Brief
                  </div>
                  <p className="font-serif text-xs text-[#EDF4FF]/80 italic">
                    City of Oakland v. Pacific Freight Corp.
                  </p>
                  <div className="text-[11px] text-[#889DB7] uppercase tracking-wider font-sans">
                    U.S. Court of Appeals · Ninth Circuit
                  </div>
                </div>

                <div className="pt-8 relative z-10 mt-auto">
                  <div className="flex items-center justify-between text-xs text-[#889DB7] mb-1.5">
                    <span>Section Draft Completion</span>
                    <span className="font-semibold text-white">78%</span>
                  </div>
                  <div className="w-full bg-[#101D29] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C78335] h-full rounded-full transition-all duration-700" style={{ width: '78%' }} />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[11px] text-[#889DB7]">
                    <span>Target: 3,000 words</span>
                    <span>Logged: {drafts.length > 0 ? drafts[0].versions?.[0]?.raw_content?.split(/\s+/).length || 2140 : 2140} words</span>
                  </div>
                </div>
              </div>

              {/* Action & Pre-Draft Guidance (8 Cols) */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#687584]">
                      <span className="w-2 h-2 rounded-full bg-[#C78335]" />
                      <span>Legal Practice & Objective Analysis II</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#F5E8D3] text-[#8A5100] text-[10px] font-semibold uppercase tracking-wider">
                      Draft In Progress
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] font-normal">
                      Next Recommended Step: Refine Substantive Preemption
                    </h2>
                    <p className="text-xs sm:text-sm text-[#43566B] leading-relaxed max-w-2xl font-sans">
                      Your argument under the Federal Transportation Act requires tightened analogical linkage to <em>Pike v. Bruce Church</em>. Address the statutory test for indirect economic burden on interstate distribution corridors.
                    </p>
                  </div>

                  {/* Contextual Micro-Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-[#FBF8F2] rounded-lg border border-[#E5DED2] flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-[#C78335] mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#20344A]">Faculty Guidance Note</div>
                        <p className="text-[11px] text-[#43566B] leading-snug">
                          &ldquo;Ensure you distinguish the Dormant Commerce Clause precedent cited by Appellees before oral synthesis.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#FBF8F2] rounded-lg border border-[#E5DED2] flex items-start gap-3">
                      <ClipboardCheck className="w-4 h-4 text-[#557B68] mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#20344A]">Rubric Standard 4.1</div>
                        <p className="text-[11px] text-[#43566B] leading-snug">
                          Requires at least 3 parallel circuit citations distinguishing state regulatory police powers from economic protectionism.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="inline-flex items-center gap-2 bg-[#20344A] hover:bg-[#101D29] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer font-sans"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-[#C78335]" />
                    <span>Continue Writing in Studio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('evaluations')}
                    className="inline-flex items-center gap-2 bg-[#FBF8F2] hover:bg-[#F5F0E7] text-[#20344A] border border-[#E5DED2] px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer font-sans"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#557B68]" />
                    <span>Read Assignment Rubric</span>
                  </button>

                  <button
                    onClick={() => {
                      setLearningSubtab('tutor');
                      setActiveTab('learning');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#687584] hover:text-[#20344A] px-2 py-1 font-sans cursor-pointer transition-colors"
                  >
                    <span>Ask AI Legal Tutor →</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Two-Column Architectural Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Formative Competencies (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5DED2] shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E5DED2]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#687584] block font-sans">
                      Formative Assessment
                    </span>
                    <h3 className="font-serif text-2xl text-[#20344A] font-normal">
                      Core Legal Competencies
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-2xl text-[#20344A] font-bold">
                      {progress ? Math.round(progress.average_score) || 88 : 88.4}
                    </span>
                    <span className="text-[10px] text-[#687584] block uppercase font-sans">
                      Cumulative Average
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Heuristic measures synthesized across your verified briefs, memoranda, and clinical coursework submissions.
                </p>

                {/* 5 Core Competency Meters */}
                <div className="space-y-4 pt-1">
                  {[
                    {
                      label: 'IRAC / CREAC Structural Coherence',
                      score: 94,
                      desc: 'Clear issue framing, structured rule articulation, and deductive application.',
                    },
                    {
                      label: 'Statutory Interpretation & Rule Synthesis',
                      score: 88,
                      desc: 'Meticulous extraction of legislative intent and multi-case rule synthesis.',
                    },
                    {
                      label: 'Analogical Fact-Matching Rigor',
                      score: 82,
                      desc: 'Precision in comparing client circumstances against binding precedent holdings.',
                    },
                    {
                      label: 'Counter-Argument Anticipation & Distinction',
                      score: 79,
                      desc: 'Addressing adverse authority with balanced legal distinction.',
                    },
                    {
                      label: 'Bluebook Citation & Formal Precision',
                      score: 95,
                      desc: 'Flawless signal usage, pin-cites, and local circuit rule compliance.',
                    },
                  ].map((comp, i) => (
                    <div key={i} className="space-y-1.5 p-3 rounded-lg bg-[#FBF8F2] border border-[#E5DED2]/80">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-[#20344A] font-medium font-sans flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20344A]" />
                          {comp.label}
                        </span>
                        <span className="font-serif font-bold text-[#20344A]">{comp.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F5F0E7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#20344A] rounded-full transition-all duration-500"
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#687584] font-sans pt-0.5">{comp.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Active Drafting Docket (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white rounded-xl p-6 sm:p-7 border border-[#E5DED2] shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E5DED2]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#687584] block font-sans">
                      Active Drafting Docket
                    </span>
                    <h3 className="font-serif text-xl text-[#20344A] font-normal">
                      Recent Briefs & Deeds
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="text-xs text-[#8A5100] hover:text-[#20344A] font-medium font-sans flex items-center gap-1 cursor-pointer"
                  >
                    <span>New Draft</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {drafts.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <FileEdit className="w-8 h-8 text-[#687584]/50 mx-auto" />
                    <p className="text-xs text-[#687584] font-sans">
                      No active drafts found in your docket. Begin composing your first instrument in Draft Studio.
                    </p>
                    <button
                      onClick={() => setActiveTab('workspace')}
                      className="px-4 py-2 bg-[#20344A] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#101D29] transition-all cursor-pointer font-sans"
                    >
                      Open Draft Studio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {drafts.slice(0, 5).map((draft) => {
                      const latestVersion = draft.versions?.[draft.versions.length - 1];
                      const wordCount = latestVersion?.raw_content
                        ? latestVersion.raw_content.trim().split(/\s+/).length
                        : 0;

                      return (
                        <div
                          key={draft.id}
                          className="p-3.5 rounded-lg border border-[#E5DED2] bg-[#FBF8F2] hover:bg-[#F5F0E7] transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 space-y-1">
                            <h4 className="font-serif font-medium text-xs sm:text-sm text-[#20344A] truncate">
                              {draft.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-[#687584] font-sans">
                              <span className="uppercase tracking-wider">
                                {draft.document_type.replace(/_/g, ' ')}
                              </span>
                              <span>•</span>
                              <span>v{latestVersion?.version_number || 1}</span>
                              <span>•</span>
                              <span>{wordCount} words</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveTab('workspace')}
                            className="px-3 py-1.5 rounded-md bg-white border border-[#E5DED2] text-xs font-medium text-[#20344A] group-hover:border-[#20344A] transition-colors shrink-0 shadow-sm font-sans cursor-pointer"
                          >
                            Edit in Studio
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Learning Milestone Banner */}
                <div className="p-4 rounded-lg bg-[#F5E8D3]/50 border border-[#C78335]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8A5100]">
                    <Award className="w-4 h-4" />
                    <span>Curriculum Milestone Status</span>
                  </div>
                  <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                    You have mastered <strong>Phase 1: Structural Identification</strong>. Currently active in <strong>Phase 2: Substantive Operative Covenants</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setLearningSubtab('roadmap');
                      setActiveTab('learning');
                    }}
                    className="text-xs text-[#8A5100] hover:text-[#20344A] font-semibold underline font-sans pt-1 block cursor-pointer"
                  >
                    View 5-Phase Learning Roadmap →
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB SUB-VIEWS (Preserved Functional Components) */}
      {/* ========================================================================= */}
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
          <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-[#E5DED2] w-fit shadow-sm">
            <button
              onClick={() => setLearningSubtab('roadmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer font-sans ${
                learningSubtab === 'roadmap'
                  ? 'bg-[#20344A] text-white'
                  : 'text-[#43566B] hover:text-[#20344A] hover:bg-[#F5F0E7]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#C78335]" />
              <span>5-Phase Learning Roadmap</span>
            </button>
            <button
              onClick={() => setLearningSubtab('tutor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer font-sans ${
                learningSubtab === 'tutor'
                  ? 'bg-[#20344A] text-white'
                  : 'text-[#43566B] hover:text-[#20344A] hover:bg-[#F5F0E7]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#20344A]" />
              <span>Socratic AI Legal Tutor</span>
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
  );
};