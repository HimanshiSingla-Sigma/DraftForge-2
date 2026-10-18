import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Submission, Assignment } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  FileCheck,
  ShieldAlert,
  FileText,
  Save,
  Scale,
} from 'lucide-react';

export const SubmissionsAuditor: React.FC<{ assignmentId?: string }> = ({
  assignmentId: initialAssignmentId,
}) => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(initialAssignmentId || '');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [overrideScore, setOverrideScore] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  useEffect(() => {
    api
      .getTeacherAssignments()
      .then((res) => {
        setAssignments(res.data || []);
        if (!selectedAssignmentId && res.data?.length > 0) {
          setSelectedAssignmentId(res.data[0].id);
        }
      })
      .catch(() => showToast('Failed to load assignments', 'error'));
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      setLoading(true);
      api
        .getAssignmentSubmissions(selectedAssignmentId)
        .then((res) => {
          setSubmissions(res.data || []);
          if (res.data?.length > 0) {
            const first = res.data[0];
            setSelectedSub(first);
            setOverrideScore(first.final_score ?? first.evaluation?.overall_score ?? 0);
            setTeacherNotes(first.teacher_notes || '');
          } else {
            setSelectedSub(null);
          }
        })
        .catch(() => showToast('Failed to fetch assignment submissions', 'error'))
        .finally(() => setLoading(false));
    }
  }, [selectedAssignmentId]);

  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setOverrideScore(sub.final_score ?? sub.evaluation?.overall_score ?? 0);
    setTeacherNotes(sub.teacher_notes || '');
    setOverrideReason('');
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!overrideReason.trim()) {
      showToast('Please provide a pedagogical rationale for the score override.', 'error');
      return;
    }

    setSavingOverride(true);
    try {
      const res = await api.overrideScore(selectedSub.id, {
        overridden_score: Number(overrideScore),
        override_reason: overrideReason,
        teacher_notes: teacherNotes.trim() || undefined,
      });
      setSelectedSub(res.data);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === res.data.id ? res.data : s))
      );
      showToast('Faculty score override persisted with audit trail!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to persist override', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. AUDITOR UTILITY & ASSIGNMENT SELECTOR */}
      {/* ========================================================================= */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Faculty Submissions Auditor
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              FERPA Compliant Review
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Student Briefs & Score Governance
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Audit student submissions, examine 100-point rubric results, and record authoritative score overrides.
          </p>
        </div>

        {/* Assignment Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-[#74777D]">Assignment Docket:</span>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none min-w-[200px]"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.submissions_count || 0} briefs)
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: SUBMISSIONS DOCKET (4 Cols) + AUDITOR WORKBENCH (8 Cols) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions Roster */}
        <div className="col-span-12 lg:col-span-4 bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#74777D]">
              Submissions Docket ({submissions.length})
            </h3>
            <span className="text-[11px] text-[#74777D] font-mono">Section 102</span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74777D] space-y-2">
              <FileText className="w-8 h-8 text-[#74777D]/40 mx-auto" />
              <p>No briefs received yet for this assignment prompt.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {submissions.map((s) => {
                const isSelected = selectedSub?.id === s.id;
                const score = s.final_score ?? s.evaluation?.overall_score ?? 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSubmission(s)}
                    className={`p-3.5 rounded border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-[#FBF0E4] border-[#C78335] text-[#20344A]'
                        : 'bg-[#FBF8F2] border-[#E5DED2] text-[#20344A] hover:border-[#74777D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white border border-[#E5DED2] flex items-center justify-center text-xs font-bold text-[#20344A]">
                          {s.student_name ? s.student_name[0].toUpperCase() : 'S'}
                        </div>
                        <span className="font-serif font-medium text-xs text-[#20344A] truncate max-w-[140px]">
                          {s.student_name || s.student_email || 'Student Submission'}
                        </span>
                      </div>

                      <span className="font-serif text-xs font-bold text-[#557B68]">
                        {score} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#74777D]">
                      <span className="uppercase text-[10px] font-semibold">{s.status}</span>
                      <span>{new Date(s.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Submission Inspection & Faculty Score Override */}
        <div className="col-span-12 lg:col-span-8 bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-6">
          {selectedSub ? (
            <>
              {/* Submission Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DED2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-center text-[#20344A] font-serif font-bold text-base">
                    {selectedSub.student_name ? selectedSub.student_name[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-lg text-[#20344A]">
                      {selectedSub.student_name || selectedSub.student_email}
                    </h3>
                    <p className="text-xs text-[#74777D]">
                      Submitted on {new Date(selectedSub.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-[#74777D] font-semibold block">
                    Recorded Score
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#557B68]">
                    {selectedSub.final_score ?? selectedSub.evaluation?.overall_score ?? 0}
                    <span className="text-xs font-sans text-[#74777D] font-normal"> / 100 PTS</span>
                  </span>
                </div>
              </div>

              {/* Automated Evaluation Summary If Present */}
              {selectedSub.evaluation && (
                <div className="p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#20344A] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#C78335]" />
                      <span>100-Point Rubric Evaluation Breakdown</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#74777D]">
                      Framework {selectedSub.evaluation.rubric_version}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded border border-[#E5DED2] text-xs">
                      <span className="text-[#74777D] text-[10px] uppercase tracking-wider block">Structure:</span>
                      <strong className="text-[#20344A] font-serif text-base font-bold">
                        {selectedSub.evaluation.structure_score} pts
                      </strong>
                    </div>
                    <div className="p-3 bg-white rounded border border-[#E5DED2] text-xs">
                      <span className="text-[#74777D] text-[10px] uppercase tracking-wider block">Clause Coverage:</span>
                      <strong className="text-[#557B68] font-serif text-base font-bold">
                        {selectedSub.evaluation.clause_score} pts
                      </strong>
                    </div>
                    <div className="p-3 bg-white rounded border border-[#E5DED2] text-xs">
                      <span className="text-[#74777D] text-[10px] uppercase tracking-wider block">Jurats & Formatting:</span>
                      <strong className="text-[#C78335] font-serif text-base font-bold">
                        {selectedSub.evaluation.formatting_score} pts
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Score Override Form */}
              <form
                onSubmit={handleOverride}
                className="p-5 rounded bg-[#FFFFFF] border border-[#C78335] space-y-4 shadow-2xs"
              >
                <div className="flex items-center gap-2 text-[#C78335] font-semibold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Authoritative Faculty Score Override</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#20344A] mb-1">
                      Adjusted Score (0–100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(Number(e.target.value))}
                      className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none font-serif font-bold text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#20344A] mb-1">
                      Faculty Audit Rationale / Rationale
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Credited sophisticated alternative dispute resolution clause"
                      className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20344A] mb-1">
                    Pedagogical Notes for Student (Optional)
                  </label>
                  <textarea
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Provide constructive commentary on IRAC synthesis or citation format..."
                    rows={3}
                    className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-2.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingOverride || !overrideReason.trim()}
                    className="px-5 py-2 bg-[#C78335] hover:bg-[#b57328] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {savingOverride ? <LoadingSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Record Score Override</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-16 text-center text-xs text-[#74777D] space-y-2">
              <FileCheck className="w-10 h-10 text-[#74777D]/30 mx-auto" />
              <p>Select a student brief from the docket on the left to audit evaluation scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};