import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Draft, DocumentType, VersionCompareResponse, EvidenceChunk, AssistDraftingResponse, Evaluation } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import { AIEvaluationModal } from '../ai/AIEvaluationModal';
import {
  Upload,
  Sparkles,
  GitCompare,
  Plus,
  Search,
  BookOpen,
  Clock,
  Layers,
  Save,
  CheckCircle2,
  Copy,
  Gavel,
  Cloud,
  AlignLeft,
  X,
  Scale,
} from 'lucide-react';

interface DraftWorkspaceProps {
  onSelectEvaluation: (evalId: string) => void;
  onNavigateToLoopholes?: (evalId: string) => void;
}

export const DraftWorkspace: React.FC<DraftWorkspaceProps> = ({
  onSelectEvaluation,
  onNavigateToLoopholes,
}) => {
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [currentVersionNumber, setCurrentVersionNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('AFFIDAVIT_OF_CHARACTER');
  const [rawContent, setRawContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // UI state
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'rubric' | 'ai_assist' | 'rag_search' | 'diff' | null>('rubric');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');

  // 3D AI Evaluation Modal State
  const [isAiEvalModalOpen, setIsAiEvalModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<Evaluation | null>(null);

  // Version Comparison
  const [diffVersion1, setDiffVersion1] = useState<number>(1);
  const [diffVersion2, setDiffVersion2] = useState<number>(2);
  const [diffResult, setDiffResult] = useState<VersionCompareResponse | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // AI Assist State
  const [targetClause, setTargetClause] = useState('Verification & Perjury Jurat');
  const [userInstructions, setUserInstructions] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAssistResult, setAiAssistResult] = useState<AssistDraftingResponse | null>(null);

  // Precedent Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResults, setRagResults] = useState<EvidenceChunk[]>([]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await api.getDrafts();
      setDrafts(res.data);
      if (res.data.length > 0 && !selectedDraft) {
        selectDraftItem(res.data[0]);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to fetch drafts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const selectDraftItem = (draft: Draft) => {
    setSelectedDraft(draft);
    setIsCreatingNew(false);
    setDocType(draft.document_type);
    setTitle(draft.title);
    const versions = draft.versions || [];
    if (versions.length > 0) {
      const latest = versions[versions.length - 1];
      setCurrentVersionNumber(latest.version_number);
      setRawContent(latest.raw_content);
    } else {
      setRawContent('');
    }
    setDiffResult(null);
  };

  const handleSelectVersion = (versionNum: number) => {
    if (!selectedDraft) return;
    const v = selectedDraft.versions.find((item) => item.version_number === versionNum);
    if (v) {
      setCurrentVersionNumber(v.version_number);
      setRawContent(v.raw_content);
      showToast(`Loaded Version ${v.version_number}`, 'info');
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawContent.trim()) {
      showToast('Please provide both draft title and initial legal content.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.createDraft({
        title,
        raw_content: rawContent,
        document_type: docType,
      });
      showToast(`Draft "${res.data.title}" initialized as Version 1`, 'success');
      setIsCreatingNew(false);
      await fetchDrafts();
      selectDraftItem(res.data);
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Draft creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRevision = async () => {
    if (!selectedDraft || !rawContent.trim()) return;
    setLoading(true);
    try {
      const res = await api.addDraftVersion(selectedDraft.id, rawContent);
      showToast(`Version ${res.data.version_number} saved successfully!`, 'success');
      const updatedDraft = await api.getDraft(selectedDraft.id);
      setSelectedDraft(updatedDraft.data);
      setCurrentVersionNumber(res.data.version_number);
      const updatedList = drafts.map((d) => (d.id === updatedDraft.data.id ? updatedDraft.data : d));
      setDrafts(updatedList);
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to save revision', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedDraft) return;
    setIsAiEvalModalOpen(true);
    setEvaluating(true);
    try {
      const res = await api.evaluateDraft(selectedDraft.id, currentVersionNumber);
      setEvaluationResult(res.data);
      showToast('Academic 100-Point Rubric Evaluation Completed!', 'success');
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Evaluation failed to complete', 'error');
      setIsAiEvalModalOpen(false);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCompareDiff = async () => {
    if (!selectedDraft) return;
    setDiffLoading(true);
    try {
      const res = await api.compareVersions(selectedDraft.id, diffVersion1, diffVersion2);
      setDiffResult(res.data);
      setActiveSidePanel('diff');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to generate diff', 'error');
    } finally {
      setDiffLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
    try {
      const res = await api.uploadDraftFile(fd);
      showToast(`Parsed "${file.name}" and created Version 1`, 'success');
      await fetchDrafts();
      selectDraftItem(res.data);
      window.dispatchEvent(new CustomEvent('draftforge:metric_update'));
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'File upload and extraction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraft) return;
    setAiGenerating(true);
    try {
      const res = await api.assistDrafting({
        document_type: selectedDraft.document_type,
        target_clause: targetClause,
        user_instructions: userInstructions,
        context_draft_id: selectedDraft.id,
      });
      setAiAssistResult(res.data);
      showToast('Clause synthesized from statutory reference corpus', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'AI drafting assistance failed', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleInsertAiClause = (clauseText: string) => {
    setRawContent((prev) => `${prev}\n\n/* Synthesized Clause (${targetClause}) */\n${clauseText}`);
    showToast('Clause appended to active editor', 'info');
  };

  const handleInsertSymbol = (symbol: string) => {
    setRawContent((prev) => `${prev} ${symbol} `);
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try {
      const res = await api.queryEvidence({
        query: ragQuery,
        document_type: selectedDraft?.document_type || docType,
        top_k: 4,
      });
      setRagResults(res.data.evidence);
      showToast(`Retrieved ${res.data.evidence.length} precedent benchmarks`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Precedent search failed', 'error');
    } finally {
      setRagLoading(false);
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || d.document_type === filterType;
    return matchesSearch && matchesType;
  });

  const wordCount = rawContent.trim() ? rawContent.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ========================================================================= */}
      {/* 1. WORKBENCH UTILITY & SESSION BAR (Editorial Jurisprudence) */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#FFFFFF] border border-[#E5DED2] p-4 sm:p-5 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#C78335] uppercase tracking-wider bg-[#FBF0E4] px-2 py-0.5 rounded">
                {isCreatingNew ? 'New Draft Studio' : selectedDraft?.document_type.replace(/_/g, ' ') || 'Appellate Advocacy'}
              </span>
              <span className="text-xs text-[#74777D]">•</span>
              <span className="text-xs text-[#43474D]">
                {isCreatingNew ? 'Draft Inception' : `Revision #${currentVersionNumber}`}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium truncate flex items-center gap-2 mt-1">
              {isCreatingNew ? (
                'Draft Inception Workbench'
              ) : (
                selectedDraft?.title || 'Legal Document Studio'
              )}
            </h1>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 pl-4 py-1 text-xs text-[#557B68] border-l border-[#E5DED2]">
            <Cloud className="w-4 h-4 text-[#557B68]" />
            <span className="text-[#43474D]">
              Saved to Academic Cloud <span className="text-[#74777D]">(Synced)</span>
            </span>
          </div>
        </div>

        {/* Workbench Actions & Metrics */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Word Count Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs text-[#20344A]">
            <AlignLeft className="w-3.5 h-3.5 text-[#74777D]" />
            <span className="font-semibold">{wordCount}</span>
            <span className="text-[#74777D]">/ 3,500 words</span>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium cursor-pointer transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5 text-[#20344A]" />
            <span>Upload</span>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Save Button */}
          {!isCreatingNew && selectedDraft && (
            <button
              onClick={handleSaveRevision}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-[#20344A] rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#20344A]" />
              <span>Save Revision</span>
            </button>
          )}

          {/* AI Tutor Toggle */}
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'ai_assist' ? null : 'ai_assist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium border transition-colors shadow-xs ${
              activeSidePanel === 'ai_assist'
                ? 'bg-[#20344A] text-white border-[#20344A]'
                : 'bg-[#FBF8F2] hover:bg-[#F3EFE6] border-[#E5DED2] text-[#20344A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
            <span>AI Legal Tutor</span>
          </button>

          {/* Precedent Search Toggle */}
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'rag_search' ? null : 'rag_search')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium border transition-colors shadow-xs ${
              activeSidePanel === 'rag_search'
                ? 'bg-[#20344A] text-white border-[#20344A]'
                : 'bg-[#FBF8F2] hover:bg-[#F3EFE6] border-[#E5DED2] text-[#20344A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#20344A]" />
            <span>Precedents</span>
          </button>

          {/* Submit for Evaluation */}
          <button
            onClick={handleEvaluate}
            disabled={evaluating || !selectedDraft || isCreatingNew}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#C78335] hover:bg-[#b57328] text-white rounded text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {evaluating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Auditing Rubrics...</span>
              </>
            ) : (
              <>
                <Gavel className="w-3.5 h-3.5 text-white" />
                <span>Submit for Evaluation</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. EDITORIAL RIBBON / MICRO-FORMATTING BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#FBF8F2] border border-[#E5DED2] px-4 py-2 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-[#43474D]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#FFFFFF] border border-[#E5DED2] rounded p-0.5">
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2.5 py-1 rounded font-serif text-xs transition-colors ${
                fontFamily === 'serif' ? 'bg-[#20344A] text-white' : 'text-[#43474D] hover:text-[#20344A]'
              }`}
            >
              Newsreader (Serif)
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                fontFamily === 'sans' ? 'bg-[#20344A] text-white' : 'text-[#43474D] hover:text-[#20344A]'
              }`}
            >
              Source Sans
            </button>
            <button
              onClick={() => setFontFamily('mono')}
              className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                fontFamily === 'mono' ? 'bg-[#20344A] text-white' : 'text-[#43474D] hover:text-[#20344A]'
              }`}
            >
              Monospace
            </button>
          </div>

          <span className="w-px h-4 bg-[#E5DED2]" />

          {/* Quick Insert Legal Symbols */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#74777D] mr-1">Insert:</span>
            <button
              onClick={() => handleInsertSymbol('§')}
              className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs font-serif font-bold text-[#20344A]"
              title="Section Symbol (§)"
            >
              §
            </button>
            <button
              onClick={() => handleInsertSymbol('¶')}
              className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs font-serif font-bold text-[#20344A]"
              title="Paragraph Symbol (¶)"
            >
              ¶
            </button>
            <button
              onClick={() => handleInsertSymbol('—')}
              className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs font-serif font-bold text-[#20344A]"
              title="Em Dash (—)"
            >
              —
            </button>
            <button
              onClick={() => handleInsertSymbol('" "')}
              className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs font-serif font-bold text-[#20344A]"
              title="Citation Quotes"
            >
              “ ”
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-[#74777D]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#557B68]" />
            Double-spaced Body Standard (Bluebook R. 10.2)
          </span>
          <span className="flex items-center gap-1 text-[#20344A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C78335]" />
            Active Rubric: Statutory Synthesis & Due Execution
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY WORKSPACE CANVAS: Inventory + Parchment Sheet + Dock */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: Drafts & Revisions (3 Columns) */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E5DED2] p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#74777D] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#20344A]" />
                <span>Drafts Docket ({drafts.length})</span>
              </span>
              <button
                onClick={() => {
                  setIsCreatingNew(true);
                  setSelectedDraft(null);
                  setTitle('');
                  setRawContent('');
                }}
                className="p-1 rounded bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] border border-[#E5DED2] transition-colors"
                title="Initialize New Blank Draft"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search docket..."
                  className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-7 pr-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-2 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character</option>
                <option value="EMPLOYMENT_AGREEMENT">Employment Agreement</option>
                <option value="RENT_AGREEMENT">Rent Agreement</option>
                <option value="LEGAL_NOTICE">Legal Notice</option>
              </select>
            </div>

            {/* Drafts List */}
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div className="text-center py-6 text-[#74777D] text-xs space-y-2">
                  <p>No briefs found.</p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-[#C78335] hover:underline font-semibold"
                  >
                    + Start New Draft
                  </button>
                </div>
              ) : (
                filteredDrafts.map((d) => {
                  const isSelected = selectedDraft?.id === d.id && !isCreatingNew;
                  return (
                    <div
                      key={d.id}
                      onClick={() => selectDraftItem(d)}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FBF0E4] border-[#C78335] text-[#20344A]'
                          : 'bg-[#FBF8F2] border-[#E5DED2] hover:border-[#74777D] text-[#20344A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-medium text-xs truncate">{d.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#74777D] border border-[#E5DED2] shrink-0">
                          v{d.versions?.length || 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#74777D]">
                        <span className="truncate max-w-[120px]">{d.document_type.replace(/_/g, ' ')}</span>
                        <span>{new Date(d.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Versions Timeline & Diff Selection */}
          {selectedDraft && !isCreatingNew && (
            <div className="bg-[#FFFFFF] border border-[#E5DED2] p-4 rounded-lg shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#74777D] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C78335]" />
                  <span>Version Timeline</span>
                </span>
                <span className="text-[11px] text-[#74777D] font-mono">
                  {selectedDraft.versions.length} Revisions
                </span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedDraft.versions.map((v) => {
                  const isCurrent = currentVersionNumber === v.version_number;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVersion(v.version_number)}
                      className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-[#20344A] text-white border-[#20344A]'
                          : 'bg-[#FBF8F2] border-[#E5DED2] hover:border-[#74777D] text-[#20344A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Version {v.version_number}</span>
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-white/70' : 'text-[#74777D]'}`}>
                          {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#C78335] text-white uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Version Comparison Selector */}
              {selectedDraft.versions.length > 1 && (
                <div className="pt-2 border-t border-[#E5DED2] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#74777D]">
                    <span>Compare Revisions</span>
                    <button
                      onClick={handleCompareDiff}
                      disabled={diffLoading}
                      className="text-[#C78335] hover:underline text-xs font-semibold flex items-center gap-1"
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>Inspect Diff</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={diffVersion1}
                      onChange={(e) => setDiffVersion1(Number(e.target.value))}
                      className="bg-[#FBF8F2] border border-[#E5DED2] rounded p-1 text-xs text-[#20344A] focus:outline-none"
                    >
                      {selectedDraft.versions.map((v) => (
                        <option key={v.id} value={v.version_number}>
                          v{v.version_number}
                        </option>
                      ))}
                    </select>
                    <select
                      value={diffVersion2}
                      onChange={(e) => setDiffVersion2(Number(e.target.value))}
                      className="bg-[#FBF8F2] border border-[#E5DED2] rounded p-1 text-xs text-[#20344A] focus:outline-none"
                    >
                      {selectedDraft.versions.map((v) => (
                        <option key={v.id} value={v.version_number}>
                          v{v.version_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Center Column: Physical Parchment Sheet Editor Canvas */}
        <section
          className={`${
            activeSidePanel ? 'col-span-12 lg:col-span-5 xl:col-span-6' : 'col-span-12 lg:col-span-9'
          } flex flex-col items-center transition-all duration-300`}
        >
          <article className="w-full bg-[#FFFFFF] border border-[#E5DED2] shadow-[0_1px_3px_rgba(32,52,74,0.06),0_8px_24px_rgba(32,52,74,0.03)] px-6 sm:px-12 py-8 sm:py-12 rounded-sm relative flex flex-col text-[#20344A]">
            {/* Parchment Running Head */}
            <header className="w-full pb-3 mb-6 flex items-center justify-between text-[#74777D] text-[11px] uppercase tracking-widest border-b border-[#E5DED2]">
              <span>
                {isCreatingNew ? 'Initial Pleading' : selectedDraft?.title || 'DraftForge Academic Docket'}
              </span>
              <span>
                {isCreatingNew ? 'Inception' : `Revision #${currentVersionNumber} • ${wordCount} Words`}
              </span>
            </header>

            {/* Creation Controls if creating new */}
            {isCreatingNew && (
              <div className="mb-6 p-4 rounded bg-[#FBF8F2] border border-[#E5DED2] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20344A] mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Affidavit of Character - Academic Pleading"
                    className="w-full bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#20344A] mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                  >
                    <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character (India)</option>
                    <option value="EMPLOYMENT_AGREEMENT">Employment Agreement (India)</option>
                    <option value="RENT_AGREEMENT">Residential Rent Deed (India)</option>
                    <option value="LEGAL_NOTICE">Legal Notice under Statutory Acts</option>
                  </select>
                </div>
              </div>
            )}

            {/* Parchment Textarea */}
            <div className="relative w-full">
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={22}
                placeholder="Author or paste the legal instrument here (captions, parties, operative covenants, jurisdiction, and verification clause)..."
                className={`w-full bg-transparent border-0 p-0 text-sm text-[#20344A] leading-relaxed focus:outline-none resize-none ${
                  fontFamily === 'serif'
                    ? 'font-serif text-base leading-loose'
                    : fontFamily === 'mono'
                    ? 'font-mono text-xs leading-relaxed'
                    : 'font-sans text-sm leading-relaxed'
                }`}
              />
            </div>

            {/* Creation Actions Footer */}
            {isCreatingNew && (
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[#E5DED2]">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 text-xs font-medium text-[#74777D] hover:text-[#20344A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDraft}
                  disabled={loading || !title.trim() || !rawContent.trim()}
                  className="px-5 py-2 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded transition-all disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Initialize Draft as Version 1'}
                </button>
              </div>
            )}

            {/* Parchment Sheet Footer */}
            <footer className="w-full pt-6 mt-8 flex items-center justify-between text-[#74777D] text-[10px] uppercase tracking-widest border-t border-[#E5DED2]">
              <span>DraftForge Academic Juris Sandbox</span>
              <span>Bluebook Standard Applied</span>
            </footer>
          </article>
        </section>

        {/* Right Column: Supporting Drawer (Rubric, AI Tutor, Precedents, Diff) */}
        {activeSidePanel && (
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#E5DED2] rounded-lg shadow-sm overflow-hidden flex flex-col">
              {/* Tab Header Strip */}
              <div className="bg-[#FBF8F2] p-1.5 border-b border-[#E5DED2] flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveSidePanel('rubric')}
                  className={`flex-1 py-1.5 px-2 rounded font-medium transition-all text-center flex items-center justify-center gap-1 ${
                    activeSidePanel === 'rubric'
                      ? 'bg-white text-[#20344A] shadow-xs font-semibold'
                      : 'text-[#74777D] hover:text-[#20344A]'
                  }`}
                >
                  <Scale className="w-3 h-3 text-[#C78335]" />
                  <span>Rubric</span>
                </button>
                <button
                  onClick={() => setActiveSidePanel('ai_assist')}
                  className={`flex-1 py-1.5 px-2 rounded font-medium transition-all text-center flex items-center justify-center gap-1 ${
                    activeSidePanel === 'ai_assist'
                      ? 'bg-white text-[#20344A] shadow-xs font-semibold'
                      : 'text-[#74777D] hover:text-[#20344A]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#C78335]" />
                  <span>Tutor</span>
                </button>
                <button
                  onClick={() => setActiveSidePanel('rag_search')}
                  className={`flex-1 py-1.5 px-2 rounded font-medium transition-all text-center flex items-center justify-center gap-1 ${
                    activeSidePanel === 'rag_search'
                      ? 'bg-white text-[#20344A] shadow-xs font-semibold'
                      : 'text-[#74777D] hover:text-[#20344A]'
                  }`}
                >
                  <BookOpen className="w-3 h-3 text-[#20344A]" />
                  <span>Cites</span>
                </button>
                <button
                  onClick={() => setActiveSidePanel(null)}
                  className="p-1 text-[#74777D] hover:text-[#20344A]"
                  title="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-Panel 1: Rubric Guidance (Matching Reference Design) */}
              {activeSidePanel === 'rubric' && (
                <div className="p-4 space-y-4">
                  {/* Score Projection Header */}
                  <div className="bg-[#FBF8F2] border border-[#E5DED2] p-3 rounded flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#74777D] font-semibold block">
                        Academic Target
                      </span>
                      <span className="font-serif text-xl font-bold text-[#20344A]">
                        100 <span className="text-xs text-[#74777D] font-sans font-normal">/ 100 PTS</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#557B68] bg-[#E8F3ED] px-2 py-0.5 rounded">
                      Standard Rubric
                    </span>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#74777D] font-semibold block">
                      Core Grading Criteria
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 bg-[#FBF8F2] border border-[#E5DED2] rounded flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-[#20344A] flex justify-between">
                            <span>Caption & Jurisdiction</span>
                            <span className="text-[10px] text-[#557B68] font-semibold">15%</span>
                          </div>
                          <p className="text-[11px] text-[#74777D]">Court hierarchy and cause title properly established.</p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#FBF8F2] border border-[#E5DED2] rounded flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-[#20344A] flex justify-between">
                            <span>Statutory Synthesis</span>
                            <span className="text-[10px] text-[#557B68] font-semibold">25%</span>
                          </div>
                          <p className="text-[11px] text-[#74777D]">Required statutory acts cited with section specificity.</p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#FBF0E4] border border-[#C78335] rounded flex items-start gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C78335] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-[#20344A] flex justify-between">
                            <span>Verification & Perjury Jurat</span>
                            <span className="text-[10px] text-[#C78335] font-semibold">30%</span>
                          </div>
                          <p className="text-[11px] text-[#74777D]">Deponent declaration of personal knowledge under oath.</p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#FBF8F2] border border-[#E5DED2] rounded flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#557B68] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-[#20344A] flex justify-between">
                            <span>Professional Tone & Bluebook</span>
                            <span className="text-[10px] text-[#557B68] font-semibold">15%</span>
                          </div>
                          <p className="text-[11px] text-[#74777D]">Formal legal cadence with accurate typographical formatting.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Insert Precedents */}
                  <div className="pt-2 border-t border-[#E5DED2] space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#74777D] font-semibold block">
                      Common Precedent Citations (Click to Insert)
                    </span>
                    <button
                      onClick={() => handleInsertSymbol('(1970) 397 U.S. 137')}
                      className="w-full text-left p-2 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs transition-colors flex items-center justify-between"
                    >
                      <span className="font-serif italic text-[#20344A]">Pike v. Bruce Church, Inc.</span>
                      <Copy className="w-3 h-3 text-[#74777D]" />
                    </button>
                    <button
                      onClick={() => handleInsertSymbol('(1978) 437 U.S. 617')}
                      className="w-full text-left p-2 bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] rounded text-xs transition-colors flex items-center justify-between"
                    >
                      <span className="font-serif italic text-[#20344A]">City of Philadelphia v. New Jersey</span>
                      <Copy className="w-3 h-3 text-[#74777D]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-Panel 2: AI Legal Tutor */}
              {activeSidePanel === 'ai_assist' && (
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#E5DED2]">
                    <Sparkles className="w-4 h-4 text-[#C78335]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20344A]">
                      AI Legal Clause Synthesis
                    </h4>
                  </div>

                  <form onSubmit={handleAiAssist} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#20344A] mb-1">
                        Target Legal Clause
                      </label>
                      <select
                        value={targetClause}
                        onChange={(e) => setTargetClause(e.target.value)}
                        className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                      >
                        <option value="Verification & Perjury Jurat">Verification & Perjury Jurat</option>
                        <option value="Section 27 Compliant Restrictive Covenants">
                          Section 27 Compliant Restrictive Covenants
                        </option>
                        <option value="Statutory Notice Period & Termination">
                          Notice Period & Termination
                        </option>
                        <option value="Security Deposit Refund Mechanics">
                          Security Deposit Refund Mechanics
                        </option>
                        <option value="Arbitration & Territorial Jurisdiction">
                          Arbitration & Jurisdiction
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#20344A] mb-1">
                        Specific Facts or Directives
                      </label>
                      <textarea
                        value={userInstructions}
                        onChange={(e) => setUserInstructions(e.target.value)}
                        placeholder="e.g. Include 30-day notice via registered speed post..."
                        rows={3}
                        className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={aiGenerating || !selectedDraft}
                      className="w-full py-2 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {aiGenerating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
                      )}
                      <span>Synthesize Clause</span>
                    </button>
                  </form>

                  {aiAssistResult && (
                    <div className="space-y-2.5 pt-3 border-t border-[#E5DED2]">
                      <div className="p-3 rounded bg-[#FBF8F2] border border-[#E5DED2] text-xs font-mono text-[#20344A] leading-relaxed">
                        {aiAssistResult.drafted_clause || aiAssistResult.generated_draft}
                      </div>

                      {aiAssistResult.commentary && (
                        <p className="text-[11px] text-[#43474D] bg-[#FBF0E4] p-2.5 rounded border border-[#C78335]/30 leading-relaxed">
                          <strong className="text-[#C78335]">Statutory Rationale: </strong>
                          {aiAssistResult.commentary}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          handleInsertAiClause(
                            aiAssistResult.drafted_clause || aiAssistResult.generated_draft || ''
                          )
                        }
                        className="w-full py-1.5 bg-[#557B68] hover:bg-[#436354] text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Clause into Sheet</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Panel 3: Precedents & Citation Search */}
              {activeSidePanel === 'rag_search' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#E5DED2]">
                    <BookOpen className="w-4 h-4 text-[#20344A]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20344A]">
                      Precedent & Knowledge Corpus
                    </h4>
                  </div>

                  <form onSubmit={handleRagSearch} className="space-y-2">
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="e.g. verification under oath jurat..."
                      className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded p-2 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={ragLoading || !ragQuery.trim()}
                      className="w-full py-1.5 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {ragLoading ? <LoadingSpinner size="sm" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Search Precedent Corpus</span>
                    </button>
                  </form>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {ragResults.length === 0 ? (
                      <p className="text-center py-6 text-[11px] text-[#74777D]">
                        Search for statutory principles, standard clauses, and binding precedents.
                      </p>
                    ) : (
                      ragResults.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-[#FBF8F2] border border-[#E5DED2] hover:border-[#74777D] space-y-1.5 text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#20344A] font-semibold">
                            <span>{chunk.source_document}</span>
                            <span>Pg. {chunk.page_number}</span>
                          </div>
                          <p className="font-serif text-[11px] text-[#43474D] leading-relaxed italic bg-white p-2 rounded border border-[#E5DED2]">
                            "{chunk.content}"
                          </p>
                          <button
                            onClick={() => {
                              setRawContent((prev) => `${prev}\n\n${chunk.content}`);
                              showToast('Citation appended to draft', 'info');
                            }}
                            className="text-[11px] text-[#C78335] hover:underline font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert into Draft</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Panel 4: Revision Comparison (Diff) */}
              {activeSidePanel === 'diff' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
                    <div className="flex items-center gap-1.5">
                      <GitCompare className="w-4 h-4 text-[#20344A]" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#20344A]">
                        Revision Diff (v{diffVersion1} vs v{diffVersion2})
                      </h4>
                    </div>
                  </div>

                  {diffResult ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-[#FBF8F2] border border-[#E5DED2]">
                        <span className="text-[#557B68] font-semibold">
                          +{diffResult.additions} additions
                        </span>
                        <span className="text-[#BA1A1A] font-semibold">
                          -{diffResult.deletions} deletions
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E5DED2] font-mono text-[11px] text-[#20344A] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {diffResult.diff_summary || 'No textual changes between selected versions.'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#74777D]">Select revisions and click inspect.</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 3D AI Evaluation Modal */}
      <AIEvaluationModal
        isOpen={isAiEvalModalOpen}
        onClose={() => setIsAiEvalModalOpen(false)}
        evaluation={evaluationResult}
        evaluating={evaluating}
        draftTitle={selectedDraft?.title || 'Legal Draft'}
        draftContent={rawContent}
        onNavigateToLoopholes={onNavigateToLoopholes}
        onViewDetailedEvidence={() => {
          if (evaluationResult) onSelectEvaluation(evaluationResult.id);
        }}
      />
    </div>
  );
};