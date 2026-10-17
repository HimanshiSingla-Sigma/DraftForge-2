import React from 'react';
import {
  FileText,
  Sparkles,
  ShieldAlert,
  Cpu,
  Database,
  GraduationCap,
} from 'lucide-react';

interface AICoreOrbProps {
  stageText?: string;
  size?: 'sm' | 'md' | 'lg';
  activeNodes?: Array<'DOCUMENT' | 'CLAUSES' | 'KNOWLEDGE' | 'RISKS' | 'SKILLS'>;
}

export const AICoreOrb: React.FC<AICoreOrbProps> = ({
  stageText = 'AI Core Processing...',
  size = 'md',
  activeNodes = ['DOCUMENT', 'CLAUSES', 'KNOWLEDGE', 'RISKS', 'SKILLS'],
}) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const containerSize = isLg ? 'w-72 h-72' : isSm ? 'w-44 h-44' : 'w-56 h-56';
  const coreSize = isLg ? 'w-24 h-24' : isSm ? 'w-14 h-14' : 'w-18 h-18';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer 3D Node Orbit System */}
      <div className={`relative ${containerSize} flex items-center justify-center perspective-1000`}>
        {/* Rotating Outer Gyroscope Ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-[#1E3E62]/30 animate-spin [animation-duration:12s]" />

        {/* Rotating Outer Gyroscope Ring 2 (Reversed & Tilted) */}
        <div className="absolute inset-2 rounded-full border-2 border-[#F59E0B]/30 animate-spin [animation-duration:16s] [animation-direction:reverse] transform rotate-45" />

        {/* Pulsing Energy Aura Wave */}
        <div className="absolute inset-6 rounded-full bg-[#1E3E62]/10 blur-xl animate-pulse-glow" />

        {/* Central 3D Glowing Nucleus */}
        <div className={`relative ${coreSize} rounded-full bg-[#1E3E62] border-2 border-[#F59E0B] p-0.5 shadow-[0_4px_#0B192C] flex items-center justify-center z-10 animate-float`}>
          <div className="w-full h-full rounded-full bg-[#0B192C] flex flex-col items-center justify-center p-2 text-center">
            <Cpu className="w-6 h-6 text-[#F59E0B] animate-pulse" />
            {!isSm && (
              <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest mt-1">
                AI CORE
              </span>
            )}
          </div>
        </div>

        {/* Orbiting Satellite Node: DOCUMENT (Top Left) */}
        {activeNodes.includes('DOCUMENT') && (
          <div className="absolute top-2 left-2 p-2 rounded-xl bg-white border-2 border-[#E6E2D8] text-[#1E3E62] shadow-[0_2px_#E6E2D8] animate-float-slow flex items-center gap-1.5 z-20">
            <FileText className="w-3.5 h-3.5 text-[#1E3E62]" />
            <span className="text-[9px] font-mono font-bold hidden sm:inline">DOCUMENT</span>
          </div>
        )}

        {/* Orbiting Satellite Node: CLAUSES (Top Right) */}
        {activeNodes.includes('CLAUSES') && (
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-white border-2 border-[#E6E2D8] text-[#B45309] shadow-[0_2px_#E6E2D8] animate-float-reverse flex items-center gap-1.5 z-20">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[9px] font-mono font-bold hidden sm:inline">CLAUSES</span>
          </div>
        )}

        {/* Orbiting Satellite Node: KNOWLEDGE (Bottom Left) */}
        {activeNodes.includes('KNOWLEDGE') && (
          <div className="absolute bottom-2 left-2 p-2 rounded-xl bg-white border-2 border-[#E6E2D8] text-[#1E3E62] shadow-[0_2px_#E6E2D8] animate-float flex items-center gap-1.5 z-20">
            <Database className="w-3.5 h-3.5 text-[#1E3E62]" />
            <span className="text-[9px] font-mono font-bold hidden sm:inline">KNOWLEDGE</span>
          </div>
        )}

        {/* Orbiting Satellite Node: RISKS (Bottom Right) */}
        {activeNodes.includes('RISKS') && (
          <div className="absolute bottom-2 right-2 p-2 rounded-xl bg-white border-2 border-[#E6E2D8] text-[#DC2626] shadow-[0_2px_#E6E2D8] animate-float-slow flex items-center gap-1.5 z-20">
            <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
            <span className="text-[9px] font-mono font-bold hidden sm:inline">RISKS</span>
          </div>
        )}

        {/* Orbiting Satellite Node: SKILLS (Center Bottom) */}
        {activeNodes.includes('SKILLS') && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 p-1.5 px-2.5 rounded-xl bg-white border-2 border-[#E6E2D8] text-[#059669] shadow-[0_2px_#E6E2D8] animate-pulse flex items-center gap-1.5 z-20">
            <GraduationCap className="w-3.5 h-3.5 text-[#059669]" />
            <span className="text-[9px] font-mono font-bold">SKILLS</span>
          </div>
        )}

        {/* SVG Connecting Energy Beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#1E3E62" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="#1E3E62" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="50%" y1="90%" x2="50%" y2="50%" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Status Stage Text Ticker */}
      {stageText && (
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white border-2 border-[#E6E2D8] text-xs font-mono text-[#0B192C] flex items-center gap-2 shadow-[0_2px_#E6E2D8]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          <span>{stageText}</span>
        </div>
      )}
    </div>
  );
};
