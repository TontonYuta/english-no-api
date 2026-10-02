import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  Layers,
  Mic,
  Brain,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  Check,
  Shuffle,
  RefreshCw,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  AppSettings,
  CEFRLevel,
  DialogueDifficulty,
  FlashcardItem,
  LearnedWord,
  TargetWordItem,
  TranslationDirection,
} from '../../types';
import {
  getLearnedWords,
  recordWordReview,
  toggleWordMastery,
} from '../../utils/learningMemory';
import {
  playAudioPronunciation,
  stopAudioPronunciation,
  evaluatePronunciationLocally,
  PronunciationScoreResult,
} from '../../utils/speechUtils';
import { generateVocabTestQuestions, VocabTestQuestion } from '../../utils/quizUtils';

interface MobileRemoteViewProps {
  settings: AppSettings;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  streak: number;
  onSetUserLevel: (level: 'A1' | 'A2' | 'B1' | 'B2') => void;
  onSwitchToFullApp: () => void;
  passage?: string;
  passageTitle?: string;
  passageTopic?: string;
  passageDifficulty?: string;
  targetWords?: TargetWordItem[];
  translationDirection?: TranslationDirection;
  onGeneratePassage?: (level?: string, topic?: string, customTopic?: string, direction?: TranslationDirection) => void;
  isGeneratingPassage?: boolean;
}

type MobileTab = 'reading' | 'flashcard' | 'speech' | 'quiz';

const STARTER_WORDS: Record<'A1' | 'A2' | 'B1' | 'B2', FlashcardItem[]> = {
  A1: [
    {
      term: 'Schedule',
      ipa: '/ˈskedʒ.uːl/',
      vietnamesePhonetic: 'xke-giun',
      partOfSpeech: 'noun / verb',
      vietnameseMeaning: 'lịch trình, thời gian biểu',
      exampleSentence: 'Let us check the daily schedule.',
      exampleTranslation: 'Hãy cùng kiểm tra lịch trình hàng ngày.',
      mastered: false,
    },
    {
      term: 'Welcome',
      ipa: '/ˈwel.kəm/',
      vietnamesePhonetic: 'oét-cầm',
      partOfSpeech: 'verb / interjection',
      vietnameseMeaning: 'chào đón, hoan nghênh',
      exampleSentence: 'Welcome to our modern office!',
      exampleTranslation: 'Chào mừng bạn đến với văn phòng hiện đại của chúng tôi!',
      mastered: false,
    },
    {
      term: 'Confirm',
      ipa: '/kənˈfɜːrm/',
      vietnamesePhonetic: 'cơn-phơm',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'xác nhận, khẳng định',
      exampleSentence: 'Please confirm your appointment time.',
      exampleTranslation: 'Vui lòng xác nhận thời gian cuộc hẹn của bạn.',
      mastered: false,
    },
    {
      term: 'Colleague',
      ipa: '/ˈkɑː.liːɡ/',
      vietnamesePhonetic: 'co-ly-g',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'đồng nghiệp',
      exampleSentence: 'She is an experienced colleague.',
      exampleTranslation: 'Cô ấy là một đồng nghiệp giàu kinh nghiệm.',
      mastered: false,
    },
  ],
  A2: [
    {
      term: 'Collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      vietnamesePhonetic: 'cơ-la-bơ-rây-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'hợp tác, phối hợp làm việc',
      exampleSentence: 'Both teams collaborate on the project.',
      exampleTranslation: 'Cả hai nhóm hợp tác thực hiện dự án.',
      mastered: false,
    },
    {
      term: 'Deadline',
      ipa: '/ˈded.laɪn/',
      vietnamesePhonetic: 'đét-lai-n',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'hạn chót, thời hạn hoàn thành',
      exampleSentence: 'We must meet the strict deadline.',
      exampleTranslation: 'Chúng ta phải kịp hạn chót nghiêm ngặt.',
      mastered: false,
    },
  ],
  B1: [
    {
      term: 'Implement',
      ipa: '/ˈɪm.plə.ment/',
      vietnamesePhonetic: 'im-plơ-mừn-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'triển khai, thi hành',
      exampleSentence: 'The firm will implement the new policy next month.',
      exampleTranslation: 'Công ty sẽ triển khai chính sách mới vào tháng sau.',
      mastered: false,
    },
    {
      term: 'Prioritize',
      ipa: '/praɪˈɔːr.ə.taɪz/',
      vietnamesePhonetic: 'prai-o-rơ-tai-z',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'ưu tiên, đặt lên hàng đầu',
      exampleSentence: 'We need to prioritize customer satisfaction.',
      exampleTranslation: 'Chúng ta cần ưu tiên sự hài lòng của khách hàng.',
      mastered: false,
    },
  ],
  B2: [
    {
      term: 'Streamline',
      ipa: '/ˈstriːm.laɪn/',
      vietnamesePhonetic: 'x-tri-m-lai-n',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'tinh gọn hóa, tối ưu hóa quy trình',
      exampleSentence: 'The new software streamlines financial reporting.',
      exampleTranslation: 'Phần mềm mới tinh gọn hóa quy trình báo cáo tài chính.',
      mastered: false,
    },
    {
      term: 'Comprehensive',
      ipa: '/ˌkɑːm.prəˈhen.sɪv/',
      vietnamesePhonetic: 'com-prơ-hen-síp',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'toàn diện, bao quát mọi mặt',
      exampleSentence: 'The committee conducted a comprehensive review.',
      exampleTranslation: 'Hội đồng đã tiến hành một cuộc đánh giá toàn diện.',
      mastered: false,
    },
  ],
};

