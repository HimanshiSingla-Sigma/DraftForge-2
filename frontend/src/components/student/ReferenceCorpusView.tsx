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
    showToast('Archival verification hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.document_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <header className="bg-[#FFFFFF] p-5 sm:p-6 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#C78335] font-semibold bg-[#FBF0E4] px-2 py-0.5 rounded">
              Statutory Knowledge Corpus
            </span>
            <span className="text-xs text-[#557B68] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded">
              Verified Precedents
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#20344A] tracking-tight font-medium mt-1">
            Precedent Library & Statutory Templates
          </h2>
          <p className="text-xs text-[#74777D] mt-0.5">
            Gold-standard statutory deeds, standard covenants, and benchmark judicial forms used for rubric alignment.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#FBF8F2] border border-[#E5DED2] rounded text-xs font-mono text-[#20344A] shrink-0">
          Curated Precedents: <strong className="text-[#557B68]">{documents.length}</strong>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E5DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#74777D] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search precedent library by title or doctrine..."
            className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded pl-8 pr-3 py-1.5 text-xs text-[#20344A] placeholder-[#74777D] focus:border-[#20344A] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#74777D]">Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#FBF8F2] border border-[#E5DED2] rounded px-3 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
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
          <LoadingSpinner size="xl" label="Loading benchmark precedent templates..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] p-12 text-center rounded-lg border border-[#E5DED2] shadow-sm space-y-3">
          <BookOpen className="w-10 h-10 text-[#74777D]/30 mx-auto" />
          <h3 className="font-serif text-lg font-medium text-[#20344A]">No Reference Documents Found</h3>
          <p className="text-xs text-[#74777D] max-w-sm mx-auto leading-relaxed">
            No templates match the selected filter. Try selecting &ldquo;All Categories&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-xs hover:border-[#20344A] transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30">
                    {doc.document_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-[#74777D] font-mono">
                    {(doc.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <h3 className="font-serif font-medium text-base text-[#20344A] group-hover:text-[#C78335] transition-colors">
                  {doc.title}
                </h3>

                <div className="space-y-1 text-xs text-[#74777D]">
                  <p>
                    <span className="text-[#20344A] font-medium">Jurisdiction:</span> {doc.jurisdiction}
                  </p>
                  <p>
                    <span className="text-[#20344A] font-medium">Indexed:</span>{' '}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bottom Actions & Hash */}
              <div className="pt-3 border-t border-[#E5DED2] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#74777D] font-mono">
                  <div className="flex items-center gap-1 truncate max-w-[170px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#557B68] shrink-0" />
                    <span>{doc.file_hash.substring(0, 14)}...</span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(doc.file_hash)}
                    className="text-[#C78335] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Copy verification hash"
                  >
                    {copiedHash === doc.file_hash ? (
                      <Check className="w-3 h-3 text-[#557B68]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedHash === doc.file_hash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="w-full py-1.5 bg-[#FBF8F2] border border-[#E5DED2] text-[#74777D] rounded text-[11px] font-mono flex items-center justify-center gap-1.5 truncate px-2.5">
                  <FileText className="w-3 h-3 text-[#20344A] shrink-0" />
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
