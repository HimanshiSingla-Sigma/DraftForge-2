import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Evaluation, Draft, ExplainEvaluationResponse } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { AIEvaluationModal } from '../ai/AIEvaluationModal';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileText,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Check,
  Edit3,
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
      showToast('100-Point Academic Rubric Evaluation Completed!', 'success');
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
        <LoadingSpinner size="xl" label="Verifying draft against statutory rubrics & precedent benchmarks..." />
      </div>
    );
  }

  // If no evaluation selected yet, show available drafts selector
  if (!evaluation) {
    return (
      <div className="space-y-6 font-sans max-w-2xl mx-auto py-8">
        <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-lg border border-[#E5DED2] shadow-sm space-y-6 text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center mx-auto text-[#C78335]">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-medium text-[#20344A] tracking-tight">
              Select a Draft for 100-Point Academic Audit
            </h3>
            <p className="text-xs text-[#74777D] max-w-md mx-auto leading-relaxed">
              Choose an authored draft from your docket to run comprehensive rule-based rubric checks, statutory verifications, and citation audits.
            </p>
          </div>

          {drafts.length > 0 ? (
            <div className="space-y-2 text-left pt-2">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleEvaluateDraft(d)}
                  className="p-4 rounded border border-[#E5DED2] hover:border-[#20344A] bg-[#FBF8F2] hover:bg-white cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div>
                    <span className="font-serif font-medium text-sm text-[#20344A] group-hover:text-[#C78335] transition-colors">
                      {d.title}
                    </span>
                    <span className="block text-xs text-[#74777D] font-mono mt-0.5">
                      {d.document_type.replace(/_/g, ' ')} • {d.versions?.length || 1} Revisions
                    </span>
                  </div>
                  <button className="px-3.5 py-1.5 bg-[#20344A] group-hover:bg-[#152332] text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                    <span>Audit Draft</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#FBF8F2] rounded border border-[#E5DED2] text-xs text-[#74777D] space-y-3">
              <p>No drafts registered in your current docket.</p>
              {onNavigateToWorkspace && (
                <button
                  onClick={onNavigateToWorkspace}
                  className="px-4 py-2 bg-[#20344A] text-white text-xs font-semibold rounded transition-all cursor-pointer"
                >
                  Author Your First Draft
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

  const honorsStatus =
    effectiveScore >= 85
      ? { label: 'High Honors', color: 'text-[#557B68] bg-[#E8F3ED]', desc: 'Ready for filing with minor polish' }
      : effectiveScore >= 70
      ? { label: 'Proficient (Honors)', color: 'text-[#C78335] bg-[#FBF0E4]', desc: 'Sound analysis requiring targeted revisions' }
      : { label: 'Sub-Standard', color: 'text-[#BA1A1A] bg-[#FFDAD6]', desc: 'Core doctrinal or procedural elements missing' };

  const filteredEvidence = (evaluation.evidence_items || []).filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. EDITORIAL MASTHEAD / DOCKET HEADER (Matching Evaluation Report Reference) */}
      {/* ========================================================================= */}
      <header className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm relative overflow-hidden">
        {/* Navy Top Hairline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#20344A]" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
                Academic Evaluation
              </span>
              <span className="text-[#E5DED2]">•</span>
              <span className="text-xs uppercase tracking-widest text-[#74777D] font-mono">
                Docket No. {evaluation.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[#E5DED2]">•</span>
              <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Certified Rubric v4.2
              </span>
              {evaluation.is_overridden && (
                <span className="text-[10px] uppercase font-bold text-[#C78335] bg-[#FBF0E4] px-2 py-0.5 rounded border border-[#C78335]/30">
                  Faculty Score Overridden
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#20344A] tracking-tight font-medium">
              Evaluation Report: Statutory Pleading <span className="italic font-normal text-[#74777D]">(Audit #1)</span>
            </h1>

            {/* Meta Grid resembling legal document masthead */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[#43474D] border-t border-[#E5DED2]">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#74777D]">Rubric Framework</span>
                <span className="text-xs text-[#20344A] font-semibold">{evaluation.rubric_version}</span>
                <span className="text-[11px] text-[#74777D]">100-Point Standard Scale</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#74777D]">Audit Concluded</span>
                <span className="text-xs text-[#20344A] font-semibold">
                  {new Date(evaluation.created_at).toLocaleDateString()}
                </span>
                <span className="text-[11px] text-[#74777D]">
                  {new Date(evaluation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Grounded Review
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#74777D]">Evaluator / Bench</span>
                <span className="text-xs text-[#20344A] font-semibold">DraftForge Juris Engine</span>
                <span className="text-[11px] text-[#74777D]">Statutory Reference Benchmark</span>
              </div>
            </div>
          </div>

          {/* Composite Score Tile */}
          <div className="flex lg:flex-col items-center lg:items-end justify-between bg-[#FBF8F2] border border-[#E5DED2] p-4 lg:p-6 rounded min-w-[220px] shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold block">
                Composite Score
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-3xl sm:text-4xl text-[#20344A] font-bold">
                  {effectiveScore.toFixed(0)}
                </span>
                <span className="font-serif text-lg text-[#74777D]">
                  / {evaluation.max_score}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end mt-0 lg:mt-3">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded ${honorsStatus.color}`}>
                {honorsStatus.label}
              </span>
              <span className="text-[11px] text-[#74777D] mt-1 hidden sm:block">
                {honorsStatus.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Action Shelf */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5DED2]">
          <div className="flex items-center gap-2 text-[#74777D] text-xs">
            <Award className="w-4 h-4 text-[#C78335]" />
            <span>
              Overall Performance: {effectiveScore >= 75 ? 'Satisfies core statutory benchmarks' : 'Action items identified below'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onNavigateToLoopholes && (
              <button
                onClick={() => onNavigateToLoopholes(evaluation.id)}
                className="px-3.5 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#C78335]" />
                <span>Doctrinal Fallacy Audit</span>
              </button>
            )}

            {onNavigateToTutor && (
              <button
                onClick={() => onNavigateToTutor()}
                className="px-3.5 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
                <span>Consult AI Legal Tutor</span>
              </button>
            )}

            {onNavigateToWorkspace && (
              <button
                onClick={onNavigateToWorkspace}
                className="px-4 py-1.5 bg-[#C78335] hover:bg-[#b57328] text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Revise Draft in Studio</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. KEY SYNTHESIS GRID: Action Imperative vs Commendations */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Action Imperative Card (Warm Amber) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#C78335]">
                <AlertTriangle className="w-4 h-4 text-[#C78335]" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Action Imperative #1</span>
              </div>
              <span className="text-[11px] text-[#C78335] bg-[#FBF0E4] px-2 py-0.5 rounded font-semibold">
                High Priority
              </span>
            </div>

            <h3 className="font-serif text-lg text-[#20344A] font-medium">
              Statutory Deponent Verification & Specificity
            </h3>

            <p className="text-xs text-[#43474D] leading-relaxed">
              Ensure verification clauses explicitly state personal knowledge versus information believed to be true. Lack of statutory jurat precision is the primary deduction on this submission.
            </p>
          </div>

          <div className="p-3 bg-[#FBF0E4] rounded border border-[#C78335]/30 flex items-start gap-2.5 text-xs text-[#20344A]">
            <Sparkles className="w-4 h-4 text-[#C78335] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tutor Guidance:</strong> Revisit the Verification clause in Draft Studio and use the Precedent Insert for standard statutory jurats under Order XIX.
            </p>
          </div>
        </div>

        {/* Faculty Commendations Card (Sage Green) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#557B68]">
                <CheckCircle2 className="w-4 h-4 text-[#557B68]" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Faculty Commendations</span>
              </div>
              <span className="text-[11px] text-[#557B68] bg-[#E8F3ED] px-2 py-0.5 rounded font-semibold">
                Exemplary Execution
              </span>
            </div>

            <h3 className="font-serif text-lg text-[#20344A] font-medium">
              Structured Recitals & Formal Legal Demarcation
            </h3>

            <p className="text-xs text-[#43474D] leading-relaxed">
              Clean introductory caption, clear definition of operative parties, and coherent chronological recitals. The draft establishes subject matter authority cleanly with professional legal cadence.
            </p>
          </div>

          {/* 3 Metric Visualizer Tiles */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-[#FBF8F2] border border-[#E5DED2] rounded text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#74777D] block">Structure</span>
              <span className="font-serif text-lg font-bold text-[#20344A]">
                {evaluation.structure_score} pts
              </span>
            </div>
            <div className="p-3 bg-[#FBF8F2] border border-[#E5DED2] rounded text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#74777D] block">Coverage</span>
              <span className="font-serif text-lg font-bold text-[#557B68]">
                {evaluation.clause_score} pts
              </span>
            </div>
            <div className="p-3 bg-[#FBF8F2] border border-[#E5DED2] rounded text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#74777D] block">Deductions</span>
              <span className="font-serif text-lg font-bold text-[#BA1A1A]">
                -{evaluation.gap_penalty} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AI SOCRATIC EXPLANATION PANEL */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center text-[#C78335]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-[#20344A]">AI Pedagogical Explanation</h3>
              <p className="text-xs text-[#74777D]">
                Detailed reasoning explaining statutory strengths and corrective guidance
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestExplanation}
            disabled={explaining}
            className="px-3.5 py-1.5 bg-[#20344A] hover:bg-[#152332] text-white rounded text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-center"
          >
            {explaining ? <LoadingSpinner size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />}
            <span>{explanationData ? 'Regenerate Narrative' : 'Explain My Score'}</span>
          </button>
        </div>

        {explanationData ? (
          <div className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-3 text-xs leading-relaxed text-[#20344A]">
            <div className="whitespace-pre-wrap">{explanationData.explanation}</div>

            {explanationData.remedial_suggestions?.length > 0 && (
              <div className="pt-3 border-t border-[#E5DED2] space-y-1.5">
                <span className="text-[10px] font-semibold text-[#C78335] uppercase tracking-wider block">
                  Actionable Revision Steps:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#43474D]">
                  {explanationData.remedial_suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#74777D] bg-[#FBF8F2] p-3 rounded border border-[#E5DED2]">
            Click &ldquo;Explain My Score&rdquo; to synthesize an in-depth pedagogical audit with statutory recommendations.
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. COMPREHENSIVE AUDIT: CRITERION-BY-CRITERION BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold block">
              Comprehensive Audit
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] font-medium tracking-tight">
              Criterion-by-Criterion Rubric Breakdown ({evaluation.evidence_items?.length || 0})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#FBF8F2] rounded border border-[#E5DED2] overflow-x-auto">
            {(['ALL', 'PASS', 'PARTIAL', 'FAIL', 'WARNING'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-[#20344A] text-white font-semibold'
                    : 'text-[#74777D] hover:text-[#20344A]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3">
          {filteredEvidence.length === 0 ? (
            <div className="py-8 text-center text-[#74777D] text-xs">
              No evidence findings matching filter "{activeFilter}".
            </div>
          ) : (
            filteredEvidence.map((item, idx) => {
              const isPass = item.status === 'PASS';
              const isPartial = item.status === 'PARTIAL';
              const isWarning = item.status === 'WARNING';
              const isExpanded = !!expandedFindings[idx];

              return (
                <div
                  key={idx}
                  className="rounded border border-[#E5DED2] bg-[#FFFFFF] overflow-hidden transition-all shadow-2xs"
                >
                  <div
                    onClick={() => toggleFindingExpand(idx)}
                    className="p-4 cursor-pointer hover:bg-[#FBF8F2] transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded bg-[#FBF8F2] border border-[#E5DED2] text-[#20344A] font-serif font-bold text-center flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-medium text-sm text-[#20344A] truncate">
                            {item.criterion}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FBF8F2] text-[#74777D] border border-[#E5DED2]">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#74777D] mt-0.5 truncate max-w-xl">
                          {item.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-serif text-sm font-bold text-[#20344A]">
                          {item.score}
                        </span>
                        <span className="text-xs text-[#74777D]"> / {item.max_score}</span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isPass
                            ? 'bg-[#E8F3ED] text-[#557B68]'
                            : isPartial || isWarning
                            ? 'bg-[#FBF0E4] text-[#C78335]'
                            : 'bg-[#FFDAD6] text-[#BA1A1A]'
                        }`}
                      >
                        {item.status}
                      </span>

                      <button className="text-[#74777D] hover:text-[#20344A]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Evidence Details */}
                  {isExpanded && (
                    <div className="p-4 pt-2 bg-[#FBF8F2] border-t border-[#E5DED2] space-y-3 animate-fade-in text-xs">
                      <p className="text-xs text-[#20344A] leading-relaxed">
                        <strong>Evaluation Rationale:</strong> {item.explanation}
                      </p>

                      {item.student_evidence && (
                        <div className="p-3 bg-white rounded border border-[#E5DED2] space-y-1">
                          <span className="text-[10px] font-semibold text-[#74777D] uppercase tracking-wider">
                            Draft Extract:
                          </span>
                          <p className="font-mono text-[11px] text-[#20344A] whitespace-pre-wrap leading-relaxed">
                            "{item.student_evidence}"
                          </p>
                        </div>
                      )}

                      {item.reference_evidence && (
                        <div className="p-3 bg-white rounded border border-[#E5DED2] space-y-1">
                          <div className="flex items-center justify-between text-[#20344A] font-semibold text-[11px]">
                            <span className="flex items-center gap-1 font-serif">
                              <BookOpen className="w-3.5 h-3.5 text-[#C78335]" />
                              Standard Reference: {item.source_document || 'Statutory Code'}
                            </span>
                            <span className="text-[#74777D] font-mono">
                              Pg. {item.source_page || 1} • {item.source_section || 'General'}
                            </span>
                          </div>
                          <p className="font-serif italic text-[11px] text-[#43474D] leading-relaxed">
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