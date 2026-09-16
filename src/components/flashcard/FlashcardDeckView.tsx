import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardItem, LeitnerRating } from '../../types';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Award,
  RefreshCcw,
  Mic,
} from 'lucide-react';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { recordWordReview, toggleWordMastery } from '../../utils/learningMemory';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

export interface FlashcardDeckViewProps {
  items: FlashcardItem[];
  title?: string;
  onClose?: () => void;
  onWordMastered?: (term: string, mastered: boolean) => void;
  onDeckCompleted?: (stats: { total: number; easy: number; good: number; hard: number; again: number }) => void;
  lang?: 'vi' | 'en';
}

export const FlashcardDeckView: React.FC<FlashcardDeckViewProps> = ({
  items: initialItems = [],
  title = 'BỘ THẺ FLASHCARD ÔN TẬP',
  onClose,
  onWordMastered,
  onDeckCompleted,
  lang = 'vi',
}) => {
  const [deck, setDeck] = useState<FlashcardItem[]>(() =>
    Array.isArray(initialItems) ? [...initialItems] : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(() => {
    return localStorage.getItem('playeng_flashcard_autoplay') !== 'false';
  });
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Leitner ratings for current session
  const [ratings, setRatings] = useState<Record<number, LeitnerRating>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [againPile, setAgainPile] = useState<FlashcardItem[]>([]);

  // Pronunciation Coach Modal
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Sync if initialItems change
  useEffect(() => {
    setDeck(Array.isArray(initialItems) ? [...initialItems] : []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setRatings({});
    setIsCompleted(false);
    setAgainPile([]);
  }, [initialItems]);

  const currentCard: FlashcardItem | undefined = deck[currentIndex];

  const speakText = useCallback((text: string, rate: number = 1.0) => {
    setSpeakingWord(text);
    playAudioPronunciation(text, {
      rate,
      onStart: () => setSpeakingWord(text),
      onEnd: () => setSpeakingWord(null),
      onError: () => setSpeakingWord(null),
    });
  }, []);

  // Auto-speak on card flip
  useEffect(() => {
    if (isFlipped && currentCard && autoPlayAudio) {
      speakText(currentCard.term, 0.95);
    }
  }, [isFlipped, currentCard, autoPlayAudio, speakText]);

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlayAudio;
    setAutoPlayAudio(nextVal);
    localStorage.setItem('playeng_flashcard_autoplay', String(nextVal));
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      finishDeck();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleRate = (rating: LeitnerRating) => {
    if (!currentCard) return;

    const newRatings = { ...ratings, [currentIndex]: rating };
    setRatings(newRatings);

    // Update memory bank
    const isSuccess = rating === 'good' || rating === 'easy';
    recordWordReview(currentCard.term, isSuccess);

    if (rating === 'easy') {
      // Mark as mastered
      toggleWordMastery(currentCard.id || currentCard.term);
      onWordMastered?.(currentCard.term, true);
    }

    if (rating === 'again' || rating === 'hard') {
      if (!againPile.some((item) => item.term.toLowerCase() === currentCard.term.toLowerCase())) {
        setAgainPile((prev) => [...prev, currentCard]);
      }
    }

    // Auto advance
    handleNext();
  };

  const finishDeck = () => {
    setIsCompleted(true);
    const total = deck.length;
    let easy = 0,
      good = 0,
      hard = 0,
      again = 0;
    Object.values(ratings).forEach((r) => {
      if (r === 'easy') easy++;
      else if (r === 'good') good++;
      else if (r === 'hard') hard++;
      else if (r === 'again') again++;
    });
    onDeckCompleted?.({ total, easy, good, hard, again });
  };

  const handleRestartAll = () => {
    setDeck([...initialItems]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setRatings({});
    setIsCompleted(false);
    setAgainPile([]);
  };

  const handleReviewAgainPile = () => {
    if (againPile.length === 0) return;
    setDeck([...againPile]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setRatings({});
    setIsCompleted(false);
    setAgainPile([]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or modal is not focused
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (isCoachOpen) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRate('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRate('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRate('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleRate('easy');
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentCard) {
          speakText(currentCard.term);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, deck, isCoachOpen, currentCard, speakText]);

  if (deck.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-sm text-center space-y-4">
        <Sparkles className="w-10 h-10 text-sky-400 mx-auto" />
        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
          {lang === 'vi' ? 'Chưa có từ vựng nào trong bộ Flashcard' : 'No flashcards available in this deck'}
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
          {lang === 'vi'
            ? 'Hãy tạo một bài học từ vựng mới hoặc lưu từ vào Sổ Nhớ để bắt đầu luyện tập lật thẻ.'
            : 'Generate a vocab lesson or save terms to Memory Bank to practice with flashcards.'}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-neutral-200 text-xs font-mono uppercase border border-zinc-700/60 cursor-pointer transition-all duration-150"
          >
            {lang === 'vi' ? 'Đóng lại' : 'Close'}
          </button>
        )}
      </div>
    );
  }

  // Session Completed Screen
  if (isCompleted) {
    const total = deck.length;
    let easyCount = 0,
      goodCount = 0,
      hardCount = 0,
      againCount = 0;
    Object.values(ratings).forEach((r) => {
      if (r === 'easy') easyCount++;
      else if (r === 'good') goodCount++;
      else if (r === 'hard') hardCount++;
      else if (r === 'again') againCount++;
    });
    const rememberedCount = easyCount + goodCount;
    const accuracy = Math.round((rememberedCount / total) * 100) || 0;

    return (
      <div className="p-6 sm:p-8 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-xl space-y-6 animate-fade-in text-center backdrop-blur-sm">
        <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            [ HOÀN THÀNH PHIÊN LUYỆN FLASHCARD ]
          </span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            {accuracy >= 80 ? 'XUẤT SẮC! TRÍ NHỚ RẤT TỐT' : 'ĐÃ HOÀN THÀNH VÒNG ÔN TẬP!'}
          </h3>
          <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto">
            Bạn đã duyệt qua toàn bộ <strong>{total}</strong> thẻ từ vựng theo phương pháp Spaced Repetition (Lặp lại ngắt quãng).
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto font-mono">
          <div className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800 text-center">
            <span className="text-xs text-neutral-400 uppercase block">Tỷ lệ nhớ</span>
            <span className="text-xl font-black text-sky-400">{accuracy}%</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs text-emerald-400 uppercase block">Thuộc lòng</span>
            <span className="text-xl font-black text-emerald-300">{easyCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-center">
            <span className="text-xs text-sky-400 uppercase block">Đã nhớ</span>
            <span className="text-xl font-black text-sky-300">{goodCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-xs text-rose-400 uppercase block">Cần ôn lại</span>
            <span className="text-xl font-black text-rose-300">{againPile.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-zinc-800/80">
          {againPile.length > 0 && (
            <button
              type="button"
              onClick={handleReviewAgainPile}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>ÔN LẠI {againPile.length} TỪ CHƯA NHỚ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRestartAll}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-white font-mono font-bold text-xs uppercase tracking-wider border border-zinc-700/60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
          >
            <RotateCw className="w-4 h-4 text-sky-400" />
            <span>HỌC LẠI TOÀN BỘ ({initialItems.length})</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-neutral-400 hover:text-white font-mono text-xs uppercase border border-zinc-800 cursor-pointer transition-all duration-150"
            >
              ĐÓNG FLASHCARD
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="space-y-4 select-none">
      {/* Deck Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              Thẻ {currentIndex + 1} / {deck.length} ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <button
            type="button"
            onClick={handleToggleAutoPlay}
            className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 cursor-pointer transition-all duration-150 ${
              autoPlayAudio
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                : 'bg-zinc-850 border-zinc-750 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Tự động phát âm khi lật thẻ"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Âm thanh tự động: {autoPlayAudio ? 'BẬT' : 'TẮT'}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-neutral-300 hover:text-white border border-zinc-750 text-[11px] flex items-center gap-1 cursor-pointer transition-all duration-150"
            title="Trộn ngẫu nhiên thứ tự thẻ"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Trộn thẻ</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-neutral-400 hover:text-white border border-zinc-750 text-[11px] cursor-pointer transition-all duration-150"
            >
              ✕ Đóng
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
        <div
          className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="w-full min-h-[360px] sm:min-h-[380px] cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full min-h-[360px] sm:min-h-[380px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ====================================================
              FRONT SIDE: ENGLISH TERM & PHONETICS
          ==================================================== */}
          <div
            className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-xl bg-zinc-900/95 border-2 transition-all duration-200 flex flex-col justify-between ${
              isFlipped
                ? 'pointer-events-none border-zinc-800'
                : 'border-zinc-800/90 hover:border-sky-500/50 shadow-xl shadow-black/40'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Top Bar on Front */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  [{currentCard?.partOfSpeech?.toUpperCase() || 'TERM'}]
                </span>
                {currentCard?.level && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    LEVEL {currentCard.level}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center gap-1 border cursor-pointer transition-all duration-150 ${
                    showHint
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-zinc-850 text-neutral-400 hover:text-neutral-200 border-zinc-750'
                  }`}
                  title="Hiện / Ẩn chữ cái đầu gợi ý"
                >
                  {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
                </button>

                <span className="text-[10px] font-mono text-neutral-500">
                  Mặt trước: Từ vựng
                </span>
              </div>
            </div>

            {/* Main Word Body */}
            <div className="my-auto py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  {currentCard?.term}
                </h2>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => currentCard && speakText(currentCard.term, 1.0)}
                    className="p-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-sky-400 border border-zinc-750 transition-all duration-150 cursor-pointer"
                    title="Nghe phát âm chuẩn (1.0x)"
                  >
                    <Volume2 className={`w-5 h-5 ${speakingWord === currentCard?.term ? 'animate-bounce' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => currentCard && speakText(currentCard.term, 0.7)}
                    className="px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-amber-400 text-xs font-mono border border-zinc-750 transition-all duration-150 cursor-pointer"
                    title="Nghe chậm (0.7x)"
                  >
                    🐢 0.7x
                  </button>
                </div>
              </div>

              {/* IPA & Vietnamese Phonetic */}
              <div className="flex items-center justify-center gap-2 flex-wrap font-mono">
                <span className="text-sm sm:text-base text-neutral-300 px-3 py-1 rounded-lg bg-zinc-850/70 border border-zinc-800">
                  {currentCard?.ipa || '/ipa/'}
                </span>
                {currentCard?.vietnamesePhonetic && (
                  <span className="text-xs text-purple-300 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    Đọc là: "{currentCard.vietnamesePhonetic}"
                  </span>
                )}
              </div>

              {/* Hint when toggled */}
              {showHint && currentCard && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs max-w-sm mx-auto animate-fade-in font-mono">
                  💡 Gợi ý: Bắt đầu bằng <strong>"{currentCard.term.slice(0, 2)}..."</strong> ({currentCard.vietnameseMeaning.slice(0, 15)}...)
                </div>
              )}
            </div>

            {/* Bottom Actions on Front */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800/80 text-xs font-mono">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {currentCard && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoachTarget({
                        term: currentCard.term,
                        ipa: currentCard.ipa,
                        vietnamesePhonetic: currentCard.vietnamesePhonetic,
                        vietnameseMeaning: currentCard.vietnameseMeaning,
                        exampleSentence: currentCard.exampleSentence,
                        exampleTranslation: currentCard.exampleTranslation,
                      });
                      setIsCoachOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-150"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LUYỆN ĐỌC THỬ (MIC)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-neutral-400 animate-pulse text-[11px]">
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Nhấn vào thẻ hoặc bấm <strong>[Space]</strong> để lật xem nghĩa ➔</span>
              </div>
            </div>
          </div>

          {/* ====================================================
              BACK SIDE: MEANING, EXAMPLES & WORD FAMILY
          ==================================================== */}
          <div
            className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-xl bg-zinc-900/95 border-2 transition-all duration-200 flex flex-col justify-between ${
              !isFlipped
                ? 'pointer-events-none border-zinc-800'
                : 'border-sky-500/50 shadow-2xl shadow-black/50'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Bar on Back */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-mono text-white">
                  {currentCard?.term}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {currentCard?.ipa}
                </span>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => currentCard && speakText(currentCard.term)}
                  className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-sky-400 border border-zinc-750 cursor-pointer transition-all duration-150"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-sky-400 uppercase">
                  Mặt sau: Nghĩa &amp; Ví dụ
                </span>
              </div>
            </div>

            {/* Back Content */}
            <div className="my-auto py-3 space-y-3.5 text-left">
              {/* Meaning Highlight */}
              <div className="p-3.5 rounded-lg bg-sky-500/10 border-l-4 border-l-sky-500 border-y border-r border-sky-500/20">
                <span className="text-[10px] font-mono font-bold uppercase text-sky-400 block mb-0.5">
                  Ý NGHĨA TIẾNG VIỆT:
                </span>
                <p className="text-base sm:text-lg font-bold text-sky-100 font-sans leading-snug">
                  {currentCard?.vietnameseMeaning}
                </p>
                {currentCard?.vietnamesePhonetic && (
                  <span className="text-xs text-purple-300 font-mono block mt-1">
                    Phát âm gần đúng: "{currentCard.vietnamesePhonetic}"
                  </span>
                )}
              </div>

              {/* Example Sentence */}
              {currentCard?.exampleSentence && (
                <div
                  className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-800 space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                      Mẫu câu ngữ cảnh:
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(currentCard.exampleSentence!, 0.9)}
                      className="text-sky-400 hover:text-sky-300 p-1 cursor-pointer flex items-center gap-1 text-[10px] font-mono transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Đọc câu</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-200 font-sans">
                    "{currentCard.exampleSentence}"
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-xs text-neutral-400 font-sans italic">
                      ➔ {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}

              {/* Word Family Matrix */}
              {currentCard?.wordFamilyDetails && (
                <div
                  className="pt-2 border-t border-zinc-850"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>Họ từ vựng (Word Family):</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                    {currentCard.wordFamilyDetails.noun && (
                      <div className="p-1.5 rounded-md bg-zinc-850/70 border border-zinc-800">
                        <span className="text-[9px] text-sky-400 block uppercase font-bold">N: Danh từ</span>
                        <span className="text-neutral-200 font-bold truncate block">{currentCard.wordFamilyDetails.noun}</span>
                        {currentCard.wordFamilyDetails.nounMeaning && (
                          <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {currentCard.wordFamilyDetails.nounMeaning}</span>
                        )}
                      </div>
                    )}
                    {currentCard.wordFamilyDetails.verb && (
                      <div className="p-1.5 rounded-md bg-zinc-850/70 border border-zinc-800">
                        <span className="text-[9px] text-emerald-400 block uppercase font-bold">V: Động từ</span>
                        <span className="text-neutral-200 font-bold truncate block">{currentCard.wordFamilyDetails.verb}</span>
                        {currentCard.wordFamilyDetails.verbMeaning && (
                          <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {currentCard.wordFamilyDetails.verbMeaning}</span>
                        )}
                      </div>
                    )}
                    {currentCard.wordFamilyDetails.adjective && (
                      <div className="p-1.5 rounded-md bg-zinc-850/70 border border-zinc-800">
                        <span className="text-[9px] text-amber-400 block uppercase font-bold">Adj: Tính từ</span>
                        <span className="text-neutral-200 font-bold truncate block">{currentCard.wordFamilyDetails.adjective}</span>
                        {currentCard.wordFamilyDetails.adjectiveMeaning && (
                          <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {currentCard.wordFamilyDetails.adjectiveMeaning}</span>
                        )}
                      </div>
                    )}
                    {currentCard.wordFamilyDetails.adverb && (
                      <div className="p-1.5 rounded-md bg-zinc-850/70 border border-zinc-800">
                        <span className="text-[9px] text-purple-400 block uppercase font-bold">Adv: Trạng từ</span>
                        <span className="text-neutral-200 font-bold truncate block">{currentCard.wordFamilyDetails.adverb}</span>
                        {currentCard.wordFamilyDetails.adverbMeaning && (
                          <span className="text-[10px] text-zinc-400 font-sans italic block">↳ {currentCard.wordFamilyDetails.adverbMeaning}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Synonyms Matrix */}
              {currentCard?.synonyms && currentCard.synonyms.length > 0 && (
                <div
                  className="pt-2 border-t border-zinc-850"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Từ đồng nghĩa (Synonyms):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                    {currentCard.synonyms.map((syn, sIdx) => {
                      const sWord = typeof syn === 'string' ? syn : syn.word;
                      const sMeaning = typeof syn === 'string' ? undefined : syn.meaning;
                      return (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-zinc-850 border border-emerald-900/50 text-emerald-300">
                          <strong>{sWord}</strong>
                          {sMeaning && <span className="text-zinc-400 font-sans ml-1 text-[10px]">({sMeaning})</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Leitner Rating Buttons */}
            <div
              className="pt-3 border-t border-zinc-850"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-mono text-neutral-400 block mb-2 text-center uppercase tracking-wider">
                Đánh giá mức độ nhớ (Bấm phím 1 - 4):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleRate('again')}
                  className="px-2.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>[1] Chưa nhớ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('hard')}
                  className="px-2.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>[2] Hơi khó</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('good')}
                  className="px-2.5 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
                >
                  <Check className="w-3.5 h-3.5 text-sky-400" />
                  <span>[3] Đã nhớ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('easy')}
                  className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>[4] Thuộc lòng ⭐</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-xs font-mono backdrop-blur-sm">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="px-4 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-200 border border-zinc-750 flex items-center gap-1.5 cursor-pointer transition-all duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước (←)</span>
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="px-4 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-sky-400 border border-zinc-750 font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-150"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Xem mặt trước' : 'Lật xem nghĩa (Space)'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold border border-sky-400/80 flex items-center gap-1.5 cursor-pointer transition-all duration-150 shadow-sm"
        >
          <span>{currentIndex === deck.length - 1 ? 'Hoàn thành' : 'Thẻ sau (→)'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pronunciation Coach Modal */}
      {coachTarget && (
        <PronunciationCoachModal
          isOpen={isCoachOpen}
          onClose={() => setIsCoachOpen(false)}
          target={coachTarget}
        />
      )}
    </div>
  );
};
