import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Evaluation } from '../../types';
import { AICoreOrb } from './AICoreOrb';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  X,
  FileText,
  Network,
  GraduationCap,
} from 'lucide-react';

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  evaluating: boolean;
  draftTitle?: string;
  draftContent?: string;
  onNavigateToLoopholes?: (evalId: string) => void;
  onNavigateToRoadmap?: () => void;
  onViewDetailedEvidence?: () => void;
}

export const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  evaluating,
  draftTitle = 'Legal Draft',
  draftContent = '',
  onNavigateToLoopholes,
  onNavigateToRoadmap,
  onViewDetailedEvidence,
}) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  const stages = [
    'Parsing statutory demarcations & recitals...',
    'Generating 384-dimensional FastEmbed vectors...',
    'Matching semantic clauses against Qdrant gold standards...',
    'Traversing Neo4j Aura graph prerequisite dependencies...',
    'Executing mathematical 100-point rubric calculation...',
  ];

  // Cycle through decorative loading stages while evaluating
  useEffect(() => {
    if (evaluating) {
      setAnimatedScore(0);
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 700);
      return () => clearInterval(interval);
    }
  }, [evaluating]);

  // Score count-up reveal animation when real evaluation arrives
  useEffect(() => {
    if (evaluation && !evaluating) {
      const targetScore = evaluation.is_overridden && evaluation.overridden_score !== null
        ? evaluation.overridden_score
        : evaluation.overall_score;

      let current = 0;
      const step = Math.max(1, Math.floor(targetScore / 30));
      const timer = setInterval(() => {
        current += step;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(current);
        }
      }, 25);
      return () => clearInterval(timer);
    }
  }, [evaluation, evaluating]);

  const handleModalClose = () => {
    window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleModalClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveScore = evaluation
    ? evaluation.is_overridden && evaluation.overridden_score !== null
      ? evaluation.overridden_score
      : evaluation.overall_score
    : 0;

  const strokeColor =
    effectiveScore >= 75
      ? '#10b981'
      : effectiveScore >= 50
      ? '#f59e0b'
      : '#f43f5e';

  const maxScore = evaluation?.max_score || 100;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (animatedScore / maxScore) * circumference;

  const passCount = evaluation?.evidence_items?.filter((i) => i.status === 'PASS').length || 0;
  const warningCount = evaluation?.evidence_items?.filter((i) => i.status === 'WARNING' || i.status === 'PARTIAL').length || 0;
  const failCount = evaluation?.evidence_items?.filter((i) => i.status === 'FAIL').length || 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B192C]/85 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white p-6 sm:p-10 rounded-[2.5rem] border-2 border-[#0B192C] shadow-[0_12px_#0B192C] space-y-8 my-auto overflow-hidden animate-scale-in">
        {/* Top Modal Chrome */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#E6E2D8] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B192C] tracking-tight">
                  Deterministic AI Evaluation Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F3F0EA] text-[#1E3E62] border border-[#E6E2D8]">
                  Rubric v1.0
                </span>
              </div>
              <p className="text-xs text-[#0B192C]/60 font-mono">
                {draftTitle} • Grounded in Qdrant & Neo4j
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-[#0B192C]/70 hover:text-[#0B192C] bg-[#F3F0EA] border-2 border-[#E6E2D8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluating State: 3D AI Core + Document Scanning Laser */}
        {evaluating ? (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left 6 Cols: Central 3D AI Core */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-6">
              <AICoreOrb size="lg" stageText={stages[loadingStage]} />

              {/* Progress Step Nodes */}
              <div className="w-full max-w-sm space-y-2 pt-2">
                {stages.map((stage, idx) => {
                  const isDone = idx < loadingStage;
                  const isCurrent = idx === loadingStage;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs font-mono transition-all ${
                        isDone
                          ? 'text-[#059669]'
                          : isCurrent
                          ? 'text-[#1E3E62] font-bold scale-105'
                          : 'text-[#0B192C]/40'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-[#10B981]' : isCurrent ? 'bg-[#F59E0B] animate-ping' : 'bg-[#E6E2D8]'}`} />
                      <span className="truncate">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 6 Cols: Document with Sweeping Laser Scan Line */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl bg-[#FAF8F5] border-2 border-[#E6E2D8] p-6 font-mono text-xs text-[#0B192C] leading-relaxed overflow-hidden shadow-[0_4px_#E6E2D8] max-h-[360px]">
                {/* Active Laser Scanning Beam */}
                <div className="laser-scan-line animate-scan" />

                <div className="text-center pb-2 mb-3 border-b-2 border-[#E6E2D8]">
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block font-mono">
                    ACTIVE STATUTORY SCAN
                  </span>
                  <p className="font-serif text-xs text-[#0B192C] font-bold truncate">{draftTitle}</p>
                </div>

                <div className="space-y-2 text-[11px] text-[#0B192C]/80 leading-relaxed max-h-[240px] overflow-hidden select-none">
                  {draftContent ? (
                    <p className="whitespace-pre-wrap">{draftContent.slice(0, 500)}...</p>
                  ) : (
                    <>
                      <p className="text-[#0B192C]">1. IDENTIFICATION & AGE: I, the deponent, solemnly affirm...</p>
                      <p className="text-[#0B192C]">2. OPERATIVE COVENANTS: That all declarations made herein are true...</p>
                      <p className="text-[#0B192C]">3. VERIFICATION JURAT: Verified under the Indian Evidence Act...</p>
                      <p className="text-[#0B192C]/60">4. DISPUTE RESOLUTION: Subject to competent jurisdiction...</p>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t-2 border-[#E6E2D8] flex items-center justify-between text-[10px] text-[#0B192C]/60 font-mono">
                  <span>FastEmbed Tokenizer</span>
                  <span className="text-[#059669] font-bold animate-pulse">Scanning Active</span>
                </div>
              </div>
            </div>
          </div>
        ) : evaluation ? (
          /* Real Evaluation Results: Cinematic Score Reveal */
          <div className="space-y-8 relative z-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 5 Cols: Score Reveal Gauge */}
              <div className="lg:col-span-5 tactile-card bg-[#FAF8F5] p-8 rounded-3xl border-2 border-[#E6E2D8] text-center space-y-4 shadow-[0_4px_#E6E2D8]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B192C]/60 block font-mono">
                  Deterministic Score Result
                </span>

                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 108 108">
                    <circle cx="54" cy="54" r="46" stroke="#E6E2D8" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="54"
                      cy="54"
                      r="46"
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
                    <span className="text-4xl font-serif font-extrabold tracking-tight text-[#0B192C]">
                      {animatedScore}
                    </span>
                    <span className="text-xs text-[#0B192C]/60 font-bold uppercase font-mono">
                      / {maxScore} pts
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border-2 ${
                      effectiveScore >= 75
                        ? 'bg-[#F0FDF4] text-[#059669] border-[#10B981]/40'
                        : effectiveScore >= 50
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/40'
                        : 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/40'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{effectiveScore >= 75 ? 'Statutory Compliant' : effectiveScore >= 50 ? 'Revision Advised' : 'High Risk Gaps'}</span>
                  </span>
                </div>
              </div>

              {/* Right 7 Cols: 4-Pillar Score Breakdown & Summary */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
                    <span className="text-[11px] font-semibold text-[#0B192C]/70">Structure & Demarcation</span>
                    <p className="text-xl font-serif font-extrabold text-[#0B192C]">{evaluation.structure_score} / 25 pts</p>
                    <span className="text-[10px] text-[#059669] font-mono">Title, recitals & numbering</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
                    <span className="text-[11px] font-semibold text-[#0B192C]/70">Clause Coverage</span>
                    <p className="text-xl font-serif font-extrabold text-[#1E3E62]">{evaluation.clause_score} / 50 pts</p>
                    <span className="text-[10px] text-[#1E3E62]/80 font-mono">Semantic precedent matching</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
                    <span className="text-[11px] font-semibold text-[#0B192C]/70">Formatting & Jurats</span>
                    <p className="text-xl font-serif font-extrabold text-[#F59E0B]">{evaluation.formatting_score} / 25 pts</p>
                    <span className="text-[10px] text-[#B45309] font-mono">Oath affirmation & stamps</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border-2 border-[#E6E2D8] space-y-1 shadow-[0_2px_#E6E2D8]">
                    <span className="text-[11px] font-semibold text-[#0B192C]/70">Contradiction Penalty</span>
                    <p className="text-xl font-serif font-extrabold text-[#DC2626]">-{evaluation.gap_penalty} pts</p>
                    <span className="text-[10px] text-[#DC2626] font-mono">Restraints & statutory gaps</span>
                  </div>
                </div>

                {/* Evidence Summary Counters */}
                <div className="p-4 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] flex items-center justify-around text-center text-xs font-mono">
                  <div>
                    <span className="text-[#0B192C]/60 block text-[10px]">Validated Items</span>
                    <span className="text-[#059669] font-bold text-base flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> {passCount} PASS
                    </span>
                  </div>
                  <div className="h-8 w-0.5 bg-[#E6E2D8]" />
                  <div>
                    <span className="text-[#0B192C]/60 block text-[10px]">Advisory Warnings</span>
                    <span className="text-[#B45309] font-bold text-base flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" /> {warningCount} WARN
                    </span>
                  </div>
                  <div className="h-8 w-0.5 bg-[#E6E2D8]" />
                  <div>
                    <span className="text-[#0B192C]/60 block text-[10px]">Critical Gaps</span>
                    <span className="text-[#DC2626] font-bold text-base flex items-center justify-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-[#DC2626]" /> {failCount} FAIL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Action Gateway Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t-2 border-[#E6E2D8]">
              <button
                onClick={() => {
                  handleModalClose();
                  if (onViewDetailedEvidence) onViewDetailedEvidence();
                }}
                className="tactile-btn w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-[#F3F0EA] text-[#0B192C] text-xs font-bold border-2 border-[#E6E2D8] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#1E3E62]" />
                <span>Inspect Evidence Findings ({evaluation.evidence_items?.length || 0})</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {onNavigateToLoopholes && (
                  <button
                    onClick={() => {
                      handleModalClose();
                      onNavigateToLoopholes(evaluation.id);
                    }}
                    className="tactile-btn flex-1 sm:flex-none px-5 py-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-bold rounded-xl border-2 border-[#DC2626]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Network className="w-4 h-4 text-[#DC2626]" />
                    <span>Neo4j Graph Loopholes</span>
                  </button>
                )}

                {onNavigateToRoadmap && (
                  <button
                    onClick={() => {
                      handleModalClose();
                      onNavigateToRoadmap();
                    }}
                    className="tactile-btn flex-1 sm:flex-none px-6 py-2.5 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-[#F59E0B]" />
                    <span>Synthesize 5-Phase Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
};
