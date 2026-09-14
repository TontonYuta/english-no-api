import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Brain,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Check,
  Bookmark,
  Shuffle
} from 'lucide-react';
import {
  getLearnedWords,
  addLearnedWords,
  toggleWordMastery,
  recordWordReview,
} from '../../utils/learningMemory';
import { playAudioPronunciation } from '../../utils/speechUtils';
import {
  generateVocabTestQuestions,
  VocabTestQuestion,
  SAMPLE_VOCAB_FOR_TEST,
} from '../../utils/quizUtils';
import { LearnedWord } from '../../types';

interface VocabTestViewProps {
  onWordsUpdated?: () => void;
}

export const VocabTestView: React.FC<VocabTestViewProps> = ({ onWordsUpdated }) => {
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>(() => getLearnedWords());
  const [questions, setQuestions] = useState<VocabTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [sampleLoadedNotice, setSampleLoadedNotice] = useState(false);
  const [testMode, setTestMode] = useState<'all' | 'meaning' | 'word_form'>('all');

  // Initialize or re-generate questions whenever learnedWords change or user requests
  const initQuestions = (
    wordsList: LearnedWord[],
    mode: 'all' | 'meaning' | 'word_form' = testMode
  ) => {
    if (wordsList.length > 0) {
      const generated = generateVocabTestQuestions(wordsList, Math.min(5, wordsList.length), mode);
      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsTestFinished(false);
    } else {
      setQuestions([]);
    }
  };

  const handleChangeMode = (mode: 'all' | 'meaning' | 'word_form') => {
    setTestMode(mode);
    initQuestions(learnedWords, mode);
  };

  useEffect(() => {
    const words = getLearnedWords();
    setLearnedWords(words);
    initQuestions(words, 'all');
  }, []);

  const handleLoadSampleWords = () => {
    addLearnedWords(SAMPLE_VOCAB_FOR_TEST as any);
    const updated = getLearnedWords();
    setLearnedWords(updated);
    initQuestions(updated, testMode);
    setSampleLoadedNotice(true);
    if (onWordsUpdated) onWordsUpdated();
    setTimeout(() => setSampleLoadedNotice(false), 3000);
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // Already answered

    const currentQ = questions[qIdx];
    const isCorrect = optIdx === currentQ.correctIndex;

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));

    // Record review in Memory Bank
    if (currentQ.wordId) {
      recordWordReview(currentQ.wordId, isCorrect);
      const updated = getLearnedWords();
      setLearnedWords(updated);
      if (onWordsUpdated) onWordsUpdated();
    }
  };

  const handleToggleMastery = (wordId: string) => {
    toggleWordMastery(wordId);
    const updated = getLearnedWords();
    setLearnedWords(updated);
    if (onWordsUpdated) onWordsUpdated();
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

  // Score calculation
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const currentQ = questions[currentIndex];
  const currentSelected = selectedAnswers[currentIndex];
  const hasAnsweredCurrent = currentSelected !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && currentSelected === currentQ?.correctIndex;

  // Empty state if no words learned yet
  if (learnedWords.length === 0) {
    return (
      <div className="p-8 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 text-center shadow-sm">
        <div className="w-12 h-12 rounded-none bg-amber-950 border border-amber-800/80 text-amber-400 mx-auto flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-mono font-bold text-white uppercase tracking-tight">
            [ SỔ TAY MEMORY BANK CHƯA CÓ TỪ VỰNG ]
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Chế độ Kiểm tra Từ Vựng sẽ sử dụng chính các từ bạn đã học ở Trụ cột 01 để kiểm tra trí nhớ phản xạ chủ động (Active Recall).
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLoadSampleWords}
            className="px-5 py-2.5 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nạp 6 từ mẫu TOEIC A1–B2 để test ngay</span>
          </button>
        </div>

        {sampleLoadedNotice && (
          <p className="text-xs font-mono text-emerald-400 animate-fade-in">
            ✓ Đã nạp thành công 6 từ mẫu! Đang tạo bài test...
          </p>
        )}
      </div>
    );
  }

  // Summary View when user finishes all questions
  if (isTestFinished || (answeredCount === totalQuestions && totalQuestions > 0 && isTestFinished)) {
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 shadow-sm border-l-4 border-l-amber-500">
        {/* Header Result */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800">
                [ KẾT QUẢ KIỂM TRA TRÍ NHỚ PHẢN XẠ ]
              </span>
            </div>
            <h3 className="text-lg font-mono font-black text-white tracking-tight uppercase">
              TỔNG KẾT BÀI TEST TỪ ĐÃ HỌC
            </h3>
            {/* Mode selection tabs */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => handleChangeMode('all')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                  testMode === 'all'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                🎯 TẤT CẢ DẠNG
              </button>
              <button
                type="button"
                onClick={() => handleChangeMode('meaning')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                  testMode === 'meaning'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                📖 NGHĨA TỪ
              </button>
              <button
                type="button"
                onClick={() => handleChangeMode('word_form')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                  testMode === 'word_form'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                🧩 LUYỆN WORDFORM (PART 5)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                initQuestions(learnedWords, testMode);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 cursor-pointer uppercase"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>ĐỀ TEST MỚI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAnswers({});
                setCurrentIndex(0);
                setIsTestFinished(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-850 text-neutral-200 font-mono text-xs font-bold transition-all border border-neutral-700 cursor-pointer uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>LÀM LẠI</span>
            </button>
          </div>
        </div>

        {/* Score Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
              ĐIỂM SỐ
            </span>
            <span className="text-2xl font-mono font-black text-white">
              {correctCount} / {totalQuestions}
            </span>
          </div>

          <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
              TỶ LỆ CHÍNH XÁC
            </span>
            <span
              className={`text-2xl font-mono font-black ${
                percentage >= 80 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
              ĐÁNH GIÁ PHẢN XẠ
            </span>
            <span className="text-sm font-bold text-neutral-200 block mt-1">
              {percentage === 100
                ? '🌟 Xuất sắc! Bạn đã khắc sâu từ vựng.'
                : percentage >= 60
                ? '👍 Tốt! Tiếp tục luyện tập để thành phản xạ tự nhiên.'
                : '💪 Cần ôn lại các từ chưa nhớ rõ.'}
            </span>
          </div>
        </div>

        {/* Breakdown of questions */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            [ CHI TIẾT TỪNG TỪ ĐÃ KIỂM TRA ]
          </span>
          <div className="space-y-2">
            {questions.map((q, idx) => {
              const selectedOpt = selectedAnswers[idx];
              const isCorrect = selectedOpt === q.correctIndex;
              const currentWord = learnedWords.find((w) => w.id === q.wordId);

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-none border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-900/60 border-l-4 border-l-emerald-500'
                      : 'bg-rose-950/20 border-rose-900/60 border-l-4 border-l-rose-500'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">
                        {q.term}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">{q.ipa}</span>
                      {q.questionType === 'word_form' && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-none border border-amber-800/60 font-bold">
                          🧩 WORDFORM
                        </span>
                      )}
                      {q.vietnamesePhonetic && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-none border border-amber-800/60">
                          {q.vietnamesePhonetic}
                        </span>
                      )}
                      <span className="text-xs text-neutral-300">→ {q.vietnameseMeaning}</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">
                      {isCorrect ? '✓ Trả lời đúng' : `✗ Bạn chọn: "${q.options[selectedOpt]}" (Đúng: "${q.options[q.correctIndex]}")`}
                    </p>
                    {q.questionType === 'word_form' && (
                      <p className="text-[11px] text-amber-200/90 font-sans italic">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakText(q.term)}
                      className="p-1.5 rounded-none bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                      title="Phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {currentWord && (
                      <button
                        type="button"
                        onClick={() => handleToggleMastery(currentWord.id)}
                        className={`px-2 py-1 rounded-none text-xs font-mono transition-colors border flex items-center gap-1 cursor-pointer ${
                          currentWord.mastered
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-amber-300'
                        }`}
                        title={currentWord.mastered ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                      >
                        <Bookmark className={`w-3 h-3 ${currentWord.mastered ? 'fill-emerald-400' : ''}`} />
                        <span>{currentWord.mastered ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View (Question by Question)
  return (
    <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 shadow-sm border-l-4 border-l-sky-500">
      {/* Quiz Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-none bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>ACTIVE RECALL TEST</span>
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs font-mono text-neutral-400">
              CÂU {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              ĐIỂM: {correctCount}/{answeredCount}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight uppercase">
            KIỂM TRA TỪ VỰNG ĐÃ LƯU TRONG BỘ NHỚ
          </h3>
          {/* Mode selection tabs */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <button
              type="button"
              onClick={() => handleChangeMode('all')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                testMode === 'all'
                  ? 'bg-sky-600 border-sky-400 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              🎯 TẤT CẢ DẠNG
            </button>
            <button
              type="button"
              onClick={() => handleChangeMode('meaning')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                testMode === 'meaning'
                  ? 'bg-sky-600 border-sky-400 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              📖 NGHĨA TỪ
            </button>
            <button
              type="button"
              onClick={() => handleChangeMode('word_form')}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer transition-colors border ${
                testMode === 'word_form'
                  ? 'bg-amber-600 border-amber-400 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              🧩 LUYỆN WORDFORM (PART 5)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => initQuestions(learnedWords, testMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-xs font-mono font-bold transition-all border border-neutral-700 cursor-pointer uppercase"
            title="Đổi bộ câu hỏi khác"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>ĐỔI ĐỀ</span>
          </button>
          {answeredCount === totalQuestions && (
            <button
              type="button"
              onClick={() => setIsTestFinished(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-black transition-all border border-emerald-400 cursor-pointer uppercase tracking-wider"
            >
              <Award className="w-3.5 h-3.5" />
              <span>XEM TỔNG KẾT</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Stem Card */}
      {currentQ && (
        <div className="space-y-4">
          <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-none bg-neutral-950 text-sky-400 border border-neutral-800">
                {currentQ.questionType === 'en_to_vi'
                  ? '[ DẠNG 1: TỪ TIẾNG ANH ➔ NGHĨA TIẾNG VIỆT ]'
                  : currentQ.questionType === 'vi_to_en'
                  ? '[ DẠNG 2: NGHĨA TIẾNG VIỆT ➔ TỪ TIẾNG ANH ]'
                  : currentQ.questionType === 'word_form'
                  ? '[ DẠNG: BIẾN ĐỔI TỪ LOẠI - TOEIC PART 5 ]'
                  : '[ DẠNG 3: ĐIỀN TỪ VÀO CÂU VĂN BẢN ]'}
              </span>

              {/* Audio button for term */}
              <button
                type="button"
                onClick={() => speakText(currentQ.term)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-neutral-950 hover:bg-neutral-850 text-neutral-300 text-xs font-mono border border-neutral-800 cursor-pointer transition-colors"
                title="Nghe phát âm chuẩn"
              >
                <Volume2 className={`w-3.5 h-3.5 ${speakingText === currentQ.term ? 'text-amber-400 animate-bounce' : 'text-sky-400'}`} />
                <span>Phát âm ({currentQ.term})</span>
              </button>
            </div>

            {/* Prompt text */}
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed font-sans whitespace-pre-line">
              {currentQ.prompt}
            </p>

            {/* Phonetic guide if available */}
            {currentQ.vietnamesePhonetic && (
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span>Phiên âm quốc tế: <strong className="text-neutral-200">{currentQ.ipa}</strong></span>
                <span>•</span>
                <span>Mẹo đọc tiếng Việt: <strong className="text-amber-300">"{currentQ.vietnamesePhonetic}"</strong></span>
              </div>
            )}

            {/* Word Family Preview if available */}
            {currentQ.wordFamilyDetails && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono text-neutral-400 pt-1.5 border-t border-neutral-800/80">
                <span className="text-neutral-500 text-[10px] uppercase font-bold">Gia đình từ:</span>
                {currentQ.wordFamilyDetails.noun && (
                  <span className="px-1.5 py-0.5 rounded-none bg-sky-950/60 text-sky-300 border border-sky-800/60 text-[10px]">
                    N: {currentQ.wordFamilyDetails.noun}
                  </span>
                )}
                {currentQ.wordFamilyDetails.verb && (
                  <span className="px-1.5 py-0.5 rounded-none bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px]">
                    V: {currentQ.wordFamilyDetails.verb}
                  </span>
                )}
                {currentQ.wordFamilyDetails.adjective && (
                  <span className="px-1.5 py-0.5 rounded-none bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[10px]">
                    Adj: {currentQ.wordFamilyDetails.adjective}
                  </span>
                )}
                {currentQ.wordFamilyDetails.adverb && (
                  <span className="px-1.5 py-0.5 rounded-none bg-purple-950/60 text-purple-300 border border-purple-800/60 text-[10px]">
                    Adv: {currentQ.wordFamilyDetails.adverb}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = currentSelected === optIdx;
              const isOptionCorrect = optIdx === currentQ.correctIndex;

              let btnStyle = 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-200';
              if (hasAnsweredCurrent) {
                if (isOptionCorrect) {
                  btnStyle = 'border-2 border-emerald-500 bg-emerald-950/40 text-emerald-100 font-semibold';
                } else if (isSelected && !isCurrentCorrect) {
                  btnStyle = 'border-2 border-rose-500 bg-rose-950/40 text-rose-200';
                } else {
                  btnStyle = 'border-neutral-850 bg-neutral-950 text-neutral-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentIndex, optIdx)}
                  disabled={hasAnsweredCurrent}
                  className={`p-4 rounded-none border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${btnStyle} ${
                    hasAnsweredCurrent ? 'cursor-default' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className={`w-6 h-6 rounded-none font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        hasAnsweredCurrent && isOptionCorrect
                          ? 'bg-emerald-600 text-white font-black'
                          : hasAnsweredCurrent && isSelected && !isCurrentCorrect
                          ? 'bg-rose-600 text-white font-black'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasAnsweredCurrent && isOptionCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isCurrentCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {hasAnsweredCurrent && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-4 rounded-none border-l-4 space-y-2 ${
                  isCurrentCorrect
                    ? 'bg-emerald-950/20 border-l-emerald-500 border-y border-r border-emerald-800/60'
                    : 'bg-rose-950/20 border-l-rose-500 border-y border-r border-rose-800/60'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-xs font-mono font-bold uppercase ${isCurrentCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {isCurrentCorrect ? '[ CHÍNH XÁC 100% 🎯 ]' : '[ CHƯA CHUẨN XÁC ]'}
                  </span>

                  {currentQ.wordId && (
                    <button
                      type="button"
                      onClick={() => handleToggleMastery(currentQ.wordId)}
                      className="text-xs font-mono text-neutral-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer underline"
                    >
                      <Bookmark className="w-3 h-3 text-amber-400" />
                      <span>Đánh dấu thuộc lòng từ này</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                  {currentQ.explanation}
                </p>

                {currentQ.exampleSentence && (
                  <div className="pt-2 border-t border-neutral-800/80 text-xs font-sans text-neutral-300">
                    <span className="font-mono text-neutral-400 block mb-0.5">Ví dụ ứng dụng:</span>
                    <p className="italic text-white">"{currentQ.exampleSentence}"</p>
                    {currentQ.exampleTranslation && (
                      <p className="text-neutral-400 mt-0.5">→ {currentQ.exampleTranslation}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-850 disabled:opacity-40 text-neutral-300 text-xs font-mono font-bold transition-all border border-neutral-700 cursor-pointer disabled:cursor-not-allowed uppercase"
                >
                  ◀ Câu Trước
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-none bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-black transition-all border border-sky-400 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Câu Tiếp Theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTestFinished(true)}
                    className="px-5 py-2 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-black transition-all border border-emerald-400 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Award className="w-4 h-4" />
                    <span>Xem Tổng Kết Điểm</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
