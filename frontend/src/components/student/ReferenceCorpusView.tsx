import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ReferenceDocument, DocumentType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const ReferenceCorpusView: React.FC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<ReferenceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getReferences(filterType === 'ALL' ? undefined : (filterType as DocumentType));
      setDocuments(res.data || []);
    } catch (err: any) {
      showToast('Failed to load legal reference corpus', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filterType]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast('SHA-256 integrity hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.document_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl tactile-card bg-white border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0B192C] tracking-tight">Legal Reference Corpus</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0FDF4] text-[#059669] border border-[#10B981]/30 font-mono">
              Qdrant Cloud Indexed
            </span>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1 font-sans">
            Gold-standard statutory templates, precedent deeds, and benchmark judicial forms used for RAG grounding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[#0B192C]/70 px-3.5 py-2 bg-[#F3F0EA] rounded-xl border-2 border-[#E6E2D8]">
            Total Reference Templates: <span className="text-[#059669] font-bold">{documents.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#0B192C]/40 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference corpus by title or keyword..."
            className="w-full bg-white border-2 border-[#E6E2D8] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B192C] placeholder-[#0B192C]/40 focus:border-[#1E3E62] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0B192C]/70 font-semibold font-mono">Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border-2 border-[#E6E2D8] rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:border-[#1E3E62] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character</option>
            <option value="EMPLOYMENT_AGREEMENT">Employment Agreement</option>
            <option value="RENT_AGREEMENT">Rent Agreement</option>
            <option value="LEGAL_NOTICE">Legal Notice</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="xl" label="Loading benchmark reference templates..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="tactile-card bg-white p-12 text-center rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
          <BookOpen className="w-12 h-12 text-[#0B192C]/40 mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#0B192C]">No Reference Documents Found</h3>
          <p className="text-xs text-[#0B192C]/70 max-w-sm mx-auto font-sans">
            No templates match the selected filter. Try selecting &ldquo;All Categories&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] hover:border-[#1E3E62] transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3F0EA] text-[#1E3E62] border border-[#E6E2D8]">
                    {doc.document_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-[#0B192C]/60 font-mono">
                    {(doc.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-[#0B192C] group-hover:text-[#1E3E62] transition-colors">
                  {doc.title}
                </h3>

                <div className="space-y-1 text-xs text-[#0B192C]/70 font-sans">
                  <p>
                    <span className="text-[#0B192C]/50">Jurisdiction:</span> {doc.jurisdiction}
                  </p>
                  <p>
                    <span className="text-[#0B192C]/50">Uploaded:</span>{' '}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bottom Actions & Hash */}
              <div className="pt-3 border-t-2 border-[#E6E2D8] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#0B192C]/60 font-mono">
                  <div className="flex items-center gap-1 truncate max-w-[170px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>{doc.file_hash.substring(0, 14)}...</span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(doc.file_hash)}
                    className="text-[#1E3E62] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Copy full SHA-256 Hash"
                  >
                    {copiedHash === doc.file_hash ? (
                      <Check className="w-3 h-3 text-[#059669]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedHash === doc.file_hash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="w-full py-2 bg-[#FAF8F5] border-2 border-[#E6E2D8] text-[#0B192C]/70 rounded-xl text-[11px] font-mono flex items-center justify-center gap-1.5 truncate px-3">
                  <FileText className="w-3.5 h-3.5 text-[#1E3E62] shrink-0" />
                  <span className="truncate">{doc.storage_path}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
