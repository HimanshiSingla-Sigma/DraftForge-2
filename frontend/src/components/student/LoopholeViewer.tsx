import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoopholeReport, Draft } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  ShieldAlert,
  ArrowRight,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Share2,
} from 'lucide-react';

interface LoopholeViewerProps {
  evaluationId?: string;
  onNavigateToWorkspace?: () => void;
  onNavigateToTutor?: () => void;
}

export const LoopholeViewer: React.FC<LoopholeViewerProps> = ({
  evaluationId: initialEvalId,
  onNavigateToWorkspace,
}) => {
  const { showToast } = useToast();
  const [report, setReport] = useState<LoopholeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

  const fetchLoopholes = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getLoopholes(id);
      setReport(res.data);
      if (res.data.loopholes?.length > 0) {
        setSelectedNodeIndex(0);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Error fetching doctrinal risk audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEvalId && initialEvalId.trim() !== '') {
      fetchLoopholes(initialEvalId);
    } else {
      setLoading(true);
      api
        .getDrafts()
        .then((res) => {
          setDrafts(res.data || []);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialEvalId]);

  const handleEvaluateAndAnalyze = async (draftId: string) => {
    setAnalyzing(true);
    try {
      const evalRes = await api.evaluateDraft(draftId);
      await fetchLoopholes(evalRes.data.id);
      showToast('Doctrinal Risk & Fallacy Audit Completed!', 'success');
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Risk audit failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || analyzing) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="xl" label="Auditing statutory dependency hierarchy & doctrinal risk exposures..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6 font-sans max-w-2xl mx-auto py-8">
        <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-lg border border-[#E5DED2] shadow-sm space-y-6 text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded bg-[#FFDAD6] border border-[#BA1A1A]/30 flex items-center justify-center mx-auto text-[#BA1A1A]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-medium text-[#20344A] tracking-tight">
              Select Draft for Doctrinal Fallacy & Risk Audit
            </h3>
            <p className="text-xs text-[#74777D] max-w-md mx-auto leading-relaxed">
              Scan dependency hierarchies to identify missing prerequisite covenants, unmitigated liabilities, and contractual vulnerabilities.
            </p>
          </div>

          {drafts.length > 0 ? (
            <div className="space-y-2 text-left pt-2">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleEvaluateAndAnalyze(d.id)}
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
                    <span>Audit Risks</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#FBF8F2] rounded border border-[#E5DED2] text-xs text-[#74777D] space-y-3">
              <p>No drafts available for analysis.</p>
              {onNavigateToWorkspace && (
                <button
                  onClick={onNavigateToWorkspace}
                  className="px-4 py-2 bg-[#20344A] text-white text-xs font-semibold rounded transition-all cursor-pointer"
                >
                  Author a Draft First
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredLoopholes = report.loopholes.filter((lh) => {
    if (severityFilter === 'ALL') return true;
    return lh.severity === severityFilter;
  });

  const activeLoophole = selectedNodeIndex !== null && report.loopholes[selectedNodeIndex]
    ? report.loopholes[selectedNodeIndex]
    : report.loopholes[0];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <header className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
                Doctrinal Fallacy & Risk Audit
              </span>
              <span className="text-xs text-[#74777D] font-mono">
                {report.document_type.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#20344A] tracking-tight">
              Structural Risk & Statutory Exposure Analysis
            </h2>
            <p className="text-xs text-[#74777D]">
              Examine prerequisite clause dependencies, enforce mandatory covenants, and mitigate legal vulnerabilities.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 bg-[#FFDAD6] border border-[#BA1A1A]/30 rounded text-xs font-semibold text-[#BA1A1A]">
              {report.high_severity_count} Critical Risks
            </div>
            <div className="px-3.5 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs text-[#20344A] font-medium">
              {report.total_loopholes} Total Observations
            </div>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#E5DED2]">
          <span className="text-xs text-[#74777D] font-medium mr-1">Filter Severity:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-[#20344A] text-white font-semibold'
                  : 'bg-[#FBF8F2] text-[#74777D] hover:text-[#20344A] border border-[#E5DED2]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </header>

      {/* Interactive Dependency Hierarchy Visualizer */}
      {report.loopholes.length > 0 && activeLoophole && (
        <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#C78335]" />
              <h3 className="font-serif font-medium text-base text-[#20344A]">
                Statutory Dependency Topology
              </h3>
            </div>
            <span className="text-[11px] text-[#74777D] font-mono">
              Cross-Referenced Statutory Framework
            </span>
          </div>

          {/* SVG Knowledge Graph Visualizer */}
          <div className="relative rounded bg-[#FBF8F2] p-6 border border-[#E5DED2] overflow-x-auto">
            <div className="min-w-[640px] flex items-center justify-between gap-4 relative py-6">
              {/* SVG Connecting Curves */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <path
                  d="M 120 60 C 200 60, 200 60, 280 60"
                  stroke="#20344A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <path
                  d="M 380 60 C 450 60, 450 60, 520 60"
                  stroke="#C78335"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              {/* Node 1: Contract Document Node */}
              <div className="relative z-10 p-4 rounded bg-white border border-[#20344A] text-center shadow-xs w-44">
                <span className="text-[10px] font-semibold text-[#20344A] block uppercase tracking-wider">
                  Document Standard
                </span>
                <span className="text-xs font-serif font-medium text-[#20344A] block truncate mt-1">
                  {report.document_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-[#557B68] mt-1 block font-semibold">
                  ● Tested Draft
                </span>
              </div>

              {/* Node 2: Missing Prerequisite Node */}
              <div className="relative z-10 p-4 rounded bg-[#FFDAD6] border border-[#BA1A1A] text-center shadow-xs w-48">
                <span className="text-[10px] font-semibold text-[#BA1A1A] block uppercase tracking-wider">
                  Missing Prerequisite
                </span>
                <span className="text-xs font-serif font-semibold text-[#BA1A1A] block truncate mt-1">
                  {activeLoophole.prerequisite_clause_name || activeLoophole.related_clause_name || 'Clause Boundary'}
                </span>
                <span className="text-[10px] text-[#BA1A1A] mt-1 block font-medium">
                  ⚠ Unmet Dependency
                </span>
              </div>

              {/* Node 3: Risk Exposure & Skill Target Node */}
              <div className="relative z-10 p-4 rounded bg-white border border-[#C78335] text-center shadow-xs w-48">
                <span className="text-[10px] font-semibold text-[#C78335] block uppercase tracking-wider">
                  Exposed Liability
                </span>
                <span className="text-xs font-serif font-medium text-[#20344A] block truncate mt-1">
                  {activeLoophole.risk_name || 'Unmitigated Exposure'}
                </span>
                <span className="text-[10px] text-[#20344A] mt-1 block truncate font-medium">
                  🎯 {activeLoophole.skill_name || 'Targeted Revision'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loopholes Cards Grid */}
      {filteredLoopholes.length === 0 ? (
        <div className="bg-[#FFFFFF] p-12 text-center rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#557B68] mx-auto" />
          <h3 className="font-serif text-lg font-medium text-[#20344A]">No Structural Vulnerabilities Detected</h3>
          <p className="text-xs text-[#74777D] max-w-md mx-auto leading-relaxed">
            The draft satisfies all prerequisite structural clauses and statutory covenants in the reference hierarchy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoopholes.map((lh, idx) => {
            const isHigh = lh.severity === 'HIGH';
            const isMedium = lh.severity === 'MEDIUM';
            const isSelected = selectedNodeIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedNodeIndex(idx)}
                className={`bg-[#FFFFFF] p-6 rounded-lg border transition-all space-y-4 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-[#20344A] ring-1 ring-[#20344A]'
                    : isHigh
                    ? 'border-[#BA1A1A]/40 hover:border-[#BA1A1A]'
                    : isMedium
                    ? 'border-[#C78335]/40 hover:border-[#C78335]'
                    : 'border-[#E5DED2] hover:border-[#20344A]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
                        isHigh
                          ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#BA1A1A]/30'
                          : 'bg-[#FBF0E4] text-[#C78335] border-[#C78335]/30'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-medium text-base text-[#20344A]">{lh.title}</h4>
                      <span className="text-[11px] text-[#74777D] font-mono">
                        Classification: {lh.gap_type}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider self-start sm:self-auto ${
                      isHigh
                        ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                        : isMedium
                        ? 'bg-[#FBF0E4] text-[#C78335]'
                        : 'bg-[#FBF8F2] text-[#20344A] border border-[#E5DED2]'
                    }`}
                  >
                    {lh.severity} RISK
                  </span>
                </div>

                <p className="text-xs text-[#43474D] leading-relaxed bg-[#FBF8F2] p-4 rounded border border-[#E5DED2]">
                  {lh.educational_observation}
                </p>

                {/* Missing Dependency Graph Flow */}
                {lh.prerequisite_clause_name && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#FBF8F2] rounded border border-[#E5DED2] text-xs">
                    <span className="text-[#BA1A1A] font-medium">{lh.related_clause_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#74777D]" />
                    <span className="text-[#74777D]">Missing Prerequisite Covenant:</span>
                    <span className="text-[#557B68] font-semibold px-2 py-0.5 rounded bg-[#E8F3ED]">
                      {lh.prerequisite_clause_name}
                    </span>
                  </div>
                )}

                {/* Risk & Skill Meta */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {lh.risk_name && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFDAD6] text-[#BA1A1A]">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Exposes: {lh.risk_name}</span>
                    </div>
                  )}

                  {lh.skill_name && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FBF8F2] border border-[#E5DED2] text-[#20344A]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
                      <span>Skill Target: {lh.skill_name}</span>
                    </div>
                  )}
                </div>

                {/* Actionable Reference Recommendation */}
                <div className="p-3.5 bg-[#FBF0E4] rounded border border-[#C78335]/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#C78335] font-semibold text-[11px] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Statutory Remediation Guidance:</span>
                  </div>
                  <p className="text-[#20344A] leading-relaxed">
                    {lh.reference_recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};