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
        <LoadingSpinner size="xl" label="Aggregating continuous legal proficiency analytics & standings..." />
      </div>
    );
  }

  const averageScore = progress?.average_score || 0;
  const scoreHistory = progress?.score_history || [];
  const docAverages = progress?.document_type_averages || {};

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Academic Proficiency
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Continuous Assessment
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Legal Drafting Proficiency & Skill Growth
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Monitor score trajectories across revisions, analyze competency distributions, and compare cohort progress.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs font-mono text-[#20344A] shrink-0">
          Cohort Benchmark: <strong className="text-[#557B68]">{averageScore.toFixed(1)} / 100</strong>
        </div>
      </header>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#557B68]" />
            <span>Mean Audit Score</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#20344A]">
            {averageScore.toFixed(1)} <span className="text-xs font-normal text-[#74777D] font-sans">/ 100</span>
          </p>
          <span className="text-[11px] text-[#74777D] block">
            Across {progress?.total_evaluations || 0} evaluated drafts
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#20344A]" />
            <span>Mastered Competencies</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#20344A]">
            {progress?.mastered_skills_count || 0}
          </p>
          <span className="text-[11px] text-[#557B68] block">
            Proficiency Rating ≥ 75%
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
            <span>Focus Areas</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#BA1A1A]">
            {progress?.weak_skills_count || 0}
          </p>
          <span className="text-[11px] text-[#74777D] block">
            Proficiency Rating &lt; 60%
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#C78335]" />
            <span>Learning Trajectory</span>
          </span>
          <p className="text-xl font-serif font-medium text-[#C78335] my-1">Advancing</p>
          <span className="text-[11px] text-[#74777D] block">
            Continuous Rubric Calibration
          </span>
        </div>
      </div>

      {/* Core Competencies Grid */}
      {skills.length > 0 && (
        <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C78335]" />
              <h3 className="font-serif font-medium text-base text-[#20344A]">
                Assessed Legal Competencies ({skills.length} Indicators)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#74777D]">
              Weighted Performance Model
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((sk) => {
              const isMastered = sk.proficiency_score >= 75;
              const isDeveloping = sk.proficiency_score >= 50 && sk.proficiency_score < 75;

              return (
                <div
                  key={sk.id}
                  className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] hover:border-[#20344A] space-y-2 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#20344A] border border-[#E5DED2]">
                      {sk.skill?.category || 'LEGAL'}
                    </span>
                    <span
                      className={`text-xs font-serif font-bold ${
                        isMastered ? 'text-[#557B68]' : isDeveloping ? 'text-[#C78335]' : 'text-[#BA1A1A]'
                      }`}
                    >
                      {Math.round(sk.proficiency_score)}%
                    </span>
                  </div>

                  <h4 className="font-serif font-medium text-sm text-[#20344A] truncate">
                    {sk.skill?.name || 'Statutory Drafting'}
                  </h4>

                  {/* Proficiency Bar */}
                  <div className="w-full h-1.5 bg-[#E5DED2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMastered
                          ? 'bg-[#557B68]'
                          : isDeveloping
                          ? 'bg-[#C78335]'
                          : 'bg-[#BA1A1A]'
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
        {/* Left Column: Score Trajectory & Category Averages */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Score Trajectory Sparkline */}
          <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#557B68]" />
                <h3 className="font-serif font-medium text-sm text-[#20344A]">
                  Evaluation Progression Across Revisions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#74777D]">
                {scoreHistory.length} Recorded Submissions
              </span>
            </div>

            {scoreHistory.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-2.5 h-36 pt-4 px-2">
                  {scoreHistory.map((score, idx) => {
                    const heightPercent = Math.max(10, Math.min(100, score));
                    const isHigh = score >= 75;
                    const isMed = score >= 50;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#20344A] text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-sm font-sans">
                          Draft #{idx + 1}: {score} pts
                        </div>
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${
                            isHigh
                              ? 'bg-[#557B68]'
                              : isMed
                              ? 'bg-[#C78335]'
                              : 'bg-[#BA1A1A]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-mono text-[#74777D]">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#74777D]">
                Complete more evaluations to populate your score trajectory.
              </div>
            )}
          </div>

          {/* Document Type Category Averages */}
          <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5DED2]">
              <Layers className="w-4 h-4 text-[#20344A]" />
              <h3 className="font-serif font-medium text-sm text-[#20344A]">
                Proficiency by Document Type
              </h3>
            </div>

            <div className="space-y-3">
              {Object.keys(docAverages).length === 0 ? (
                <div className="text-center py-6 text-xs text-[#74777D]">
                  No category averages recorded yet.
                </div>
              ) : (
                Object.entries(docAverages).map(([type, avg]) => (
                  <div key={type} className="p-3 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#20344A] font-serif font-medium">{type.replace(/_/g, ' ')}</span>
                      <span className="font-serif text-[#557B68] font-bold">{avg.toFixed(1)} pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5DED2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#20344A] rounded-full"
                        style={{ width: `${Math.min(100, avg)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Classroom Standings */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#C78335]" />
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Classroom Standings & Honor Roll
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#74777D]">
                {leaderboard.length} Ranked Scholars
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#74777D]">
                  Classroom rankings will populate as students complete draft evaluations.
                </div>
              ) : (
                leaderboard.map((entry, idx) => {
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={entry.user_id || idx}
                      className={`p-3.5 rounded border transition-all flex items-center justify-between ${
                        isFirst
                          ? 'bg-[#FBF0E4] border-[#C78335] text-[#20344A]'
                          : 'bg-[#FBF8F2] border-[#E5DED2] text-[#20344A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                            isFirst
                              ? 'bg-[#C78335] text-white'
                              : 'bg-white text-[#74777D] border border-[#E5DED2]'
                          }`}
                        >
                          {isFirst ? (
                            <Crown className="w-3.5 h-3.5 text-white" />
                          ) : (
                            `#${idx + 1}`
                          )}
                        </div>

                        <div>
                          <p className="font-serif font-medium text-xs text-[#20344A]">
                            {entry.full_name || `Scholar ${entry.user_id?.substring(0, 6)}`}
                          </p>
                          <span className="text-[10px] text-[#74777D] font-mono">
                            {entry.evaluations_completed || 0} evaluations
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-serif font-bold text-sm text-[#557B68]">
                          {entry.average_score?.toFixed(1) || 0}
                        </span>
                        <span className="text-[10px] text-[#74777D] block">
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