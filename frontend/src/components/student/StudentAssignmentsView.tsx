import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Assignment, Draft } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  FileCheck,
  Calendar,
  Send,
  AlertCircle,
  Search,
  BookOpen,
} from 'lucide-react';

interface StudentAssignmentsViewProps {
  onSelectEvaluation?: (evalId: string) => void;
  onNavigateToWorkspace?: () => void;
}

export const StudentAssignmentsView: React.FC<StudentAssignmentsViewProps> = ({
  onNavigateToWorkspace,
}) => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, dRes] = await Promise.all([
        api.getAssignments(),
        api.getDrafts(),
      ]);
      setAssignments(aRes.data || []);
      setDrafts(dRes.data || []);
      if (aRes.data?.length > 0 && !selectedAssignment) {
        setSelectedAssignment(aRes.data[0]);
      }
      if (dRes.data?.length > 0 && !selectedDraftId) {
        setSelectedDraftId(dRes.data[0].id);
        const versions = dRes.data[0].versions || [];
        if (versions.length > 0) {
          setSelectedVersion(versions[versions.length - 1].version_number);
        }
      }
    } catch (err: any) {
      showToast('Failed to load coursework assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
    const draft = drafts.find((d) => d.id === draftId);
    if (draft && draft.versions?.length > 0) {
      setSelectedVersion(draft.versions[draft.versions.length - 1].version_number);
    }
  };

  const selectedDraftObj = drafts.find((d) => d.id === selectedDraftId);
  const selectedVersionObj = selectedDraftObj?.versions?.find(
    (v) => v.version_number === Number(selectedVersion)
  ) || selectedDraftObj?.versions?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !selectedDraftId || !selectedVersionObj) {
      showToast('Please select an assignment and a draft version.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitAssignment({
        assignment_id: selectedAssignment.id,
        draft_id: selectedDraftId,
        draft_version_id: selectedVersionObj.id,
      });
      showToast('Draft version submitted successfully for faculty review!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Assignment submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.instructions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl tactile-card bg-[#FAF8F5] border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C] tracking-tight">Class Coursework & Assignments</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30 font-mono">
              Faculty Published
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1">
            Complete legal drafting briefs assigned by your professor and submit versioned drafts for grading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[#0B192C] px-3.5 py-2 bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8]">
            Active Tasks: <span className="text-[#1E3E62] font-bold">{assignments.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Assignments List (5 cols) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="tactile-card bg-[#FAF8F5] p-5 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#E6E2D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B192C]/70">
                Coursework Catalog ({assignments.length})
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#0B192C]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl pl-8 pr-3 py-2 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none transition-colors"
              />
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#0B192C]/60 space-y-2">
                <BookOpen className="w-8 h-8 text-[#0B192C]/30 mx-auto" />
                <p>No active assignments published by faculty.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filtered.map((a) => {
                  const isSelected = selectedAssignment?.id === a.id;
                  const isOverdue = a.deadline && new Date(a.deadline) < new Date();

                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAssignment(a)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'bg-[#1E3E62]/10 border-[#1E3E62] text-[#0B192C] shadow-[0_3px_#1E3E62]'
                          : 'bg-[#F3F0EA] border-[#E6E2D8] text-[#0B192C] hover:border-[#1E3E62]/40 shadow-[0_2px_#E6E2D8]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1E3E62] border border-[#1E3E62]/30">
                          {a.document_type.replace(/_/g, ' ')}
                        </span>
                        {a.deadline && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-[#FAF8F5] text-[#0B192C]/70 border border-[#E6E2D8]'
                            }`}
                          >
                            Due {new Date(a.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#0B192C]">{a.title}</h4>
                      <p className="text-xs text-[#0B192C]/70 line-clamp-2 leading-relaxed">
                        {a.instructions}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-[#0B192C]/60 pt-2 border-t border-[#E6E2D8]">
                        <span>Status: <strong className="text-[#0B192C] uppercase">{a.status}</strong></span>
                        <span>{a.submissions_count || 0} Submissions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignment Details & Submission Tool (7 cols) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {selectedAssignment ? (
            <div className="tactile-card bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-6">
              {/* Assignment Brief Header */}
              <div className="space-y-3 pb-5 border-b-2 border-[#E6E2D8]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30">
                    {selectedAssignment.document_type.replace(/_/g, ' ')}
                  </span>

                  {selectedAssignment.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-[#D97706] font-mono font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-serif font-bold text-[#0B192C] tracking-tight">
                  {selectedAssignment.title}
                </h2>
                {selectedAssignment.description && (
                  <p className="text-xs text-[#0B192C]/80 font-medium">
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* Instructions Callout */}
              <div className="p-5 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] space-y-2">
                <div className="flex items-center gap-2 text-[#1E3E62] font-bold text-xs uppercase tracking-wider">
                  <FileCheck className="w-4 h-4" />
                  <span>Drafting Instructions & Rubric Constraints</span>
                </div>
                <p className="text-xs text-[#0B192C] leading-relaxed whitespace-pre-line font-mono bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E2D8]">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-[#F3F0EA]/70 border-2 border-[#E6E2D8] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B192C]">
                    Submit Draft for Assignment
                  </h4>
                  {onNavigateToWorkspace && (
                    <button
                      type="button"
                      onClick={onNavigateToWorkspace}
                      className="text-xs text-[#1E3E62] hover:underline font-bold"
                    >
                      Open Workspace Editor →
                    </button>
                  )}
                </div>

                {drafts.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>You have not created any drafts yet. Create one in the Workspace first.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B192C] mb-1.5">
                        Select Workspace Draft
                      </label>
                      <select
                        value={selectedDraftId}
                        onChange={(e) => handleSelectDraft(e.target.value)}
                        className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                      >
                        {drafts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({d.document_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B192C] mb-1.5">
                        Revision Version
                      </label>
                      <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
                      >
                        {selectedDraftObj?.versions?.map((v) => (
                          <option key={v.id} value={v.version_number}>
                            Version {v.version_number} ({new Date(v.created_at).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || drafts.length === 0}
                  className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152e4a] text-white font-bold text-xs rounded-xl shadow-[0_3px_#0B192C] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                  <span>Submit Version {selectedVersion} for Faculty Evaluation</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="tactile-card bg-[#FAF8F5] p-16 text-center rounded-3xl border-2 border-[#E6E2D8] text-xs text-[#0B192C]/60 space-y-2 shadow-[0_4px_#E6E2D8]">
              <BookOpen className="w-10 h-10 text-[#0B192C]/30 mx-auto" />
              <p>Select an assignment from the left catalog to inspect instructions and submit your work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
