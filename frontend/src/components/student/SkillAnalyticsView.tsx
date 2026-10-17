import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProgress, LeaderboardEntry, StudentSkill } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Layers,
  Crown,
  Compass,
} from 'lucide-react';

export const SkillAnalyticsView: React.FC = () => {
  const { showToast } = useToast();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, lRes, sRes] = await Promise.all([
        api.getProgress().catch(() => ({ data: null })),
        api.getLeaderboard().catch(() => ({ data: { entries: [] } })),
        api.getSkills().catch(() => ({ data: [] })),
      ]);
      setProgress(pRes.data);
      setLeaderboard(lRes.data?.entries || (Array.isArray(lRes.data) ? lRes.data : []));
      setSkills(sRes.data || []);
    } catch (err: any) {
      showToast('Failed to aggregate student analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="xl" label="Aggregating continuous evaluation analytics & standings..." />
      </div>
    );
  }

  const averageScore = progress?.average_score || 0;
  const scoreHistory = progress?.score_history || [];
  const docAverages = progress?.document_type_averages || {};

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl tactile-card bg-white border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0B192C] tracking-tight">
              Drafting Proficiency & Skill Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0FDF4] text-[#059669] border border-[#10B981]/30 font-mono">
              Continuous EMA Evaluation
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1 font-sans">
            Track your score trajectories across revisions, document category averages, and classroom standing.
          </p>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="tactile-card bg-white p-5 rounded-2xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-semibold text-[#0B192C]/70 flex items-center gap-1.5 font-sans">
            <Award className="w-4 h-4 text-[#059669]" />
            <span>Average Evaluation Score</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-[#0B192C]">
            {averageScore.toFixed(1)} <span className="text-xs font-normal text-[#0B192C]/50 font-sans">/ 100</span>
          </p>
          <span className="text-[10px] text-[#0B192C]/60 font-mono block">
            Across {progress?.total_evaluations || 0} evaluated drafts
          </span>
        </div>

        <div className="tactile-card bg-white p-5 rounded-2xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-semibold text-[#0B192C]/70 flex items-center gap-1.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-[#1E3E62]" />
            <span>Mastered Skills</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-[#1E3E62]">
            {progress?.mastered_skills_count || 0}
          </p>
          <span className="text-[10px] text-[#0B192C]/60 font-mono block">
            Proficiency Score ≥ 75%
          </span>
        </div>

        <div className="tactile-card bg-white p-5 rounded-2xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-semibold text-[#0B192C]/70 flex items-center gap-1.5 font-sans">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span>Target Areas</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-[#DC2626]">
            {progress?.weak_skills_count || 0}
          </p>
          <span className="text-[10px] text-[#0B192C]/60 font-mono block">
            Proficiency Score &lt; 60%
          </span>
        </div>

        <div className="tactile-card bg-white p-5 rounded-2xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-semibold text-[#0B192C]/70 flex items-center gap-1.5 font-sans">
            <TrendingUp className="w-4 h-4 text-[#B45309]" />
            <span>Skill Trajectory</span>
          </span>
          <p className="text-xl font-serif font-bold text-[#B45309] my-1">CALIBRATING</p>
          <span className="text-[10px] text-[#0B192C]/60 font-mono block">
            Active RAG & Neo4j Grounded
          </span>
        </div>
      </div>

      {/* Skill Galaxy & Legal DNA Visualization */}
      {skills.length > 0 && (
        <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#1E3E62]" />
              <h3 className="font-serif font-bold text-base text-[#0B192C]">
                Legal DNA & Skill Galaxy ({skills.length} Active Vectors)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#0B192C]/60">
              Exponential Moving Average (EMA) Scoring
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((sk) => {
              const isMastered = sk.proficiency_score >= 75;
              const isDeveloping = sk.proficiency_score >= 50 && sk.proficiency_score < 75;

              return (
                <div
                  key={sk.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] hover:border-[#1E3E62] space-y-2 transition-all shadow-[0_2px_#E6E2D8]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#0B192C] border border-[#E6E2D8]">
                      {sk.skill?.category || 'LEGAL'}
                    </span>
                    <span
                      className={`text-xs font-mono font-extrabold ${
                        isMastered ? 'text-[#059669]' : isDeveloping ? 'text-[#B45309]' : 'text-[#DC2626]'
                      }`}
                    >
                      {Math.round(sk.proficiency_score)}%
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-xs text-[#0B192C] truncate">
                    {sk.skill?.name || 'Statutory Drafting'}
                  </h4>

                  {/* Proficiency Bar */}
                  <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMastered
                          ? 'bg-[#10B981]'
                          : isDeveloping
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${Math.min(100, sk.proficiency_score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left 6 Cols: Score Trajectory History & Category Averages */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Score Trajectory Sparkline */}
          <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#E6E2D8]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#059669]" />
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#0B192C]">
                  Score Progression Across Evaluations
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#0B192C]/60">
                {scoreHistory.length} Submissions
              </span>
            </div>

            {scoreHistory.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-2 h-36 pt-4 px-2">
                  {scoreHistory.map((score, idx) => {
                    const heightPercent = Math.max(10, Math.min(100, score));
                    const isHigh = score >= 75;
                    const isMed = score >= 50;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B192C] text-[#FAF8F5] font-mono text-[10px] px-2 py-0.5 rounded border border-[#0B192C] pointer-events-none whitespace-nowrap z-10 shadow-md">
                          Eval #{idx + 1}: {score} pts
                        </div>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isHigh
                              ? 'bg-[#10B981]'
                              : isMed
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#DC2626]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] font-mono text-[#0B192C]/50">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#0B192C]/50 font-sans">
                Complete more evaluations to populate your score trajectory.
              </div>
            )}
          </div>

          {/* Document Type Category Averages */}
          <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#E6E2D8]">
              <Layers className="w-4 h-4 text-[#1E3E62]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#0B192C]">
                Performance by Document Category
              </h3>
            </div>

            <div className="space-y-3">
              {Object.keys(docAverages).length === 0 ? (
                <div className="text-center py-6 text-xs text-[#0B192C]/50 font-sans">
                  No category averages recorded yet.
                </div>
              ) : (
                Object.entries(docAverages).map(([type, avg]) => (
                  <div key={type} className="p-3.5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#0B192C] font-serif">{type.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[#059669] font-bold">{avg.toFixed(1)} pts</span>
                    </div>
                    <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
                      <div
                        className="h-full bg-[#1E3E62] rounded-full"
                        style={{ width: `${Math.min(100, avg)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Global Classroom Leaderboard */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E6E2D8]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-serif font-bold text-base text-[#0B192C]">
                  Classroom Standings & Leaderboard
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#0B192C]/60">
                {leaderboard.length} Ranked Peers
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0B192C]/50 font-sans">
                  Leaderboard rankings will update as students complete draft evaluations.
                </div>
              ) : (
                leaderboard.map((entry, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;

                  return (
                    <div
                      key={entry.user_id || idx}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        isFirst
                          ? 'bg-[#FFFBEB] border-[#F59E0B] shadow-[0_3px_#F59E0B]'
                          : isSecond
                          ? 'bg-[#F3F0EA] border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                          : isThird
                          ? 'bg-[#FAF8F5] border-[#E6E2D8] shadow-[0_2px_#E6E2D8]'
                          : 'bg-white border-[#E6E2D8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isFirst
                              ? 'bg-[#F59E0B] text-[#0B192C] border-[#B45309]'
                              : isSecond
                              ? 'bg-[#E6E2D8] text-[#0B192C] border-[#0B192C]/20'
                              : isThird
                              ? 'bg-[#B45309] text-white border-[#B45309]'
                              : 'bg-[#F3F0EA] text-[#0B192C] font-mono text-[11px] border-[#E6E2D8]'
                          }`}
                        >
                          {isFirst ? (
                            <Crown className="w-4 h-4 text-[#0B192C]" />
                          ) : (
                            `#${idx + 1}`
                          )}
                        </div>

                        <div>
                          <p className="font-serif font-bold text-xs text-[#0B192C]">
                            {entry.full_name || `Student ${entry.user_id?.substring(0, 6)}`}
                          </p>
                          <span className="text-[10px] text-[#0B192C]/60 font-mono">
                            {entry.evaluations_completed || 0} evaluations
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-[#059669]">
                          {entry.average_score?.toFixed(1) || 0}
                        </span>
                        <span className="text-[10px] text-[#0B192C]/60 block font-mono">
                          pts avg
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};