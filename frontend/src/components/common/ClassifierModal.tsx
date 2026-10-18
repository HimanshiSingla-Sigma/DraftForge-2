import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../../services/api';
import { DocumentClassificationResult } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ClassifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType?: (type: string) => void;
}

export const ClassifierModal: React.FC<ClassifierModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.classifyText(text);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Document classification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleApply = () => {
    if (result && onSelectType) {
      onSelectType(result.detected_type);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Document Type Identifier"
      subtitle="Analyze draft language to automatically detect the statutory document category"
      icon={<Sparkles className="w-4 h-4" />}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        <form onSubmit={handleClassify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#20344A] uppercase tracking-wider mb-2 font-mono">
              Legal Draft Content / Excerpt
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste deed text, recital preamble, or affidavit verification clause..."
              rows={6}
              className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded-lg p-3.5 text-xs text-[#20344A] placeholder-[#74777D]/60 font-mono focus:border-[#20344A] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setText(
                  "I, Ramesh Kumar, son of Late Shri Suresh Kumar, aged about 24 years, resident of Sector 14, Gurugram, do hereby solemnly affirm and declare on oath that I am applying for enrollment as an Advocate before the Bar Council..."
                )
              }
              className="text-xs text-[#C78335] hover:text-[#20344A] font-medium underline"
            >
              Insert sample affidavit excerpt
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs font-medium text-[#74777D] hover:text-[#20344A] transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-4 py-2 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-medium rounded flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Search className="w-3.5 h-3.5" />}
                <span>Identify Document</span>
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 rounded-lg bg-[#FBF8F2] border border-[#E5DED2] shadow-xs space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#E8F3ED] border border-[#557B68]/30 flex items-center justify-center text-[#557B68]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#20344A]">
                    {result.detected_type.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-[#74777D] font-mono">
                    Match Confidence:{' '}
                    <span className="text-[#557B68] font-bold">
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#F4EFEA] text-[#20344A] text-[11px] font-medium rounded border border-[#E5DED2] font-mono">
                {result.detected_type}
              </span>
            </div>

            <p className="text-xs text-[#20344A] bg-white p-3 rounded border border-[#E5DED2] leading-relaxed">
              {result.summary}
            </p>

            {onSelectType && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleApply}
                  className="px-3.5 py-1.5 bg-[#20344A] hover:bg-[#152434] text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Apply Document Type <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
