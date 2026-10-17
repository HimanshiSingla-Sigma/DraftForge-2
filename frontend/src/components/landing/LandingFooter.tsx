import React from 'react';
import {
  Scale,
} from 'lucide-react';

interface LandingFooterProps {
  onOpenAuth: () => void;
  onOpenHealth?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenAuth,
  onOpenHealth,
}) => {
  return (
    <footer className="border-t-2 border-[#E6E2D8] bg-[#F3F0EA] pt-16 pb-12 text-[#5A6A80] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-[0_3px_#0B192C]">
                <Scale className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <span className="font-serif text-xl font-black text-[#0B192C] tracking-tight">
                Draft<span className="text-[#F59E0B]">Forge</span>
              </span>
            </div>

            <p className="text-xs text-[#5A6A80] leading-relaxed max-w-sm">
              The AI-powered legal drafting, evaluation, and learning platform. Built for law students, legal scholars, and faculty with deterministic rubric precision, dense vector retrieval, and Neo4j knowledge graph reasoning.
            </p>

            {onOpenHealth && (
              <button
                onClick={onOpenHealth}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] text-xs font-mono font-bold text-[#059669] tactile-btn transition-colors shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>System Telemetry & Architecture Health</span>
              </button>
            )}
          </div>

          {/* Col 2: Core Platform */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-black text-[#0B192C] uppercase tracking-wider text-xs">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-[#5A6A80]">
              <li>
                <a href="#scanner" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Interactive Scanner
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1E3E62] transition-colors font-medium">
                  AI Drafting Copilot
                </a>
              </li>
              <li>
                <a href="#ai-evaluation" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Deterministic Rubrics
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1E3E62] transition-colors font-medium">
                  GraphRAG Loopholes
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Reference Precedent Corpus
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Studio */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-black text-[#0B192C] uppercase tracking-wider text-xs">
              For Students
            </h4>
            <ul className="space-y-2 text-[#5A6A80]">
              <li>
                <a href="#students" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Legal Drafting Workspace
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#1E3E62] transition-colors font-medium">
                  5-Phase Learning Roadmap
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Socratic AI Tutor Chat
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Interactive Statutory Quizzes
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Skill Mastery Matrix (EMA)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Faculty Studio */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-black text-[#0B192C] uppercase tracking-wider text-xs">
              For Faculty
            </h4>
            <ul className="space-y-2 text-[#5A6A80]">
              <li>
                <a href="#faculty" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Assignment Manager
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Submissions Auditor & Grading
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Audited Score Overrides
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Reference Corpus Ingestion
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#1E3E62] transition-colors font-medium">
                  Cohort Weak-Skill Analytics
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-[#E6E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#5A6A80]">
          <p>© {new Date().getFullYear()} DraftForge AI. All rights reserved. Deterministic LegalTech Platform.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] font-bold">
              FastEmbed • Qdrant • Neo4j Aura • Supabase
            </span>
            <button
              onClick={onOpenAuth}
              className="text-[#1E3E62] hover:text-[#0B192C] font-bold underline"
            >
              Sign In to Portal →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
