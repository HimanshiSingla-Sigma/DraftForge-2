import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero3DVisual } from '../components/landing/Hero3DVisual';
import { InteractiveDocumentScanner } from '../components/landing/InteractiveDocumentScanner';
import { LandingFooter } from '../components/landing/LandingFooter';
import { HealthModal } from '../components/common/HealthModal';
import {
  Sparkles,
  ArrowRight,
  FileCheck,
  GraduationCap,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Database,
  Network,
  Cpu,
  ChevronRight,
  FileEdit,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'faculty'>('student');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      id: 'ai_copilot',
      title: 'In-Editor AI Drafting Copilot',
      badge: 'Statutory Synthesis',
      description:
        'Synthesize standard clauses, verification jurats, or dispute resolution mechanisms grounded in verified Indian precedents directly in the workspace editor.',
      icon: Sparkles,
      color: 'text-accent-cyan',
      bgGlow: 'from-cyan-500/20 to-blue-500/5',
      codeSnippet: `/* AI Synthesized Verification Clause */\n"Verified at New Delhi on this 23rd day of August, 2026, that the contents of paragraphs 1 to 4 are true and correct to my knowledge..."`,
    },
    {
      id: 'rubric_eval',
      title: 'Deterministic 100-Point Rubrics',
      badge: 'Zero Hallucination',
      description:
        'Mathematical score breakdowns across Structure (25 pts), Clause Matching (50 pts), Formatting Jurats (25 pts), and Contradiction Penalties (-15 pts).',
      icon: ClipboardCheck,
      color: 'text-accent-emerald',
      bgGlow: 'from-emerald-500/20 to-teal-500/5',
      codeSnippet: `Evaluation Result:\n• Structure Score: 25 / 25 pts\n• Clause Coverage: 42 / 50 pts\n• Verification Jurat: 20 / 25 pts\n• Penalty Deducted: 0 pts\n= Final Score: 87 / 100 pts`,
    },
    {
      id: 'graph_loopholes',
      title: 'Neo4j GraphRAG Loophole Detection',
      badge: 'Knowledge Graph',
      description:
        'Traverse graph prerequisite chains to discover missing statutory nodes, cross-clause contradictions, and procedural risks before filing in court.',
      icon: Network,
      color: 'text-accent-rose',
      bgGlow: 'from-rose-500/20 to-pink-500/5',
      codeSnippet: `Graph Loophole Detected:\n[Restrictive_Covenant] -> MISSING_PREREQUISITE -> [Garden_Leave_Compensation]\nSeverity: HIGH RISK\nStatutory Note: Restraint of trade void under Sec 27 ICA.`,
    },
    {
      id: 'rag_corpus',
      title: 'Qdrant Dense Vector Corpus',
      badge: 'FastEmbed 384-dim',
      description:
        'Every draft is compared against gold-standard judicial templates and statutory reference files with SHA-256 cryptographic integrity verification.',
      icon: Database,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/20 to-primary-500/5',
      codeSnippet: `Vector Search (Qdrant Cloud):\n• Collection: legal_reference_corpus\n• Top-K Semantic Chunks: 4 retrieved\n• Similarity Score: 0.964\n• SHA-256: 7f8a12e4b9c...`,
    },
    {
      id: 'roadmap_trajectory',
      title: 'Dynamic 5-Phase Learning Roadmap',
      badge: 'Adaptive Pedagogy',
      description:
        'AI analyzes your evaluation weaknesses across drafts to synthesize a personalized 5-phase legal drafting curriculum with real-time milestone checkoffs.',
      icon: GraduationCap,
      color: 'text-accent-amber',
      bgGlow: 'from-amber-500/20 to-yellow-500/5',
      codeSnippet: `5-Phase Milestone Trajectory:\n[Phase 1] Structural Identification & Preamble (Done)\n[Phase 2] Substantive Operative Covenants (Active)\n[Phase 3] Jurats & Statutory Oath Precision (Pending)`,
    },
    {
      id: 'faculty_oversight',
      title: 'Faculty Assignment & Override Studio',
      badge: 'Academic Governance',
      description:
        'Professors publish drafting briefs with deadline trackers, review automated evaluations, and submit score overrides with required audit logs.',
      icon: Users,
      color: 'text-primary-400',
      bgGlow: 'from-primary-500/20 to-indigo-500/5',
      codeSnippet: `Faculty Audited Override:\n• Student: Arjun Sharma (v2)\n• Automated Score: 78 pts -> Overridden: 88 pts\n• Audit Reason: "Approved creative arbitration seat structure"`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0B192C] font-sans selection:bg-[#F59E0B]/30 selection:text-[#0B192C] relative overflow-hidden">
      {/* Navigation */}
      <LandingNavbar onOpenAuth={onOpenAuth} onOpenHealth={() => setIsHealthOpen(true)} />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Small Premium Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F3F0EA] border-2 border-[#E6E2D8] text-[#1E3E62] text-xs font-semibold shadow-[0_2px_#E6E2D8] animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
            <span className="font-serif">AI-Powered Legal Drafting & Deterministic Evaluation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[11px] font-mono text-[#0B192C]/60">Grounded in Real Corpus</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B192C] leading-[1.15] animate-fade-in">
            Draft Smarter.{' '}
            <span className="text-[#1E3E62] italic underline decoration-[#F59E0B] decoration-wavy decoration-2">Learn Faster.</span>
            <br />
            Write Better <span className="text-[#B45309]">Legal Documents.</span>
          </h1>

          {/* Supporting Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#0B192C]/75 max-w-2xl mx-auto leading-relaxed font-normal">
            DraftForge is the next-generation LegalTech platform empowering law students and faculty with deterministic rubric evaluations, FastEmbed vector precedent retrieval, and Neo4j GraphRAG loophole detection.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAuth}
              className="tactile-btn w-full sm:w-auto px-8 py-3.5 bg-[#1E3E62] hover:bg-[#152C46] text-white text-sm font-bold rounded-2xl border-b-4 border-[#0B192C] shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Drafting Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#F59E0B]" />
            </button>

            <a
              href="#scanner"
              className="tactile-btn w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold text-[#0B192C] bg-white hover:bg-[#F3F0EA] border-2 border-[#E6E2D8] border-b-4 border-b-[#E6E2D8] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Platform Demo</span>
              <ChevronRight className="w-4 h-4 text-[#0B192C]/50" />
            </a>
          </div>

          {/* Verified Stack Telemetry Tag */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#0B192C]/70 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> FastEmbed 384-dim Vectors
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Neo4j Aura Graph Traversal
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Deterministic 100-pt Rubrics
            </span>
          </div>
        </div>

        {/* 3D Visual in Hero */}
        <div className="mt-14 sm:mt-16">
          <Hero3DVisual />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRUST & ARCHITECTURAL FOUNDATION SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 border-y-2 border-[#E6E2D8] bg-[#F3F0EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
              Empirical Legal Precision
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C] tracking-tight">
              Engineered on a Four-Pillar Legal AI Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/30 flex items-center justify-center text-[#059669]">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">Deterministic Rubrics</h3>
              <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                Objective scoring across Structure, Clause Matching, and Jurats without arbitrary LLM score hallucination.
              </p>
            </div>

            <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border-2 border-[#1E3E62]/30 flex items-center justify-center text-[#1E3E62]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">Dense Vector Retrieval</h3>
              <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                FastEmbed 384-dim embeddings match clauses against official statutory precedents and bench forms in Qdrant.
              </p>
            </div>

            <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 flex items-center justify-center text-[#DC2626]">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">GraphRAG Reasoning</h3>
              <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                Neo4j Aura graph topology traverses dependency chains to catch missing prerequisite clauses and legal exposures.
              </p>
            </div>

            <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B]/30 flex items-center justify-center text-[#B45309]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#0B192C]">Socratic Pedagogy</h3>
              <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                Adaptive 5-phase roadmaps and conversational AI tutoring grounded in retrieved statutory chunks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM → SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626] font-mono">
            Bridging the Legal Drafting Gap
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
            Why Traditional Drafting Education Fails & How DraftForge Solves It
          </h2>
          <p className="text-xs sm:text-sm text-[#0B192C]/70">
            Legal drafting has historically suffered from subjective grading and invisible blind spots.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Drafting (Problem) */}
          <div className="p-8 rounded-3xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 shadow-[0_4px_#E6E2D8] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#DC2626] font-bold text-xs uppercase tracking-wider font-mono">
                <XCircle className="w-5 h-5" />
                <span>The Traditional Problem</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B192C]">
                Unstructured Drafting with Invisible Risk Exposures
              </h3>
              <ul className="space-y-3 text-xs text-[#0B192C]/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold">✕</span>
                  <span>Students never know which prerequisite clauses are missing until a judge or adversary rejects the filing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold">✕</span>
                  <span>Feedback is delayed, subjective, and lacks mathematical breakdown or statutory citation grounding.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold">✕</span>
                  <span>Critical contradictions (like void Section 27 non-compete clauses) slip through unverified.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold">✕</span>
                  <span>Faculty are overwhelmed with manual grading, lacking cohort-wide weak-skill intelligence.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#DC2626]/20 text-[11px] text-[#DC2626] font-mono">
              Outcome: High procedural rejection rates & fragmented student learning trajectories.
            </div>
          </div>

          {/* DraftForge Solution */}
          <div className="p-8 rounded-3xl bg-[#F0FDF4] border-2 border-[#10B981]/30 shadow-[0_4px_#E6E2D8] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#059669] font-bold text-xs uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-5 h-5" />
                <span>The DraftForge Transformation</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B192C]">
                Evidence-Grounded Intelligence with Knowledge Graphs
              </h3>
              <ul className="space-y-3 text-xs text-[#0B192C]/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span>Deterministic 100-point rubrics immediately audit Structure, Clause Coverage, and Verification Jurats.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span>Neo4j knowledge graph traversal highlights missing prerequisite dependencies and illegal restraints.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span>Personalized 5-phase roadmaps and Socratic tutoring guide continuous draft revision.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span>Faculty studio enables rapid brief creation, audited score overrides, and cohort analytics.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#10B981]/20 text-[11px] text-[#059669] font-mono">
              Outcome: Empirical mastery, verifiable statutory compliance, and commercial drafting confidence.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE DOCUMENT SCANNER DEMO */}
      {/* ========================================================================= */}
      <section id="scanner" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
            Live Product Simulation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
            See the Analysis Engine in Action
          </h2>
          <p className="text-xs sm:text-sm text-[#0B192C]/70">
            Select a legal deed below to preview real-time clause extraction, statutory risk flags, and rubric scoring.
          </p>
        </div>

        <InteractiveDocumentScanner />
      </section>

      {/* ========================================================================= */}
      {/* 5. CORE FEATURES SHOWCASE */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 border-t-2 border-[#E6E2D8] bg-[#F3F0EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
              Full Spectrum Platform Capabilities
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Engineered for Law Students & Faculty Alike
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/70">
              Every feature corresponds directly to verified backend algorithms and database tables.
            </p>
          </div>

          {/* Interactive Feature Showcase with Tabbed Preview */}
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Feature List (Left 5 Cols) */}
            <div className="col-span-12 lg:col-span-5 space-y-3">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                const isActive = activeFeatureIndex === idx;

                return (
                  <div
                    key={feat.id}
                    onClick={() => setActiveFeatureIndex(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-1.5 ${
                      isActive
                        ? 'tactile-card bg-white border-[#1E3E62] shadow-[0_4px_#1E3E62]'
                        : 'bg-[#FAF8F5] border-[#E6E2D8] shadow-[0_2px_#E6E2D8] hover:border-[#1E3E62]/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-[#1E3E62] text-white' : 'bg-[#E6E2D8] text-[#0B192C]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#0B192C]">{feat.title}</h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                          isActive
                            ? 'bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/30'
                            : 'bg-[#E6E2D8] text-[#0B192C]/70'
                        }`}
                      >
                        {feat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#0B192C]/70 leading-relaxed pl-9 font-sans">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Feature Visual Console Preview (Right 7 Cols) */}
            <div className="col-span-12 lg:col-span-7">
              <div className="tactile-card bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#E6E2D8]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-mono text-[#0B192C]/60 ml-2">
                      engine_runtime / {features[activeFeatureIndex].id}.ts
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#059669] bg-[#F0FDF4] border border-[#10B981]/30">
                    Active Execution
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                    {features[activeFeatureIndex].title}
                  </h3>
                  <p className="text-xs text-[#0B192C]/75 leading-relaxed font-sans">
                    {features[activeFeatureIndex].description}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#0B192C] text-[#FAF8F5] border-2 border-[#0B192C] font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                    {features[activeFeatureIndex].codeSnippet}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onOpenAuth}
                    className="tactile-btn px-5 py-2.5 bg-[#1E3E62] hover:bg-[#152C46] text-white font-bold text-xs rounded-xl border-b-4 border-[#0B192C] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Launch in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE AI EVALUATION & GRAPH RAG PIPELINE */}
      {/* ========================================================================= */}
      <section id="ai-evaluation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
            System Architecture
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
            How DraftForge Evaluates a Legal Document
          </h2>
          <p className="text-xs sm:text-sm text-[#0B192C]/70">
            A deterministic pipeline integrating semantic vector search with knowledge graph dependency checking.
          </p>
        </div>

        {/* 6-Step Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '01',
              title: 'Draft Intake',
              desc: 'Author in Monaco editor or upload .pdf/.docx/.txt',
              icon: FileEdit,
              color: 'text-[#1E3E62]',
            },
            {
              step: '02',
              title: 'FastEmbed',
              desc: 'Vectorized into 384-dimensional dense embeddings',
              icon: Cpu,
              color: 'text-[#7C3AED]',
            },
            {
              step: '03',
              title: 'Qdrant RAG',
              desc: 'Matched against gold-standard statutory precedent corpus',
              icon: Database,
              color: 'text-[#0284C7]',
            },
            {
              step: '04',
              title: 'Neo4j Aura',
              desc: 'Knowledge graph traverses prerequisite clause links',
              icon: Network,
              color: 'text-[#DC2626]',
            },
            {
              step: '05',
              title: 'Deterministic Rubric',
              desc: 'Evaluates Structure, Clauses, and Jurats (0–100 pts)',
              icon: ClipboardCheck,
              color: 'text-[#059669]',
            },
            {
              step: '06',
              title: 'Roadmap & Tutor',
              desc: 'Synthesizes Socratic tips & personalized 5-phase trajectory',
              icon: GraduationCap,
              color: 'text-[#B45309]',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="tactile-card bg-white p-5 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3 relative group transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0B192C]/50">{item.step}</span>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#0B192C]">{item.title}</h4>
                  <p className="text-[11px] text-[#0B192C]/70 leading-relaxed font-sans">{item.desc}</p>
                </div>

                <div className="w-full h-1 bg-[#F3F0EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E3E62] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DUAL EXPERIENCE: FOR STUDENTS VS FOR FACULTY */}
      {/* ========================================================================= */}
      <section id="students" className="py-24 border-t-2 border-[#E6E2D8] bg-[#F3F0EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
              Tailored Portals
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Two Dedicated Studios. One Seamless Platform.
            </h2>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex justify-center">
            <div className="p-1.5 bg-white rounded-2xl border-2 border-[#E6E2D8] flex items-center gap-2 shadow-[0_2px_#E6E2D8]">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`tactile-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'student'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-[#FAF8F5]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>For Law Students</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('faculty')}
                className={`tactile-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'faculty'
                    ? 'bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                    : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-[#FAF8F5]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>For Law Faculty</span>
              </button>
            </div>
          </div>

          {/* Student Journey Showcase */}
          {activeRoleTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border-2 border-[#1E3E62]/30 flex items-center justify-center text-[#1E3E62]">
                  <FileEdit className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Drafting Studio & Unified Diff</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Author deeds with Monaco-style monospace precision, save numbered revision versions, and compare additions/deletions with live diff inspection.
                </p>
              </div>

              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B]/30 flex items-center justify-center text-[#B45309]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Socratic AI Tutor Chat</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Engage in multi-turn legal reasoning sessions where answers are strictly grounded in retrieved statutory precedents and verified evidence.
                </p>
              </div>

              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/30 flex items-center justify-center text-[#059669]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">5-Phase Personalized Curriculum</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Synthesize an adaptive milestone curriculum, verify knowledge with statutory MCQs, and track your exponential moving average (EMA) skill mastery.
                </p>
              </div>
            </div>
          )}

          {/* Faculty Journey Showcase */}
          {activeRoleTab === 'faculty' && (
            <div id="faculty" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border-2 border-[#1E3E62]/30 flex items-center justify-center text-[#1E3E62]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Assignment Creator</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Publish drafting briefs with target document types, rubric constraints, and deadline trackers. Enforce structured coursework workflows.
                </p>
              </div>

              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/30 flex items-center justify-center text-[#059669]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Submissions Auditor & Overrides</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Inspect student submissions, review automated evaluation breakdowns, and submit faculty score overrides backed by required audit logs.
                </p>
              </div>

              <div className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 flex items-center justify-center text-[#DC2626]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#0B192C]">Cohort Weak-Skill Analytics</h3>
                <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">
                  Gain class-wide intelligence into statutory clauses where students struggle, enabling targeted faculty lectures and intervention.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. 5-STEP HOW IT WORKS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-mono">
            Step-by-Step Flow
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
            How It Works in Practice
          </h2>
          <p className="text-xs sm:text-sm text-[#0B192C]/70">
            From raw draft to certified statutory compliance in five steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              num: '01',
              title: 'Draft & Author',
              desc: 'Write or paste legal deeds into the Monaco workspace editor.',
            },
            {
              num: '02',
              title: 'Deterministic Scan',
              desc: 'FastEmbed and rule engines scan structure, clauses, and jurats.',
            },
            {
              num: '03',
              title: 'Graph Loophole Audit',
              desc: 'Neo4j Aura checks prerequisite dependencies and risk exposures.',
            },
            {
              num: '04',
              title: 'AI Copilot Refine',
              desc: 'Revise weak clauses with Socratic tutoring and precedent search.',
            },
            {
              num: '05',
              title: 'Submit & Master',
              desc: 'Submit to faculty, check milestones, and track EMA mastery score.',
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="tactile-card bg-white p-6 rounded-3xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-3 relative group hover:border-[#1E3E62] transition-all"
            >
              <span className="text-3xl font-serif font-extrabold text-[#1E3E62]/30 group-hover:text-[#1E3E62] transition-colors">
                {step.num}
              </span>
              <h4 className="font-serif font-bold text-sm text-[#0B192C]">{step.title}</h4>
              <p className="text-xs text-[#0B192C]/70 leading-relaxed font-sans">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. STRATEGIC HIGH-IMPACT CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative tactile-card bg-[#1E3E62] text-white p-8 sm:p-14 rounded-[2.5rem] border-4 border-[#0B192C] shadow-[0_8px_#0B192C] text-center space-y-6 overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-[#F59E0B] border border-[#F59E0B]/30 font-mono uppercase tracking-wider">
              Start Drafting Today
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Turn Every Draft into a Legal Mastery Milestone
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              Experience the power of evidence-grounded legal drafting education. Enter the DraftForge Studio now to author, audit, and master statutory compliance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={onOpenAuth}
              className="tactile-btn w-full sm:w-auto px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B192C] text-sm font-bold rounded-2xl border-b-4 border-[#B45309] shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Launch DraftForge Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0B192C]" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter onOpenAuth={onOpenAuth} onOpenHealth={() => setIsHealthOpen(true)} />

      {/* System Telemetry Modal */}
      <HealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
    </div>
  );
};
