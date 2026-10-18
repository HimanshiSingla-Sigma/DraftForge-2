import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Assignment, DocumentType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  FileCheck,
  Plus,
  Users,
  Search,
  BookOpen,
  Clock,
} from 'lucide-react';

export const AssignmentManager: React.FC<{ onSelectAssignment: (id: string) => void }> = ({
  onSelectAssignment,
}) => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [docType, setDocType] = useState<DocumentType>('EMPLOYMENT_AGREEMENT');
  const [deadline, setDeadline] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.getTeacherAssignments();
      setAssignments(res.data || []);
    } catch (err: any) {
      showToast('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      showToast('Please provide an assignment title and drafting instructions.', 'error');
      return;
    }
    setCreating(true);
    try {
      await api.createAssignment({
        title,
        description: description.trim() || undefined,
        document_type: docType,
        instructions,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      showToast(`Assignment "${title}" published successfully!`, 'success');
      setTitle('');
      setDescription('');
      setInstructions('');
      setDeadline('');
      await fetchAssignments();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create assignment', 'error');
    } finally {
      setCreating(false);
    }
  };

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.instructions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Curriculum & Assignments
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Active Syllabus
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Assignment Management Studio
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Publish drafting briefs, enforce statutory constraints, and track student submissions in real-time.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs font-mono text-[#20344A] shrink-0">
          Published Briefs: <strong className="text-[#C78335]">{assignments.length}</strong>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Create Assignment Form (Left 5 Cols) */}
        <div className="col-span-12 lg:col-span-5 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5DED2]">
            <Plus className="w-4 h-4 text-[#C78335]" />
            <h3 className="font-serif font-medium text-base text-[#20344A]">Draft New Assignment Prompt</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Executive Employment Agreement Drafting"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Short Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Focus on restrictive covenants and termination notice"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Target Legal Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
              >
                <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character (India)</option>
                <option value="EMPLOYMENT_AGREEMENT">Employment Agreement (India)</option>
                <option value="RENT_AGREEMENT">Residential Rent Deed (India)</option>
                <option value="LEGAL_NOTICE">Statutory Legal Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Instructions & Rubric Constraints
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Specify mandatory party clauses, consideration terms, notice periods, and statutory references..."
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-2.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Submission Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !title.trim() || !instructions.trim()}
              className="w-full py-2 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {creating ? <LoadingSpinner size="sm" /> : <FileCheck className="w-3.5 h-3.5 text-[#C78335]" />}
              <span>Publish Assignment</span>
            </button>
          </form>
        </div>

        {/* Existing Assignments (Right 7 Cols) */}
        <div className="col-span-12 lg:col-span-7 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5DED2]">
            <h3 className="font-serif font-medium text-base text-[#20344A]">Active Classroom Assignments</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-[#FBF8F2] border border-[#E5DED2] rounded pl-7 pr-3 py-1 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="Loading faculty assignments..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#74777D] space-y-2">
              <BookOpen className="w-8 h-8 text-[#74777D]/30 mx-auto" />
              <p>No assignments published yet. Author one on the left.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAssignment(a.id)}
                  className="p-4 rounded border border-[#E5DED2] hover:border-[#20344A] bg-[#FBF8F2] hover:bg-white cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#20344A] border border-[#E5DED2]">
                        {a.document_type.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-serif font-medium text-base text-[#20344A] mt-1.5 group-hover:text-[#C78335] transition-colors">
                        {a.title}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F3ED] text-[#557B68] uppercase tracking-wider">
                      {a.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#43474D] line-clamp-2 leading-relaxed">
                    {a.instructions}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#74777D] pt-2 border-t border-[#E5DED2]">
                    <div className="flex items-center gap-1.5 text-[#20344A] font-medium">
                      <Users className="w-3.5 h-3.5 text-[#C78335]" />
                      <span>{a.submissions_count || 0} Submissions</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className="w-3 h-3 text-[#74777D]" />
                      <span>
                        {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'Open Ended'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};