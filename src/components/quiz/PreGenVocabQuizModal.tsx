import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  X,
  FastForward,
} from 'lucide-react';
import { LearnedWord } from '../../types';
import { generateVocabTestQuestions, VocabTestQuestion } from '../../utils/quizUtils';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { recordWordReview } from '../../utils/learningMemory';

interface PreGenVocabQuizModalProps {
  isOpen: boolean;
  questionCount: number;
  learnedWords: LearnedWord[];
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
  lang?: 'vi' | 'en';
}

export const PreGenVocabQuizModal: React.FC<PreGenVocabQuizModalProps> = ({
  isOpen,
  questionCount,
  learnedWords,
  onComplete,
  onSkip,
  onClose,
  lang = 'vi',
}) => {
  const questions: VocabTestQuestion[] = useMemo(() => {
    if (!isOpen || !learnedWords || learnedWords.length === 0) return [];
    const count = Math.min(Math.max(1, questionCount), learnedWords.length);
    return generateVocabTestQuestions(learnedWords, count, 'all');
  }, [isOpen, questionCount, learnedWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredState, setAnsweredState] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isAnswered = answeredState[currentIndex] ?? false;
  const selectedOption = selectedAnswers[currentIndex];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;

    const correct = optIdx === currentQ.correctIndex;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
    setAnsweredState((prev) => ({ ...prev, [currentIndex]: true }));

    // Record review in memory bank
    try {
      recordWordReview(currentQ.wordId || currentQ.term, correct);
    } catch (e) {
      console.warn('Failed to record word review:', e);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Calculate results
  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => ans === questions[parseInt(idx, 10)]?.correctIndex
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-850 bg-zinc-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {lang === 'vi' ? 'Ôn Tập Nhanh Kho Từ Vựng' : 'Quick Vocab Recall Check'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  PRE-LESSON
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                {lang === 'vi'
                  ? 'Kích hoạt trí nhớ trước khi sinh bài đọc mới'
                  : 'Warm up your memory before generating new reading content'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            title="Hủy tạo bài"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {!isFinished ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Progress Bar & Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  {lang === 'vi' ? 'Câu hỏi' : 'Question'} {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Prompt & Target Word */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2 shadow-inner">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide">
                  {currentQ.term}
                </span>
                <button
                  type="button"
                  onClick={() => playAudioPronunciation(currentQ.term)}
                  className="p-1.5 rounded-full text-sky-400 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {currentQ.ipa && (
                <span className="text-xs text-zinc-400 font-mono block">
                  [{currentQ.ipa}] {currentQ.partOfSpeech ? `• (${currentQ.partOfSpeech})` : ''}
                </span>
              )}

              <p className="text-xs text-sky-300 font-sans font-medium pt-1 border-t border-zinc-800/80">
                {currentQ.prompt || (lang === 'vi' ? 'Chọn nghĩa tiếng Việt chính xác nhất:' : 'Select the most accurate meaning:')}
              </p>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt, optIdx) => {
                let btnStyle = 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white';
                let indicator = (
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 font-mono text-xs flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                );

                if (isAnswered) {
                  if (optIdx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-md';
                    indicator = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
                  } else if (optIdx === selectedOption) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                    indicator = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
                  } else {
                    btnStyle = 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-sans ${btnStyle}`}
                  >
                    {indicator}
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card after answered */}
            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-fade-in font-sans ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 font-mono">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Chính xác! (+1 điểm ghi nhớ)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-300">
                        Chưa đúng! Đáp án đúng là: {currentQ.options[currentQ.correctIndex]}
                      </span>
                    </>
                  )}
                </div>
                {currentQ.explanation && <p className="text-zinc-300">{currentQ.explanation}</p>}
                {currentQ.exampleSentence && (
                  <p className="mt-1 text-[11px] text-zinc-400 italic">
                    Ví dụ: "{currentQ.exampleSentence}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white tracking-tight">
                {lang === 'vi' ? 'Hoàn Thành Bài Ôn Tập!' : 'Review Completed!'}
              </h4>
              <p className="text-xs text-zinc-400 font-sans">
                {lang === 'vi'
                  ? `Bạn đã trả lời đúng ${correctCount}/${questions.length} từ vựng cũ trong kho.`
                  : `You correctly answered ${correctCount}/${questions.length} review words.`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-emerald-300 font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'vi'
                  ? 'Kho từ vựng đã được củng cố. Sẵn sàng tạo bài đọc mới!'
                  : 'Memory bank updated. Ready to generate your new lesson!'}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-center">
              <button
                type="button"
                onClick={onComplete}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <span>🚀 {lang === 'vi' ? 'Tiếp Tục Tạo Bài Mới' : 'Continue to Generate Lesson'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Bỏ qua trắc nghiệm và bắt đầu sinh bài đọc ngay"
          >
            <FastForward className="w-3.5 h-3.5 text-zinc-400" />
            <span>{lang === 'vi' ? 'Bỏ qua lần này & Tạo bài ngay' : 'Skip quiz & generate now'}</span>
          </button>

          {!isFinished && isAnswered && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <span>{currentIndex < questions.length - 1 ? (lang === 'vi' ? 'Câu tiếp theo' : 'Next') : (lang === 'vi' ? 'Xem kết quả' : 'Finish')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
