import React, { useState } from 'react';
import { VocabResult } from '../../types';
import {
  Volume2,
  BookOpen,
  AlertOctagon,
  Sparkles,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface VocabResultViewProps {
  result: VocabResult;
}

export const VocabResultView: React.FC<VocabResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    const text = `${result.term} (${result.ipa}) - ${result.vietnameseMeaning}\n\nExamples:\n${result.examples
      .map((ex) => `• ${ex.en} (${ex.vi})`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Vocab Identity Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                {result.partOfSpeech || 'Idiomatic Expression'}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Register: {result.register || 'Idiomatic'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {result.term}
              </h2>
              <button
                type="button"
                onClick={() => speakText(result.term)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="Listen to native pronunciation"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
              </button>
            </div>
            <p className="text-sm font-mono text-neutral-400 mt-1">
              {result.ipa || '/ipa/'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Study Card'}</span>
          </button>
        </div>

        {/* Vietnamese Translation & Nuances */}
        <div className="pt-5 space-y-4">
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-900/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
              Ý nghĩa tiếng Việt &amp; Bản chất ngữ nghĩa
            </span>
            <p className="text-base font-semibold text-sky-100 leading-relaxed">
              {result.vietnameseMeaning}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-300 block mb-1">
              Sắc thái &amp; Ngữ cảnh sử dụng (Linguistic Nuances):
            </span>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {result.nuances}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Native Examples */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>3 Native-Level Examples in Context</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {result.examples?.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{ex.en}"
                </p>
                <button
                  type="button"
                  onClick={() => speakText(ex.en)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-sky-400 transition-colors shrink-0"
                  title="Listen to sentence audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 italic">
                ↳ {ex.vi}
              </p>

              {ex.contextNote && (
                <div className="pt-1 text-[11px] text-neutral-500 font-mono">
                  Context insight: {ex.contextNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Common Traps and Collocations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common Traps */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertOctagon className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Common Learner Traps &amp; Mistakes
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-neutral-300">
            {result.commonTraps?.map((trap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{trap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Collocations */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              High-Value Collocations
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.collocations?.map((col, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
