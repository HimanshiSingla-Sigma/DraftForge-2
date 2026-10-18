import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Evaluation } from '../../types';
import { AICoreOrb } from './AICoreOrb';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  X,
  FileText,
  ShieldAlert,
  GraduationCap,
  Scale,
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
    'Parsing statutory captions, recitals, and party designations...',
    'Analyzing operative clauses against academic standards...',
    'Verifying statutory verifications, oaths, and judicial jurats...',
    'Auditing cross-clause legal dependencies & potential risk exposures...',
    'Computing 100-point rubric assessment & faculty benchmark...',
  ];

  // Cycle through loading stages while evaluating
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
      ? '#557B68'
      : effectiveScore >= 50
      ? '#C78335'
      : '#BA1A1A';

  const maxScore = evaluation?.max_score || 100;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (animatedScore / maxScore) * circumference;

  const passCount = evaluation?.evidence_items?.filter((i) => i.status === 'PASS').length || 0;
  const warningCount = evaluation?.evidence_items?.filter((i) => i.status === 'WARNING' || i.status === 'PARTIAL').length || 0;
  const failCount = evaluation?.evidence_items?.filter((i) => i.status === 'FAIL').length || 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#20344A]/80 backdrop-blur-xs animate-fade-in overflow-y-auto font-sans">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] p-6 sm:p-8 rounded-lg border border-[#E5DED2] shadow-2xl space-y-6 my-auto overflow-hidden animate-scale-in">
        {/* Top Hairline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#20344A]" />

        {/* Top Modal Chrome */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center text-[#C78335]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-medium text-base sm:text-lg text-[#20344A] tracking-tight">
                  Academic 100-Point Rubric Audit
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E8F3ED] text-[#557B68]">
                  Rubric v4.2
                </span>
              </div>
              <p className="text-xs text-[#74777D] font-mono">
                {draftTitle} • Grounded in Verified Statutory Corpuses
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded text-[#74777D] hover:text-[#20344A] bg-[#FBF8F2] border border-[#E5DED2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Evaluating State */}
        {evaluating ? (
          <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-5">
              <AICoreOrb size="lg" stageText={stages[loadingStage]} />

              <div className="w-full max-w-sm space-y-2 pt-1">
                {stages.map((stage, idx) => {
                  const isDone = idx < loadingStage;
                  const isCurrent = idx === loadingStage;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-xs transition-all ${
                        isDone
                          ? 'text-[#557B68]'
                          : isCurrent
                          ? 'text-[#20344A] font-semibold'
                          : 'text-[#74777D]/50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-[#557B68]' : isCurrent ? 'bg-[#C78335] animate-ping' : 'bg-[#E5DED2]'}`} />
                      <span className="truncate">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Scan Simulation */}
            <div className="lg:col-span-6">
              <div className="relative rounded bg-[#FBF8F2] border border-[#E5DED2] p-5 text-xs text-[#20344A] leading-relaxed overflow-hidden shadow-inner max-h-[340px]">
                <div className="laser-scan-line animate-scan" />

                <div className="text-center pb-2 mb-3 border-b border-[#E5DED2]">
                  <span className="text-[10px] font-semibold text-[#C78335] uppercase tracking-wider block">
                    Active Statutory Examination
                  </span>
                  <p className="font-serif text-xs text-[#20344A] font-medium truncate">{draftTitle}</p>
                </div>

                <div className="space-y-2 text-[11px] text-[#43474D] font-serif leading-relaxed max-h-[220px] overflow-hidden select-none">
                  {draftContent ? (
                    <p className="whitespace-pre-wrap">{draftContent.slice(0, 500)}...</p>
                  ) : (
                    <>
                      <p>1. STATEMENT OF PARTIES: Counsel enters appearance on behalf of...</p>
                      <p>2. OPERATIVE COVENANTS: It is hereby agreed and understood under statutory provisions...</p>
                      <p>3. VERIFICATION JURAT: Verified under the Indian Evidence Act that contents are true...</p>
                      <p className="text-[#74777D]">4. ARBITRATION & JURISDICTION: Courts of competent territorial jurisdiction...</p>
                    </>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#E5DED2] flex items-center justify-between text-[10px] text-[#74777D] font-mono">
                  <span>DraftForge Evaluator</span>
                  <span className="text-[#557B68] font-semibold">Active Review</span>
                </div>
              </div>
            </div>
          </div>
        ) : evaluation ? (
          /* Real Evaluation Results */
          <div className="space-y-6 relative z-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Score Reveal Gauge */}
              <div className="lg:col-span-5 bg-[#FBF8F2] p-6 rounded-lg border border-[#E5DED2] text-center space-y-3 shadow-2xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#74777D] block">
                  Overall Composite Result
                </span>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 108 108">
                    <circle cx="54" cy="54" r="46" stroke="#E5DED2" strokeWidth="8" fill="transparent" />
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
                    <span className="text-4xl font-serif font-bold tracking-tight text-[#20344A]">
                      {animatedScore}
                    </span>
                    <span className="text-[11px] text-[#74777D] font-sans">
                      / {maxScore} pts
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${
                      effectiveScore >= 75
                        ? 'bg-[#E8F3ED] text-[#557B68]'
                        : effectiveScore >= 50
                        ? 'bg-[#FBF0E4] text-[#C78335]'
                        : 'bg-[#FFDAD6] text-[#BA1A1A]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{effectiveScore >= 75 ? 'Statutory Honors' : effectiveScore >= 50 ? 'Revision Advised' : 'High Priority Gaps'}</span>
                  </span>
                </div>
              </div>

              {/* 4-Pillar Score Breakdown */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#E5DED2] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-medium text-[#74777D]">Structure & Recitals</span>
                    <p className="text-lg font-serif font-bold text-[#20344A]">{evaluation.structure_score} / 25 pts</p>
                    <span className="text-[10px] text-[#557B68]">Caption, parties & numbering</span>
                  </div>

                  <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#E5DED2] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-medium text-[#74777D]">Statutory Coverage</span>
                    <p className="text-lg font-serif font-bold text-[#20344A]">{evaluation.clause_score} / 50 pts</p>
                    <span className="text-[10px] text-[#20344A]">Required legal covenants</span>
                  </div>

                  <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#E5DED2] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-medium text-[#74777D]">Formatting & Jurats</span>
                    <p className="text-lg font-serif font-bold text-[#C78335]">{evaluation.formatting_score} / 25 pts</p>
                    <span className="text-[10px] text-[#C78335]">Oath, jurat & execution</span>
                  </div>

                  <div className="p-3.5 rounded bg-[#FFFFFF] border border-[#E5DED2] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-medium text-[#74777D]">Contradiction Penalty</span>
                    <p className="text-lg font-serif font-bold text-[#BA1A1A]">-{evaluation.gap_penalty} pts</p>
                    <span className="text-[10px] text-[#BA1A1A]">Deductions for ambiguities</span>
                  </div>
                </div>

                {/* Evidence Summary Counters */}
                <div className="p-3 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-around text-center text-xs">
                  <div>
                    <span className="text-[#74777D] block text-[10px]">Validated Items</span>
                    <span className="text-[#557B68] font-bold text-sm flex items-center justify-center gap-1 font-serif">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68]" /> {passCount} Met
                    </span>
                  </div>
                  <div className="h-6 w-px bg-[#E5DED2]" />
                  <div>
                    <span className="text-[#74777D] block text-[10px]">Advisory Notes</span>
                    <span className="text-[#C78335] font-bold text-sm flex items-center justify-center gap-1 font-serif">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#C78335]" /> {warningCount} Warn
                    </span>
                  </div>
                  <div className="h-6 w-px bg-[#E5DED2]" />
                  <div>
                    <span className="text-[#74777D] block text-[10px]">Missing Elements</span>
                    <span className="text-[#BA1A1A] font-bold text-sm flex items-center justify-center gap-1 font-serif">
                      <XCircle className="w-3.5 h-3.5 text-[#BA1A1A]" /> {failCount} Gaps
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Action Gateway Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5DED2]">
              <button
                onClick={() => {
                  handleModalClose();
                  if (onViewDetailedEvidence) onViewDetailedEvidence();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] text-xs font-semibold border border-[#E5DED2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#20344A]" />
                <span>Examine Audit Findings ({evaluation.evidence_items?.length || 0})</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {onNavigateToLoopholes && (
                  <button
                    onClick={() => {
                      handleModalClose();
                      onNavigateToLoopholes(evaluation.id);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] text-xs font-semibold rounded border border-[#E5DED2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldAlert className="w-4 h-4 text-[#C78335]" />
                    <span>Doctrinal Risk Audit</span>
                  </button>
                )}

                {onNavigateToRoadmap && (
                  <button
                    onClick={() => {
                      handleModalClose();
                      onNavigateToRoadmap();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <GraduationCap className="w-4 h-4 text-[#C78335]" />
                    <span>View Learning Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
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
