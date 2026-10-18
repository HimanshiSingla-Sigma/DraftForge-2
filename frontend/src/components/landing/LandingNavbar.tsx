import React, { useState, useEffect } from 'react';
import {
  Scale,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

interface LandingNavbarProps {
  onOpenAuth: () => void;
  onOpenHealth?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenAuth,
  onOpenHealth,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Methodology', href: '#how-it-works' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Curriculum Roadmap', href: '#roadmap' },
    { label: 'For Students', href: '#students' },
    { label: 'For Faculty', href: '#faculty' },
    { label: 'Live Scanner', href: '#scanner' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FBF8F2]/95 backdrop-blur-md border-b border-[#E5DED2] shadow-[0_2px_12px_rgba(32,52,74,0.04)] py-2.5'
            : 'bg-[#FBF8F2] border-b border-[#E5DED2] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#20344A] flex items-center justify-center shadow-xs group-hover:bg-[#152332] transition-colors shrink-0">
              <Scale className="w-4 h-4 text-[#C78335]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl tracking-tight text-[#20344A] font-medium leading-none">
                  DraftForge AI
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5E8D3] text-[#8A5100] uppercase tracking-wider font-sans whitespace-nowrap shrink-0 border border-[#E5DED2]/80">
                  Juris Education
                </span>
              </div>
              <p className="text-[11px] text-[#687584] font-sans mt-0.5 hidden sm:block leading-none">
                Legal Writing & Doctrinal Evaluation
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 px-2 py-1 bg-white border border-[#E5DED2] rounded-full shadow-2xs shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1 text-xs font-medium text-[#43566B] hover:text-[#20344A] hover:bg-[#FBF8F2] rounded-full transition-all font-sans whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onOpenHealth && (
              <button
                onClick={onOpenHealth}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#E8F3ED] hover:bg-[#dbeee4] text-[#557B68] text-[11px] font-semibold border border-[#557B68]/30 transition-all font-sans shadow-2xs cursor-pointer whitespace-nowrap"
                title="Institutional System Diagnostics & Telemetry"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#557B68] animate-pulse" />
                <span>Platform Verified</span>
              </button>
            )}

            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#20344A] bg-white hover:bg-[#FBF8F2] border border-[#E5DED2] shadow-2xs transition-all font-sans cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>

            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#20344A] hover:bg-[#152332] text-white text-xs font-semibold rounded-md shadow-sm transition-all group font-sans cursor-pointer whitespace-nowrap"
            >
              <span>Start Drafting</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#C78335]" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md bg-white border border-[#E5DED2] text-[#20344A] hover:bg-[#FBF8F2] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FBF8F2]/98 backdrop-blur-xl lg:hidden flex flex-col justify-between p-6 pt-24 animate-fade-in border-b border-[#E5DED2]">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#687584] px-2 font-sans">
              Academic Syllabus & Navigation
            </p>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 rounded-lg bg-white border border-[#E5DED2] text-sm font-semibold text-[#20344A] hover:border-[#20344A] transition-colors font-sans"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-2.5 pt-6 border-t border-[#E5DED2]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3 rounded-lg bg-[#20344A] text-white font-semibold text-xs shadow-sm font-sans flex items-center justify-center gap-2"
            >
              <span>Enter Drafting Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-lg bg-white border border-[#E5DED2] text-[#20344A] font-medium text-xs hover:bg-[#F5F0E7] font-sans"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      )}
    </>
  );
};
