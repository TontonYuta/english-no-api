import React, { useState, useMemo } from 'react';
import { ReflexChallengeResult } from '../../types';
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  Volume2,
  Bookmark,
  Check,
  Brain,
  HelpCircle
} from 'lucide-react';
import { getLearnedWords, toggleWordMastery } from '../../utils/learningMemory';
import { shuffleOptionsWithCorrectIndex } from '../../utils/quizUtils';
import { playAudioPronunciation } from '../../utils/speechUtils';

interface ReflexChallengeResultViewProps {
  result: ReflexChallengeResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const ReflexChallengeResultView: React.FC<ReflexChallengeResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Read mastered status for reviewed terms
  const learnedWords = getLearnedWords();
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const term of result.reviewedTerms || []) {
      const match = learnedWords.find((w) => w.term.toLowerCase() === term.toLowerCase());
      if (match) {
        map[term] = match.mastered;
      }
    }
    return map;
  });

  const handleToggleMastery = (term: string) => {
    const match = learnedWords.find((w) => w.term.toLowerCase() === term.toLowerCase());
    if (match) {
      toggleWordMastery(match.id);
      setMasteredMap((prev) => ({
        ...prev,
        [term]: !prev[term],
      }));
    }
  };

  const speakText = (text: string, rate: number = 1.0) => {
    setSpeakingText(text);
    playAudioPronunciation(text, {
      rate,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  // Randomize options order so correctIndex is never hardcoded to index 0
  const { shuffledOptions, newCorrectIndex, cleanedExplanation } = useMemo(() => {
    return shuffleOptionsWithCorrectIndex(
      result.options || [],
      result.correctIndex ?? 0,
      result.explanation || ''
    );
  }, [result]);

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIndex(idx);
    setHasAnswered(true);
  };

  const isCorrect = selectedIndex === newCorrectIndex;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-6 rounded-none bg-neutral-950 border-l-4 border-l-amber-500 border-y border-r border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>LUYỆN PHẢN XẠ TRÍ NHỚ (ACTIVE RECALL)</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-none border ${
                  result.userLevel === 'A1'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : result.userLevel === 'A2'
                    ? 'bg-sky-950 text-sky-300 border-sky-800'
                    : result.userLevel === 'B1'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-purple-950 text-purple-300 border-purple-800'
                }`}
              >
                {result.userLevel === 'A1'
                  ? '[ A1: KHỞI ĐẦU ]'
                  : result.userLevel === 'A2'
                  ? '[ A2: CƠ BẢN ]'
                  : result.userLevel === 'B1'
                  ? '[ B1: TRUNG CẤP ]'
                  : '[ B2: TOEIC 700+ ]'}
              </span>
              {result.sourceType === 'memory_review' ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-sky-400" />
                  <span>TRÍCH XUẤT TỪ BỘ NHỚ</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-none bg-neutral-900 text-neutral-300 border border-neutral-800">
                  [ PHẢN XẠ TỔNG HỢP ]
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              THỬ THÁCH PHẢN XẠ TÌNH HUỐNG
            </h2>
          </div>

          {onGenerateAnother && (
            <button
              type="button"
              disabled={isAutomating}
              onClick={() => {
                setSelectedIndex(null);
                setHasAnswered(false);
                onGenerateAnother();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-mono font-black bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all border border-amber-300 cursor-pointer disabled:opacity-50 self-start sm:self-center uppercase"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
              <span>{isAutomating ? 'ĐANG TẠO...' : 'TÌNH HUỐNG KHÁC'}</span>
            </button>
          )}
        </div>

        {/* Reviewed Terms Pills */}
        {result.reviewedTerms && result.reviewedTerms.length > 0 && (
          <div className="pt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>TỪ VỰNG &amp; CẤU TRÚC ĐANG ĐƯỢC TÁI KÍCH HOẠT:</span>
            </span>
            {result.reviewedTerms.map((term, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-neutral-900 border border-amber-800/80 text-xs font-mono text-amber-300 shadow-sm"
              >
                <span>{term}</span>
                <button
                  type="button"
                  onClick={() => handleToggleMastery(term)}
                  className={`p-0.5 rounded-none transition-colors cursor-pointer ${
                    masteredMap[term]
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-neutral-500 hover:text-amber-400'
                  }`}
                  title={masteredMap[term] ? 'Đã thuộc vững' : 'Bấm để đánh dấu đã thuộc'}
                >
                  <Bookmark className={`w-3 h-3 ${masteredMap[term] ? 'fill-emerald-400' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workplace Situation Card */}
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-4 shadow-sm">
        <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            [ BỐI CẢNH CÔNG SỞ THỰC TẾ ]
          </span>
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans">
            {result.situationContext}
          </p>
        </div>

        <div className="p-3.5 rounded-none bg-amber-950/20 border-l-4 border-l-amber-500 border-y border-r border-amber-900/40">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              CÂU HỎI PHẢN XẠ:
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-white leading-snug">
            {result.question}
          </p>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-2 pt-2">
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedIndex === idx;
            const isTargetCorrect = idx === newCorrectIndex;

            let optionStyle =
              'border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-neutral-200';

            if (hasAnswered) {
              if (isTargetCorrect) {
                optionStyle = 'border-2 border-emerald-500 bg-emerald-950/40 text-emerald-100 font-semibold';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-2 border-rose-500 bg-rose-950/40 text-rose-200';
              } else {
                optionStyle = 'border-neutral-850 bg-neutral-950 text-neutral-500 opacity-60';
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-none border transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <span
                    className={`w-6 h-6 rounded-none font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      hasAnswered && isTargetCorrect
                        ? 'bg-emerald-600 text-white font-black'
                        : hasAnswered && isSelected && !isCorrect
                        ? 'bg-rose-600 text-white font-black'
                        : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm leading-relaxed">{option}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(option);
                    }}
                    className="p-1.5 rounded-none bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700"
                    title="Nghe câu này"
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 ${speakingText === option ? 'animate-bounce text-amber-400' : ''}`}
                    />
                  </button>

                  {hasAnswered && isTargetCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback & Pedagogical Explanation */}
      {hasAnswered && (
        <div className="space-y-3">
          <div
            className={`p-5 rounded-none border-l-4 space-y-3 ${
              isCorrect
                ? 'bg-emerald-950/20 border-l-emerald-500 border-y border-r border-emerald-800/60'
                : 'bg-rose-950/20 border-l-rose-500 border-y border-r border-rose-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                    [ CHÍNH XÁC - PHẢN XẠ XUẤT SẮC 🎯 ]
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-mono font-bold text-rose-300 uppercase">
                    [ CHƯA CHUẨN XÁC - CÙNG PHÂN TÍCH LỖI SAI ]
                  </span>
                </>
              )}
            </div>

            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
              <strong className="text-white block mb-1 font-mono uppercase text-xs">💡 Phân tích chi tiết:</strong>
              {cleanedExplanation || result.explanation}
            </div>
          </div>

          {/* Core Memory Retrieval Tip */}
          {result.memoryTip && (
            <div className="p-4 rounded-none bg-neutral-950 border-l-4 border-l-amber-500 border-y border-r border-amber-900/40 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  MẸO GHI NHỚ PHẢN XẠ (MEMORY TIP)
                </span>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {result.memoryTip}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
