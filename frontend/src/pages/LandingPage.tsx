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
  BookOpen,
  ShieldCheck,
  ClipboardCheck,
  ChevronRight,
  Scale,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'faculty'>('student');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const capabilities = [
    {
      id: 'ai_copilot',
      title: 'In-Editor AI Legal Tutor',
      badge: 'Statutory Synthesis',
      description:
        'Synthesize standard clauses, verification jurats, or dispute resolution mechanisms grounded in verified Indian precedents directly in the workspace editor.',
      icon: Sparkles,
      color: 'text-[#C78335]',
      exampleHeading: 'Statutory Verification Clause',
      codeSnippet: `/* Formative Verification Clause */\n"Verified at New Delhi on this 23rd day of August, 2026, that the contents of paragraphs 1 to 4 are true and correct to my knowledge, and nothing material has been concealed therefrom."`,
    },
    {
      id: 'rubric_eval',
      title: '100-Point Academic Rubrics',
      badge: 'Doctrinal Accuracy',
      description:
        'Transparent criterion breakdowns across IRAC Structure (25 pts), Essential Clause Coverage (50 pts), and Statutory Verification Jurats (25 pts).',
      icon: ClipboardCheck,
      color: 'text-[#557B68]',
      exampleHeading: 'Academic Assessment Result',
      codeSnippet: `Evaluation Result:\n• IRAC Coherence: 25 / 25 pts\n• Substantive Clause Coverage: 44 / 50 pts\n• Verification & Jurat Formalities: 22 / 25 pts\n= Composite Assessment Score: 91 / 100 pts (High Honors)`,
    },
    {
      id: 'graph_loopholes',
      title: 'Doctrinal Fallacy & Risk Audit',
      badge: 'Doctrinal Coherence',
      description:
        'Systematically checks legal prerequisites, statutory cross-clause contradictions, and procedural pitfalls before documents are finalized.',
      icon: ShieldCheck,
      color: 'text-[#B45D4D]',
      exampleHeading: 'Doctrinal Exposure Flagged',
      codeSnippet: `Doctrinal Fallacy Detected:\n[Post-Termination Restrictive Covenant] requires [Valid Garden Leave Compensation]\nSeverity: ACTION IMPERATIVE\nStatutory Note: Absolute restraint of trade is void under Section 27, Indian Contract Act.`,
    },
    {
      id: 'rag_corpus',
      title: 'Statutory Precedent Library',
      badge: 'Verified Corpus',
      description:
        'Every draft is cross-referenced against authoritative appellate judgments, High Court precedent templates, and official statutory forms.',
      icon: BookOpen,
      color: 'text-[#20344A]',
      exampleHeading: 'Precedent Alignment',
      codeSnippet: `Precedent Alignment (Statutory Corpus):\n• Reference Source: High Court Appellate Practice Rules\n• Evidentiary Match: 96% concordance with standard verification formats\n• Case Authority: Per Lord Denning in Seaford Court Estates Ltd v. Asher`,
    },
    {
      id: 'roadmap_trajectory',
      title: 'Personalized 5-Phase Learning Roadmap',
      badge: 'Guided Curriculum',
      description:
        'Continuous analysis of your drafting strengths and weaknesses synthesizes a custom milestone trajectory to build seasoned legal drafting competence.',
      icon: GraduationCap,
      color: 'text-[#C78335]',
      exampleHeading: 'Current Curriculum Trajectory',
      codeSnippet: `5-Phase Academic Trajectory:\n[Phase 1] Structural Identification & Preamble Mastery (Achieved)\n[Phase 2] Substantive Operative Covenants & Conditions (In Progress)\n[Phase 3] Formal Oath & Statutory Jurat Precision (Upcoming)`,
    },
    {
      id: 'faculty_oversight',
      title: 'Clinical Faculty Governance Studio',
      badge: 'Academic Review',
      description:
        'Course convenors assign moot problems, review submissions with automated criteria, and enter annotated faculty feedback with full institutional compliance.',
      icon: Users,
      color: 'text-[#20344A]',
      exampleHeading: 'Faculty Audit Entry',
      codeSnippet: `Faculty Evaluator Review:\n• Student: Elena Rostova (Appellate Brief Draft 2)\n• Automated Evaluation: 86 / 100 pts -> Faculty Endorsed: 89 / 100 pts\n• Faculty Note: "Exemplary factual distinguishing of adverse authority."`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#101D29] font-sans selection:bg-[#F5E8D3] selection:text-[#20344A] relative overflow-hidden">
      {/* Navigation */}
      <LandingNavbar onOpenAuth={onOpenAuth} onOpenHealth={() => setIsHealthOpen(true)} />

      {/* ========================================================================= */}
      {/* 1. TOP EDITORIAL HERO (Matches Editorial Jurisprudence) */}
      {/* ========================================================================= */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left Column: Typographic Rhetoric */}
          <div className="w-full lg:w-7/12 flex flex-col space-y-6">
            {/* Academic Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#C78335]" />
              <span className="text-xs uppercase tracking-widest text-[#20344A] font-semibold font-sans">
                Legal Writing & Evaluation
              </span>
              <span className="text-[#C4C6CD]">•</span>
              <span className="text-xs uppercase tracking-wider text-[#687584] font-sans">
                Pedagogical Framework 4.2
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal text-[#20344A] leading-[1.18] tracking-tight">
              Better Legal Writing Begins With Better Feedback.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#43566B] leading-relaxed max-w-2xl font-normal font-sans">
              DraftForge helps law students strengthen their legal drafting through structured evaluation, clear rubric-based feedback, and guided revision. Crafted to cultivate rigorous doctrinal analysis and immaculate Bluebook precision.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 bg-[#20344A] hover:bg-[#101D29] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Drafting</span>
                <ArrowRight className="w-4 h-4 text-[#C78335] group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-3 bg-white text-[#20344A] hover:bg-[#F5F0E7] text-sm font-semibold rounded-lg border border-[#E5DED2] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore How It Works</span>
                <ChevronRight className="w-4 h-4 text-[#687584]" />
              </a>

              <span className="text-xs text-[#687584] hidden sm:inline-block font-sans">
                ABA Standards 302 & 314 Aligned
              </span>
            </div>

            {/* Academic Citation Metadata Strip */}
            <div className="grid grid-cols-3 gap-4 bg-[#F5F0E7]/60 border border-[#E5DED2] p-4 sm:p-5 rounded-xl">
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl text-[#20344A] font-normal leading-none">
                  4.8x
                </span>
                <span className="text-[11px] text-[#687584] uppercase tracking-wider font-sans mt-1.5">
                  Revision Depth
                </span>
              </div>
              <div className="flex flex-col border-l border-[#E5DED2] pl-4">
                <span className="font-serif text-2xl sm:text-3xl text-[#20344A] font-normal leading-none">
                  100%
                </span>
                <span className="text-[11px] text-[#687584] uppercase tracking-wider font-sans mt-1.5">
                  Rule Syntheses Checked
                </span>
              </div>
              <div className="flex flex-col border-l border-[#E5DED2] pl-4">
                <span className="font-serif text-2xl sm:text-3xl text-[#20344A] font-normal leading-none">
                  38+
                </span>
                <span className="text-[11px] text-[#687584] uppercase tracking-wider font-sans mt-1.5">
                  Law Schools Enrolled
                </span>
              </div>
            </div>

            {/* Core Practice Modules & Evaluated Statutory Formats */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#687584] font-medium">
                  Curricular Practice Modules & Benchmark Formats
                </span>
                <span className="text-[10px] font-semibold text-[#557B68] bg-[#E8F3ED] border border-[#557B68]/20 px-2 py-0.5 rounded">
                  Indian Bar Council Standard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-lg border border-[#E5DED2] shadow-2xs flex items-start gap-3 transition-all hover:border-[#20344A]/40">
                  <div className="w-7 h-7 rounded bg-[#FBF0E4] border border-[#C78335]/20 flex items-center justify-center text-[#C78335] shrink-0 mt-0.5">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-serif font-medium text-xs text-[#20344A]">Employment & Commercial Contracts</h4>
                    <p className="text-[11px] text-[#687584] leading-snug">Non-competes, dispute resolution, governing law & indemnities.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5DED2] shadow-2xs flex items-start gap-3 transition-all hover:border-[#20344A]/40">
                  <div className="w-7 h-7 rounded bg-[#E8F3ED] border border-[#557B68]/20 flex items-center justify-center text-[#557B68] shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-serif font-medium text-xs text-[#20344A]">Affidavits & Verification Jurats</h4>
                    <p className="text-[11px] text-[#687584] leading-snug">Competent attestation, deponent verifications & Bar Council rules.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5DED2] shadow-2xs flex items-start gap-3 transition-all hover:border-[#20344A]/40">
                  <div className="w-7 h-7 rounded bg-[#FBF8F2] border border-[#E5DED2] flex items-center justify-center text-[#20344A] shrink-0 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-serif font-medium text-xs text-[#20344A]">Statutory Notices & Demands</h4>
                    <p className="text-[11px] text-[#687584] leading-snug">Section 138 NI Act notices, limitation audits & demand covenants.</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E5DED2] shadow-2xs flex items-start gap-3 transition-all hover:border-[#20344A]/40">
                  <div className="w-7 h-7 rounded bg-[#FBF0E4] border border-[#C78335]/20 flex items-center justify-center text-[#C78335] shrink-0 mt-0.5">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-serif font-medium text-xs text-[#20344A]">Appellate Writs & Briefs</h4>
                    <p className="text-[11px] text-[#687584] leading-snug">IRAC/CREAC synthesis, question presented & statutory citation.</p>
                  </div>
                </div>
              </div>

              {/* Institutional Affiliation Bar */}
              <div className="p-3 bg-white/80 rounded-lg border border-[#E5DED2] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#557B68] shrink-0" />
                  <p className="text-[11px] text-[#43566B] truncate font-sans">
                    <strong className="text-[#20344A] font-semibold">The NorthCap University (NCU Law)</strong> — Clinical Legal Drafting Curriculum 2026
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#687584] shrink-0 font-medium bg-[#FBF8F2] px-2 py-0.5 rounded border border-[#E5DED2]">
                  Authorized Access
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Archival Plate / 3D Canvas */}
          <div className="w-full lg:w-5/12 flex flex-col space-y-4">
            <div className="bg-white p-3 rounded-xl border border-[#E5DED2] shadow-sm">
              <Hero3DVisual />
              <div className="pt-3 px-2 flex items-baseline justify-between border-t border-[#E5DED2]/60 mt-2">
                <p className="font-serif text-xs text-[#687584] italic">
                  Fig. 1.1 — Comparative statutory analysis workbench, Harvard Law Library collection.
                </p>
                <span className="text-[10px] uppercase text-[#687584] font-mono shrink-0 ml-3">
                  Doc. Ref. 1904-B
                </span>
              </div>
            </div>

            {/* Institutional Endorsement Plaque */}
            <div className="bg-[#EDF3F0] p-4 rounded-xl border border-[#557B68]/30 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#557B68] shrink-0" />
              <p className="text-xs text-[#20344A] leading-snug font-sans">
                <span className="font-semibold text-[#20344A]">Adopted by Legal Research & Writing faculties</span> for 1L Appellate Advocacy and clinical legal drafting seminars nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 4-STEP PEDAGOGICAL METHODOLOGY */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 border-t border-[#E5DED2] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#C78335] font-semibold font-sans block">
                The Methodology
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#20344A] font-normal tracking-tight">
                How DraftForge Works
              </h2>
            </div>
            <p className="text-sm text-[#43566B] max-w-md font-sans leading-relaxed">
              Moving beyond passive spellchecks: a structured four-stage evaluation pipeline engineered around law review benchmarks and judicial clerkship standards.
            </p>
          </div>

          {/* 4 Step Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#FBF8F2] p-6 rounded-xl border border-[#E5DED2] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl text-[#20344A]/25">01</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DED2] flex items-center justify-center text-[#20344A]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] mb-2">
                  Structured Submission
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Upload briefs, legal memoranda, or appellate pleadings evaluated against standard Bluebook and jurisdictional rule frameworks.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5DED2] flex items-center justify-between text-[#687584] text-[11px] font-sans">
                <span className="uppercase tracking-wider">Format Support</span>
                <span className="font-mono text-[#20344A]">.DOCX • .PDF • .TXT</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FBF8F2] p-6 rounded-xl border border-[#E5DED2] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl text-[#C78335]/35">02</span>
                  <div className="w-8 h-8 rounded-lg bg-[#F5E8D3] border border-[#C78335]/30 flex items-center justify-center text-[#8A5100]">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] mb-2">
                  Rubric-Level Analysis
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Instant multi-axial evaluation across IRAC/CREAC discipline, statutory synthesis, factual distinction, and deductive cohesion.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5DED2] flex items-center justify-between text-[#687584] text-[11px] font-sans">
                <span className="uppercase tracking-wider">Rubric Schema</span>
                <span className="font-semibold text-[#8A5100]">12 Core Indices</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FBF8F2] p-6 rounded-xl border border-[#E5DED2] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl text-[#20344A]/25">03</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DED2] flex items-center justify-center text-[#20344A]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] mb-2">
                  In-Line Annotations
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Margin callouts pinpointing deductive reasoning gaps, missing counter-argument treatments, and jurisdictional nuances in context.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5DED2] flex items-center justify-between text-[#687584] text-[11px] font-sans">
                <span className="uppercase tracking-wider">Gutter Diagnostics</span>
                <span className="text-[#557B68] font-semibold">Real-Time Notes</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FBF8F2] p-6 rounded-xl border border-[#E5DED2] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl text-[#20344A]/25">04</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DED2] flex items-center justify-center text-[#20344A]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-[#20344A] mb-2">
                  Guided Revision
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Iterative drafting workspace tracking analytical delta improvements with side-by-side versions and rhetorical scoring progression.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5DED2] flex items-center justify-between text-[#687584] text-[11px] font-sans">
                <span className="uppercase tracking-wider">Version Delta</span>
                <span className="font-semibold text-[#20344A]">Pre/Post Differential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE DOCUMENT SCANNER DEMO */}
      {/* ========================================================================= */}
      <section id="scanner" className="py-20 border-t border-[#E5DED2] bg-[#FBF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C78335] font-semibold font-sans">
              Interactive Demonstration
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#20344A] font-normal tracking-tight">
              See Structured Legal Evaluation in Action
            </h2>
            <p className="text-sm text-[#43566B] font-sans">
              Select an instrument below to preview live clause verification, statutory notes, and transparent rubric assessment.
            </p>
          </div>

          <InteractiveDocumentScanner />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE CAPABILITIES (Capabilities Grid) */}
      {/* ========================================================================= */}
      <section id="capabilities" className="py-20 border-t border-[#E5DED2] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C78335] font-semibold font-sans">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#20344A] font-normal tracking-tight">
              Engineered for Law Students & Clinical Faculty
            </h2>
            <p className="text-sm text-[#43566B] font-sans">
              Every tool is purpose-built to elevate student legal reasoning and support faculty grading efficiency.
            </p>
          </div>

          {/* Interactive Feature Explorer */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Capability Selector (Left 5 Cols) */}
            <div className="col-span-12 lg:col-span-5 space-y-3">
              {capabilities.map((feat, idx) => {
                const Icon = feat.icon;
                const isActive = activeFeatureIndex === idx;

                return (
                  <div
                    key={feat.id}
                    onClick={() => setActiveFeatureIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      isActive
                        ? 'bg-[#FBF8F2] border-[#20344A] shadow-sm'
                        : 'bg-white border-[#E5DED2] hover:bg-[#FBF8F2] hover:border-[#20344A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center ${
                            isActive ? 'bg-[#20344A] text-white' : 'bg-[#F5F0E7] text-[#20344A]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-serif font-medium text-sm text-[#20344A]">{feat.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded font-sans uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#F5E8D3] text-[#8A5100]'
                            : 'bg-[#F5F0E7] text-[#687584]'
                        }`}
                      >
                        {feat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#43566B] leading-relaxed pl-9 font-sans">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Capability Showcase (Right 7 Cols) */}
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-[#FBF8F2] p-6 sm:p-8 rounded-xl border border-[#E5DED2] shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5DED2]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#557B68]" />
                    <span className="text-xs font-serif text-[#20344A] font-medium">
                      {capabilities[activeFeatureIndex].exampleHeading}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[11px] font-sans font-medium text-[#557B68] bg-[#EDF3F0] border border-[#557B68]/30">
                    Live Verified Output
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-normal text-[#20344A]">
                    {capabilities[activeFeatureIndex].title}
                  </h3>
                  <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                    {capabilities[activeFeatureIndex].description}
                  </p>

                  <div className="p-5 rounded-lg bg-white border border-[#E5DED2] text-[#20344A] font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-sm">
                    {capabilities[activeFeatureIndex].codeSnippet}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onOpenAuth}
                    className="px-5 py-2.5 bg-[#20344A] hover:bg-[#101D29] text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer font-sans"
                  >
                    <span>Try in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C78335]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DUAL ROLES: FOR STUDENTS VS FOR CLINICAL FACULTY */}
      {/* ========================================================================= */}
      <section id="students" className="py-20 border-t border-[#E5DED2] bg-[#FBF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C78335] font-semibold font-sans">
              Tailored Environments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#20344A] font-normal tracking-tight">
              Two Dedicated Studios. One Cohesive Curriculum.
            </h2>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex justify-center">
            <div className="p-1 bg-white rounded-lg border border-[#E5DED2] flex items-center gap-1 shadow-sm">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer font-sans ${
                  activeRoleTab === 'student'
                    ? 'bg-[#20344A] text-white'
                    : 'text-[#43566B] hover:text-[#20344A] hover:bg-[#F5F0E7]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>For Law Students</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('faculty')}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer font-sans ${
                  activeRoleTab === 'faculty'
                    ? 'bg-[#20344A] text-white'
                    : 'text-[#43566B] hover:text-[#20344A] hover:bg-[#F5F0E7]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>For Clinical Faculty</span>
              </button>
            </div>
          </div>

          {/* Student Journey Showcase */}
          {activeRoleTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#F5F0E7] flex items-center justify-center text-[#20344A]">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Draft Studio & Side-by-Side Diff
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Compose briefs with clean typography, save numbered draft revisions, and inspect additions, edits, and structural evolution side-by-side.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#F5E8D3] flex items-center justify-center text-[#8A5100]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Socratic AI Legal Tutor
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Engage in interactive legal reasoning dialogues grounded in statutory precedents, honing counter-argument distinction and rule formulation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#EDF3F0] flex items-center justify-center text-[#557B68]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Progressive Skills Mastery
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Follow a structured milestone curriculum, practice with statutory drills, and track your analytical growth across IRAC coherence and Bluebook rigor.
                </p>
              </div>
            </div>
          )}

          {/* Faculty Journey Showcase */}
          {activeRoleTab === 'faculty' && (
            <div id="faculty" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#F5F0E7] flex items-center justify-center text-[#20344A]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Assignment Management
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Create moot briefs with target deed types, customized evaluation rubrics, and automated deadlines to maintain course momentum.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#EDF3F0] flex items-center justify-center text-[#557B68]">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Submissions Auditor & Faculty Feedback
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Inspect student submissions, review rubric findings, add personalized marginal notes, and enter official grade overrides with full audit history.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E5DED2] shadow-sm space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#F5E8D3] flex items-center justify-center text-[#8A5100]">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-medium text-base text-[#20344A]">
                  Cohort Doctrinal Analytics
                </h3>
                <p className="text-xs text-[#43566B] leading-relaxed font-sans">
                  Identify specific statutory clauses and doctrinal steps where students struggle, enabling targeted clinical lectures and seminar workshops.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STRATEGIC BOTTOM CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#20344A] text-white p-8 sm:p-14 rounded-2xl shadow-sm text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-[#F5E8D3] uppercase tracking-wider font-sans">
              Institutional & Student Access
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
              Elevate Your Legal Writing Today
            </h2>
            <p className="text-sm text-[#EDF4FF]/80 leading-relaxed font-sans max-w-xl mx-auto">
              Join legal scholars and clinical faculty nationwide. Enter the DraftForge Studio now to author, audit, and refine your legal instruments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={onOpenAuth}
              className="px-8 py-3 bg-[#C78335] hover:bg-[#A86E2A] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer font-sans"
            >
              <span>Launch Draft Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter onOpenAuth={onOpenAuth} onOpenHealth={() => setIsHealthOpen(true)} />

      {/* System Health Modal */}
      <HealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
    </div>
  );
};
