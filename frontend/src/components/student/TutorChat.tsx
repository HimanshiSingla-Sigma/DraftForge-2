import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Conversation, ChatMessage, DocumentType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../common/Toast';
import {
  Plus,
  Send,
  BookOpen,
  User,
  Sparkles,
  MessageSquare,
  Scale,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const TutorChat: React.FC = () => {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [docType, setDocType] = useState<DocumentType>('AFFIDAVIT_OF_CHARACTER');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.data || []);
      if (res.data && res.data.length > 0 && !activeConv) {
        setActiveConv(res.data[0]);
      }
    } catch (err: any) {
      showToast('Error loading conversation threads', 'error');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      setLoadingHistory(true);
      api
        .getMessages(activeConv.id)
        .then((res) => setMessages(res.data || []))
        .catch(() => showToast('Failed to fetch messages', 'error'))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeConv]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleCreateNewThread = async () => {
    try {
      const title = `Inquiry: ${docType.replace(/_/g, ' ')}`;
      const res = await api.createConversation(title);
      const newConv = res.data;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConv(newConv);
      setMessages([]);
      showToast('Created new legal dialogue session', 'info');
    } catch (err: any) {
      showToast('Failed to create thread', 'error');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const currentText = inputMsg;
    setInputMsg('');
    setSending(true);

    try {
      let targetConv = activeConv;

      if (!targetConv) {
        const createRes = await api.createConversation(
          currentText.length > 30 ? `${currentText.slice(0, 30)}...` : currentText
        );
        targetConv = createRes.data;
        setConversations((prev) => [targetConv!, ...prev]);
        setActiveConv(targetConv);
      }

      const payload = {
        conversation_id: targetConv.id,
        message: currentText,
        document_type: docType,
      };

      const res = await api.sendChatMessage(payload);
      setMessages((prev) => [...prev, res.data.user_message, res.data.ai_message]);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'What verification jurat elements are mandatory in an Indian Affidavit of Character?',
    'Under Section 27 of the Indian Contract Act, how should non-solicitation covenants be drafted?',
    'What standard notice period and security deposit terms apply to residential rent deeds?',
    'How do I structure a formal statutory legal notice demanding performance of contract?',
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-fade-in font-sans">
      {/* Left Column: Conversation Threads */}
      <div className="col-span-12 lg:col-span-4 bg-[#FFFFFF] p-5 rounded-lg border border-[#E5DED2] shadow-sm flex flex-col justify-between overflow-hidden">
        <div className="space-y-3 overflow-hidden flex flex-col flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DED2]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#20344A]" />
              <h3 className="font-serif font-medium text-sm text-[#20344A]">
                Dialogue Threads ({conversations.length})
              </h3>
            </div>
            <button
              onClick={handleCreateNewThread}
              className="p-1.5 rounded bg-[#FBF8F2] hover:bg-[#F3EFE6] text-[#20344A] border border-[#E5DED2] transition-colors cursor-pointer"
              title="New Tutoring Dialogue"
            >
              <Plus className="w-4 h-4 text-[#C78335]" />
            </button>
          </div>

          {/* Conversation List */}
          <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-[#74777D] p-4 text-center">
                No active threads. Ask a question to begin Socratic legal dialogue.
              </p>
            ) : (
              conversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`p-3 rounded cursor-pointer text-xs transition-all border ${
                      isActive
                        ? 'bg-[#FBF0E4] border-[#C78335] text-[#20344A]'
                        : 'bg-[#FBF8F2] border-[#E5DED2] text-[#43474D] hover:bg-white hover:border-[#74777D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[190px] font-serif font-medium">{c.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#74777D] shrink-0" />
                    </div>
                    <span className="block text-[10px] text-[#74777D] font-mono mt-1">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Document Context Selector */}
        <div className="pt-3 border-t border-[#E5DED2] space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#74777D] block">
            Subject Doctrine Context:
          </span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="w-full bg-[#FBF8F2] border border-[#E5DED2] rounded px-2.5 py-1.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none"
          >
            <option value="AFFIDAVIT_OF_CHARACTER">Affidavit of Character (India)</option>
            <option value="EMPLOYMENT_AGREEMENT">Employment Agreement (India)</option>
            <option value="RENT_AGREEMENT">Residential Rent Deed (India)</option>
            <option value="LEGAL_NOTICE">Statutory Legal Notice</option>
          </select>
        </div>
      </div>

      {/* Right Column: Chat Stream */}
      <div className="col-span-12 lg:col-span-8 bg-[#FFFFFF] rounded-lg border border-[#E5DED2] shadow-sm flex flex-col overflow-hidden">
        {/* Chat Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loadingHistory ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" label="Loading dialogue history..." />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto py-8">
              <div className="w-12 h-12 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center text-[#C78335]">
                <Scale className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-medium text-[#20344A]">Socratic AI Legal Tutor</h3>
                <p className="text-xs text-[#74777D] leading-relaxed">
                  Ask conceptual or doctrinal drafting questions. Guidance is synthesized from verified legal precedent corpuses and statutory rules.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2 w-full text-left pt-2">
                <span className="text-[10px] font-semibold text-[#74777D] uppercase tracking-wider block">
                  Suggested Inquiries:
                </span>
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMsg(q)}
                    className="w-full p-2.5 rounded bg-[#FBF8F2] hover:bg-[#F3EFE6] border border-[#E5DED2] text-xs text-[#20344A] text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C78335] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center shrink-0 text-[#C78335] mt-1">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl p-4 rounded text-xs leading-relaxed space-y-2.5 ${
                      isUser
                        ? 'bg-[#20344A] text-white rounded-tr-none'
                        : 'bg-[#FBF8F2] text-[#20344A] border border-[#E5DED2] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Grounded Sources */}
                    {m.retrieved_sources && m.retrieved_sources.length > 0 && (
                      <div className="pt-2 border-t border-[#E5DED2] text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-[#C78335] font-semibold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="font-serif">Grounded Statutory Citations:</span>
                        </div>
                        <div className="space-y-1">
                          {m.retrieved_sources.map((s, i) => (
                            <div
                              key={i}
                              className="font-serif italic text-[#43474D] bg-white p-2 rounded border border-[#E5DED2]"
                            >
                              • {s.source_document} (Page {s.page_number || 1}) — {s.section}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-center shrink-0 text-[#20344A] mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-center gap-2.5 p-3 rounded bg-[#FBF8F2] border border-[#E5DED2] w-fit">
              <LoadingSpinner size="sm" />
              <span className="text-xs text-[#74777D] animate-pulse">
                AI Legal Tutor is reviewing statutory precedents and formulating guidance...
              </span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 border-t border-[#E5DED2] bg-[#FBF8F2] flex gap-2.5"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask your legal drafting tutor a question (e.g. How do I draft a valid verification jurat?)..."
            className="flex-1 bg-white border border-[#E5DED2] rounded px-3.5 py-2.5 text-xs text-[#20344A] focus:border-[#20344A] focus:outline-none placeholder-[#74777D]"
          />
          <button
            type="submit"
            disabled={sending || !inputMsg.trim()}
            className="px-4 py-2.5 bg-[#20344A] hover:bg-[#152332] text-white rounded text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#C78335]" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};