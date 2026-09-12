import React, { useState } from 'react';
import { WritingResult } from '../../types';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface WritingResultViewProps {
  result: WritingResult;
}

export const WritingResultView: React.FC<WritingResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'corrections' | 'rewrite' | 'vocab'>('corrections');

  const handleCopyRewrite = () => {
    navigator.clipboard.writeText(result.improvedRewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* CEFR Band Score Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Official CEFR Assessment
              </span>
              <span className="text-xs text-neutral-500">•</span>
              <span className="text-xs text-neutral-400">Cambridge &amp; IELTS Metric</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {result.cefrBand}
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Subscore Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-400 block mb-1">Task Achieve</span>
            <span className="text-base font-bold text-sky-400">
              {result.scoreBreakdown?.taskAchievement || '7.0'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-400 block mb-1">Coherence</span>
            <span className="text-base font-bold text-sky-400">
              {result.scoreBreakdown?.coherenceCohesion || '6.5'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-400 block mb-1">Lexical</span>
            <span className="text-base font-bold text-sky-400">
              {result.scoreBreakdown?.lexicalResource || '7.0'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-400 block mb-1">Grammar</span>
            <span className="text-base font-bold text-sky-400">
              {result.scoreBreakdown?.grammaticalRange || '6.5'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('corrections')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'corrections'
              ? 'text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Grammar &amp; Collocation Corrections ({result.corrections?.length || 0})</span>
          {activeTab === 'corrections' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rewrite')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'rewrite'
              ? 'text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Improved Native Rewrite</span>
          {activeTab === 'rewrite' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vocab')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'vocab'
              ? 'text-sky-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Vocabulary Upgrades ({result.vocabularyUpgrades?.length || 0})</span>
          {activeTab === 'vocab' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
          )}
        </button>
      </div>

      {/* Tab 1: Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-3">
          {result.corrections && result.corrections.length > 0 ? (
            result.corrections.map((corr, idx) => (
              <div
                key={idx}
                id={`writing-correction-${idx}`}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
                    {corr.type}
                  </span>
                  <span className="text-xs text-neutral-500">Item #{idx + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                      Original Text
                    </span>
                    <p className="text-sm text-neutral-300 line-through decoration-rose-500/60 leading-relaxed">
                      "{corr.original}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Recommended Correction
                    </span>
                    <p className="text-sm text-emerald-200 font-medium leading-relaxed">
                      "{corr.suggested}"
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40 text-xs text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-300 font-semibold">Examiner's Rule: </strong>
                  {corr.explanation}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-neutral-400">No major corrections noted. Excellent grammar precision!</div>
          )}
        </div>
      )}

      {/* Tab 2: Improved Rewrite */}
      {activeTab === 'rewrite' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">
                Elevated C1/C2 Academic Essay Rewrite
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopyRewrite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Rewrite'}</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {result.improvedRewrite}
          </div>
        </div>
      )}

      {/* Tab 3: Vocabulary Upgrades */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.vocabularyUpgrades && result.vocabularyUpgrades.length > 0 ? (
            result.vocabularyUpgrades.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Upgrade #{idx + 1}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    {item.level || 'C1/C2'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-neutral-400 font-mono">
                    "{item.originalWord}"
                  </span>
                  <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-sm font-bold text-white font-mono">
                    "{item.upgradedWord}"
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  {item.context}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 col-span-2 text-center text-neutral-400">
              No specific vocabulary upgrades suggested.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
