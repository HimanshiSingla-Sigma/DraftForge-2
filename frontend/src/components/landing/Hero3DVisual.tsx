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

      {/* Main Floating Document Container */}
      <div className="hero-3d-card relative bg-white rounded-2xl border border-[#E5DED2] p-5 sm:p-7 shadow-xl transition-all duration-700">
        {/* Top Window Chrome */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E5DED2]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5DED2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5DED2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5DED2]" />
            <span className="text-[11px] font-mono text-[#74777D] ml-2">
              Statutory Docket / Bar_Affidavit_Benchmark.legal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#FBF0E4] text-[#C78335] border border-[#C78335]/30 uppercase">
              Statutory Quality Audit
            </span>
            <span className="w-2 h-2 rounded-full bg-[#557B68] animate-pulse" />
          </div>
        </div>

        {/* Legal Document Editor Simulation */}
        <div className="relative rounded-lg bg-[#FBF8F2] border border-[#E5DED2] p-5 font-mono text-xs text-[#20344A] leading-relaxed overflow-hidden">
          {/* Sweeping Laser Scan Line */}
          <div className="laser-scan-line animate-scan" />

          {/* Heading */}
          <div className="text-center font-serif font-medium text-[#20344A] mb-3 tracking-wide text-xs sm:text-sm border-b border-[#E5DED2] pb-2">
            BEFORE THE COMPETENT BAR COUNCIL AUTHORITY, NEW DELHI
            <p className="text-[10px] text-[#C78335] font-sans font-medium mt-0.5 uppercase tracking-wider">
              IN THE MATTER OF: STATUTORY ENROLLMENT UNDER ADVOCATES ACT, 1961
            </p>
          </div>

          {/* Clauses with Live AI Annotations */}
          <div className="space-y-2.5 text-[11px] sm:text-xs">
            <p
              onMouseEnter={() => setActiveHighlight(1)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded transition-all cursor-pointer ${
                activeHighlight === 1
                  ? 'bg-[#E8F3ED] text-[#557B68] border-l-2 border-[#557B68]'
                  : 'text-[#20344A] hover:bg-white'
              }`}
            >
              <strong className="text-[#20344A] font-semibold">1. IDENTIFICATION & AGE:</strong> I, Ramesh Kumar, Son of Shri Suresh Kumar, aged about 24 years, resident of Sector 14, Gurugram, Haryana, do hereby solemnly affirm on oath as under:
            </p>

            <p
              onMouseEnter={() => setActiveHighlight(2)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded transition-all cursor-pointer ${
                activeHighlight === 2
                  ? 'bg-[#E8F3ED] text-[#557B68] border-l-2 border-[#557B68]'
                  : 'text-[#20344A] hover:bg-white'
              }`}
            >
              <strong className="text-[#20344A] font-semibold">2. LEGAL CHARACTER:</strong> That I have graduated with LL.B (Honours) from an institution recognized by the Bar Council of India, and no criminal proceedings or moral turpitude charges are pending against me in any court of law.
            </p>

            <p
              onMouseEnter={() => setActiveHighlight(3)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-2 rounded transition-all cursor-pointer ${
                activeHighlight === 3
                  ? 'bg-[#FBF0E4] text-[#C78335] border-l-2 border-[#C78335]'
                  : 'text-[#20344A] hover:bg-white'
              }`}
            >
              <strong className="text-[#C78335] font-semibold">3. FULL-TIME ENGAGEMENT:</strong> That I am not engaged in any commercial trade, full-time business, or salaried profession contrary to the Bar Council of India Rules.
            </p>

            <div
              onMouseEnter={() => setActiveHighlight(4)}
              onMouseLeave={() => setActiveHighlight(null)}
              className={`p-3 rounded-lg transition-all cursor-pointer border ${
                activeHighlight === 4
                  ? 'bg-white border-[#20344A] text-[#20344A] shadow-xs'
                  : 'bg-white border-[#E5DED2] text-[#20344A]'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-[#20344A] mb-1 font-mono text-[11px]">
                <span>VERIFICATION JURAT:</span>
                <span className="text-[9px] text-[#557B68] uppercase font-semibold">
                  ✓ Verified under Oath
                </span>
              </div>
              <p className="text-[10px] text-[#74777D] leading-normal font-sans">
                "Verified at New Delhi on this 23rd day of August, 2026, that the contents of paragraphs 1 to 3 are true to my personal knowledge and belief. Nothing material has been concealed."
              </p>
            </div>
          </div>
        </div>

        {/* Floating Badge 1: 100-Point Rubric Assessment */}
        <div className="absolute -top-6 -right-4 sm:-right-8 p-3 rounded-xl bg-white border border-[#E5DED2] shadow-md animate-float">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5DED2"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#557B68"
                  strokeWidth="3.5"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-bold text-xs text-[#20344A]">87%</span>
            </div>
            <div>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[#74777D] font-mono block">
                Academic Rubric
              </span>
              <span className="font-serif font-medium text-xs text-[#557B68]">Statutory Compliant</span>
            </div>
          </div>
        </div>

        {/* Floating Badge 2: Precedent Library Match */}
        <div className="absolute -bottom-6 -left-3 sm:-left-8 p-3 rounded-xl bg-white border border-[#E5DED2] shadow-md animate-float-reverse">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-center text-[#20344A]">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#74777D] block font-medium">
                Precedent Match
              </span>
              <span className="font-medium text-[#20344A] text-[11px]">
                96.4% Ground Truth Precedent
              </span>
            </div>
          </div>
        </div>

        {/* Floating Badge 3: Doctrinal Risk Audit */}
        <div className="absolute -bottom-6 right-2 sm:right-6 p-3 rounded-xl bg-white border border-[#E5DED2] shadow-md animate-float-slow">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded bg-[#FBF0E4] border border-[#C78335]/30 flex items-center justify-center text-[#C78335]">
              <Network className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-[#74777D] block font-medium">Doctrinal Audit</span>
              <span className="font-medium text-[#20344A] text-[10px]">
                Prerequisites Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
