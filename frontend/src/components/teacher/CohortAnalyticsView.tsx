import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CohortAnalytics } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  Users,
  Award,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';

export const CohortAnalyticsView: React.FC = () => {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getCohortAnalytics();
      setAnalytics(res.data);
    } catch (err: any) {
      showToast('Failed to load cohort analytics intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="xl" label="Calculating cohort-wide drafting metrics & skill distributions..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-[#FFFFFF] p-12 text-center rounded-lg border border-[#E5DED2] space-y-3 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-[#C78335] mx-auto" />
        <h3 className="font-serif text-lg font-medium text-[#20344A]">No Cohort Records Detected</h3>
        <p className="text-xs text-[#74777D]">
          Cohort intelligence will populate as enrolled students complete evaluations and submit assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Cohort Intelligence
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Section Analytics
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Class-Wide Competency Distributions & Analytics
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Aggregated performance benchmarks across all enrolled students and empirical weak skill distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#20344A] px-3.5 py-1.5 bg-[#FBF8F2] rounded border border-[#E5DED2] shrink-0">
          <GraduationCap className="w-4 h-4 text-[#C78335]" />
          <span>Cohort Size: {analytics.total_students} Scholars</span>
        </div>
      </header>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#20344A]" />
            <span>Enrolled Scholars</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#20344A]">{analytics.total_students}</p>
          <span className="text-[11px] text-[#74777D] block">
            Active rostered student profiles
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#557B68]" />
            <span>Cohort Mean Score</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#557B68]">
            {analytics.cohort_average_score?.toFixed(1) || 0}
          </p>
          <span className="text-[11px] text-[#74777D] block">
            Across {analytics.total_evaluations || 0} rubric audits
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs space-y-1.5">
          <span className="text-xs font-medium text-[#74777D] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
            <span>Primary Focus Areas</span>
          </span>
          <p className="text-3xl font-serif font-bold text-[#BA1A1A]">
            {analytics.weak_skills_distribution?.length || 0}
          </p>
          <span className="text-[11px] text-[#74777D] block">
            Competencies with rating &lt; 60%
          </span>
        </div>
      </div>

      {/* Weak Skills Distribution Bar Chart */}
      <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5DED2]">
          <BarChart3 className="w-4 h-4 text-[#C78335]" />
          <div>
            <h3 className="font-serif font-medium text-base text-[#20344A]">
              Cohort Competency Gaps & Intervention Targets
            </h3>
            <p className="text-xs text-[#74777D]">
              Identifies statutory clauses and pleading structures where students require faculty guidance
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!analytics.weak_skills_distribution || analytics.weak_skills_distribution.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#74777D]">
              No critical competency gaps identified across the cohort.
            </p>
          ) : (
            analytics.weak_skills_distribution.map((ws, i) => (
              <div
                key={i}
                className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-2.5 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-serif font-medium text-sm text-[#20344A]">{ws.skill_name}</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#FFDAD6] text-[#BA1A1A] self-start sm:self-auto font-mono">
                    {ws.struggling_students_count} scholars below benchmark
                  </span>
                </div>

                <div className="w-full h-2 bg-[#E5DED2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#BA1A1A] to-[#C78335] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(5, ws.average_proficiency)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#74777D]">
                  <span>Class Average Proficiency:</span>
                  <span className="text-[#20344A] font-semibold">{ws.average_proficiency.toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};