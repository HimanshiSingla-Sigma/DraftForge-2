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
    'Reviewing evaluated feedback and drafting findings...',
    'Mapping statutory curriculum milestones & benchmark standards...',
    'Synthesizing personalized 5-phase learning trajectory...',
    'Formulating practice targets & academic competencies...',
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* If Generating: Synthesis State */}
      {generating ? (
        <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-lg border border-[#E5DED2] text-center space-y-6 shadow-sm relative overflow-hidden">
          <AICoreOrb size="lg" stageText={synthesisStages[synthesisStage]} />

          <div className="max-w-md mx-auto space-y-2 pt-2">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#20344A] tracking-tight">
              Synthesizing 5-Phase Learning Roadmap
            </h3>
            <p className="text-xs text-[#74777D] leading-relaxed">
              DraftForge AI is dynamically organizing your drafting trajectory based on verified evaluation findings.
            </p>
          </div>
        </div>
      ) : roadmap ? (
        /* Roadmap View with Progressive Nodes */
        <div className="space-y-6">
          {/* Header Card with Progress Gauge */}
          <header className="bg-[#FFFFFF] p-6 sm:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
                    Personalized 5-Phase Track
                  </span>
                  <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
                    Active Syllabus
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
                  {roadmap.title}
                </h2>
                <p className="text-xs text-[#74777D]">
                  Calibrated to elevate your statutory drafting and verification jurat precision to honors benchmark.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#74777D] block">Trajectory Progress</span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#20344A]">
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                <button
                  onClick={onGenerateNew}
                  className="px-3.5 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] text-xs font-medium rounded border border-[#E5DED2] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
                  <span>Resynthesize</span>
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-1.5 bg-[#E5DED2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#20344A] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </header>

          {/* 5-Phase Progressive Materialized Nodes Timeline */}
          <div className="space-y-3 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-[#E5DED2] hidden sm:block" />

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
                    className={`relative p-5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      isCompleted
                        ? 'bg-[#E8F3ED]/40 border-[#557B68]/30'
                        : 'bg-[#FFFFFF] border-[#E5DED2] hover:border-[#20344A]'
                    }`}
                  >
                    {/* Left Phase Badge & Description */}
                    <div className="flex items-start gap-4">
                      {/* Node Avatar */}
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center font-serif font-bold text-sm shrink-0 border ${
                          isCompleted
                            ? 'bg-[#557B68] text-white border-[#557B68]'
                            : 'bg-[#FBF8F2] border-[#E5DED2] text-[#20344A]'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span>{item.phase_number}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-[#74777D] font-semibold">
                            Phase {item.phase_number}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] font-semibold text-[#557B68] bg-[#E8F3ED] px-2 py-0.2 rounded">
                              ✓ Milestone Achieved
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-medium text-base text-[#20344A] tracking-tight">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-[#43474D] leading-relaxed max-w-2xl">
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
                          className="px-3.5 py-1.5 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {isCompleting ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C78335]" />
                          )}
                          <span>Mark Milestone Completed</span>
                        </button>
                      ) : (
                        <div className="text-xs text-[#557B68] font-semibold px-2.5 py-1 rounded bg-[#E8F3ED] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#557B68]" />
                          <span>Phase Completed</span>
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
            <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C78335]" />
                <h3 className="font-serif font-medium text-base text-[#20344A]">Target Competencies</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.slice(0, 6).map((sk) => (
                  <div
                    key={sk.id}
                    className="p-3 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-medium text-xs text-[#20344A] truncate max-w-[170px]">
                        {sk.skill?.name || 'Legal Drafting'}
                      </h4>
                      <span className="text-[10px] text-[#74777D] font-mono">
                        {sk.skill?.category || 'General'}
                      </span>
                    </div>

                    <span className="font-serif text-xs font-bold text-[#557B68]">
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
        <div className="bg-[#FFFFFF] p-12 rounded-lg border border-[#E5DED2] shadow-sm text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center mx-auto text-[#C78335]">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium text-[#20344A]">No Active Learning Roadmap</h3>
            <p className="text-xs text-[#74777D] leading-relaxed">
              Synthesize a tailored 5-phase statutory drafting roadmap based on your latest evaluation findings.
            </p>
          </div>
          <button
            onClick={onGenerateNew}
            className="w-full py-2.5 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
            <span>Generate 5-Phase Roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
};
