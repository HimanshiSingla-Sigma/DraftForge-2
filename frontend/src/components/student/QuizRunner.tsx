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
    showToast('Model clause copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const templateText = generatedExercise?.drafted_clause || generatedExercise?.generated_draft || '';
  const commentaryText = generatedExercise?.commentary || '';

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Academic Practice Studio
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Knowledge Verification
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Statutory Practice & Legal Quizzes
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Test statutory mechanics with interactive multiple-choice questions or generate AI drafting scenarios.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FBF8F2] rounded border border-[#E5DED2]">
          <button
            onClick={() => {
              setActiveTab('standard');
              setActiveQuiz(null);
            }}
            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'standard'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A]'
            }`}
          >
            Statutory Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('ai_exercise');
              setActiveQuiz(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'ai_exercise'
                ? 'bg-[#20344A] text-white font-semibold'
                : 'text-[#74777D] hover:text-[#20344A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />
            <span>AI Practice Studio</span>
          </button>
        </div>
      </header>

      {/* VIEW 1: Standard Quizzes Catalog */}
      {activeTab === 'standard' && !activeQuiz && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#74777D] uppercase tracking-wider">
              Available Tests
            </span>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
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
            <div className="bg-[#FFFFFF] p-12 text-center rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
              <HelpCircle className="w-10 h-10 text-[#74777D]/30 mx-auto" />
              <h3 className="font-serif text-lg font-medium text-[#20344A]">No Quizzes Found</h3>
              <p className="text-xs text-[#74777D] leading-relaxed">
                No interactive quizzes match the selected category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuiz(q.id)}
                  className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs hover:border-[#20344A] cursor-pointer transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30">
                        {q.document_type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          q.difficulty === 'ADVANCED'
                            ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                            : q.difficulty === 'INTERMEDIATE'
                            ? 'bg-[#FBF0E4] text-[#C78335]'
                            : 'bg-[#E8F3ED] text-[#557B68]'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="font-serif font-medium text-base text-[#20344A] group-hover:text-[#C78335] transition-colors">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-xs text-[#43474D] leading-relaxed line-clamp-2">
                        {q.description}
                      </p>
                    )}
                  </div>

                  <button className="w-full py-1.5 bg-[#FBF8F2] group-hover:bg-[#20344A] border border-[#E5DED2] group-hover:border-[#20344A] text-[#20344A] group-hover:text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                    <span>Take Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Active Quiz Runner */}
      {activeTab === 'standard' && activeQuiz && (
        <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DED2]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBF8F2] text-[#20344A] border border-[#E5DED2]">
                  {activeQuiz.document_type}
                </span>
                <span className="text-[11px] font-semibold text-[#C78335]">
                  Difficulty: {activeQuiz.difficulty}
                </span>
              </div>
              <h2 className="font-serif text-xl font-medium text-[#20344A] mt-1">{activeQuiz.title}</h2>
            </div>

            <button
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
              }}
              className="text-xs text-[#74777D] hover:text-[#20344A] font-semibold self-start sm:self-auto cursor-pointer"
            >
              ← Back to Quizzes Catalog
            </button>
          </div>

          {/* Questions Stream */}
          <div className="space-y-4">
            {activeQuiz.questions?.map((q, idx) => {
              const selectedOption = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-5 rounded bg-[#FBF8F2] border border-[#E5DED2] space-y-3"
                >
                  <p className="text-xs font-serif font-medium text-[#20344A] leading-relaxed">
                    <span className="font-sans font-bold text-[#C78335] mr-2">Q{idx + 1}.</span>
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt.key })}
                          className={`p-3 rounded text-xs text-left border transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-[#20344A] border-[#20344A] font-medium shadow-xs'
                              : 'bg-white border-[#E5DED2] text-[#43474D] hover:border-[#74777D]'
                          }`}
                        >
                          <span
                            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                              isSelected
                                ? 'bg-[#20344A] text-white border-[#20344A]'
                                : 'bg-[#FBF8F2] text-[#20344A] border-[#E5DED2]'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
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
                className="px-5 py-2.5 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {submitting ? <LoadingSpinner size="sm" /> : <CheckCircle2 className="w-4 h-4 text-[#C78335]" />}
                <span>Submit Answers for Evaluation</span>
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-[#FFFFFF] border border-[#E5DED2] space-y-4 shadow-sm animate-fade-in-up">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center text-[#C78335]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#20344A]">
                      Score: {result.score.toFixed(0)}%
                    </h3>
                    <p className="text-xs text-[#74777D]">
                      Answered {Object.keys(answers).length} of {result.total_questions} questions
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                    result.passed
                      ? 'bg-[#E8F3ED] text-[#557B68]'
                      : 'bg-[#FFDAD6] text-[#BA1A1A]'
                  }`}
                >
                  {result.passed ? 'PASSED (≥ 70%)' : 'REQUIRES REVISION'}
                </span>
              </div>

              {/* Explanations Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-serif font-medium text-[#20344A] uppercase tracking-wider">
                  Itemized Question Explanations
                </h4>
                {result.breakdown?.map((b, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded text-xs space-y-1.5 border ${
                      b.is_correct
                        ? 'bg-[#E8F3ED]/40 border-[#557B68]/30'
                        : 'bg-[#FFDAD6]/40 border-[#BA1A1A]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2">
                        {b.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-[#557B68] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#BA1A1A] shrink-0" />
                        )}
                        <span className="font-serif font-semibold text-[#20344A]">Question {i + 1}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#74777D]">
                        Correct: <strong className="text-[#557B68] font-bold">{b.correct_answer}</strong>
                      </span>
                    </div>
                    <p className="text-[#43474D] text-xs leading-relaxed">{b.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setResult(null);
                  }}
                  className="px-4 py-1.5 bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] text-xs font-medium rounded border border-[#E5DED2] transition-colors cursor-pointer"
                >
                  Return to Quizzes Catalog
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: AI Practice Exercise Generator Studio */}
      {activeTab === 'ai_exercise' && (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-5 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5DED2]">
              <Sparkles className="w-4 h-4 text-[#C78335]" />
              <h3 className="font-serif font-medium text-base text-[#20344A]">AI Practice Scenario Generator</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Target Legal Document
              </label>
              <select
                value={exerciseDocType}
                onChange={(e) => setExerciseDocType(e.target.value as DocumentType)}
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
                Focus Legal Clause / Concept
              </label>
              <input
                type="text"
                value={targetSkill}
                onChange={(e) => setTargetSkill(e.target.value)}
                placeholder="e.g. Verification Jurat, Section 27 Restraint of Trade, Notice Period"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#20344A] mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
              >
                <option value="BEGINNER">Beginner (Foundational Structures)</option>
                <option value="INTERMEDIATE">Intermediate (Statutory Enforceability)</option>
                <option value="ADVANCED">Advanced (Cross-Clause Risk Mitigation)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAIExercise}
              disabled={generatingExercise || !targetSkill.trim()}
              className="w-full py-2 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {generatingExercise ? <LoadingSpinner size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-[#C78335]" />}
              <span>Synthesize Practice Scenario</span>
            </button>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-[#FFFFFF] p-6 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#20344A]" />
                <h3 className="font-serif font-medium text-base text-[#20344A]">Synthesized Model Clause & Guidance</h3>
              </div>

              {templateText && (
                <button
                  onClick={() => copyClauseText(templateText)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] rounded text-xs font-medium border border-[#E5DED2] transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#557B68]" /> : <Copy className="w-3.5 h-3.5 text-[#20344A]" />}
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
                <div className="p-4 bg-[#FBF8F2] rounded border border-[#E5DED2] space-y-2">
                  <span className="font-serif font-medium text-xs text-[#20344A] uppercase tracking-wider">
                    Model Statutory Draft:
                  </span>
                  <pre className="text-xs font-mono text-[#20344A] whitespace-pre-wrap leading-relaxed p-4 bg-white rounded border border-[#E5DED2]">
                    {templateText}
                  </pre>
                </div>

                {commentaryText && (
                  <div className="p-4 bg-[#E8F3ED]/60 rounded border border-[#557B68]/30 space-y-1.5 text-xs">
                    <span className="font-serif font-medium text-[#557B68] uppercase tracking-wider block">
                      Statutory Commentary & Enforceability Notes:
                    </span>
                    <p className="text-[#20344A] leading-relaxed whitespace-pre-line">
                      {commentaryText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-[#74777D] space-y-2">
                <BookOpen className="w-8 h-8 text-[#74777D]/30 mx-auto" />
                <p>Configure parameters on the left and click &ldquo;Synthesize Practice Scenario&rdquo; to generate bespoke drafting challenges.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};