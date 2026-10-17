import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface MockDocument {
  id: string;
  title: string;
  category: string;
  preamble: string;
  clauses: Array<{
    title: string;
    text: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    statutoryNote: string;
    points: string;
  }>;
  score: number;
  structureScore: number;
  clauseScore: number;
  formattingScore: number;
  penalty: number;
}

export const InteractiveDocumentScanner: React.FC = () => {
  const documents: MockDocument[] = [
    {
      id: 'affidavit',
      title: 'Affidavit of Character & Non-Conviction',
      category: 'AFFIDAVIT_OF_CHARACTER',
      preamble: 'BEFORE THE HON’BLE BAR COUNCIL OF INDIA / STATE BAR COUNCIL',
      clauses: [
        {
          title: 'Deponent Identification & Age Demarcation',
          text: 'I, Ramesh Kumar, son of Late Shri Suresh Kumar, aged about 24 years, resident of Sector 14, Gurugram, Haryana, do hereby solemnly affirm and state on oath...',
          status: 'PASS',
          statutoryNote: 'Valid deponent identification and age eligibility under Advocates Act, 1961.',
          points: '+25 pts (Structure)',
        },
        {
          title: 'Averment of Clean Moral Record & Character',
          text: 'That I have graduated in Law and have never been convicted by any Criminal Court for any offence involving moral turpitude, nor are any criminal charges pending against me...',
          status: 'PASS',
          statutoryNote: 'Matches benchmark character clause in FastEmbed reference collection.',
          points: '+25 pts (Clause)',
        },
        {
          title: 'Bar on Dual Commercial Employment',
          text: 'That the deponent is not engaged in any trade, business, or salaried profession contrary to Bar Council of India enrollment guidelines.',
          status: 'WARNING',
          statutoryNote: 'Recommend explicitly clarifying suspension of any prior corporate directorships.',
          points: '+17 pts (Clause)',
        },
        {
          title: 'Verification Jurat & Oath Affirmation',
          text: 'Verified at New Delhi on this 23rd day of August, 2026, that the contents of paragraphs 1 to 3 are true to my personal knowledge and belief. Nothing material is concealed.',
          status: 'PASS',
          statutoryNote: 'Meets CPC Order XIX Rule 3 jurat requirements.',
          points: '+20 pts (Formatting)',
        },
      ],
      score: 87,
      structureScore: 25,
      clauseScore: 42,
      formattingScore: 20,
      penalty: 0,
    },
    {
      id: 'employment',
      title: 'Executive Employment Agreement',
      category: 'EMPLOYMENT_AGREEMENT',
      preamble: 'BY AND BETWEEN APEX TECHNOLOGIES PRIVATE LIMITED AND SENIOR SOFTWARE ENGINEER',
      clauses: [
        {
          title: 'Term & Position Designation',
          text: 'The Company engages the Executive as Principal Legal Engineer on a full-time, exclusive basis commencing from the Effective Date.',
          status: 'PASS',
          statutoryNote: 'Standard executive term clause.',
          points: '+20 pts (Structure)',
        },
        {
          title: 'Post-Employment Non-Compete Restriction (Section 27 Check)',
          text: 'The Employee shall not engage in any competing software development business for a period of 24 months post-termination anywhere in India.',
          status: 'FAIL',
          statutoryNote: 'Void ab initio under Section 27 of Indian Contract Act, 1872 (Restraint of Trade). Post-termination non-competes are unenforceable in India.',
          points: '-15 pts (Contradiction)',
        },
        {
          title: 'Confidentiality & Trade Secret Protection',
          text: 'All proprietary code, legal vectors, and student data remain the exclusive intellectual property of the Company in perpetuity.',
          status: 'PASS',
          statutoryNote: 'Enforceable under Indian IP jurisprudence.',
          points: '+25 pts (Clause)',
        },
        {
          title: 'Statutory Notice Period & Severance',
          text: 'Either party may terminate this agreement with 30 days written notice or payment of equivalent salary in lieu thereof.',
          status: 'PASS',
          statutoryNote: 'Complies with state Industrial & Shops Establishments Act guidelines.',
          points: '+20 pts (Formatting)',
        },
      ],
      score: 65,
      structureScore: 20,
      clauseScore: 35,
      formattingScore: 20,
      penalty: 10,
    },
    {
      id: 'rent',
      title: 'Residential Tenancy & Rent Agreement',
      category: 'RENT_AGREEMENT',
      preamble: 'THIS LEASE DEED IS EXECUTED AT BENGALURU ON THIS 1ST DAY OF SEPTEMBER 2026',
      clauses: [
        {
          title: 'Premises Description & Schedule',
          text: 'The Lessor grants tenancy of Flat No. 402, Green Valley Apartments, Koramangala, Bengaluru, comprising 3 BHK with designated parking.',
          status: 'PASS',
          statutoryNote: 'Accurate property schedule demarcated.',
          points: '+25 pts (Structure)',
        },
        {
          title: 'Security Deposit & Refund Mechanics',
          text: 'The Lessee has deposited an interest-free refundable security deposit of ₹1,00,000 to be returned within 7 days of peaceful handover.',
          status: 'PASS',
          statutoryNote: 'Standard residential deposit repayment clause.',
          points: '+25 pts (Clause)',
        },
        {
          title: 'Lock-in Period & Forfeiture Terms',
          text: 'Both parties agree to an initial lock-in period of 6 months, during which unilateral termination is prohibited without liquid damages.',
          status: 'PASS',
          statutoryNote: 'Legally valid contractual lock-in.',
          points: '+22 pts (Clause)',
        },
        {
          title: 'Arbitration & Territorial Jurisdiction',
          text: 'All disputes shall be subject to the exclusive jurisdiction of the Courts at Bengaluru.',
          status: 'PASS',
          statutoryNote: 'Clear jurisdiction clause under Section 20 CPC.',
          points: '+20 pts (Formatting)',
        },
      ],
      score: 92,
      structureScore: 25,
      clauseScore: 47,
      formattingScore: 20,
      penalty: 0,
    },
  ];

  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [displayedScore, setDisplayedScore] = useState<number>(87);

  const activeDoc = documents[activeDocIndex];

  const handleSelectDoc = (index: number) => {
    setActiveDocIndex(index);
    setIsScanning(true);
    setDisplayedScore(0);
    setTimeout(() => {
      setIsScanning(false);
      setDisplayedScore(documents[index].score);
    }, 600);
  };

  return (
    <div className="tactile-card p-6 sm:p-10 rounded-3xl bg-[#FAF8F5] border-2 border-[#E6E2D8] shadow-[0_6px_#E6E2D8] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#E6E2D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#1E3E62]/10 text-[#1E3E62] border border-[#1E3E62]/20">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B192C] tracking-tight">
              Interactive Legal Document Analysis Engine
            </h3>
          </div>
          <p className="text-xs text-[#0B192C]/70 mt-1 font-sans">
            Experience how DraftForge scans clauses, verifies statutory enforceability, and calculates deterministic scores in real time.
          </p>
        </div>

        {/* Document Selector Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-[#F3F0EA] rounded-2xl border-2 border-[#E6E2D8] overflow-x-auto">
          {documents.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => handleSelectDoc(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeDocIndex === idx
                  ? 'tactile-btn bg-[#1E3E62] text-white border-b-4 border-[#0B192C]'
                  : 'text-[#0B192C]/70 hover:text-[#0B192C] hover:bg-[#FAF8F5]'
              }`}
            >
              {doc.title.split(' ')[0]} {doc.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Legal Document Preview with Scanning Line */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-white border-2 border-[#E6E2D8] p-6 text-xs text-[#0B192C] overflow-hidden shadow-[0_4px_#E6E2D8]">
            {/* Active Scanning Laser Line */}
            {isScanning && <div className="laser-scan-line animate-scan" />}

            {/* Document Header */}
            <div className="text-center pb-4 mb-4 border-b-2 border-[#E6E2D8] space-y-1">
              <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest block font-mono">
                {activeDoc.category.replace(/_/g, ' ')}
              </span>
              <h4 className="font-serif font-bold text-base text-[#0B192C] tracking-wide">{activeDoc.title}</h4>
              <p className="text-[10px] text-[#0B192C]/60 uppercase tracking-wider font-mono">{activeDoc.preamble}</p>
            </div>

            {/* Clauses List */}
            <div className="space-y-3.5">
              {activeDoc.clauses.map((clause, i) => {
                const isPass = clause.status === 'PASS';
                const isWarning = clause.status === 'WARNING';
                const isFail = clause.status === 'FAIL';

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 transition-all space-y-2 ${
                      isPass
                        ? 'bg-[#F0FDF4] border-[#10B981]/50'
                        : isWarning
                        ? 'bg-[#FFFBEB] border-[#F59E0B]/50'
                        : 'bg-[#FEF2F2] border-[#DC2626]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPass && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                        {isWarning && <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />}
                        {isFail && <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />}
                        <span className="font-serif font-bold text-xs text-[#0B192C]">{clause.title}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0B192C]/70 bg-white/80 px-2 py-0.5 rounded border border-[#E6E2D8]">
                        {clause.points}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#0B192C]/80 leading-relaxed font-sans pl-6 italic">
                      &ldquo;{clause.text}&rdquo;
                    </p>

                    <div className="pl-6 pt-1">
                      <span
                        className={`text-[10px] block font-mono font-medium ${
                          isPass
                            ? 'text-[#059669]'
                            : isWarning
                            ? 'text-[#D97706]'
                            : 'text-[#DC2626] font-bold'
                        }`}
                      >
                        ⚖️ {clause.statutoryNote}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Score & Metric Visualizer */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Circular Score Gauge Card */}
          <div className="tactile-card bg-white p-6 rounded-2xl border-2 border-[#E6E2D8] shadow-[0_4px_#E6E2D8] space-y-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B192C]/60 font-mono">
              Deterministic Rubric Calculation
            </span>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#F3F0EA" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={displayedScore >= 75 ? '#10B981' : displayedScore >= 50 ? '#F59E0B' : '#DC2626'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={(2 * Math.PI * 42) * (1 - displayedScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-serif font-extrabold text-[#0B192C]">{displayedScore}</span>
                <span className="text-[10px] text-[#0B192C]/60 font-semibold uppercase tracking-wider">Overall Quality</span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="space-y-3 text-left pt-2 border-t-2 border-[#E6E2D8]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#0B192C]">Structure & Demarcation</span>
                <span className="font-mono text-[#059669] font-bold">{activeDoc.structureScore} / 25 pts</span>
              </div>
              <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${(activeDoc.structureScore / 25) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#0B192C]">Clause Relevance & Matching</span>
                <span className="font-mono text-[#1E3E62] font-bold">{activeDoc.clauseScore} / 50 pts</span>
              </div>
              <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
                <div
                  className="h-full bg-[#1E3E62] rounded-full transition-all duration-500"
                  style={{ width: `${(activeDoc.clauseScore / 50) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#0B192C]">Formatting & Oath Verification</span>
                <span className="font-mono text-[#F59E0B] font-bold">{activeDoc.formattingScore} / 25 pts</span>
              </div>
              <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden border border-[#E6E2D8]">
                <div
                  className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                  style={{ width: `${(activeDoc.formattingScore / 25) * 100}%` }}
                />
              </div>

              {activeDoc.penalty > 0 && (
                <div className="flex justify-between text-xs font-semibold text-[#DC2626]">
                  <span>Contradiction / Restraint Penalty</span>
                  <span className="font-mono font-bold">-{activeDoc.penalty} pts</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Insight Card */}
          <div className="p-5 rounded-2xl bg-[#F3F0EA] border-2 border-[#E6E2D8] shadow-[0_2px_#E6E2D8] space-y-2">
            <div className="flex items-center gap-2 text-[#1E3E62] font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>Deterministic Precision</span>
            </div>
            <p className="text-xs text-[#0B192C]/80 leading-relaxed font-sans">
              DraftForge evaluates legal text by combining rule-based heuristics with 384-dimensional dense vectors from statutory precedent corpuses — eliminating arbitrary LLM score hallucination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
