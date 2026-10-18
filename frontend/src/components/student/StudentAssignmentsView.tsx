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
  ArrowRight,
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
      showToast('Please select an assignment and a draft revision.', 'error');
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Academic Coursework Docket
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Faculty Published
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Assigned Legal Briefs & Submissions
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Complete formal drafting assignments prescribed by faculty and submit versioned drafts for rubric evaluation.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs font-mono text-[#20344A] shrink-0">
          Pending Briefs: <strong className="text-[#C78335]">{assignments.length}</strong>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Assignments List (5 cols) */}
        <div className="col-span-12 lg:col-span-5 bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74777D]">
              Coursework Catalog ({assignments.length})
            </span>
            <span className="text-[11px] text-[#74777D] font-mono">Curriculum v4.2</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assigned briefs..."
              className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-7 pr-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none transition-colors"
            />
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#74777D] space-y-2">
              <BookOpen className="w-8 h-8 text-[#74777D]/30 mx-auto" />
              <p>No active coursework assignments published yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filtered.map((a) => {
                const isSelected = selectedAssignment?.id === a.id;
                const isOverdue = a.deadline && new Date(a.deadline) < new Date();

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAssignment(a)}
                    className={`p-3.5 rounded border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#FBF0E4] border-[#C78335] text-[#20344A]'
                        : 'bg-[#FBF8F2] border-[#E5DED2] text-[#20344A] hover:border-[#74777D]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#20344A] border border-[#E5DED2]">
                        {a.document_type.replace(/_/g, ' ')}
                      </span>
                      {a.deadline && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                              : 'bg-white text-[#74777D] border border-[#E5DED2]'
                          }`}
                        >
                          Due {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-medium text-sm text-[#20344A]">{a.title}</h4>
                    <p className="text-xs text-[#43474D] line-clamp-2 leading-relaxed">
                      {a.instructions}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#74777D] pt-2 border-t border-[#E5DED2]">
                      <span>Status: <strong className="text-[#20344A] uppercase">{a.status}</strong></span>
                      <span>{a.submissions_count || 0} Submissions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Assignment Details & Submission Tool (7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-6">
          {selectedAssignment ? (
            <div className="space-y-5">
              {/* Assignment Brief Header */}
              <div className="space-y-2 pb-4 border-b border-[#E5DED2]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30">
                    {selectedAssignment.document_type.replace(/_/g, ' ')}
                  </span>

                  {selectedAssignment.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-[#C78335] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Filing Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#20344A] tracking-tight">
                  {selectedAssignment.title}
                </h2>
                {selectedAssignment.description && (
                  <p className="text-xs text-[#74777D]">
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-2">
                <div className="flex items-center gap-1.5 text-[#20344A] font-semibold text-xs uppercase tracking-wider">
                  <FileCheck className="w-4 h-4 text-[#C78335]" />
                  <span>Drafting Directives & Rubric Constraints</span>
                </div>
                <p className="text-xs text-[#20344A] leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-[#E5DED2]">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="p-5 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-medium text-sm text-[#20344A]">
                    Submit Authored Draft
                  </h4>
                  {onNavigateToWorkspace && (
                    <button
                      type="button"
                      onClick={onNavigateToWorkspace}
                      className="text-xs text-[#C78335] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Open in Draft Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {drafts.length === 0 ? (
                  <div className="p-3.5 bg-[#FBF0E4] border border-[#C78335]/30 rounded text-xs text-[#20344A] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C78335]" />
                    <span>No drafts available in your docket. Please author a draft in the studio first.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#20344A] mb-1">
                        Select Docket Draft
                      </label>
                      <select
                        value={selectedDraftId}
                        onChange={(e) => handleSelectDraft(e.target.value)}
                        className="w-full bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                      >
                        {drafts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({d.document_type.replace(/_/g, ' ')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#20344A] mb-1">
                        Revision Number
                      </label>
                      <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(Number(e.target.value))}
                        className="w-full bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
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
                  className="w-full py-2.5 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : <Send className="w-3.5 h-3.5 text-[#C78335]" />}
                  <span>Submit Version {selectedVersion} for Evaluation</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-[#74777D] space-y-2">
              <BookOpen className="w-8 h-8 text-[#74777D]/30 mx-auto" />
              <p>Select an assignment prompt from the docket on the left to inspect guidelines and submit your brief.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
