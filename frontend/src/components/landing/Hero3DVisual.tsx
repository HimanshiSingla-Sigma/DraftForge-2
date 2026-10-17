import React, { useState } from 'react';
import {
  Network,
  Database,
} from 'lucide-react';

export const Hero3DVisual: React.FC = () => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto perspective-1200 select-none">
      {/* Ambient Radial Background Glows */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#F59E0B]/10 via-[#1E3E62]/10 to-[#F59E0B]/10 rounded-[3rem] blur-3xl -z-10" />

      {/* Main 3D Floating Canvas Container */}
      <div className="hero-3d-card relative bg-white rounded-3xl border-2 border-[#0B192C] p-5 sm:p-7 shadow-[0_10px_#0B192C] transition-all duration-700">
        {/* Top Window Chrome */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-[#E6E2D8]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600" />
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
            <span className="text-[11px] font-mono font-bold text-[#5A6A80] ml-2">
              LegalForge_Studio / Affidavit_Draft_v2.legal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 uppercase">
              Live RAG Evaluation
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          </div>
        </div>

        {/* Legal Document Editor Simulation */}
        <div className="relative rounded-2xl bg-[#FAF8F5] border-2 border-[#E6E2D8] p-5 font-mono text-xs text-[#0B192C] leading-relaxed overflow-hidden">
          {/* Sweeping Laser Scan Line */}
          <div className="laser-scan-line animate-scan" />

          {/* Heading */}
          <div className="text-center font-serif font-black text-[#0B192C] mb-3 tracking-wide text-xs sm:text-sm border-b-2 border-[#E6E2D8] pb-2">
            BEFORE THE COMPETENT BAR COUNCIL AUTHORITY, NEW DELHI
            <p className="text-[10px] text-[#1E3E62] font-sans font-bold mt-0.5 uppercase tracking-wider">
              IN THE MATTER OF: STATUTORY ENROLLMENT UNDER ADVOCATES ACT, 1961
            </p>
          </div>

          {/* Clauses with Live AI Annotations */}
          <div className="space-y-2.5 text-[11px] sm:text-xs">
            <p
              onMouseEnter={() => setActiveHighlight(1)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeHighlight === 1
                  ? 'bg-[#ECFDF5] text-[#065F46] border-l-4 border-[#059669]'
                  : 'text-[#0B192C] hover:bg-white'
              }`}
            >
              <strong className="text-[#1E3E62] font-black">1. IDENTIFICATION & AGE:</strong> I, Ramesh Kumar, Son of Shri Suresh Kumar, aged about 24 years, resident of Sector 14, Gurugram, Haryana, do hereby solemnly affirm on oath as under:
            </p>

            <p
              onMouseEnter={() => setActiveHighlight(2)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeHighlight === 2
                  ? 'bg-[#ECFDF5] text-[#065F46] border-l-4 border-[#059669]'
                  : 'text-[#0B192C] hover:bg-white'
              }`}
            >
              <strong className="text-[#1E3E62] font-black">2. LEGAL CHARACTER:</strong> That I have graduated with LL.B (Honours) from an institution recognized by the Bar Council of India, and no criminal proceedings or moral turpitude charges are pending against me in any court of law.
            </p>

            <p
              onMouseEnter={() => setActiveHighlight(3)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeHighlight === 3
                  ? 'bg-[#FFFBEB] text-[#92400E] border-l-4 border-[#D97706]'
                  : 'text-[#0B192C] hover:bg-white'
              }`}
            >
              <strong className="text-[#D97706] font-black">3. FULL-TIME ENGAGEMENT:</strong> That I am not engaged in any commercial trade, full-time business, or salaried profession contrary to the Bar Council of India Rules.
            </p>

            <div
              onMouseEnter={() => setActiveHighlight(4)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3 rounded-2xl transition-all cursor-pointer border-2 ${
                activeHighlight === 4
                  ? 'bg-white border-[#0B192C] text-[#0B192C] shadow-md'
                  : 'bg-white border-[#E6E2D8] text-[#0B192C]'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[#1E3E62] mb-1 font-mono text-[11px]">
                <span>VERIFICATION JURAT:</span>
                <span className="text-[9px] text-[#059669] uppercase font-bold">
                  ✓ Verified under Oath
                </span>
              </div>
              <p className="text-[10px] text-[#5A6A80] leading-normal font-sans">
                "Verified at New Delhi on this 23rd day of August, 2026, that the contents of paragraphs 1 to 3 are true to my personal knowledge and belief. Nothing material has been concealed."
              </p>
            </div>
          </div>
        </div>

        {/* Floating Holographic Badge 1: Deterministic Score Card (Top Right) */}
        <div className="absolute -top-6 -right-4 sm:-right-8 p-3 rounded-2xl bg-white border-2 border-[#0B192C] shadow-[0_4px_#0B192C] animate-float">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E6E2D8"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-black text-xs text-[#0B192C]">87%</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#5A6A80] font-mono block">
                Deterministic Rubric
              </span>
              <span className="font-serif font-black text-xs text-[#059669]">Statutory Compliant</span>
            </div>
          </div>
        </div>

        {/* Floating Holographic Badge 2: FastEmbed Qdrant Match (Bottom Left) */}
        <div className="absolute -bottom-6 -left-3 sm:-left-8 p-3 rounded-2xl bg-white border-2 border-[#0B192C] shadow-[0_4px_#0B192C] animate-float-reverse">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border-2 border-[#E6E2D8] flex items-center justify-center text-[#1E3E62]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#5A6A80] block font-bold">
                FastEmbed 384-dim Match
              </span>
              <span className="font-bold text-[#0B192C] text-[11px]">
                96.4% Ground Truth Precedent
              </span>
            </div>
          </div>
        </div>

        {/* Floating Holographic Badge 3: Neo4j Graph RAG Risk Alert (Bottom Right) */}
        <div className="absolute -bottom-6 right-2 sm:right-6 p-3 rounded-2xl bg-white border-2 border-[#0B192C] shadow-[0_4px_#0B192C] animate-float-slow">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#B45309]">
              <Network className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-[#5A6A80] block font-bold">Neo4j Aura Graph</span>
              <span className="font-bold text-[#0B192C] text-[10px]">
                Prerequisites Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
