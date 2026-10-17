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
      title="Rule-Based Document Classifier"
      subtitle="Paste raw legal text to detect statutory document classification and structural confidence"
      icon={<Sparkles className="w-5 h-5" />}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        <form onSubmit={handleClassify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-2 font-mono">
              Legal Draft Content / Excerpt
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste deed text, recital preamble, or affidavit verification clause..."
              rows={6}
              className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-2xl p-4 text-xs text-[#0B192C] placeholder-[#5A6A80]/60 font-mono focus:border-[#1E3E62] focus:outline-none transition-colors"
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
              className="text-xs text-[#1E3E62] hover:text-[#0B192C] font-bold underline"
            >
              Insert sample affidavit excerpt
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C] transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B192C] text-xs font-black rounded-xl flex items-center gap-2 border-2 border-[#B45309] border-b-4 border-b-[#B45309] tactile-btn shadow-sm disabled:opacity-50 transition-all"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Search className="w-3.5 h-3.5" />}
                Analyze Structure
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] shadow-sm space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-black text-[#0B192C]">
                    {result.detected_type.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-[#5A6A80] font-mono">
                    Structural Match Confidence:{' '}
                    <span className="text-[#059669] font-bold">
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[#1E3E62]/10 text-[#1E3E62] text-xs font-bold rounded-lg border border-[#1E3E62]/20 font-mono">
                {result.detected_type}
              </span>
            </div>

            <p className="text-xs text-[#0B192C] bg-white p-3.5 rounded-xl border border-[#E6E2D8] leading-relaxed">
              {result.summary}
            </p>

            {onSelectType && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-[#1E3E62] hover:bg-[#0B192C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border-2 border-[#0B192C] border-b-4 border-b-[#0B192C] tactile-btn"
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