export const MobileRemoteView: React.FC<MobileRemoteViewProps> = ({
  settings,
  userLevel,
  streak,
  onSetUserLevel,
  onSwitchToFullApp,
  passage = '',
  passageTitle = '',
  passageTopic = 'Công Nghệ & Đời Sống',
  passageDifficulty = 'B1',
  targetWords = [],
  translationDirection = 'en_vi',
  onGeneratePassage,
  isGeneratingPassage = false,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('reading');
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>(() => getLearnedWords());

  // Reload memory bank on tab switch
  useEffect(() => {
    setLearnedWords(getLearnedWords());
  }, [activeTab]);

  // Audio player state for reading passage
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0>(1.0);

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      stopAudioPronunciation();
      setIsPlayingAudio(false);
    } else {
      if (!passage.trim()) return;
      setIsPlayingAudio(true);
      playAudioPronunciation(passage, {
        rate: playbackSpeed,
        voice: settings.speechVoice,
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleStopAudio = () => {
    stopAudioPronunciation();
    setIsPlayingAudio(false);
  };

  // Stop audio when unmounting
  useEffect(() => {
    return () => {
      stopAudioPronunciation();
    };
  }, []);

  // Flashcard Deck State
  const flashcardItems: FlashcardItem[] = useMemo(() => {
    if (targetWords && targetWords.length > 0) {
      return targetWords.map((tw) => ({
        term: tw.word,
        ipa: tw.ipa || '',
        partOfSpeech: tw.partOfSpeech || 'noun',
        vietnameseMeaning: tw.meaningVi || '',
        exampleSentence: tw.contextSentence || '',
        exampleTranslation: '',
        mastered: false,
      }));
    }
    if (learnedWords && learnedWords.length > 0) {
      return learnedWords.map((lw) => ({
        term: lw.term,
        ipa: lw.ipa || '',
        vietnamesePhonetic: lw.vietnamesePhonetic || '',
        partOfSpeech: lw.partOfSpeech || 'noun',
        vietnameseMeaning: lw.vietnameseMeaning || '',
        exampleSentence: lw.exampleSentence || '',
        exampleTranslation: lw.exampleTranslation || '',
        mastered: lw.mastered || false,
      }));
    }
    return STARTER_WORDS[userLevel] || STARTER_WORDS.A1;
  }, [targetWords, learnedWords, userLevel]);

  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const currentCard = flashcardItems[fcIndex] || flashcardItems[0];

  const handleNextCard = () => {
    setFcFlipped(false);
    setFcIndex((prev) => (prev + 1) % flashcardItems.length);
  };

  const handlePrevCard = () => {
    setFcFlipped(false);
    setFcIndex((prev) => (prev - 1 + flashcardItems.length) % flashcardItems.length);
  };

  const handleCardRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (currentCard) {
      const isMastered = rating === 'easy' || rating === 'good';
      try {
        recordWordReview(currentCard.term, isMastered);
      } catch {}
    }
    handleNextCard();
  };

  // Speech Pronunciation Coach State
  const speechTargetWord = useMemo(() => {
    if (targetWords && targetWords.length > 0) {
      return targetWords[0]?.word || 'Schedule';
    }
    return currentCard?.term || 'Schedule';
  }, [targetWords, currentCard]);

  const [selectedSpeechWord, setSelectedSpeechWord] = useState<string>(speechTargetWord);
  useEffect(() => {
    setSelectedSpeechWord(speechTargetWord);
  }, [speechTargetWord]);

  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechEvaluation, setSpeechEvaluation] = useState<PronunciationScoreResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleStartSpeechRecord = () => {
    setSpeechError(null);
    setSpeechEvaluation(null);
    setSpeechTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Trình duyệt di động này chưa hỗ trợ nhận dạng giọng nói Web Speech. Bạn có thể nghe phát âm chuẩn bằng nút loa!'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSpeechTranscript(text);
        const evalResult = evaluatePronunciationLocally(selectedSpeechWord, text, userLevel);
        setSpeechEvaluation(evalResult);
        setIsRecording(false);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        setSpeechError(
          e.error === 'not-allowed'
            ? 'Quyền truy cập micro bị từ chối. Vui lòng cho phép quyền micro trên trình duyệt.'
            : `Lỗi nhận diện âm thanh (${e.error}). Hãy thử lại nơi yên tĩnh.`
        );
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setSpeechError('Không thể khởi động micro: ' + err.message);
    }
  };

  const handleStopSpeechRecord = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Mobile Vocab Quiz State
  const quizQuestions: VocabTestQuestion[] = useMemo(() => {
    const wordsPool: LearnedWord[] =
      learnedWords.length > 0
        ? learnedWords
        : (STARTER_WORDS[userLevel] as any[]).map((w, idx) => ({
            id: `starter_${idx}`,
            term: w.term,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            vietnameseMeaning: w.vietnameseMeaning,
            level: userLevel,
            reviewCount: 0,
            mastered: false,
            createdAt: Date.now(),
            lastReviewedAt: Date.now(),
          }));

    return generateVocabTestQuestions(wordsPool, Math.min(5, wordsPool.length), 'all');
  }, [learnedWords, userLevel, activeTab]);

  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<Record<number, number>>({});
  const [quizAnswered, setQuizAnswered] = useState<Record<number, boolean>>({});
  const currentQ = quizQuestions[quizIdx];

  const handleSelectQuizOption = (optIdx: number) => {
    if (quizAnswered[quizIdx]) return;
    const isCorrect = optIdx === currentQ.correctIndex;
    setQuizSelected((prev) => ({ ...prev, [quizIdx]: optIdx }));
    setQuizAnswered((prev) => ({ ...prev, [quizIdx]: true }));
    try {
      recordWordReview(currentQ.wordId || currentQ.term, isCorrect);
    } catch {}
  };

  const handleResetQuiz = () => {
    setQuizIdx(0);
    setQuizSelected({});
    setQuizAnswered({});
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none antialiased">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white">PlayEng Remote</h1>
              <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/80">
                MOBILE
              </span>
            </div>
          </div>
        </div>

        {/* Level Switcher & Streak */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-400 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Level Toggle Button */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onSetUserLevel(lvl)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  userLevel === lvl
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Switch to Desktop App Button */}
          <button
            type="button"
            onClick={onSwitchToFullApp}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Mở giao diện đầy đủ (Desktop Studio)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 pb-24 px-4 pt-3 overflow-y-auto max-w-md mx-auto w-full">
        {/* ========================================================= */}
        {/* TAB 1: BÀI ĐỌC (Reading Passage & Target Vocabulary) */}
        {/* ========================================================= */}
        {activeTab === 'reading' && (
          <div className="space-y-4 animate-fade-in">
            {/* Lesson Title & Topic Badge */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
                  {passageTopic || 'Công Nghệ & AI'}
                </span>
                <span className="text-sky-400 font-bold">
                  {passageDifficulty || userLevel} • {translationDirection === 'vi_en' ? 'Dịch Việt ➔ Anh' : 'Dịch Anh ➔ Việt'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {passageTitle || 'A Peaceful Morning in My Neighborhood'}
              </h2>

              {/* Audio Playback Controls */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayAudio}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      isPlayingAudio
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 animate-pulse'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Tạm Dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Nghe Audio TTS</span>
                      </>
                    )}
                  </button>

                  {isPlayingAudio && (
                    <button
                      type="button"
                      onClick={handleStopAudio}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                      title="Dừng phát âm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPlaybackSpeed((s) => (s === 1.0 ? 0.8 : 1.0))}
                  className="px-2 py-1 rounded-lg bg-zinc-850 border border-zinc-750 text-[11px] font-mono text-zinc-300 cursor-pointer"
                >
                  Tốc độ: {playbackSpeed}x
                </button>
              </div>
            </div>

            {/* Passage Text */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Nội dung bài học ({passage.trim().split(/\s+/).length} từ):
              </span>

              {passage.trim() ? (
                <div className="text-sm leading-relaxed text-zinc-200 font-serif space-y-3">
                  {passage.split(/\n\s*\n/).map((p, idx) => (
                    <p key={idx} className="leading-7">
                      {p}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-zinc-400">Chưa có bài đọc nào được tải.</p>
                  {onGeneratePassage && (
                    <button
                      type="button"
                      disabled={isGeneratingPassage}
                      onClick={() => onGeneratePassage(userLevel)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      {isGeneratingPassage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tạo bài...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tạo bài học mới</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Target Vocabulary List */}
            {targetWords && targetWords.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Từ Vựng Trọng Tâm ({targetWords.length} từ)</span>
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {targetWords.map((tw, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-serif">{tw.word}</span>
                          {tw.ipa && (
                            <span className="text-[11px] text-zinc-400 font-mono">[{tw.ipa}]</span>
                          )}
                        </div>
                        <span className="text-xs text-emerald-400 font-sans block">
                          {tw.meaningVi}
                        </span>
                        {tw.contextSentence && (
                          <p className="text-[11px] text-zinc-400 italic pt-0.5">
                            "{tw.contextSentence}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => playAudioPronunciation(tw.word)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-400 shrink-0 cursor-pointer transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick action button to generate next lesson */}
            {onGeneratePassage && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGeneratingPassage}
                  onClick={() => onGeneratePassage(userLevel)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                >
                  {isGeneratingPassage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang sinh bài đọc mới...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>🔄 Đổi Chủ Đề / Sinh Bài Đọc Mới</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FLASHCARD (Smart Leitner Deck) */}
        {/* ========================================================= */}
        {activeTab === 'flashcard' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">
                Thẻ {fcIndex + 1} / {flashcardItems.length}
              </span>
              <span className="text-amber-400 font-bold">Leitner Flashcard</span>
            </div>

            {/* Flashcard Touch Card */}
            <div
              onClick={() => setFcFlipped(!fcFlipped)}
              className="min-h-[260px] p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-zinc-750 flex flex-col justify-between items-center text-center cursor-pointer shadow-xl relative transition-all active:scale-[0.99]"
            >
              <div className="w-full flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
                <span>{currentCard?.partOfSpeech || 'vocabulary'}</span>
                <span>{fcFlipped ? 'Mặt sau (Nghĩa)' : 'Mặt trước (Từ)'}</span>
              </div>

              {!fcFlipped ? (
                /* Front Side: Term & IPA */
                <div className="my-auto space-y-2">
                  <h3 className="text-3xl font-black text-white font-serif tracking-wide">
                    {currentCard?.term}
                  </h3>
                  {currentCard?.ipa && (
                    <span className="text-sm text-sky-400 font-mono block">
                      [{currentCard.ipa}]
                    </span>
                  )}
                  {currentCard?.vietnamesePhonetic && (
                    <span className="text-xs text-zinc-400 font-sans block">
                      Phát âm: <strong className="text-zinc-200">{currentCard.vietnamesePhonetic}</strong>
                    </span>
                  )}
                  <p className="text-[11px] text-zinc-500 font-mono pt-3">
                    (Chạm vào thẻ để xem nghĩa tiếng Việt)
                  </p>
                </div>
              ) : (
                /* Back Side: Meaning & Examples */
                <div className="my-auto space-y-3">
                  <h4 className="text-xl font-bold text-emerald-400 font-sans">
                    {currentCard?.vietnameseMeaning}
                  </h4>
                  {currentCard?.exampleSentence && (
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-serif leading-relaxed text-left">
                      <p className="italic">"{currentCard.exampleSentence}"</p>
                      {currentCard.exampleTranslation && (
                        <p className="text-[11px] text-zinc-400 font-sans pt-1">
                          {currentCard.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom sound prompt */}
              <div className="w-full flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard?.term) playAudioPronunciation(currentCard.term);
                  }}
                  className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sky-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe đọc</span>
                </button>
              </div>
            </div>

            {/* Leitner SRS Action Bar */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block text-center">
                Mức độ ghi nhớ của bạn:
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleCardRating('again')}
                  className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-xs font-bold text-center hover:bg-rose-900/60 cursor-pointer"
                >
                  <span className="block text-[10px] text-rose-400">1</span>
                  Học Lại
                </button>
                <button
                  type="button"
                  onClick={() => handleCardRating('hard')}
                  className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 font-mono text-xs font-bold text-center hover:bg-amber-900/60 cursor-pointer"
                >
                  <span className="block text-[10px] text-amber-400">2</span>
                  Khó
                </button>
                <button
                  type="button"
                  onClick={() => handleCardRating('good')}
                  className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-300 font-mono text-xs font-bold text-center hover:bg-sky-900/60 cursor-pointer"
                >
                  <span className="block text-[10px] text-sky-400">3</span>
                  Tốt
                </button>
                <button
                  type="button"
                  onClick={() => handleCardRating('easy')}
                  className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-mono text-xs font-bold text-center hover:bg-emerald-900/60 cursor-pointer"
                >
                  <span className="block text-[10px] text-emerald-400">4</span>
                  Dễ
                </button>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePrevCard}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 cursor-pointer"
              >
                ← Thẻ trước
              </button>
              <button
                type="button"
                onClick={handleNextCard}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 cursor-pointer"
              >
                Thẻ tiếp theo →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PHÁT ÂM (Pronunciation Speech Coach) */}
        {/* ========================================================= */}
        {activeTab === 'speech' && (
          <div className="space-y-4 animate-fade-in">
            {/* Word selector chip list */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                Chọn từ cần luyện phát âm:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {flashcardItems.slice(0, 8).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedSpeechWord(item.term);
                      setSpeechEvaluation(null);
                      setSpeechError(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif shrink-0 cursor-pointer transition-all ${
                      selectedSpeechWord.toLowerCase() === item.term.toLowerCase()
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.term}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Word Practice Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
                Mục tiêu phát âm:
              </span>

              <h3 className="text-3xl font-black text-white font-serif tracking-wide">
                {selectedSpeechWord}
              </h3>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => playAudioPronunciation(selectedSpeechWord)}
                  className="px-3 py-1.5 rounded-full bg-sky-950/60 border border-sky-600/50 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-sky-900"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe mẫu chuẩn</span>
                </button>
              </div>

              {/* Big Microphone button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={isRecording ? handleStopSpeechRecord : handleStartSpeechRecord}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all cursor-pointer shadow-xl ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse scale-105 shadow-rose-600/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20 hover:scale-105'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>

                <p className="text-xs font-mono mt-2 text-zinc-400">
                  {isRecording ? 'Đang lắng nghe... Hãy nói ngay!' : 'Chạm vào Micro để nói'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {speechError && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 font-sans leading-relaxed">
                {speechError}
              </div>
            )}

            {/* Evaluation Result */}
            {speechEvaluation && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                    Kết quả chấm điểm:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                      speechEvaluation.accuracyScore >= 80
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : speechEvaluation.accuracyScore >= 60
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {speechEvaluation.accuracyScore}% CHÍNH XÁC
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-xl text-xs space-y-1 font-mono">
                  <div className="text-zinc-400">
                    Bạn đã nói: <span className="text-white font-bold">"{speechTranscript}"</span>
                  </div>
                  <div className="text-zinc-400">
                    Độ trôi chảy: <span className="text-sky-300">{speechEvaluation.fluencyBand}</span>
                  </div>
                </div>

                {speechEvaluation.feedback && (
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    💡 {speechEvaluation.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TRẮC NGHIỆM (Active Recall Vocab Quiz) */}
        {/* ========================================================= */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            {quizQuestions.length > 0 && currentQ ? (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">
                    Câu {quizIdx + 1} / {quizQuestions.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Làm lại bộ đề
                  </button>
                </div>

                {/* Question Prompt */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center space-y-2">
                  <span className="text-2xl font-black text-white font-serif tracking-wide block">
                    {currentQ.term}
                  </span>
                  {currentQ.ipa && (
                    <span className="text-xs text-zinc-400 font-mono block">[{currentQ.ipa}]</span>
                  )}
                  <p className="text-xs text-sky-300 pt-1 border-t border-zinc-800/80 font-medium">
                    {currentQ.prompt}
                  </p>
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isAnswered = quizAnswered[quizIdx];
                    const selectedOpt = quizSelected[quizIdx];

                    let btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850';
                    if (isAnswered) {
                      if (optIdx === currentQ.correctIndex) {
                        btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold';
                      } else if (optIdx === selectedOpt) {
                        btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold';
                      } else {
                        btnStyle = 'bg-zinc-900/40 border-zinc-850 text-zinc-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectQuizOption(optIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && optIdx === currentQ.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isAnswered && optIdx === selectedOpt && optIdx !== currentQ.correctIndex && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {quizAnswered[quizIdx] && (
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <span className="font-bold text-emerald-400 block font-mono">Giải thích:</span>
                    <p>{currentQ.explanation}</p>
                    {currentQ.exampleSentence && (
                      <p className="italic text-[11px] text-zinc-400 pt-1">
                        "{currentQ.exampleSentence}"
                      </p>
                    )}
                  </div>
                )}

                {/* Next button */}
                {quizAnswered[quizIdx] && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizIdx((prev) => (prev + 1) % quizQuestions.length)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>
                        {quizIdx < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Bắt đầu vòng mới'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-zinc-400">Kho từ vựng chưa có đủ câu hỏi.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation Bar (Thumb-friendly & Safe Area) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 px-2 py-2 flex items-center justify-around shadow-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setActiveTab('reading')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reading'
              ? 'text-sky-400 font-bold bg-sky-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-mono">Bài Đọc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcard')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'flashcard'
              ? 'text-amber-400 font-bold bg-amber-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-mono">Flashcard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('speech')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'speech'
              ? 'text-emerald-400 font-bold bg-emerald-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-mono">Phát Âm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'text-purple-400 font-bold bg-purple-950/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px] font-mono">Trắc Nghiệm</span>
        </button>
      </nav>
    </div>
  );
};
