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
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'AI Evaluation & RAG', href: '#ai-evaluation' },
    { label: 'For Students', href: '#students' },
    { label: 'For Faculty', href: '#faculty' },
    { label: 'Live Scanner', href: '#scanner' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b-2 border-[#E6E2D8] shadow-sm py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-[0_3px_#0B192C] group-hover:translate-y-[-1px] transition-transform">
              <Scale className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-black tracking-tight text-[#0B192C] group-hover:text-[#1E3E62] transition-colors">
                  Draft<span className="text-[#F59E0B]">Forge</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 uppercase tracking-wider font-mono">
                  AI LegalTech
                </span>
              </div>
              <p className="text-[10px] text-[#5A6A80] font-medium hidden sm:block">
                Evidence-Grounded Drafting & Evaluation
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-white border-2 border-[#E6E2D8] shadow-sm rounded-2xl">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-bold text-[#5A6A80] hover:text-[#0B192C] hover:bg-[#F3F0EA] rounded-xl transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {onOpenHealth && (
              <button
                onClick={onOpenHealth}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] text-xs font-bold border-2 border-[#A7F3D0] border-b-4 border-b-[#6EE7B7] tactile-btn transition-all font-mono shadow-sm"
                title="Telemetry: Supabase, FastEmbed, Qdrant & Neo4j Aura"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Backend Live</span>
              </button>
            )}

            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-[#0B192C] bg-white hover:bg-[#F3F0EA] border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] tactile-btn transition-all shadow-sm"
            >
              Sign In
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B192C] text-xs font-black rounded-xl border-2 border-[#B45309] border-b-4 border-b-[#B45309] shadow-sm tactile-btn transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] text-[#0B192C] tactile-btn"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-2xl lg:hidden flex flex-col justify-between p-6 pt-24 animate-fade-in">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A6A80] px-3 font-mono">
              Navigation
            </p>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3.5 rounded-2xl bg-white border-2 border-[#E6E2D8] text-sm font-bold text-[#0B192C] hover:border-[#1E3E62] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t-2 border-[#E6E2D8]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#F59E0B] text-[#0B192C] font-black text-xs border-2 border-[#B45309] border-b-4 border-b-[#B45309] tactile-btn shadow-sm"
            >
              Enter DraftForge Studio
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3 rounded-2xl bg-white border-2 border-[#E6E2D8] border-b-4 border-b-[#D5CEBE] text-[#0B192C] font-bold text-xs tactile-btn"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      )}
    </>
  );
};
