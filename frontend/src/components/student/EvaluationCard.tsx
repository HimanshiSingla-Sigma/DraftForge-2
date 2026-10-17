import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Evaluation, Draft, ExplainEvaluationResponse } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { AIEvaluationModal } from '../ai/AIEvaluationModal';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileText,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EvaluationCardProps {
  evaluationId?: string;
  onNavigateToLoopholes?: (evalId: string) => void;
  onNavigateToTutor?: (draftId?: string) => void;
  onNavigateToWorkspace?: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluationId: initialEvalId,
  onNavigateToLoopholes,
  onNavigateToTutor,
  onNavigateToWorkspace,
}) => {
  const { showToast } = useToast();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<ExplainEvaluationResponse | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PASS' | 'PARTIAL' | 'FAIL' | 'WARNING'>('ALL');
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>({});

  // 3D AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeDraftTitle, setActiveDraftTitle] = useState('');
  const [activeDraftContent, setActiveDraftContent] = useState('');

  const fetchEval = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getEvaluation(id);
      setEvaluation(res.data);
      if (res.data.llm_explanation) {
        setExplanationData({
          evaluation_id: res.data.id,
          explanation: res.data.llm_explanation,
          remedial_suggestions: [],
        });
      } else {
        setExplanationData(null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to load evaluation details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEvalId && initialEvalId.trim() !== '') {
      fetchEval(initialEvalId);
    } else {
      api
        .getDrafts()
        .then((res) => {
          setDrafts(res.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialEvalId]);

  const handleEvaluateDraft = async (draft: Draft) => {
    setActiveDraftTitle(draft.title);
    const versions = draft.versions || [];
    const latestContent = versions.length > 0 ? versions[versions.length - 1].raw_content : '';
    setActiveDraftContent(latestContent);
    setIsAiModalOpen(true);
    setEvaluating(true);

    try {
      const res = await api.evaluateDraft(draft.id);
      setEvaluation(res.data);
      showToast('Deterministic RAG Evaluation Completed!', 'success');
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Evaluation failed to complete', 'error');
      setIsAiModalOpen(false);
    } finally {
      setEvaluating(false);
    }
  };

  const handleRequestExplanation = async () => {
    if (!evaluation) return;
    setExplaining(true);
    try {
      const res = await api.explainEvaluation(evaluation.id);
      setExplanationData(res.data);
      showToast('AI synthesized pedagogical explanation', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to generate explanation', 'error');
    } finally {
      setExplaining(false);
    }
  };

  const toggleFindingExpand = (index: number) => {
    setExpandedFindings((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="xl" label="Verifying draft against statutory rubrics & Qdrant..." />
      </div>
    );
  }

  // If no evaluation selected yet, show available drafts selector
  if (!evaluation) {
    return (
      <div className="space-y-6 font-sans">
        <div className="tactile-card bg-white p-8 sm:p-12 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6 text-center max-w-xl mx-auto animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0B192C] tracking-tight">
              Select a Draft for Deterministic Evaluation
            </h3>
            <p className="text-xs text-[#0B192C]/70 mt-1 leading-relaxed font-sans">
              Choose an existing draft from your workspace to run rule-based rubric checks, scanning laser sweeps, and evidence findings.
            </p>
          </div>

          {drafts.length > 0 ? (
            <div className="space-y-2.5 text-left pt-2">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleEvaluateDraft(d)}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] hover:border-[#1E3E62] cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div>
                    <span className="font-serif font-bold text-xs text-[#0B192C] group-hover:text-[#1E3E62] transition-colors">
                      {d.title}
                    </span>
                    <span className="block text-[10px] text-[#0B192C]/60 font-mono mt-0.5">
                      {d.document_type.replace(/_/g, ' ')} • {d.versions?.length || 1} Revisions
                    </span>
                  </div>
                  <button className="tactile-btn px-3.5 py-1.5 bg-[#1E3E62] group-hover:bg-[#152C46] text-white rounded-xl text-xs font-bold border-b-4 border-[#0B192C] shadow-sm transition-all flex items-center gap-1 cursor-pointer">
                    <span>Evaluate</span>
                    <ArrowRight className="w-3 h-3 text-[#F59E0B]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8] text-xs text-[#0B192C]/70 space-y-3 font-sans">
              <p>No drafts found in your workspace.</p>
              {onNavigateToWorkspace && (
                <button
                  onClick={onNavigateToWorkspace}
                  className="tactile-btn px-4 py-2 bg-[#1E3E62] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow transition-all cursor-pointer"
                >
                  Create Your First Draft
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3D AI Evaluation Modal */}
        <AIEvaluationModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          evaluation={evaluation}
          evaluating={evaluating}
          draftTitle={activeDraftTitle}
          draftContent={activeDraftContent}
          onNavigateToLoopholes={onNavigateToLoopholes}
        />
      </div>
    );
  }

  const effectiveScore = evaluation.is_overridden && evaluation.overridden_score !== null
    ? evaluation.overridden_score
    : evaluation.overall_score;

  const scoreColor =
    effectiveScore >= 75
      ? 'text-[#059669]'
      : effectiveScore >= 50
      ? 'text-[#B45309]'
      : 'text-[#DC2626]';

  const strokeColor =
    effectiveScore >= 75
      ? '#10B981'
      : effectiveScore >= 50
      ? '#F59E0B'
      : '#DC2626';

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (effectiveScore / evaluation.max_score) * circumference;

  const filteredEvidence = (evaluation.evidence_items || []).filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header Card with Circular Gauge & Score Breakdown */}
      <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Circular Score Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#F3F0EA"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={strokeColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-serif font-extrabold tracking-tight ${scoreColor}`}>
                  {effectiveScore.toFixed(0)}
                </span>
                <span className="text-[10px] font-semibold text-[#0B192C]/60 font-mono">
                  / {evaluation.max_score}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1E3E62] uppercase tracking-wider font-mono">
                  Deterministic Audit
                </span>
                {evaluation.is_overridden && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30 uppercase tracking-wider font-mono">
                    Faculty Overridden
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl font-extrabold text-[#0B192C] tracking-tight">
                Draft Quality Score
              </h2>
              <p className="text-xs text-[#0B192C]/60 font-mono">
                Rubric Standard: {evaluation.rubric_version} • Evaluated on{' '}
                {new Date(evaluation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToLoopholes && (
              <button
                onClick={() => onNavigateToLoopholes(evaluation.id)}
                className="tactile-btn flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-bold border-2 border-[#DC2626]/30 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                <span>Neo4j Graph Loopholes</span>
              </button>
            )}

            {onNavigateToTutor && (
              <button
                onClick={() => onNavigateToTutor()}
                className="tactile-btn flex items-center gap-2 px-4 py-2 bg-[#F3F0EA] hover:bg-white text-[#1E3E62] rounded-xl text-xs font-bold border-2 border-[#E6E2D8] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Ask Socratic Tutor</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Score Breakdown Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t-2 border-[#E6E2D8]">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
            <span className="text-[11px] font-semibold text-[#0B192C]/70">Structure & Demarcation</span>
            <p className="text-xl font-serif font-bold text-[#0B192C]">{evaluation.structure_score} pts</p>
            <span className="text-[10px] text-[#0B192C]/60 block font-mono">Title, recitals & numbering</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
            <span className="text-[11px] font-semibold text-[#0B192C]/70">Clause Coverage</span>
            <p className="text-xl font-serif font-bold text-[#1E3E62]">{evaluation.clause_score} pts</p>
            <span className="text-[10px] text-[#0B192C]/60 block font-mono">Qdrant vector matched clauses</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
            <span className="text-[11px] font-semibold text-[#0B192C]/70">Formatting & Jurats</span>
            <p className="text-xl font-serif font-bold text-[#B45309]">{evaluation.formatting_score} pts</p>
            <span className="text-[10px] text-[#0B192C]/60 block font-mono">Oaths, verification & stamps</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
            <span className="text-[11px] font-semibold text-[#0B192C]/70">Contradiction Penalty</span>
            <p className="text-xl font-serif font-bold text-[#DC2626]">-{evaluation.gap_penalty} pts</p>
            <span className="text-[10px] text-[#0B192C]/60 block font-mono">Deducted for legal inconsistencies</span>
          </div>
        </div>
      </div>

      {/* AI Pedagogical Explanation Panel */}
      <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3F0EA] border-2 border-[#E6E2D8] flex items-center justify-center text-[#1E3E62]">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">AI Pedagogical Explanation</h3>
              <p className="text-xs text-[#0B192C]/70 font-sans">
                Evidence-grounded rationale explaining statutory strengths and errors
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestExplanation}
            disabled={explaining}
            className="tactile-btn px-4 py-1.5 bg-[#1E3E62] hover:bg-[#152C46] text-white rounded-xl text-xs font-bold border-b-4 border-[#0B192C] shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {explaining ? <LoadingSpinner size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />}
            <span>{explanationData ? 'Regenerate Narrative' : 'Explain My Score'}</span>
          </button>
        </div>

        {explanationData ? (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-3 animate-fade-in">
            <div className="text-xs text-[#0B192C] whitespace-pre-wrap leading-relaxed font-sans">
              {explanationData.explanation}
            </div>

            {explanationData.remedial_suggestions?.length > 0 && (
              <div className="pt-2 border-t-2 border-[#E6E2D8] space-y-1.5">
                <span className="text-[10px] font-bold text-[#1E3E62] uppercase tracking-wider font-mono">
                  Remedial Statutory Recommendations:
                </span>
                <ul className="list-disc list-inside text-xs text-[#0B192C]/80 space-y-1 font-sans">
                  {explanationData.remedial_suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#0B192C]/60 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E6E2D8] font-sans">
            Click &ldquo;Explain My Score&rdquo; to receive an AI-generated pedagogical breakdown with statutory citations.
          </p>
        )}
      </div>

      {/* Granular Evidence Findings */}
      <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0B192C] tracking-tight">
              Itemized Evidence Findings ({evaluation.evidence_items?.length || 0})
            </h3>
            <p className="text-xs text-[#0B192C]/60 mt-0.5 font-sans">
              Audited against gold-standard statutory legal reference corpus
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8] overflow-x-auto">
            {(['ALL', 'PASS', 'PARTIAL', 'FAIL', 'WARNING'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`tactile-btn px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3.5">
          {filteredEvidence.length === 0 ? (
            <div className="py-8 text-center text-[#0B192C]/50 text-xs font-sans">
              No evidence findings matching filter "{activeFilter}".
            </div>
          ) : (
            filteredEvidence.map((item, idx) => {
              const isPass = item.status === 'PASS';
              const isPartial = item.status === 'PARTIAL';
              const isFail = item.status === 'FAIL';
              const isWarning = item.status === 'WARNING';
              const isExpanded = !!expandedFindings[idx];

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    isPass
                      ? 'bg-[#F0FDF4] border-[#10B981]/40'
                      : isPartial
                      ? 'bg-[#FFFBEB] border-[#F59E0B]/40'
                      : isWarning
                      ? 'bg-[#FFFBEB] border-[#F59E0B]/40'
                      : 'bg-[#FEF2F2] border-[#DC2626]/40'
                  }`}
                >
                  <div
                    onClick={() => toggleFindingExpand(idx)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isPass && <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />}
                      {isPartial && <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />}
                      {(isFail || isWarning) && <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#0B192C] border border-[#E6E2D8]">
                            {item.category}
                          </span>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#0B192C]">
                            {item.criterion}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#0B192C]">
                        {item.score} / {item.max_score} pts
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border ${
                          isPass
                            ? 'bg-white text-[#059669] border-[#10B981]/40'
                            : isPartial
                            ? 'bg-white text-[#B45309] border-[#F59E0B]/40'
                            : 'bg-white text-[#DC2626] border-[#DC2626]/40'
                        }`}
                      >
                        {item.status}
                      </span>
                      <button className="text-[#0B192C]/50 hover:text-[#0B192C]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#0B192C]/80 mt-2.5 leading-relaxed font-sans">{item.explanation}</p>

                  {/* Expanded Evidence Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t-2 border-[#E6E2D8] space-y-3 animate-fade-in">
                      {item.student_evidence && (
                        <div className="p-3 bg-white rounded-xl border border-[#E6E2D8] text-xs space-y-1">
                          <span className="text-[10px] font-bold text-[#0B192C]/60 uppercase tracking-wider font-mono">
                            Student Draft Excerpt:
                          </span>
                          <p className="font-mono text-[11px] text-[#0B192C] whitespace-pre-wrap">
                            "{item.student_evidence}"
                          </p>
                        </div>
                      )}

                      {item.reference_evidence && (
                        <div className="p-3.5 bg-white rounded-xl border-2 border-[#E6E2D8] text-xs space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-[#1E3E62] font-semibold text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span className="font-serif">
                                Gold Standard: {item.source_document || 'Reference Corpus'}
                              </span>
                            </div>
                            <span className="font-mono text-[#0B192C]/60">Page {item.source_page || 1} • {item.source_section || 'General'}</span>
                          </div>
                          <p className="text-[#0B192C]/90 font-mono text-[11px] leading-relaxed">
                            "{item.reference_evidence}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3D AI Evaluation Modal */}
      <AIEvaluationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        evaluation={evaluation}
        evaluating={evaluating}
        draftTitle={activeDraftTitle}
        draftContent={activeDraftContent}
        onNavigateToLoopholes={onNavigateToLoopholes}
      />
    </div>
  );
};