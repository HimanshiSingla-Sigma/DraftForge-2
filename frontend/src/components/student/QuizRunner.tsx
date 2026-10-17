import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Quiz, DocumentType, QuizAttemptResponse } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  Award,
  Sparkles,
  BookOpen,
  PenTool,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const QuizRunner: React.FC = () => {
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // AI Practice Studio
  const [activeTab, setActiveTab] = useState<'standard' | 'ai_exercise'>('standard');
  const [exerciseDocType, setExerciseDocType] = useState<DocumentType>('EMPLOYMENT_AGREEMENT');
  const [targetSkill, setTargetSkill] = useState('Termination & Section 27 Restrictive Covenants');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [generatingExercise, setGeneratingExercise] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.getQuizzes(filterType === 'ALL' ? undefined : filterType);
      setQuizzes(res.data || []);
    } catch (err: any) {
      showToast('Failed to load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [filterType]);

  const handleSelectQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      const res = await api.getQuiz(quizId);
      setActiveQuiz(res.data);
      setAnswers({});
      setResult(null);
    } catch (err: any) {
      showToast('Failed to load quiz questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await api.submitQuiz({
        quiz_id: activeQuiz.id,
        answers,
      });
      setResult(res.data);
      if (res.data.passed) {
        showToast(`Congratulations! You passed with ${res.data.score}%`, 'success');
      } else {
        showToast(`Quiz completed: ${res.data.score}%. Review explanations below.`, 'info');
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Quiz submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAIExercise = async () => {
    setGeneratingExercise(true);
    setGeneratedExercise(null);
    setCopied(false);

    try {
      const res = await api.assistDrafting({
        document_type: exerciseDocType,
        target_clause: targetSkill,
        user_instructions: `Generate a drafting practice scenario with difficulty ${difficulty}. Include drafting instructions, pitfalls to avoid under Indian law, and a model compliant clause.`,
      });
      setGeneratedExercise(res.data);
      showToast('Practice scenario synthesized from statutory corpus', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to synthesize exercise', 'error');
    } finally {
      setGeneratingExercise(false);
    }
  };

  const copyClauseText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Model template copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const templateText = generatedExercise?.drafted_clause || generatedExercise?.generated_draft || '';
  const commentaryText = generatedExercise?.commentary || '';

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl tactile-card bg-white border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0B192C] tracking-tight">Legal Quizzes & Practice Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30 font-mono">
              Knowledge Verification
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1 font-sans">
            Test statutory mechanics with interactive multiple-choice questions or generate AI drafting scenarios.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8]">
          <button
            onClick={() => {
              setActiveTab('standard');
              setActiveQuiz(null);
            }}
            className={`tactile-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'standard'
                ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-white'
            }`}
          >
            Statutory Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('ai_exercise');
              setActiveQuiz(null);
            }}
            className={`tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ai_exercise'
                ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>AI Practice Studio</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Standard Quizzes Catalog */}
      {activeTab === 'standard' && !activeQuiz && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#0B192C] uppercase tracking-wider">
              Available Tests
            </span>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border-2 border-[#E6E2D8] rounded-xl px-3 py-1.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character</option>
              <option value="EMPLOYMENT_AGREEMENT">Employment Agreement</option>
              <option value="RENT_AGREEMENT">Rent Agreement</option>
              <option value="LEGAL_NOTICE">Legal Notice</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" label="Loading legal quizzes..." />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="tactile-card bg-white p-12 text-center rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
              <HelpCircle className="w-12 h-12 text-[#0B192C]/40 mx-auto" />
              <h3 className="font-serif text-sm font-semibold text-[#0B192C]">No Quizzes Found</h3>
              <p className="text-xs text-[#0B192C]/70 font-sans">
                No interactive quizzes match the selected category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuiz(q.id)}
                  className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] hover:border-[#1E3E62] cursor-pointer transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3F0EA] text-[#0B192C] border border-[#E6E2D8]">
                        {q.document_type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                          q.difficulty === 'ADVANCED'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30'
                            : q.difficulty === 'INTERMEDIATE'
                            ? 'bg-[#FFFBEB] text-[#B45309] border border-[#F59E0B]/30'
                            : 'bg-[#F0FDF4] text-[#059669] border border-[#10B981]/30'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#0B192C] group-hover:text-[#1E3E62] transition-colors">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-xs text-[#0B192C]/70 leading-relaxed line-clamp-2 font-sans">
                        {q.description}
                      </p>
                    )}
                  </div>

                  <button className="tactile-btn w-full py-2 bg-[#F3F0EA] group-hover:bg-[#1E3E62] border-2 border-[#E6E2D8] group-hover:border-[#0B192C] text-[#0B192C] group-hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Active Quiz Runner */}
      {activeTab === 'standard' && activeQuiz && (
        <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#E6E2D8]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F0EA] text-[#0B192C] border border-[#E6E2D8]">
                  {activeQuiz.document_type}
                </span>
                <span className="text-[10px] font-bold text-[#B45309] font-mono">
                  Difficulty: {activeQuiz.difficulty}
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-[#0B192C] mt-1">{activeQuiz.title}</h2>
            </div>

            <button
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
              }}
              className="text-xs text-[#0B192C]/70 hover:text-[#0B192C] font-semibold self-start sm:self-auto cursor-pointer"
            >
              ← Back to Quizzes Catalogue
            </button>
          </div>

          {/* Questions Stream */}
          <div className="space-y-6">
            {activeQuiz.questions?.map((q, idx) => {
              const selectedOption = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-4"
                >
                  <p className="text-xs font-serif font-bold text-[#0B192C] leading-relaxed">
                    <span className="font-mono text-[#1E3E62] mr-2">Q{idx + 1}.</span>
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt.key })}
                          className={`p-3.5 rounded-xl text-xs text-left border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-[#0B192C] border-[#1E3E62] shadow-[0_3px_#1E3E62]'
                              : 'bg-white border-[#E6E2D8] text-[#0B192C]/80 hover:border-[#1E3E62]/40'
                          }`}
                        >
                          <span
                            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                              isSelected
                                ? 'bg-[#1E3E62] text-white border-[#0B192C]'
                                : 'bg-[#F3F0EA] text-[#0B192C] border-[#E6E2D8]'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="leading-relaxed font-sans">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action or Evaluation Result Card */}
          {!result ? (
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="tactile-btn px-6 py-2.5 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <LoadingSpinner size="sm" /> : <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />}
                <span>Submit Quiz for Instant Scoring</span>
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] space-y-5 shadow-[0_4px_#E6E2D8] animate-fade-in-up">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#E6E2D8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border-2 border-[#F59E0B]/30 flex items-center justify-center text-[#B45309]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0B192C]">
                      Score: {result.score.toFixed(0)}%
                    </h3>
                    <p className="text-xs text-[#0B192C]/60 font-mono">
                      Answered: {Object.keys(answers).length} of {result.total_questions} questions
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono border-2 ${
                    result.passed
                      ? 'bg-[#F0FDF4] text-[#059669] border-[#10B981]/40'
                      : 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/40'
                  }`}
                >
                  {result.passed ? 'PASSED (>= 70%)' : 'NEEDS REVISION'}
                </span>
              </div>

              {/* Explanations Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-serif font-bold text-[#0B192C] uppercase tracking-wider">
                  Itemized Question Explanations
                </h4>
                {result.breakdown?.map((b, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl text-xs space-y-2 border-2 ${
                      b.is_correct
                        ? 'bg-[#F0FDF4] border-[#10B981]/40'
                        : 'bg-[#FEF2F2] border-[#DC2626]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-2">
                        {b.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                        )}
                        <span className="font-serif font-bold text-[#0B192C]">Question {i + 1}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#0B192C]/70">
                        Correct Option: <strong className="text-[#059669] font-bold">{b.correct_answer}</strong>
                      </span>
                    </div>
                    <p className="text-[#0B192C]/80 text-xs leading-relaxed font-sans">{b.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setResult(null);
                  }}
                  className="tactile-btn px-4 py-2 bg-white hover:bg-[#F3F0EA] text-[#0B192C] text-xs font-bold rounded-xl border-2 border-[#E6E2D8] transition-colors cursor-pointer"
                >
                  Return to Catalogue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: AI Practice Exercise Generator Studio */}
      {activeTab === 'ai_exercise' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#E6E2D8]">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">AI Scenario Generator</h3>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Target Legal Document
              </label>
              <select
                value={exerciseDocType}
                onChange={(e) => setExerciseDocType(e.target.value as DocumentType)}
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
              >
                <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character (India)</option>
                <option value="EMPLOYMENT_AGREEMENT">Employment Agreement (India)</option>
                <option value="RENT_AGREEMENT">Residential Rent Deed (India)</option>
                <option value="LEGAL_NOTICE">Statutory Legal Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Focus Legal Clause / Concept
              </label>
              <input
                type="text"
                value={targetSkill}
                onChange={(e) => setTargetSkill(e.target.value)}
                placeholder="e.g. Verification Jurat, Section 27 Restraint of Trade, Notice Period"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#0B192C] mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
              >
                <option value="BEGINNER">Beginner (Foundational Structures)</option>
                <option value="INTERMEDIATE">Intermediate (Statutory Enforceability)</option>
                <option value="ADVANCED">Advanced (Cross-Clause Risk Mitigation)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAIExercise}
              disabled={generatingExercise || !targetSkill.trim()}
              className="tactile-btn w-full py-2.5 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {generatingExercise ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4 text-[#F59E0B]" />}
              <span>Synthesize Practice Scenario</span>
            </button>
          </div>

          <div className="col-span-12 lg:col-span-7 tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#E6E2D8]">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#1E3E62]" />
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Generated Scenario & Model Solution</h3>
              </div>

              {templateText && (
                <button
                  onClick={() => copyClauseText(templateText)}
                  className="tactile-btn flex items-center gap-1 px-3 py-1.5 bg-[#F3F0EA] hover:bg-white text-[#0B192C] rounded-xl text-xs font-semibold border-2 border-[#E6E2D8] transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#1E3E62]" />}
                  <span>{copied ? 'Copied' : 'Copy Clause'}</span>
                </button>
              )}
            </div>

            {generatingExercise ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner size="lg" label="Synthesizing compliant drafting challenge..." />
              </div>
            ) : templateText ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border-2 border-[#E6E2D8] space-y-2">
                  <span className="font-serif font-bold text-xs text-[#1E3E62] uppercase tracking-wider">
                    Model Statutory Draft:
                  </span>
                  <pre className="text-xs font-mono text-[#FAF8F5] whitespace-pre-wrap leading-relaxed p-4 bg-[#0B192C] rounded-xl border-2 border-[#0B192C] shadow-inner">
                    {templateText}
                  </pre>
                </div>

                {commentaryText && (
                  <div className="p-4 bg-[#F0FDF4] rounded-2xl border-2 border-[#10B981]/30 space-y-2 text-xs">
                    <span className="font-serif font-bold text-[#059669] uppercase tracking-wider">
                      Statutory Commentary & Enforceability Notes:
                    </span>
                    <p className="text-[#0B192C]/80 leading-relaxed whitespace-pre-line font-sans">
                      {commentaryText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-[#0B192C]/50 space-y-2">
                <BookOpen className="w-10 h-10 text-[#0B192C]/30 mx-auto" />
                <p>Configure parameters on the left and click &ldquo;Synthesize Practice Scenario&rdquo; to generate bespoke drafting challenges.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};