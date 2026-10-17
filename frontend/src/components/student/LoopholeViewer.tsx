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
  Network,
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
      showToast(err.response?.data?.detail || 'Error fetching graph loopholes', 'error');
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
      showToast('Neo4j Graph Traversal & Risk Audit Completed!', 'success');
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Graph analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || analyzing) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="xl" label="Traversing Neo4j Aura Graph Dependency Topology..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-6 text-center max-w-xl mx-auto animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Network className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Select Draft for Neo4j Graph Loophole Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Traverse dependency chains and identify missing prerequisite clauses, statutory risk exposures, and legal loopholes.
          </p>
        </div>

        {drafts.length > 0 ? (
          <div className="space-y-2.5 text-left pt-2">
            {drafts.map((d) => (
              <div
                key={d.id}
                onClick={() => handleEvaluateAndAnalyze(d.id)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer flex items-center justify-between transition-all group"
              >
                <div>
                  <span className="font-bold text-xs text-white group-hover:text-rose-300 transition-colors">
                    {d.title}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                    {d.document_type.replace(/_/g, ' ')} • {d.versions?.length || 1} Revisions
                  </span>
                </div>
                <button className="px-3.5 py-1.5 bg-rose-500/10 text-rose-300 group-hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                  <span>Audit Graph</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-3">
            <p>No drafts available for analysis.</p>
            {onNavigateToWorkspace && (
              <button
                onClick={onNavigateToWorkspace}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Create a Draft
              </button>
            )}
          </div>
        )}
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
      <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 flex items-center justify-center text-[#DC2626] shrink-0">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#0B192C]/60 uppercase tracking-wider font-mono">
                  Neo4j Graph Reasoning
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 font-mono">
                  {report.document_type}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-extrabold text-[#0B192C] tracking-tight mt-0.5">
                GraphRAG Structural Loophole Analysis
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#FEF2F2] border-2 border-[#DC2626]/30 rounded-2xl text-xs font-bold text-[#DC2626] font-mono shadow-sm">
              {report.high_severity_count} High Severity Risks
            </div>
            <div className="px-4 py-2 bg-[#F3F0EA] border-2 border-[#E6E2D8] rounded-2xl text-xs font-bold text-[#0B192C] font-mono">
              {report.total_loopholes} Total Gaps
            </div>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t-2 border-[#E6E2D8]">
          <span className="text-xs text-[#0B192C]/70 font-semibold mr-2 font-mono">Filter Severity:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`tactile-btn px-3.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                  : 'bg-[#F3F0EA] text-[#0B192C]/70 hover:text-[#0B192C] border-2 border-[#E6E2D8]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Graph Topology Visualizer (Only if loopholes exist) */}
      {report.loopholes.length > 0 && activeLoophole && (
        <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#E6E2D8] pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#1E3E62]" />
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#0B192C] tracking-tight">
                Interactive Graph Knowledge Topology
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#0B192C]/60">
              Traversed from Neo4j Aura Graph Database
            </span>
          </div>

          {/* SVG Knowledge Graph Visualizer */}
          <div className="relative rounded-2xl bg-[#FAF8F5] p-6 border-2 border-[#E6E2D8] overflow-x-auto shadow-inner">
            <div className="min-w-[650px] flex items-center justify-between gap-4 relative py-8">
              {/* SVG Connecting Curves */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <path
                  d="M 100 70 C 180 70, 180 70, 260 70"
                  stroke="#1E3E62"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <path
                  d="M 370 70 C 440 70, 440 70, 520 70"
                  stroke="#DC2626"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              {/* Node 1: Contract Document Node */}
              <div className="relative z-10 p-4 rounded-2xl bg-white border-2 border-[#1E3E62] text-center shadow-[0_3px_#1E3E62] w-44">
                <span className="text-[9px] font-mono font-bold text-[#1E3E62] block uppercase">
                  DOCUMENT NODE
                </span>
                <span className="text-xs font-serif font-bold text-[#0B192C] block truncate mt-1">
                  {report.document_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] font-mono text-[#059669] mt-1 block font-bold">
                  ● Tested Draft
                </span>
              </div>

              {/* Node 2: Missing Prerequisite Node */}
              <div className="relative z-10 p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626] text-center shadow-[0_3px_#DC2626] w-48 animate-pulse-glow">
                <span className="text-[9px] font-mono font-bold text-[#DC2626] block uppercase">
                  MISSING PREREQUISITE
                </span>
                <span className="text-xs font-serif font-extrabold text-[#0B192C] block truncate mt-1">
                  {activeLoophole.prerequisite_clause_name || activeLoophole.related_clause_name || 'Clause Boundary'}
                </span>
                <span className="text-[9px] font-mono text-[#DC2626] mt-1 block font-bold">
                  ⚠ Unmet Dependency
                </span>
              </div>

              {/* Node 3: Risk Exposure & Skill Target Node */}
              <div className="relative z-10 p-4 rounded-2xl bg-white border-2 border-[#F59E0B] text-center shadow-[0_3px_#F59E0B] w-48">
                <span className="text-[9px] font-mono font-bold text-[#B45309] block uppercase">
                  EXPOSED RISK
                </span>
                <span className="text-xs font-serif font-bold text-[#0B192C] block truncate mt-1">
                  {activeLoophole.risk_name || 'Unmitigated Liability'}
                </span>
                <span className="text-[9px] font-mono text-[#1E3E62] mt-1 block truncate font-bold">
                  🎯 {activeLoophole.skill_name || 'Remedial Drafting'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loopholes Cards Grid */}
      {filteredLoopholes.length === 0 ? (
        <div className="tactile-card bg-white p-12 text-center rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#0B192C]">No Gaps Detected</h3>
          <p className="text-xs text-[#0B192C]/70 max-w-md mx-auto font-sans">
            The draft satisfies all prerequisite structural nodes and unmitigated risk relationships in the knowledge graph.
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
                className={`tactile-card bg-white p-6 rounded-3xl border-2 transition-all space-y-4 cursor-pointer ${
                  isSelected
                    ? 'border-[#1E3E62] shadow-[0_6px_#1E3E62]'
                    : isHigh
                    ? 'border-[#DC2626]/40 shadow-[0_4px_#E6E2D8] hover:border-[#DC2626]'
                    : isMedium
                    ? 'border-[#F59E0B]/40 shadow-[0_4px_#E6E2D8] hover:border-[#F59E0B]'
                    : 'border-[#E6E2D8] shadow-[0_4px_#E6E2D8] hover:border-[#1E3E62]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                        isHigh
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                          : 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/30'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#0B192C]">{lh.title}</h4>
                      <span className="text-[10px] font-mono text-[#0B192C]/60">
                        Gap Type: {lh.gap_type}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono self-start sm:self-auto border-2 ${
                      isHigh
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/40'
                        : isMedium
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/40'
                        : 'bg-[#F3F0EA] text-[#0B192C] border-[#E6E2D8]'
                    }`}
                  >
                    {lh.severity} RISK
                  </span>
                </div>

                <p className="text-xs text-[#0B192C]/80 leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border-2 border-[#E6E2D8] font-sans">
                  {lh.educational_observation}
                </p>

                {/* Missing Dependency Graph Flow */}
                {lh.prerequisite_clause_name && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8] text-xs font-mono">
                    <span className="text-[#DC2626] font-bold">{lh.related_clause_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0B192C]/50" />
                    <span className="text-[#0B192C]/70">Missing Prerequisite Node:</span>
                    <span className="text-[#059669] font-bold px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#10B981]/30">
                      {lh.prerequisite_clause_name}
                    </span>
                  </div>
                )}

                {/* Risk & Skill Meta */}
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  {lh.risk_name && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 text-[#DC2626] font-mono">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Exposes: {lh.risk_name}</span>
                    </div>
                  )}

                  {lh.skill_name && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] border-2 border-[#1E3E62]/30 text-[#1E3E62] font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Skill Target: {lh.skill_name}</span>
                    </div>
                  )}
                </div>

                {/* Actionable Reference Recommendation */}
                <div className="p-4 bg-[#FFFBEB] rounded-2xl border-2 border-[#F59E0B]/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#B45309] font-bold text-[11px] uppercase tracking-wider font-mono">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Statutory Remediation Advice:</span>
                  </div>
                  <p className="text-[#0B192C]/80 leading-relaxed font-sans">
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