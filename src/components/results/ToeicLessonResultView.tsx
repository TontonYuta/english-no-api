import React, { useState } from 'react';
import { ToeicLessonResult, ToeicWord } from '../../types';
import {
  Volume2,
  Sparkles,
  Mail,
  FileText,
  MessageSquare,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Layers,
  Repeat
} from 'lucide-react';

interface ToeicLessonResultViewProps {
  result: ToeicLessonResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const ToeicLessonResultView: React.FC<ToeicLessonResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Interactive Challenge State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingWord(text);
      utterance.onend = () => setSpeakingWord(null);
      utterance.onerror = () => setSpeakingWord(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyLesson = () => {
    const text = `🎯 TOEIC 700+ Lesson: ${result.situationTitle} (${result.topic})\n\n[Scenario]\n${result.scenarioText}\n\n[Vocabulary]\n${result.targetWords
      .map(
        (w) =>
          `• ${w.term} (${w.ipa}) [${w.partOfSpeech}]: ${w.vietnameseMeaning}\n  Family: ${w.wordFamily || 'N/A'}\n  Paraphrase: ${w.toeicParaphrase || 'N/A'}`
      )
      .join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSituationIcon = () => {
    switch (result.situationType) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'memo':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-sky-950/40 border border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>TOEIC 700+ Workplace Scenario</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                {getSituationIcon()}
                <span className="capitalize">{result.situationType || 'Business Scenario'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {result.situationTitle}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Chủ đề: <strong className="text-sky-300">{result.topic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCopyLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer border border-neutral-700"
              title="Copy study summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép bài'}</span>
            </button>

            {onGenerateAnother && (
              <button
                type="button"
                disabled={isAutomating}
                onClick={onGenerateAnother}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/20 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                <span>{isAutomating ? 'Đang tạo...' : 'Đổi tình huống khác'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Workplace Scenario Reader Box */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <span>🏢 Bối Cảnh Thực Tế (Authentic Context)</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speakText(result.scenarioText)}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 px-2 py-1 rounded-lg bg-sky-950/50 hover:bg-sky-900/50 border border-sky-800/60 transition-colors cursor-pointer"
                title="Listen to native narration"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe đoạn văn</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showTranslation ? 'Ẩn dịch' : 'Xem bản dịch'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-neutral-950 border border-neutral-800 relative">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans">
              "{result.scenarioText}"
            </p>

            {showTranslation && (
              <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs sm:text-sm text-neutral-400 italic leading-relaxed">
                ↳ {result.scenarioTranslationVi}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 Target Vocabulary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3 Từ Vựng / Collocations Vàng Chuẩn 700+ Trong Bối Cảnh Này</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">Part 5 &amp; 7 Focus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.targetWords?.map((word: ToeicWord, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Word Header & Audio */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-extrabold text-white tracking-tight">
                        {word.term}
                      </h4>
                      <button
                        type="button"
                        onClick={() => speakText(word.term)}
                        className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-400 transition-colors cursor-pointer"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${speakingWord === word.term ? 'animate-bounce' : ''}`} />
                      </button>
                    </div>
                    <span className="text-xs font-mono text-neutral-400 block mt-0.5">
                      {word.ipa} • <span className="text-neutral-500">{word.partOfSpeech}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Word {idx + 1}
                  </span>
                </div>

                {/* Meaning */}
                <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                    Nghĩa công sở
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-sky-100 leading-snug">
                    {word.vietnameseMeaning}
                  </p>
                </div>

                {/* Word Family (Part 5 Secret) */}
                {word.wordFamily && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>Gia đình từ (Word Family - Part 5):</span>
                    </span>
                    <p className="text-xs text-neutral-400 font-mono bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800/80">
                      {word.wordFamily}
                    </p>
                  </div>
                )}

                {/* TOEIC Paraphrase (Part 7 Secret) */}
                {word.toeicParaphrase && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-amber-400" />
                      <span>Từ đồng nghĩa trong đề thi (Paraphrase):</span>
                    </span>
                    <p className="text-xs text-amber-300/90 font-mono bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800/80">
                      {word.toeicParaphrase}
                    </p>
                  </div>
                )}

                {/* Example sentence */}
                <div className="pt-2 text-xs text-neutral-300 border-t border-neutral-800/60 space-y-1">
                  <p className="italic text-neutral-300 leading-relaxed">
                    "{word.exampleSentence}"
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    ↳ {word.exampleTranslation}
                  </p>
                </div>
              </div>

              {/* ETS Trap Tip */}
              {word.etsTrapTip && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 space-y-1 mt-auto">
                  <div className="flex items-center gap-1 font-bold text-amber-400 uppercase tracking-wide">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Bẫy đề thi ETS:</span>
                  </div>
                  <p className="leading-relaxed">{word.etsTrapTip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Reflex Challenge */}
      {result.interactiveChallenge && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Thử Thách Phản Xạ Tình Huống (Workplace Reflex Challenge)
            </h3>
          </div>

          <p className="text-sm font-semibold text-neutral-200 leading-relaxed">
            {result.interactiveChallenge.prompt}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {result.interactiveChallenge.options.map((opt: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === result.interactiveChallenge.correctIndex;
              let btnStyle = 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300';

              if (hasSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-neutral-950/60 border-neutral-800/60 text-neutral-500';
                }
              } else if (isSelected) {
                btnStyle = 'bg-sky-950/60 border-sky-500 text-white font-medium';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedOption(idx);
                    setHasSubmitted(true);
                  }}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-neutral-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box after Selection */}
          {hasSubmitted && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${
                    selectedOption === result.interactiveChallenge.correctIndex
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {selectedOption === result.interactiveChallenge.correctIndex
                    ? '🎉 Chuẩn xác 100%!'
                    : '💡 Chưa tối ưu - Xem phân tích bên dưới:'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {result.interactiveChallenge.explanation}
              </p>

              {result.interactiveChallenge.takeawayTip && (
                <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-900/40 text-xs text-sky-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300">Bí kíp 700+:</strong> {result.interactiveChallenge.takeawayTip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
