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
  Mic,
  Bookmark,
} from 'lucide-react';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

interface VocabResultViewProps {
  result: VocabResult;
}

export const VocabResultView: React.FC<VocabResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

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
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 shadow-sm border-l-4 border-l-sky-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-sky-950 text-sky-300 border border-sky-800">
                [{result.partOfSpeech || 'Idiomatic Expression'}]
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800">
                [REGISTER: {result.register || 'Idiomatic'}]
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-mono font-bold text-white tracking-tight">
                {result.term}
              </h2>
              <button
                type="button"
                onClick={() => speakText(result.term)}
                className="p-2 rounded-none bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="Listen to native pronunciation"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
              </button>
            </div>
            <p className="text-sm font-mono text-neutral-400 mt-1">
              {result.ipa || '/ipa/'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsCoachOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 transition-colors cursor-pointer shadow-sm"
              title="Luyện đọc phát âm với xác nhận đúng hay sai"
            >
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              <span>[ 🎙️ LUYỆN PHÁT ÂM ĐÚNG/SAI ]</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '[ COPIED ]' : '[ COPY CARD ]'}</span>
            </button>
          </div>
        </div>

        {/* Vietnamese Translation & Nuances */}
        <div className="pt-5 space-y-4">
          <div className="p-4 rounded-none bg-sky-950/20 border border-sky-900/40 border-l-2 border-l-sky-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block mb-1">
              Ý nghĩa tiếng Việt &amp; Bản chất ngữ nghĩa
            </span>
            <p className="text-base font-semibold text-sky-100 leading-relaxed font-sans">
              {result.vietnameseMeaning}
            </p>
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase text-neutral-300 block mb-1">
              Sắc thái &amp; Ngữ cảnh sử dụng (Linguistic Nuances):
            </span>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              {result.nuances}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Native Examples */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>[ 3 Native-Level Examples in Context ]</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {result.examples?.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-none bg-neutral-950 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors border-l-2 border-l-neutral-700"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-mono font-semibold text-white leading-relaxed">
                  "{ex.en}"
                </p>
                <button
                  type="button"
                  onClick={() => speakText(ex.en)}
                  className="p-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-sky-400 transition-colors shrink-0 cursor-pointer"
                  title="Listen to sentence audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 italic font-sans">
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
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertOctagon className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              Common Learner Traps &amp; Mistakes
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-neutral-300">
            {result.commonTraps?.map((trap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-mono text-[10px] mt-0.5 shrink-0">■</span>
                <span className="leading-relaxed font-sans">{trap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Collocations */}
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-sky-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              High-Value Collocations
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.collocations?.map((col, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 rounded-none bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono"
              >
                [{col}]
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Word Family with Meanings */}
      {result.wordFamilyDetails && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 text-purple-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              Nghĩa các dạng Họ Từ (Word Family Meanings)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {result.wordFamilyDetails.noun && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">Danh từ (Noun)</span>
                <span className="text-sm font-bold text-white font-mono block">{result.wordFamilyDetails.noun}</span>
                {result.wordFamilyDetails.nounMeaning && (
                  <span className="text-xs text-purple-300 block font-sans">↳ {result.wordFamilyDetails.nounMeaning}</span>
                )}
              </div>
            )}
            {result.wordFamilyDetails.verb && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">Động từ (Verb)</span>
                <span className="text-sm font-bold text-white font-mono block">{result.wordFamilyDetails.verb}</span>
                {result.wordFamilyDetails.verbMeaning && (
                  <span className="text-xs text-purple-300 block font-sans">↳ {result.wordFamilyDetails.verbMeaning}</span>
                )}
              </div>
            )}
            {result.wordFamilyDetails.adjective && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">Tính từ (Adjective)</span>
                <span className="text-sm font-bold text-white font-mono block">{result.wordFamilyDetails.adjective}</span>
                {result.wordFamilyDetails.adjectiveMeaning && (
                  <span className="text-xs text-purple-300 block font-sans">↳ {result.wordFamilyDetails.adjectiveMeaning}</span>
                )}
              </div>
            )}
            {result.wordFamilyDetails.adverb && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">Trạng từ (Adverb)</span>
                <span className="text-sm font-bold text-white font-mono block">{result.wordFamilyDetails.adverb}</span>
                {result.wordFamilyDetails.adverbMeaning && (
                  <span className="text-xs text-purple-300 block font-sans">↳ {result.wordFamilyDetails.adverbMeaning}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Synonyms with Meanings & Nuances */}
      {result.synonyms && result.synonyms.length > 0 && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              Từ Đồng Nghĩa &amp; Sắc Thái Ngữ Cảnh (Synonyms &amp; Nuances)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.synonyms.map((syn, idx) => {
              const synWord = typeof syn === 'string' ? syn : syn.word;
              const synMeaning = typeof syn === 'string' ? undefined : syn.meaning;
              const synNuance = typeof syn === 'string' ? undefined : syn.nuance;
              return (
                <div key={idx} className="p-3 bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300 font-mono">{synWord}</span>
                    <button
                      type="button"
                      onClick={() => speakText(synWord)}
                      className="text-neutral-400 hover:text-emerald-300 p-1 cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {synMeaning && <p className="text-xs text-neutral-200 font-sans font-medium">↳ {synMeaning}</p>}
                  {synNuance && <p className="text-[11px] text-neutral-400 font-sans italic">{synNuance}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pronunciation Coach Modal with strict check: Đúng / Sai */}
      <PronunciationCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        target={{
          term: result.term,
          ipa: result.ipa,
          vietnameseMeaning: result.vietnameseMeaning,
          exampleSentence: result.examples?.[0]?.en,
          exampleTranslation: result.examples?.[0]?.vi,
        }}
      />
    </div>
  );
};
