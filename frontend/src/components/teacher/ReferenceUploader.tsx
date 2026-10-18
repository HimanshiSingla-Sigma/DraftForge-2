import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DocumentType, ReferenceDocument } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  BookOpen,
  Library,
} from 'lucide-react';

export const ReferenceUploader: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('AFFIDAVIT_OF_CHARACTER');
  const [jurisdiction, setJurisdiction] = useState('India');
  const [uploading, setUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState<ReferenceDocument[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.getReferences();
      setRecentUploads(res.data.slice(0, 6));
    } catch (err: any) {
      // Ignore initial load failure
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a reference benchmark file (.pdf, .docx, .txt).', 'error');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('document_type', docType);
    fd.append('jurisdiction', jurisdiction);

    try {
      await api.uploadReference(fd);
      showToast(`Document "${file.name}" ingested into the statutory precedent library!`, 'success');
      setFile(null);
      await fetchRecent();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to ingest reference document', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Institutional Knowledge Corpus
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Authoritative Precedents
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Precedent Library & Statutory Ingestion
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Ingest master model templates, judicial forms, and statutory covenants used as grading benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#20344A] px-3.5 py-1.5 bg-[#FBF8F2] rounded border border-[#E5DED2] shrink-0">
          <Library className="w-3.5 h-3.5 text-[#C78335]" />
          <span>Repository: Statutory Precedents</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Ingestion Upload Form */}
        <div className="col-span-12 lg:col-span-6 bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5DED2]">
            <UploadCloud className="w-4 h-4 text-[#C78335]" />
            <h3 className="font-serif font-medium text-base text-[#20344A]">Upload Benchmark Template</h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
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
                Statutory Jurisdiction
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. India (High Court / Bar Council Standard)"
                className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
              />
            </div>

            {/* File drop area */}
            <div className="border border-dashed border-[#E5DED2] hover:border-[#20344A] rounded p-6 text-center cursor-pointer transition-all bg-[#FBF8F2] group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="ref-upload-input"
              />
              <label htmlFor="ref-upload-input" className="cursor-pointer space-y-1.5 block">
                <UploadCloud className="w-8 h-8 text-[#C78335] mx-auto transition-transform group-hover:scale-105" />
                <p className="font-serif text-sm font-medium text-[#20344A]">
                  {file ? file.name : 'Select or drop benchmark legal file'}
                </p>
                <p className="text-[11px] text-[#74777D] font-mono">
                  Accepts PDF, DOCX, TXT up to 15MB
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2 bg-[#20344A] hover:bg-[#152332] text-white font-semibold text-xs rounded transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <UploadCloud className="w-3.5 h-3.5 text-[#C78335]" />}
              <span>Ingest into Precedent Library</span>
            </button>
          </form>
        </div>

        {/* Right 6 Cols: Recent Master Ingestions */}
        <div className="col-span-12 lg:col-span-6 bg-[#FFFFFF] p-6 lg:p-8 rounded-lg border border-[#E5DED2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5DED2]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#20344A]" />
              <h3 className="font-serif font-medium text-base text-[#20344A]">Recently Ingested Precedents</h3>
            </div>
            <span className="text-[11px] text-[#74777D] font-mono">Indexed Corpus</span>
          </div>

          {loadingRecent ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#74777D] space-y-2">
              <FileText className="w-8 h-8 text-[#74777D]/30 mx-auto" />
              <p>No master reference documents ingested yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentUploads.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded bg-white border border-[#E5DED2] flex items-center justify-center text-[#20344A] shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-medium text-xs text-[#20344A] truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#74777D] font-mono mt-0.5">
                        <span className="text-[#557B68] font-semibold">{doc.document_type.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>{doc.jurisdiction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Indexed</span>
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