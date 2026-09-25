import React, { useState } from 'react';
import { TranslationVocabResult, Language } from '../../types';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Bookmark,
  Share2,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { playAudioPronunciation, getUserAudioSettings } from '../../utils/speechUtils';
import { addLearnedWords } from '../../utils/learningMemory';

interface TranslationVocabResultViewProps {
  result: TranslationVocabResult;
  lang?: Language;
  onPracticeAgain?: () => void;
}

export const TranslationVocabResultView: React.FC<TranslationVocabResultViewProps> = ({
  result,
  lang = 'vi',
  onPracticeAgain,
}) => {
  const [activeTab, setActiveTab] = useState<'translation' | 'vocab' | 'advice'>('translation');
  const [copiedReference, setCopiedReference] = useState(false);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});
  const [expandedSentenceIdx, setExpandedSentenceIdx] = useState<number | null>(null);

  const audioSettings = getUserAudioSettings();

  const handleCopyReference = () => {
    navigator.clipboard.writeText(result.translationEvaluation.referenceTranslation);
    setCopiedReference(true);
    setTimeout(() => setCopiedReference(false), 2000);
  };

  const handlePlayAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playAudioPronunciation(text, {
      rate: 0.9,
      voice: audioSettings.speechVoice,
    });
  };

  const handleSaveWordToMemory = (wordItem: any) => {
    addLearnedWords([
      {
        term: wordItem.word,
        ipa: wordItem.ipa || '',
        partOfSpeech: wordItem.partOfSpeech || 'vocab',
        vietnameseMeaning: wordItem.actualMeaningInContext,
        exampleSentence: wordItem.exampleSentence || wordItem.contextSentence || '',
        level: result.cefrLevel || 'B2',
      },
    ]);
    setSavedWords((prev) => ({ ...prev, [wordItem.word]: true }));
  };

  // Color scheme based on overall score
  const score = result.overallScore;
  const scoreColor =
    score >= 85
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : score >= 70
      ? 'text-sky-400 border-sky-500/40 bg-sky-500/10'
      : 'text-amber-400 border-amber-500/40 bg-amber-500/10';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HERO SCORE & PERFORMANCE DASHBOARD */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Overall score gauge */}
          <div className="flex items-center gap-5">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${scoreColor}`}
            >
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">{score}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-0.5">
                / 100 ĐIỂM
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{result.performanceBadge}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-800 text-sky-300 border border-zinc-700">
                  Cấp độ CEFR: {result.cefrLevel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {result.title || 'Báo Cáo Đánh Giá & Chấm Điểm AI'}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                {result.executiveSummary}
              </p>
            </div>
          </div>

          {/* Right: Component Score Breakdown */}
          <div className="grid grid-cols-2 gap-3 lg:w-72 shrink-0">
            {/* Translation Score */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 uppercase">Điểm Dịch Đoạn</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {result.translationScore}
                <span className="text-xs text-neutral-500">/100</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.translationScore)}%` }}
                />
              </div>
            </div>

            {/* Vocab Guessing Score */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 uppercase">Đoán Từ Ngữ Cảnh</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {result.vocabScore}
                <span className="text-xs text-neutral-500">/100</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.vocabScore)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/80 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('translation')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeTab === 'translation'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-850 hover:bg-zinc-800 text-neutral-300'
            }`}
          >
            <span>✍️ Phân Tích Bản Dịch ({result.translationEvaluation.sentenceBySentenceFeedback.length} câu)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeTab === 'vocab'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-zinc-850 hover:bg-zinc-800 text-neutral-300'
            }`}
          >
            <span>📖 Bóc Tách Từ Vựng Đoán ({result.vocabEvaluations.length} từ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advice')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeTab === 'advice'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-zinc-850 hover:bg-zinc-800 text-neutral-300'
            }`}
          >
            <span>💡 Góp Ý &amp; Lộ Trình Cải Thiện</span>
          </button>

          {onPracticeAgain && (
            <button
              type="button"
              onClick={onPracticeAgain}
              className="ml-auto px-4 py-2 rounded-xl text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-750 text-neutral-200 border border-zinc-700 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Luyện Bài Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB CONTENT: TRANSLATION ANALYSIS */}
      {activeTab === 'translation' && (
        <div className="space-y-6">
          {/* Reference Translation Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  BẢN DỊCH THAM KHẢO CHUẨN XÁC TỪ AI (NATIVE POLISH)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyReference}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-800 hover:bg-zinc-750 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              >
                {copiedReference ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReference ? 'Đã sao chép' : 'Sao chép bản dịch'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 text-emerald-100 text-sm leading-relaxed whitespace-pre-line font-sans">
              {result.translationEvaluation.referenceTranslation}
            </div>
          </div>

          {/* Strengths & Weaknesses Pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Điểm Sáng Trong Bản Dịch</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {result.translationEvaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Điểm Cần Chuốt Lại (Polish)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {result.translationEvaluation.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sentence-by-Sentence Breakdown */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4 backdrop-blur-md">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                  CHẤM TỪNG CÂU &amp; SO SÁNH 3 LỚP (SENTENCE-BY-SENTENCE BREAKDOWN)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Đối chiếu từng câu gốc tiếng Anh, câu bạn đã dịch và gợi ý tối ưu từ AI.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {result.translationEvaluation.sentenceBySentenceFeedback.length} câu
              </span>
            </div>

            <div className="space-y-4">
              {result.translationEvaluation.sentenceBySentenceFeedback.map((item) => {
                const statusBadge =
                  item.status === 'good'
                    ? { label: 'Dịch Tốt', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
                    : item.status === 'acceptable'
                    ? { label: 'Chấp Nhận Được', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' }
                    : { label: 'Cần Cải Thiện', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };

                return (
                  <div
                    key={item.sentenceIndex}
                    className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-zinc-800 text-neutral-300 font-mono font-bold text-xs flex items-center justify-center">
                          #{item.sentenceIndex}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(item.originalSentence)}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                        title="Nghe câu gốc tiếng Anh"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sentence 3-Layer Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* English Original */}
                      <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-850 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">1. Câu Gốc Tiếng Anh</div>
                        <p className="text-neutral-200 leading-relaxed font-sans">{item.originalSentence}</p>
                      </div>

                      {/* User's Translation */}
                      <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-850 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">2. Bản Dịch Của Bạn</div>
                        <p className="text-neutral-200 leading-relaxed font-sans italic">
                          {item.userTranslatedSentence ? `"${item.userTranslatedSentence}"` : '(Chưa dịch câu này)'}
                        </p>
                      </div>

                      {/* Suggested Polish */}
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">3. Gợi Ý Chuẩn Của AI</div>
                        <p className="text-emerald-200 leading-relaxed font-sans">{item.suggestedSentence}</p>
                      </div>
                    </div>

                    {/* In-depth Critique */}
                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-850 text-xs text-neutral-300 font-sans flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <b className="text-neutral-200 font-mono text-[11px] uppercase">Góp ý khách quan:</b>{' '}
                        {item.critique}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: VOCABULARY GUESSING EVALUATION */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.vocabEvaluations.map((item) => {
              const isSaved = savedWords[item.word];
              const gradeBadge =
                item.accuracyGrade === 'exact'
                  ? { label: 'Chính xác 100%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
                  : item.accuracyGrade === 'close'
                  ? { label: 'Gần đúng 75%', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
                  : { label: 'Chưa chính xác', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };

              return (
                <div
                  key={item.word}
                  className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3.5 backdrop-blur-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white font-mono">{item.word}</h4>
                        <span className="text-xs text-sky-400 font-mono">{item.ipa}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(item.word)}
                          className="text-neutral-400 hover:text-white cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono uppercase mt-0.5">
                        {item.partOfSpeech}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${gradeBadge.color}`}>
                        {gradeBadge.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSaveWordToMemory(item)}
                        className={`p-1.5 rounded-lg text-xs font-mono border cursor-pointer transition-colors ${
                          isSaved
                            ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-750 text-neutral-400 hover:text-white border-zinc-700'
                        }`}
                        title={isSaved ? 'Đã lưu vào Sổ Nhớ' : 'Lưu từ này vào Sổ Nhớ'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Guess vs Actual Meaning */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-0.5">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Bạn đã đoán:</span>
                      <div className="text-neutral-200 font-medium italic font-sans">
                        "{item.userGuess}"
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-0.5">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Nghĩa theo ngữ cảnh:</span>
                      <div className="text-emerald-300 font-medium font-sans">
                        {item.actualMeaningInContext}
                      </div>
                    </div>
                  </div>

                  {/* Objective AI Feedback */}
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-850 text-xs text-neutral-300 font-sans leading-relaxed">
                    <b className="text-amber-400 font-mono text-[11px] uppercase">Đánh giá suy luận:</b>{' '}
                    {item.feedback}
                  </div>

                  {/* Nuance Breakdown */}
                  <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-850 text-xs text-neutral-300 font-sans space-y-1">
                    <div className="text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>Sắc thái ngữ cảnh &amp; Manh mối:</span>
                    </div>
                    <p className="leading-relaxed text-neutral-400">{item.nuanceExplanation}</p>
                  </div>

                  {/* Collocations & Example Sentence */}
                  {item.collocations && item.collocations.length > 0 && (
                    <div className="pt-2 border-t border-zinc-850/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-neutral-500">Collocations:</span>
                      {item.collocations.map((col, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-sky-300">
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: OBJECTIVE ADVICE & IMPROVEMENT ROADMAP */}
      {activeTab === 'advice' && (
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-6 backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              LỜI KHUYÊN KHÁCH QUAN &amp; KẾ HOẠCH CẢI THIỆN TỪ AI
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Những phương pháp cốt lõi để nâng cấp tư duy dịch thuật và kỹ năng suy luận từ vựng không cần từ điển.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Translation Mastery Tips */}
            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Kỹ Năng Dịch Thoát Ý Tự Nhiên</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 leading-relaxed font-sans">
                {result.objectiveAdvice.translationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Context Deduction Tips */}
            <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Mẹo Suy Luận Nghĩa Từ Qua Ngữ Cảnh</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 leading-relaxed font-sans">
                {result.objectiveAdvice.contextDeductionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Action Callout */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                Hành động đề xuất tiếp theo:
              </div>
              <div className="text-xs text-neutral-200 font-sans">
                {result.objectiveAdvice.nextAction}
              </div>
            </div>

            {onPracticeAgain && (
              <button
                type="button"
                onClick={onPracticeAgain}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shrink-0 shadow-md"
              >
                Bắt Đầu Ngay ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
