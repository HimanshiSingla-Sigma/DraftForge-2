import { Scale } from 'lucide-react';

interface LandingFooterProps {
  onOpenAuth: () => void;
  onOpenHealth?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenAuth,
  onOpenHealth,
}) => {
  return (
    <footer className="border-t border-[#E5DED2] bg-[#F5F0E7] pt-14 pb-12 text-[#687584] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#20344A] flex items-center justify-center text-white">
                <Scale className="w-4 h-4 text-[#C78335]" />
              </div>
              <span className="font-serif text-xl font-normal text-[#20344A] tracking-tight">
                DraftForge AI
              </span>
            </div>

            <p className="text-xs text-[#43566B] leading-relaxed max-w-sm font-sans">
              The academic legal drafting and evaluation platform. Crafted for law students and clinical faculty to cultivate rigorous doctrinal analysis, structured rubric feedback, and Bluebook citation precision.
            </p>

            {onOpenHealth && (
              <button
                onClick={onOpenHealth}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FBF8F2] border border-[#E5DED2] text-xs font-sans text-[#557B68] transition-colors shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#557B68] animate-pulse" />
                <span>Platform Architecture & Health Status</span>
              </button>
            )}
          </div>

          {/* Col 2: Core Platform */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-medium text-[#20344A] uppercase tracking-wider text-xs">
              Curriculum Modules
            </h4>
            <ul className="space-y-2 text-[#43566B]">
              <li>
                <a href="#how-it-works" className="hover:text-[#20344A] transition-colors font-medium">
                  The Methodology
                </a>
              </li>
              <li>
                <a href="#scanner" className="hover:text-[#20344A] transition-colors font-medium">
                  Interactive Scanner
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#20344A] transition-colors font-medium">
                  AI Legal Tutor
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#20344A] transition-colors font-medium">
                  Academic Rubrics
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#20344A] transition-colors font-medium">
                  Precedent Library
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Studio */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-medium text-[#20344A] uppercase tracking-wider text-xs">
              For Law Students
            </h4>
            <ul className="space-y-2 text-[#43566B]">
              <li>
                <a href="#students" className="hover:text-[#20344A] transition-colors font-medium">
                  Draft Studio
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#20344A] transition-colors font-medium">
                  Learning Roadmap
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#20344A] transition-colors font-medium">
                  Socratic AI Tutor
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#20344A] transition-colors font-medium">
                  Practice Exercises
                </a>
              </li>
              <li>
                <a href="#students" className="hover:text-[#20344A] transition-colors font-medium">
                  Core Competencies
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Faculty Studio */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-medium text-[#20344A] uppercase tracking-wider text-xs">
              For Clinical Faculty
            </h4>
            <ul className="space-y-2 text-[#43566B]">
              <li>
                <a href="#faculty" className="hover:text-[#20344A] transition-colors font-medium">
                  Assignment Management
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#20344A] transition-colors font-medium">
                  Submissions Auditor
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#20344A] transition-colors font-medium">
                  Audited Grade Overrides
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#20344A] transition-colors font-medium">
                  Statutory Precedent Corpus
                </a>
              </li>
              <li>
                <a href="#faculty" className="hover:text-[#20344A] transition-colors font-medium">
                  Cohort Doctrinal Analytics
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#687584]">
          <p>© {new Date().getFullYear()} DraftForge AI. All rights reserved. Juris Education Platform.</p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-sans">
              ABA Standards 302 & 314 Aligned
            </span>
            <button
              onClick={onOpenAuth}
              className="text-[#20344A] hover:text-[#101D29] font-medium underline font-sans"
            >
              Sign In to Academic Portal →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
