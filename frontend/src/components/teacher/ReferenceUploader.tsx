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
  ShieldCheck,
  Server,
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
      showToast(`Document "${file.name}" chunked and indexed into Qdrant Cloud!`, 'success');
      setFile(null);
      await fetchRecent();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to ingest reference document', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl tactile-card bg-[#FAF8F5] border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C] tracking-tight">Ingest Master Reference Corpus</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30 font-mono">
              FastEmbed + Qdrant Cloud
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1">
            Uploaded reference documents are parsed, chunked by legal section, and indexed as 384-dimensional dense vectors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0B192C] px-3.5 py-2 bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8]">
          <Server className="w-3.5 h-3.5 text-[#1E3E62]" />
          <span>Collection: legal_reference_corpus</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left 6 Cols: Ingestion Upload Form */}
        <div className="col-span-12 lg:col-span-6 tactile-card bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-[#E6E2D8]">
            <UploadCloud className="w-4 h-4 text-[#1E3E62]" />
            <h3 className="font-serif font-bold text-base text-[#0B192C]">Upload Benchmark Template</h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B192C] mb-1.5">
                Target Legal Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl p-2.5 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
              >
                <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character (India)</option>
                <option value="EMPLOYMENT_AGREEMENT">Employment Agreement (India)</option>
                <option value="RENT_AGREEMENT">Residential Rent Deed (India)</option>
                <option value="LEGAL_NOTICE">Statutory Legal Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B192C] mb-1.5">
                Jurisdiction
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. India (Bar Council / High Court)"
                className="w-full bg-[#FAF8F5] border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none"
              />
            </div>

            {/* Drag and drop / file selector */}
            <div className="border-2 border-dashed border-[#E6E2D8] hover:border-[#1E3E62] rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#FDFBF7] shadow-inner group">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="ref-upload-input"
              />
              <label htmlFor="ref-upload-input" className="cursor-pointer space-y-2 block">
                <UploadCloud className="w-10 h-10 text-[#1E3E62] mx-auto group-hover:scale-110 transition-transform" />
                <p className="font-serif text-sm font-bold text-[#0B192C]">
                  {file ? file.name : 'Select or Drag Benchmark Legal File'}
                </p>
                <p className="text-[11px] text-[#0B192C]/50 font-mono">
                  Accepts .PDF, .DOCX, .TXT up to 15MB
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="tactile-btn w-full py-3 bg-[#1E3E62] hover:bg-[#152e4a] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-[0_3px_#0B192C] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Parsing, Chunking & Vectorizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                  <span>Vectorize & Index into Qdrant</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 6 Cols: Recent Indexed Corpus Files */}
        <div className="col-span-12 lg:col-span-6 tactile-card bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#E6E2D8]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1E3E62]" />
              <h3 className="font-serif font-bold text-base text-[#0B192C]">Active Reference Corpus</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0B192C]/60">
              {recentUploads.length} Documents
            </span>
          </div>

          {loadingRecent ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#0B192C]/50 space-y-2">
              <FileText className="w-8 h-8 text-[#0B192C]/30 mx-auto" />
              <p>No reference documents ingested yet. Upload benchmark templates on the left.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {recentUploads.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] space-y-2 shadow-[0_2px_#E6E2D8]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-[#0B192C] truncate max-w-[200px]">
                      {doc.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1E3E62] border border-[#E6E2D8]">
                      {doc.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#0B192C]/70 font-mono">
                    <span>Jurisdiction: {doc.jurisdiction}</span>
                    <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#0B192C]/60 pt-1 border-t-2 border-[#E6E2D8]">
                    <div className="flex items-center gap-1 font-mono text-emerald-800 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{doc.file_hash.substring(0, 12)}...</span>
                    </div>
                    <span className="font-mono">{new Date(doc.created_at).toLocaleDateString()}</span>
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