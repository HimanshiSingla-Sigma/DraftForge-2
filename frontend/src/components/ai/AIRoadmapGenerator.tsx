import React, { useState, useEffect } from 'react';
import { Roadmap, RoadmapItem, StudentSkill } from '../../types';
import { AICoreOrb } from './AICoreOrb';
import {
  Sparkles,
  Check,
  Award,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface AIRoadmapGeneratorProps {
  roadmap: Roadmap | null;
  skills: StudentSkill[];
  generating: boolean;
  onCompleteItem: (itemId: string) => void;
  completingItemId: string | null;
  onGenerateNew: () => void;
}

export const AIRoadmapGenerator: React.FC<AIRoadmapGeneratorProps> = ({
  roadmap,
  skills,
  generating,
  onCompleteItem,
  completingItemId,
  onGenerateNew,
}) => {
  const [revealedNodesCount, setRevealedNodesCount] = useState<number>(0);
  const [synthesisStage, setSynthesisStage] = useState<number>(0);

  const synthesisStages = [
    'Analyzing evaluated weaknesses and draft gap deductions...',
    'Traversing statutory curriculum concepts & learning standards...',
    'Calibrating personalized 5-phase milestone trajectory...',
    'Synthesizing practice targets & mastery certifications...',
  ];

  // Progressive generation loading animation
  useEffect(() => {
    if (generating) {
      setRevealedNodesCount(0);
      setSynthesisStage(0);
      const stageInterval = setInterval(() => {
        setSynthesisStage((prev) => (prev < synthesisStages.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(stageInterval);
    }
  }, [generating]);

  // Progressive reveal of actual roadmap items when response arrives
  useEffect(() => {
    if (roadmap && !generating) {
      const items = roadmap.roadmap_items || [];
      setRevealedNodesCount(0);
      let count = 0;
      const revealInterval = setInterval(() => {
        count += 1;
        setRevealedNodesCount(count);
        if (count >= items.length) {
          clearInterval(revealInterval);
        }
      }, 200);
      return () => clearInterval(revealInterval);
    }
  }, [roadmap, generating]);

  const items = roadmap?.roadmap_items || [];
  const completedCount = items.filter((i) => i.is_completed).length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* If Generating: 3D AI Core Universe Generation State */}
      {generating ? (
        <div className="tactile-card bg-white p-8 sm:p-12 rounded-[2.5rem] border-2 border-[#E6E2D8] text-center space-y-6 shadow-[0_8px_#E6E2D8] relative overflow-hidden">
          <AICoreOrb size="lg" stageText={synthesisStages[synthesisStage]} />

          <div className="max-w-md mx-auto space-y-3 pt-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B192C] tracking-tight">
              Synthesizing 5-Phase Personalized Curriculum
            </h3>
            <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
              DraftForge AI is dynamically organizing your drafting trajectory based on verified evaluation findings.
            </p>
          </div>
        </div>
      ) : roadmap ? (
        /* Roadmap View with 3D Progressive Nodes */
        <div className="space-y-6">
          {/* Header Card with Progress Gauge */}
          <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F3F0EA] text-[#1E3E62] border border-[#E6E2D8] uppercase tracking-wider font-mono">
                    Personalized 5-Phase Track
                  </span>
                  <span className="text-[10px] font-mono text-[#059669] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                    Active Curriculum
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#0B192C] tracking-tight">
                  {roadmap.title}
                </h2>
                <p className="text-xs text-[#0B192C]/70 font-sans">
                  Calibrated to elevate your weakest statutory clauses and jurat structures to commercial mastery.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#0B192C]/60 font-medium block">Curriculum Completion</span>
                  <span className="font-serif text-2xl font-extrabold text-[#1E3E62]">
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                <button
                  onClick={onGenerateNew}
                  className="tactile-btn px-4 py-2.5 bg-[#F3F0EA] hover:bg-white text-[#0B192C] text-xs font-bold rounded-xl border-2 border-[#E6E2D8] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Resynthesize</span>
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2.5 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
              <div
                className="h-full bg-[#1E3E62] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5-Phase Progressive Materialized Nodes Timeline */}
          <div className="space-y-4 relative">
            {/* Connecting Track Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#E6E2D8] hidden sm:block" />

            {items.map((item: RoadmapItem, idx: number) => {
              const isRevealed = idx < revealedNodesCount;
              const isCompleted = item.is_completed;
              const isCompleting = completingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`transition-all duration-500 transform ${
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <div
                    className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-[#F0FDF4] border-[#10B981]/50 shadow-[0_4px_#10B981]/20'
                        : 'tactile-card bg-white border-[#E6E2D8] shadow-[0_4px_#E6E2D8] hover:border-[#1E3E62]'
                    }`}
                  >
                    {/* Left Phase Badge & Description */}
                    <div className="flex items-start gap-4">
                      {/* Node Icon Avatar */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border-2 ${
                          isCompleted
                            ? 'bg-[#10B981] text-white border-[#059669]'
                            : 'bg-[#F3F0EA] border-[#E6E2D8] text-[#1E3E62]'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <span className="font-serif text-sm font-extrabold">{item.phase_number}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B192C]/60">
                            Phase {item.phase_number}
                          </span>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F0FDF4] text-[#059669] border border-[#10B981]/30 uppercase tracking-wider font-mono">
                              ✓ Completed
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-bold text-base text-[#0B192C] tracking-tight">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-[#0B192C]/75 leading-relaxed max-w-2xl font-sans">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Check-off Action Button */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {!isCompleted ? (
                        <button
                          onClick={() => onCompleteItem(item.id)}
                          disabled={isCompleting}
                          className="tactile-btn px-4 py-2 bg-[#1E3E62] hover:bg-[#152C46] text-white text-xs font-bold rounded-xl border-b-4 border-[#0B192C] shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isCompleting ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                          )}
                          <span>Mark Phase Complete</span>
                        </button>
                      ) : (
                        <div className="text-[11px] font-mono text-[#059669] font-bold px-3 py-1.5 rounded-xl bg-[#F0FDF4] border-2 border-[#10B981]/40 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#059669]" />
                          <span>Milestone Achieved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Skill Mastery Matrix Ribbon */}
          {skills.length > 0 && (
            <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#1E3E62]" />
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Target Skill Matrices</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.slice(0, 6).map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3.5 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-xs text-[#0B192C] truncate max-w-[170px]">
                        {sk.skill?.name || 'Legal Drafting'}
                      </h4>
                      <span className="text-[10px] text-[#0B192C]/60 font-mono">
                        {sk.skill?.category || 'General'}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#059669]">
                      {Math.round(sk.proficiency_score)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Roadmap State */
        <div className="tactile-card bg-white p-12 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] text-center space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] flex items-center justify-center mx-auto text-[#1E3E62] shadow-sm">
            <Compass className="w-8 h-8 text-[#1E3E62]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-[#0B192C]">No Active Learning Roadmap</h3>
            <p className="text-xs text-[#0B192C]/70 font-sans">
              Synthesize a tailored 5-phase statutory drafting trajectory based on your latest draft evaluations.
            </p>
          </div>
          <button
            onClick={onGenerateNew}
            className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>Generate 5-Phase Roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
};
