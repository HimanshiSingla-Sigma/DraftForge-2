import React, { useEffect, useRef, useState } from 'react';
import {
  Scale,
  Gavel,
  Landmark,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  symbol?: string;
  baseAlpha: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const LegalBackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parallax tilt state (-1 to 1)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Track cursor position globally across viewport
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const normX = (e.clientX / width - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / height - 0.5) * 2; // -1 to 1
      setTilt({ x: normX, y: normY });
      setMousePos({ x: e.clientX, y: e.clientY, active: true });
    };

    const handlePointerLeave = () => {
      setMousePos((prev) => ({ ...prev, active: false }));
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // Canvas particle network & interactive physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Symbols pool for legal nodes
    const legalSymbols = ['§', '¶', '⚖', '✦', '🏛', 'LEX', 'Art.'];
    const colors = [
      '#1E3E62', // Deep Slate Navy
      '#F59E0B', // Warm Gold
      '#0B192C', // Deep Ink
      '#B45309', // Antique Bronze
      '#5A6A80', // Cool Grey
    ];

    // Initialize particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 45);
    const particles: Particle[] = [];
    const sparks: Spark[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isSymbol = Math.random() < 0.35;
      const baseAlpha = 0.15 + Math.random() * 0.35;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: isSymbol ? 6 : 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        symbol: isSymbol ? legalSymbols[Math.floor(Math.random() * legalSymbols.length)] : undefined,
      });
    }

    // Spawn sparks on click
    const handleCanvasClick = (e: MouseEvent) => {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 1.2 + Math.random() * 2.5;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          color: Math.random() > 0.5 ? '#F59E0B' : '#1E3E62',
        });
      }
    };
    window.addEventListener('click', handleCanvasClick);

    // Main animation loop
    let lastTime = performance.now();
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Subtle ambient parchment background pattern
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      const currentMouse = mousePos;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Bounce at boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Magnetic repulsion/attraction with mouse
        if (currentMouse.active) {
          const dx = currentMouse.x - p.x;
          const dy = currentMouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 170;

          if (dist < maxDist && dist > 1) {
            // Draw interactive golden citation link to cursor
            const connectionAlpha = (1 - dist / maxDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(currentMouse.x, currentMouse.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${connectionAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Gentle repulsion force
            const force = (1 - dist / maxDist) * 0.6;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
            p.alpha = Math.min(p.baseAlpha + 0.35, 0.9);
          } else {
            p.alpha = p.baseAlpha;
          }
        }

        // Connect nearby nodes (Statutory citation constellation)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxLinkDist = 115;

          if (dist < maxLinkDist) {
            const linkAlpha = (1 - dist / maxLinkDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(30, 62, 98, ${linkAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.symbol) {
          ctx.font = '12px "Playfair Display", Georgia, serif';
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.symbol, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.restore();
      }

      // Render sparks from click interactions
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // slight gravity
        const progress = s.life / s.maxLife;

        if (progress >= 1) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.8;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleCanvasClick);
    };
  }, [mousePos.active]);

  // Dynamic Scale Tilt Angle (-12deg to +12deg based on horizontal mouse movement)
  const scaleTiltDeg = tilt.x * 12;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Interactive HTML5 Canvas (constellation & citation web) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      {/* 2. Soft Vignette & Subtle Radial Gradient Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#FAF8F5]/30 to-[#FAF8F5]/80 pointer-events-none" />

      {/* 3. Large Architectural Legal Watermarks in the background */}
      <div
        className="absolute -top-12 -right-8 text-[#0B192C]/[0.035] font-serif font-black text-[220px] sm:text-[340px] leading-none select-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(${tilt.x * -20}px, ${tilt.y * -20}px, 0)`,
        }}
      >
        §
      </div>
      <div
        className="absolute -bottom-16 -left-10 text-[#0B192C]/[0.035] font-serif font-black text-[200px] sm:text-[300px] leading-none select-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(${tilt.x * 20}px, ${tilt.y * 20}px, 0)`,
        }}
      >
        ¶
      </div>

      {/* 4. Floating Interactive Law Artifact 1: Scales of Equity (Top Left) */}
      <div
        className="hidden lg:flex absolute top-10 left-10 pointer-events-auto items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border-2 border-[#0B192C] shadow-[0_5px_#0B192C] transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default animate-float-slow"
        style={{
          transform: `translate3d(${tilt.x * 14}px, ${tilt.y * 14}px, 0)`,
        }}
      >
        <div className="relative w-10 h-10 rounded-xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center shadow-[0_2px_#0B192C] overflow-hidden">
          <div
            className="transition-transform duration-500 ease-out origin-center"
            style={{ transform: `rotate(${scaleTiltDeg}deg)` }}
          >
            <Scale className="w-5 h-5 text-[#F59E0B]" />
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-black text-[#0B192C]">
              Scales of Equity
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
          </div>
          <p className="text-[10px] text-[#5A6A80] font-mono">
            Interactive Balance &bull; {scaleTiltDeg > 0 ? `+${scaleTiltDeg.toFixed(1)}°` : `${scaleTiltDeg.toFixed(1)}°`}
          </p>
        </div>
      </div>

      {/* 5. Floating Interactive Law Artifact 2: Section Citation Engine (Top Right) */}
      <div
        className="hidden lg:flex absolute top-12 right-12 pointer-events-auto items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border-2 border-[#0B192C] shadow-[0_5px_#0B192C] transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default animate-float"
        style={{
          transform: `translate3d(${tilt.x * -16}px, ${tilt.y * 16}px, 0)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#F3F0EA] border-2 border-[#0B192C] flex items-center justify-center font-serif font-black text-sm text-[#B45309] shadow-[0_2px_#0B192C]">
          § 138
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-black text-[#0B192C]">
              Statutory Knowledge Graph
            </span>
            <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          </div>
          <p className="text-[10px] text-[#5A6A80] font-mono">
            NI Act &bull; 0 Ambiguity Detected
          </p>
        </div>
      </div>

      {/* 6. Floating Interactive Law Artifact 3: Constitutional Pillar Seal (Bottom Left) */}
      <div
        className="hidden xl:flex absolute bottom-12 left-12 pointer-events-auto items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border-2 border-[#0B192C] shadow-[0_5px_#0B192C] transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default animate-float-reverse"
        style={{
          transform: `translate3d(${tilt.x * 18}px, ${tilt.y * -18}px, 0)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#1E3E62] border-2 border-[#0B192C] flex items-center justify-center text-[#F59E0B] shadow-[0_2px_#0B192C]">
          <Landmark className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-black text-[#0B192C]">
              Constitutional Doctrine
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              Art. 21
            </span>
          </div>
          <p className="text-[10px] text-[#5A6A80] font-mono">
            Substantive Due Process
          </p>
        </div>
      </div>

      {/* 7. Floating Interactive Law Artifact 4: Forensic Legal Drafting Seal (Bottom Right) */}
      <div
        className="hidden xl:flex absolute bottom-12 right-12 pointer-events-auto items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border-2 border-[#0B192C] shadow-[0_5px_#0B192C] transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default animate-float-slow"
        style={{
          transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -14}px, 0)`,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-[#F3F0EA] border-2 border-[#0B192C] flex items-center justify-center text-[#0B192C] shadow-[0_2px_#0B192C]">
          <Gavel className="w-5 h-5 text-[#B45309]" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-black text-[#0B192C]">
              Jurisprudential Studio
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-[10px] text-[#5A6A80] font-mono">
            RAG Verified Precedents &bull; Live
          </p>
        </div>
      </div>

      {/* 8. Subtle Floating Latin Legal Maxims Banner (Mid-Center Top) */}
      <div
        className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-[#E6E2D8] text-[10px] font-serif text-[#0B192C]/60 transition-transform duration-700"
        style={{
          transform: `translate3d(calc(-50% + ${tilt.x * 6}px), ${tilt.y * 6}px, 0)`,
        }}
      >
        <span className="font-bold text-[#1E3E62]">&sect; LEX EST TUTISSIMA CASSIS</span>
        <span>&bull;</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#B45309]">The Law is the Safest Helmet</span>
      </div>
    </div>
  );
};
