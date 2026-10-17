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
        <LoadingSpinner size="xl" label="Calculating class-wide drafting metrics & skill distributions..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="tactile-card bg-[#FAF8F5] p-12 text-center rounded-3xl border-2 border-[#E6E2D8] space-y-3 shadow-[0_4px_#E6E2D8]">
        <AlertTriangle className="w-12 h-12 text-[#F59E0B] mx-auto" />
        <h3 className="font-serif text-base font-bold text-[#0B192C]">No Cohort Data Recorded</h3>
        <p className="text-xs text-[#0B192C]/60">
          Cohort intelligence will populate as enrolled students complete evaluations and submit assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl tactile-card bg-[#FAF8F5] border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C] tracking-tight">Cohort Intelligence & Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/30 font-mono">
              Class-Wide Metrics
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1">
            Aggregated performance benchmarks across all enrolled students and empirical weak skill distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0B192C] px-3.5 py-2 bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8]">
          <GraduationCap className="w-4 h-4 text-[#1E3E62]" />
          <span>Cohort Size: {analytics.total_students} Students</span>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="tactile-card bg-[#FAF8F5] p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-bold text-[#0B192C]/70 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#1E3E62]" />
            <span>Enrolled Students</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-[#0B192C]">{analytics.total_students}</p>
          <span className="text-[10px] text-[#0B192C]/50 font-mono block">
            Active student profiles
          </span>
        </div>

        <div className="tactile-card bg-[#FAF8F5] p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-bold text-[#0B192C]/70 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Cohort Average Score</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-emerald-700">
            {analytics.cohort_average_score?.toFixed(1) || 0}
          </p>
          <span className="text-[10px] text-[#0B192C]/50 font-mono block">
            Across {analytics.total_evaluations || 0} automated evaluations
          </span>
        </div>

        <div className="tactile-card bg-[#FAF8F5] p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-2">
          <span className="text-xs font-bold text-[#0B192C]/70 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span>Critical Weak Skill Areas</span>
          </span>
          <p className="text-3xl font-serif font-extrabold text-red-700">
            {analytics.weak_skills_distribution?.length || 0}
          </p>
          <span className="text-[10px] text-[#0B192C]/50 font-mono block">
            Skills with proficiency &lt; 60%
          </span>
        </div>
      </div>

      {/* Weak Skills Distribution Bar Chart */}
      <div className="tactile-card bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-[#E6E2D8]">
          <BarChart3 className="w-5 h-5 text-[#1E3E62]" />
          <div>
            <h3 className="font-serif font-bold text-base text-[#0B192C]">
              Cohort Weak-Skill Distribution & Struggling Students
            </h3>
            <p className="text-xs text-[#0B192C]/70">
              Identifies statutory clauses where students need faculty intervention or targeted lessons
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!analytics.weak_skills_distribution || analytics.weak_skills_distribution.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#0B192C]/50">
              No critical weak skills detected in the cohort.
            </p>
          ) : (
            analytics.weak_skills_distribution.map((ws, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] space-y-3 shadow-[0_2px_#E6E2D8]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-serif font-bold text-sm text-[#0B192C]">{ws.skill_name}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 self-start sm:self-auto font-mono">
                    {ws.struggling_students_count} students struggling
                  </span>
                </div>

                <div className="w-full h-3 bg-[#FAF8F5] rounded-full overflow-hidden border-2 border-[#E6E2D8]">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-[#F59E0B] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(5, ws.average_proficiency)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#0B192C]/70">
                  <span>Class Average Proficiency:</span>
                  <span className="text-[#0B192C] font-bold">{ws.average_proficiency.toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};