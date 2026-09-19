import React, { useState, useEffect, useMemo } from 'react';
import {
  TaskType,
  ChatbotProvider,
  Language,
  PipelineStep,
  TaskResult,
  GrammarFocus,
  MainTabType,
} from '../types';
import { ToeicLessonResultView } from './results/ToeicLessonResultView';
import { GrammarLessonResultView } from './results/GrammarLessonResultView';
import { ReflexChallengeResultView } from './results/ReflexChallengeResultView';
import { VocabTestView } from './results/VocabTestView';
import { GrammarTestView } from './results/GrammarTestView';
import { ReadingTestView } from './results/ReadingTestView';
import { ListeningTestView } from './results/ListeningTestView';
import { ReadingLessonResultView } from './results/ReadingLessonResultView';
import { ListeningLessonResultView } from './results/ListeningLessonResultView';
import { MemoryBankModal } from './MemoryBankModal';
import { FlashcardDeckView } from './flashcard/FlashcardDeckView';
import { playAudioPronunciation } from '../utils/speechUtils';
import {
  Flame,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  Award,
  BookOpen,
  HelpCircle,
  Play,
  Check,
  RotateCcw,
  Target,
  Briefcase,
  Layers,
  Brain,
  Bookmark,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Settings,
  Compass,
  ArrowRight,
  Headphones,
  FileText,
} from 'lucide-react';
import {
  getLearnedWords,
  getLearnedGrammar,
  getLearnedReadings,
  getLearnedListenings,
  getExcludeWordsList,
  getExcludeGrammarList,
  getTargetItemsForReflex,
  addLearnedWords,
  addLearnedGrammar,
  addLearnedReading,
  addLearnedListening,
} from '../utils/learningMemory';

interface DailyHabitViewProps {
  provider: ChatbotProvider;
  isAutomating: boolean;
  steps: PipelineStep[];
  currentResult: TaskResult | null;
  onRunDailyTask: (taskType: TaskType, inputData: Record<string, unknown>) => void;
  lang: Language;
  onOpenTerminal: () => void;
  onOpenSettings?: () => void;
  activeTab?: MainTabType;
  onSwitchTab?: (tab: MainTabType) => void;
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  setUserLevel?: (lvl: 'A1' | 'A2' | 'B1' | 'B2') => void;
  streak?: number;
  isCompletedToday?: boolean;
  onMarkCompleted?: () => void;
  focusMode?: boolean;
}

export interface TopicOption {
  id: string;
  label: string;
  enLabel: string;
  icon: string;
}

const VOCAB_TOPICS: TopicOption[] = [
  { id: 'daily_talk', label: '☕ Đời Sống Hàng Ngày & Mua Sắm', enLabel: '☕ Daily Life & Shopping', icon: '☕' },
  { id: 'dining', label: '🍽️ Nhà Hàng, Ẩm Thực & Gọi Món', enLabel: '🍽️ Dining & Food', icon: '🍽️' },
  { id: 'travel', label: '✈️ Du Lịch, Sân Bay & Khách Sạn', enLabel: '✈️ Travel & Hotel', icon: '✈️' },
  { id: 'tech', label: '💻 Công Nghệ, Ứng Dụng & Thiết Bị', enLabel: '💻 Tech & Digital Life', icon: '💻' },
  { id: 'entertainment', label: '🎬 Giải Trí, Phim Ảnh & Sở Thích', enLabel: '🎬 Movies & Hobbies', icon: '🎬' },
  { id: 'health', label: '🏃 Sức Khỏe, Thể Thao & Đời Sống', enLabel: '🏃 Health & Sports', icon: '🏃' },
  { id: 'workplace', label: '💼 Công Sở, Đồng Nghiệp & Email', enLabel: '💼 Workplace & Email', icon: '💼' },
  { id: 'surprise', label: '🎲 Đa Dạng Tự Do / Ngẫu Nhiên', enLabel: '🎲 Smart Surprise', icon: '🎲' },
];

export const VOCAB_STORY_TOPICS: TopicOption[] = [
  { id: 'inspiration', label: '🌟 Câu Chuyện Động Lực & Cảm Hứng Sống', enLabel: '🌟 Inspiring Stories', icon: '🌟' },
  { id: 'anecdote', label: '☕ Chuyện Đời Thường & Khoảnh Khắc Hài Hước', enLabel: '☕ Daily Anecdotes', icon: '☕' },
  { id: 'travel_tales', label: '✈️ Du Ký, Khám Phá Thế Giới & Ẩm Thực', enLabel: '✈️ Travel & Food', icon: '✈️' },
  { id: 'tech_future', label: '💡 Khoa Học Kỳ Thú & Đổi Mới Công Nghệ', enLabel: '💡 Science & Innovation', icon: '💡' },
  { id: 'mindfulness', label: '🧘 Tâm Lý Học, Hạnh Phúc & Cân Bằng', enLabel: '🧘 Mindfulness & Habits', icon: '🧘' },
  { id: 'nature_wonders', label: '🐾 Thiên Nhiên, Rừng Xanh & Động Vật', enLabel: '🐾 Nature & Wildlife', icon: '🐾' },
  { id: 'culture_discovery', label: '🎨 Nghệ Thuật, Âm Nhạc & Văn Hóa', enLabel: '🎨 Arts & Culture', icon: '🎨' },
  { id: 'surprise_story', label: '🎲 Câu Chuyện Bất Ngờ Ngẫu Nhiên', enLabel: '🎲 Surprise Story', icon: '🎲' },
];

const READING_TOPICS: TopicOption[] = [
  { id: 'daily_life', label: '☕ Đời Sống, Thói Quen & Gia Đình (Daily Life)', enLabel: '☕ Daily Life & Habits', icon: '☕' },
  { id: 'travel_culture', label: '✈️ Du Lịch & Khám Phá Văn Hóa (Travel & Cultures)', enLabel: '✈️ Travel & Cultures', icon: '✈️' },
  { id: 'culinary', label: '🍽️ Ẩm Thực, Cà Phê & Công Thức Món (Food & Cafe)', enLabel: '🍽️ Food & Dining', icon: '🍽️' },
  { id: 'science_tech', label: '💻 Công Nghệ, AI & Khoa Học (Tech & Innovation)', enLabel: '💻 Tech & Innovation', icon: '💻' },
  { id: 'entertainment', label: '🎬 Điện Ảnh, Âm Nhạc & Nghệ Thuật (Arts & Cinema)', enLabel: '🎬 Arts & Cinema', icon: '🎬' },
  { id: 'health_wellness', label: '🏃 Thể Thao, Sức Khỏe & Thư Giãn (Health & Fitness)', enLabel: '🏃 Health & Wellness', icon: '🏃' },
  { id: 'workplace_pro', label: '💼 Công Sở, Dự Án & Thông Báo (Workplace & Notices)', enLabel: '💼 Workplace & Email', icon: '💼' },
  { id: 'free_random', label: '🎲 Đa Dạng Tự Do / Bất Kỳ Chủ Đề (Surprise Story)', enLabel: '🎲 Any Topic Surprise', icon: '🎲' },
];

const LISTENING_TOPICS: TopicOption[] = [
  { id: 'casual_chat', label: '☕ Trò Chuyện Bạn Bè & Cuối Tuần (Casual Friends Chat)', enLabel: '☕ Friends & Weekend', icon: '☕' },
  { id: 'travel_journey', label: '✈️ Chỉ Đường, Khách Sạn & Du Lịch (Travel Directions)', enLabel: '✈️ Travel & Sightseeing', icon: '✈️' },
  { id: 'ordering_food', label: '🍽️ Gọi Món Cà Phê & Nhà Hàng (Cafe & Dining Out)', enLabel: '🍽️ Cafe & Dining', icon: '🍽️' },
  { id: 'tech_lifestyle', label: '💻 Bàn Luận Công Nghệ & Sở Thích (Tech & Hobbies)', enLabel: '💻 Tech & Gadgets', icon: '💻' },
  { id: 'advice_dilemma', label: '💡 Tâm Sự & Lời Khuyên Đời Sống (Life Advice & Stories)', enLabel: '💡 Advice & Stories', icon: '💡' },
  { id: 'shopping_services', label: '🛍️ Mua Sắm & Dịch Vụ Khách Hàng (Shopping & Service)', enLabel: '🛍️ Shopping & Services', icon: '🛍️' },
  { id: 'workplace_meeting', label: '💼 Đồng Nghiệp & Họp Nhóm (Workplace & Teams)', enLabel: '💼 Workplace Dialogue', icon: '💼' },
  { id: 'listening_random', label: '🎲 Đa Dạng Tự Do / Ngẫu Nhiên (Surprise Dialogue)', enLabel: '🎲 Any Scenario / Surprise', icon: '🎲' },
];

export const DailyHabitView: React.FC<DailyHabitViewProps> = ({
  provider,
  isAutomating,
  steps,
  currentResult,
  onRunDailyTask,
  lang,
  onOpenTerminal,
  onOpenSettings,
  activeTab = 'today',
  onSwitchTab,
  userLevel: propUserLevel,
  setUserLevel: propSetUserLevel,
  streak: propStreak,
  isCompletedToday: propIsCompletedToday,
  onMarkCompleted: propOnMarkCompleted,
  focusMode = false,
}) => {
  // Streak state
  const [localStreak, setLocalStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('playeng_streak') || '1', 10);
  });
  const [localIsCompletedToday, setLocalIsCompletedToday] = useState<boolean>(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('playeng_last_completed') === today;
  });
  const streak = propStreak ?? localStreak;
  const isCompletedToday = propIsCompletedToday ?? localIsCompletedToday;

  // 4 Core Language Pillars: Vocab, Grammar, Reading, Listening
  const [dailyMode, setDailyMode] = useState<'vocab' | 'grammar' | 'reading' | 'listening'>('vocab');

  // Per-mode sub-tab: 'learn' (Học mới) vs 'test' (Kiểm tra đã học) vs 'flashcard' (Ôn tập Flashcard)
  const [subModeByPillar, setSubModeByPillar] = useState<Record<'vocab' | 'grammar' | 'reading' | 'listening', 'learn' | 'test' | 'flashcard'>>({
    vocab: 'learn',
    grammar: 'learn',
    reading: 'learn',
    listening: 'learn',
  });

  const currentSubMode = subModeByPillar[dailyMode] || 'learn';
  const setSubModeForCurrent = (tab: 'learn' | 'test' | 'flashcard') => {
    setSubModeByPillar((prev) => ({ ...prev, [dailyMode]: tab }));
  };

  // Progressive User Level State (Default to A1 for beginners, stored in localStorage and settings)
  const [localUserLevel, setLocalUserLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>(() => {
    return (localStorage.getItem('playeng_user_level') as 'A1' | 'A2' | 'B1' | 'B2') || 'A1';
  });
  const userLevel = propUserLevel || localUserLevel;

  const handleSetUserLevel = (lvl: 'A1' | 'A2' | 'B1' | 'B2') => {
    if (propSetUserLevel) {
      propSetUserLevel(lvl);
    } else {
      setLocalUserLevel(lvl);
      localStorage.setItem('playeng_user_level', lvl);
    }
  };

  // Sync activeTab to dailyMode
  useEffect(() => {
    if (activeTab === 'vocab') {
      setDailyMode('vocab');
    } else if (activeTab === 'grammar') {
      setDailyMode('grammar');
    } else if (activeTab === 'read_listen') {
      if (dailyMode !== 'reading' && dailyMode !== 'listening') {
        setDailyMode('reading');
      }
    }
  }, [activeTab]);

  // Memory Bank State & Modal
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryTick, setMemoryTick] = useState(0);
  const [memorySelectedTest, setMemorySelectedTest] = useState<'vocab' | 'grammar' | 'reading' | 'listening' | null>(null);

  const learnedWords = getLearnedWords();
  const learnedGrammar = getLearnedGrammar();
  const learnedReadings = getLearnedReadings();
  const learnedListenings = getLearnedListenings();

  const masteredWordsCount = learnedWords.filter((w) => w.mastered).length;
  const masteredGrammarCount = learnedGrammar.filter((g) => g.mastered).length;
  const masteredReadingsCount = learnedReadings.filter((r) => r.mastered).length;
  const masteredListeningsCount = learnedListenings.filter((l) => l.mastered).length;

  // Auto-persist new words, grammar, reading, and listening whenever a result is received
  useEffect(() => {
    if (currentResult && !isAutomating) {
      if (currentResult.type === 'toeic_lesson' && currentResult.data?.targetWords) {
        addLearnedWords(currentResult.data.targetWords);
        setMemoryTick((prev) => prev + 1);
      } else if (currentResult.type === 'grammar_lesson' && currentResult.data) {
        addLearnedGrammar(currentResult.data);
        setMemoryTick((prev) => prev + 1);
      } else if (currentResult.type === 'reading_lesson' && currentResult.data) {
        addLearnedReading({
          title: currentResult.data.title,
          passage: currentResult.data.passage,
          translationVi: currentResult.data.translationVi,
          level: currentResult.data.userLevel || userLevel,
          topic: currentResult.data.topic || 'Business & Daily',
          keyWords: (currentResult.data.keyVocabulary || []).map((k: any) => ({ term: k.term, meaning: k.meaning || k.meaningVi || k.term })),
          questions: currentResult.data.comprehensionQuiz ? [currentResult.data.comprehensionQuiz] : [],
        });
        if (currentResult.data.keyVocabulary && currentResult.data.keyVocabulary.length > 0) {
          addLearnedWords(
            currentResult.data.keyVocabulary.map((k: any) => ({
              term: k.term,
              ipa: k.ipa || '',
              partOfSpeech: 'vocab',
              vietnameseMeaning: k.meaning || k.meaningVi || k.term,
              exampleSentence: k.contextHint || k.contextSentence || '',
              level: currentResult.data.userLevel || userLevel,
            }))
          );
        }
        setMemoryTick((prev) => prev + 1);
      } else if (currentResult.type === 'listening_lesson' && currentResult.data) {
        addLearnedListening({
          title: currentResult.data.title,
          dialogue: currentResult.data.dialogue,
          level: currentResult.data.userLevel || userLevel,
          topic: currentResult.data.topic || 'Workplace & Life',
          questions: currentResult.data.listeningQuiz ? [{
            audioPrompt: currentResult.data.listeningQuiz.audioPrompt || currentResult.data.dialogue?.[0]?.text || '',
            question: currentResult.data.listeningQuiz.question,
            options: currentResult.data.listeningQuiz.options,
            correctIndex: currentResult.data.listeningQuiz.correctIndex,
            explanation: currentResult.data.listeningQuiz.explanation,
          }] : [],
        });
        setMemoryTick((prev) => prev + 1);
      }
    }
  }, [currentResult, isAutomating, userLevel]);

  // Topic & Grammar Focus States
  const [selectedVocabTopic, setSelectedVocabTopic] = useState<TopicOption>(VOCAB_TOPICS[0]);
  const [selectedStoryTopic, setSelectedStoryTopic] = useState<TopicOption>(VOCAB_STORY_TOPICS[0]);
  const [vocabLearningMethod, setVocabLearningMethod] = useState<'core' | 'reading'>('core');
  const [customVocabTopic, setCustomVocabTopic] = useState<string>('');
  const [customStoryTopic, setCustomStoryTopic] = useState<string>('');
  const [selectedReadingTopic, setSelectedReadingTopic] = useState<TopicOption>(READING_TOPICS[0]);
  const [selectedListeningTopic, setSelectedListeningTopic] = useState<TopicOption>(LISTENING_TOPICS[0]);
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('');
  const [customListeningTopic, setCustomListeningTopic] = useState<string>('');

  // Reading Level & Word Count Controls (Customizable by user)
  const [readingLevel, setReadingLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>(() => {
    try {
      const saved = localStorage.getItem('playeng_reading_level');
      if (saved && ['A1', 'A2', 'B1', 'B2', 'C1'].includes(saved)) {
        return saved as 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
      }
    } catch {}
    return (userLevel as 'A1' | 'A2' | 'B1' | 'B2') || 'B1';
  });

  const handleSetReadingLevel = (lvl: 'A1' | 'A2' | 'B1' | 'B2' | 'C1') => {
    setReadingLevel(lvl);
    try {
      localStorage.setItem('playeng_reading_level', lvl);
    } catch {}
  };

  type ReadingWordPreset = '150' | '250' | '400' | '600' | 'custom';
  const [readingWordPreset, setReadingWordPreset] = useState<ReadingWordPreset>(() => {
    try {
      const saved = localStorage.getItem('playeng_reading_word_preset');
      if (saved && ['150', '250', '400', '600', 'custom'].includes(saved)) {
        return saved as ReadingWordPreset;
      }
    } catch {}
    return '250';
  });

  const [customReadingWords, setCustomReadingWords] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('playeng_reading_custom_words');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 50 && val <= 1500) return val;
      }
    } catch {}
    return 300;
  });

  const handleSetReadingWordPreset = (preset: ReadingWordPreset) => {
    setReadingWordPreset(preset);
    try {
      localStorage.setItem('playeng_reading_word_preset', preset);
    } catch {}
  };

  const handleSetCustomReadingWords = (count: number) => {
    setCustomReadingWords(count);
    try {
      localStorage.setItem('playeng_reading_custom_words', count.toString());
    } catch {}
  };

  const effectiveReadingWordCount = useMemo(() => {
    if (readingWordPreset === 'custom') {
      return customReadingWords || 300;
    }
    return parseInt(readingWordPreset, 10) || 250;
  }, [readingWordPreset, customReadingWords]);
  const [selectedGrammarFocus, setSelectedGrammarFocus] = useState<GrammarFocus>(() => {
    try {
      const raw = localStorage.getItem('playeng_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.grammarFocus) return parsed.grammarFocus;
      }
    } catch {}
    return 'toeic_all';
  });

  // Speech helper
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const speak = (text: string, rate: number = 1.0) => {
    setSpeakingText(text);
    playAudioPronunciation(text, {
      rate,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  // Settings reader
  const getSettings = () => {
    try {
      const raw = localStorage.getItem('playeng_settings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      dailyVocabCount: 3,
      topicPreference: 'all',
      themeStyle: 'monochrome',
      grammarFocus: 'toeic_all',
    };
  };

  // Daily 4-Step Journey Completion state
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const today = new Date().toDateString();
      const lastDay = localStorage.getItem('playeng_last_progress_date');
      if (lastDay === today) {
        const saved = localStorage.getItem('playeng_completed_steps');
        return saved ? JSON.parse(saved) : [];
      }
    } catch {}
    return [];
  });

  // Mark step completed
  const markStepCompleted = (stepKey: string) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepKey)) return prev;
      const next = [...prev, stepKey];
      localStorage.setItem('playeng_completed_steps', JSON.stringify(next));
      localStorage.setItem('playeng_last_progress_date', new Date().toDateString());
      return next;
    });
  };

  // 1. Pillar 1 Generator: Vocab (Supports both Core Words and Inspiring Stories)
  const handleGenerateVocab = (
    overrideCount?: number,
    overrideTopic?: string,
    overrideMethod?: 'core' | 'reading'
  ) => {
    const method = overrideMethod || vocabLearningMethod;
    const settings = getSettings();
    const count = overrideCount || settings.dailyVocabCount || 3;
    let topicStr = '';

    if (method === 'reading') {
      topicStr = overrideTopic || customStoryTopic.trim() || selectedStoryTopic.label;
      if (selectedStoryTopic.id === 'surprise_story' && !customStoryTopic.trim() && !overrideTopic) {
        const randomStoryPool = [
          'Một Thói Quen Nhỏ Buổi Sáng Thay Đổi Cuộc Đời (Morning Habit That Transformed Life)',
          'Tiệm Bánh Cổ Điển Trong Con Hẻm Nhỏ Paris (Cozy Bakery in Paris)',
          'Hành Trình Chinh Phục Ngọn Núi Đầu Tiên (First Mountain Trekking Adventure)',
          'Người Bạn Bốn Chân Kỳ Diệu Giữa Phố Thị (A Rescued Dog and Urban Kindness)',
          'Bước Ra Khỏi Vùng An Toàn Đam Mê Sáng Tạo (Stepping Beyond Comfort Zone)',
          'Bí Ẩn Tách Cà Phê Lúc Bình Minh Bên Bờ Biển (Sunrise Coffee by the Ocean)',
        ];
        topicStr = randomStoryPool[Math.floor(Math.random() * randomStoryPool.length)];
      }
    } else {
      topicStr = overrideTopic || customVocabTopic.trim() || selectedVocabTopic.label;
      if (selectedVocabTopic.id === 'surprise' && !customVocabTopic.trim() && !overrideTopic) {
        const randomVocabPool = [
          'Thiên Nhiên, Động Vật Hoang Dã & Rừng Xanh (Nature & Wildlife)',
          'Ẩm Thực Đường Phố & Gia Vị Đặc Trưng (Street Food & Spices)',
          'Âm Nhạc, Nhạc Cụ & Lễ Hội Âm Nhạc (Music & Festivals)',
          'Khám Phá Vũ Trụ & Các Ngôi Sao (Space & Galaxies)',
          'Tâm Lý Học, Cảm Xúc & Tư Duy Tích Cực (Emotions & Positive Mindset)',
          'Du Lịch Bụi & Văn Hóa Bản Địa (Backpacking & Local Cultures)',
        ];
        topicStr = randomVocabPool[Math.floor(Math.random() * randomVocabPool.length)];
      }
    }

    const excludeTerms = getExcludeWordsList();
    markStepCompleted('vocab');
    onRunDailyTask('toeic_lesson', {
      topic: `${topicStr} (Level ${userLevel})`,
      userLevel,
      excludeTerms,
      wordCount: count,
      vocabMethod: method,
      situationType: method === 'reading' ? 'story' : 'email',
      modeFocus: method === 'reading' ? 'reading' : 'vocab',
    });
  };

  // 2. Pillar 2 Generator: Grammar
  const handleGenerateGrammar = (focusOverride?: GrammarFocus) => {
    const settings = getSettings();
    const focus = focusOverride || selectedGrammarFocus || settings.grammarFocus || 'toeic_all';
    const excludeRules = getExcludeGrammarList();
    markStepCompleted('grammar');
    onRunDailyTask('grammar_lesson', {
      userLevel,
      grammarFocus: focus,
      excludeRules,
    });
  };

  // 3. Pillar 3 Generator: Reading
  const handleGenerateReading = (overrideTopic?: string) => {
    let topicStr = overrideTopic || customReadingTopic.trim() || selectedReadingTopic.label;
    if (selectedReadingTopic.id === 'free_random' && !customReadingTopic.trim() && !overrideTopic) {
      const randomReadingPool = [
        'Vũ Trụ & Những Hành Tinh Kỳ Thú (Astronomy & Space Exploration)',
        'Văn Hóa Uống Trà & Cà Phê Trên Thế Giới (World Tea & Coffee Cultures)',
        'Bí Quyết Nấu Món Ăn Truyền Thống Địa Phương (Culinary Secrets)',
        'Hành Trình Khám Phá Vùng Đất Bắc Âu (Nordic Travel Stories)',
        'Trí Tuệ Nhân Tạo & Đời Sống Số Tương Lai (AI in Modern Life)',
        'Tâm Lý Học Về Hạnh Phúc & Lòng Biết Ơn (Psychology of Happiness)',
        'Nhiếp Ảnh Đường Phố & Kể Chuyện Bằng Ảnh (Street Photography)',
        'Nuôi Thú Cưng & Những Khoảnh Khắc Ấm Áp (Pets & Companionship)',
      ];
      topicStr = randomReadingPool[Math.floor(Math.random() * randomReadingPool.length)];
    }
    const excludeTerms = getExcludeWordsList();
    markStepCompleted('reading');
    onRunDailyTask('reading_lesson', {
      topic: `${topicStr} (Level ${readingLevel})`,
      userLevel: readingLevel,
      targetWordCount: effectiveReadingWordCount,
      excludeTerms,
    });
  };

  // 4. Pillar 4 Generator: Listening
  const handleGenerateListening = (overrideTopic?: string) => {
    let topicStr = overrideTopic || customListeningTopic.trim() || selectedListeningTopic.label;
    if (selectedListeningTopic.id === 'listening_random' && !customListeningTopic.trim() && !overrideTopic) {
      const randomListeningPool = [
        'Hẹn Bạn Thân Đi Thưởng Thức Ẩm Thực Cuối Tuần (Weekend Food Adventure)',
        'Đặt Phòng Khách Sạn View Biển & Hỏi Dịch Vụ (Booking Seaside Hotel)',
        'Bàn Luận Về Bộ Phim Khoa Học Viễn Tưởng Mới Ra Rạp (Sci-Fi Movie Discussion)',
        'Hỏi Ý Kiến Về Việc Mua Laptop Mới (Tech Advice on Choosing Laptop)',
        'Lập Kế Hoạch Chuyến Đi Dã Ngoại Cắm Trại (Planning Camping Trip)',
        'Tâm Sự Về Thói Quen Dậy Sớm & Tập Thể Dục (Morning Habits & Fitness)',
        'Mua Quà Lưu Niệm Tại Hội Chợ Thủ Công (Shopping at Artisan Market)',
      ];
      topicStr = randomListeningPool[Math.floor(Math.random() * randomListeningPool.length)];
    }
    const excludeTerms = getExcludeWordsList();
    markStepCompleted('listening');
    onRunDailyTask('listening_lesson', {
      topic: `${topicStr} (Level ${userLevel})`,
      userLevel,
      excludeTerms,
    });
  };

  // 1-Click Auto-Pilot Master Launcher: Smart auto-advance to current incomplete step
  const handleStartAutoPilot = () => {
    const settings = getSettings();
    const count = settings.dailyVocabCount || 3;
    let topicName = selectedVocabTopic.label;

    if (settings.topicPreference === 'custom' && settings.customTopic) {
      topicName = settings.customTopic;
    } else if (settings.topicPreference === 'daily_life') {
      topicName = 'Đời Sống Hàng Ngày & Mua Sắm (Daily Life)';
    } else if (settings.topicPreference === 'travel') {
      topicName = 'Du Lịch, Sân Bay & Đặt Phòng (Travel & Hotel)';
    } else if (settings.topicPreference === 'tech') {
      topicName = 'Công Nghệ, Thiết Bị & Đời Sống Hiện Đại (Modern Tech)';
    } else if (settings.topicPreference === 'workplace') {
      topicName = 'Công Sở, Đồng Nghiệp & Email (Workplace)';
    } else if (settings.topicPreference === 'all') {
      const themes = [
        'Đời Sống Hàng Ngày & Mua Sắm (Daily Life)',
        'Nhà Hàng, Ẩm Thực & Gọi Món (Dining Out)',
        'Du Lịch, Sân Bay & Chỉ Đường (Travel)',
        'Công Sở, Đồng Nghiệp & Email (Workplace)',
        'Công Nghệ, Thiết Bị & Đời Sống Số (Tech)',
      ];
      topicName = themes[new Date().getDay() % themes.length];
    }

    if (!completedSteps.includes('vocab')) {
      setDailyMode('vocab');
      setSubModeByPillar((prev) => ({ ...prev, vocab: 'learn' }));
      handleGenerateVocab(count, topicName);
    } else if (!completedSteps.includes('grammar')) {
      setDailyMode('grammar');
      setSubModeByPillar((prev) => ({ ...prev, grammar: 'learn' }));
      handleGenerateGrammar(selectedGrammarFocus);
    } else if (!completedSteps.includes('reading')) {
      setDailyMode('reading');
      setSubModeByPillar((prev) => ({ ...prev, reading: 'learn' }));
      handleGenerateReading();
    } else if (!completedSteps.includes('listening')) {
      setDailyMode('listening');
      setSubModeByPillar((prev) => ({ ...prev, listening: 'learn' }));
      handleGenerateListening();
    } else {
      setDailyMode('vocab');
      setSubModeByPillar((prev) => ({ ...prev, vocab: 'test' }));
    }
  };

  const handleResetDailyProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem('playeng_completed_steps');
  };

  const handleMarkCompleted = () => {
    if (propOnMarkCompleted) {
      propOnMarkCompleted();
      return;
    }
    if (isCompletedToday) return;
    const newStreak = streak + 1;
    setLocalStreak(newStreak);
    setLocalIsCompletedToday(true);
    localStorage.setItem('playeng_streak', newStreak.toString());
    localStorage.setItem('playeng_last_completed', new Date().toDateString());
  };

  const getTestedItemCount = () => {
    if (dailyMode === 'vocab') return `${learnedWords.length} từ (${masteredWordsCount} ⭐)`;
    if (dailyMode === 'grammar') return `${learnedGrammar.length} mẫu (${masteredGrammarCount} ⭐)`;
    if (dailyMode === 'reading') return `${learnedReadings.length} bài (${masteredReadingsCount} ⭐)`;
    return `${learnedListenings.length} bài (${masteredListeningsCount} ⭐)`;
  };

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------
          TAB 1: HÔM NAY (Guided Today Plan)
      ---------------------------------------------------- */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Today Master Routine Card */}
          <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm flex items-center gap-1.5 shrink-0">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>{streak} NGÀY</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">
                    {lang === 'vi' ? 'Lộ Trình Tự Nhiên Hôm Nay' : 'Natural Daily Progression'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    {lang === 'vi'
                      ? '5–10 phút mỗi ngày: Từ vựng ➔ Ngữ pháp ➔ Đọc & Nghe ➔ Nhắn tin phản xạ.'
                      : '5-10 minutes daily: Vocab ➔ Grammar ➔ Reading & Listening ➔ Messenger.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-850 border border-zinc-750 text-sky-300 font-bold">
                  LEVEL {userLevel}
                </span>
                {!isCompletedToday ? (
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-150 border border-emerald-500 flex items-center gap-1 cursor-pointer uppercase shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Đánh dấu xong' : 'Mark Done'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'vi' ? 'Đã hoàn thành hôm nay' : 'Completed Today'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4-Step Progress Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div
                className={`p-2.5 border rounded-lg flex items-center justify-between transition-all duration-150 ${
                  completedSteps.includes('vocab')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400'
                }`}
              >
                <span>1. 📚 Từ Vựng</span>
                <span>{completedSteps.includes('vocab') ? '✓' : '...'}</span>
              </div>
              <div
                className={`p-2.5 border rounded-lg flex items-center justify-between transition-all duration-150 ${
                  completedSteps.includes('grammar')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400'
                }`}
              >
                <span>2. 🧩 Ngữ Pháp</span>
                <span>{completedSteps.includes('grammar') ? '✓' : '...'}</span>
              </div>
              <div
                className={`p-2.5 border rounded-lg flex items-center justify-between transition-all duration-150 ${
                  completedSteps.includes('reading') || completedSteps.includes('listening')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400'
                }`}
              >
                <span>3. 🎧 Đọc &amp; Nghe</span>
                <span>{completedSteps.includes('reading') || completedSteps.includes('listening') ? '✓' : '...'}</span>
              </div>
              <div
                className={`p-2.5 border rounded-lg flex items-center justify-between transition-all duration-150 ${
                  completedSteps.includes('chat')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400'
                }`}
              >
                <span>4. 💬 Nhắn Tin</span>
                <span>{completedSteps.includes('chat') ? '✓' : '...'}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span>Tiến độ: <strong>{completedSteps.length}/4</strong> chặng</span>
                {completedSteps.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetDailyProgress}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
                  >
                    [ ↺ Làm lại ]
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isAutomating}
                onClick={handleStartAutoPilot}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs font-mono uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isAutomating
                    ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                    : completedSteps.length >= 4
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500'
                    : 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/80'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isAutomating
                    ? 'AI ĐANG KHỞI TẠO BÀI HỌC...'
                    : completedSteps.length >= 4
                    ? '[ ĐÃ XONG 4 CHẶNG - ÔN TẬP ĐÃ HỌC ]'
                    : completedSteps.length === 0
                    ? '[ ▶ BẮT ĐẦU BUỔI HỌC HÔM NAY ]'
                    : `[ ▶ TIẾP TỤC: ${
                        !completedSteps.includes('vocab')
                          ? 'BƯỚC 1 TỪ VỰNG'
                          : !completedSteps.includes('grammar')
                          ? 'BƯỚC 2 NGỮ PHÁP'
                          : !completedSteps.includes('reading') && !completedSteps.includes('listening')
                          ? 'BƯỚC 3 ĐỌC & NGHE'
                          : 'BƯỚC 4 NHẮN TIN CHAT'
                      } ]`}
                </span>
              </button>
            </div>
          </div>

          {/* Today Lesson Result Area */}
          {currentResult ? (
            <div className="space-y-4">
              {currentResult.type === 'toeic_lesson' && (
                <>
                  <ToeicLessonResultView
                    result={currentResult.data}
                    onGenerateAnother={() => handleGenerateVocab()}
                    isAutomating={isAutomating}
                  />
                  <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-sky-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                          [ ĐÃ XONG BƯỚC 1: TỪ VỰNG ]
                        </span>
                        <p className="text-xs text-neutral-300 font-medium">
                          Tuyệt vời! Bây giờ hãy chuyển sang Bước 2 để học mẫu câu ghép ngữ pháp TOEIC.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isAutomating}
                      onClick={() => {
                        setDailyMode('grammar');
                        handleGenerateGrammar();
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span>HỌC TIẾP: BƯỚC 2 NGỮ PHÁP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {currentResult.type === 'grammar_lesson' && (
                <>
                  <GrammarLessonResultView
                    result={currentResult.data}
                    onGenerateAnother={() => handleGenerateGrammar()}
                    isAutomating={isAutomating}
                  />
                  <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-indigo-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          [ ĐÃ XONG BƯỚC 2: NGỮ PHÁP ]
                        </span>
                        <p className="text-xs text-neutral-300 font-medium">
                          Đã nắm công thức ghép câu! Hãy chuyển sang Bước 3 để luyện đọc hiểu đoạn văn thực tế.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isAutomating}
                      onClick={() => {
                        setDailyMode('reading');
                        handleGenerateReading();
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span>HỌC TIẾP: BƯỚC 3 ĐỌC HIỂU</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {currentResult.type === 'reading_lesson' && (
                <>
                  <ReadingLessonResultView
                    result={currentResult.data}
                    onGenerateAnother={() => handleGenerateReading()}
                    isAutomating={isAutomating}
                  />
                  <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-emerald-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          [ ĐÃ XONG BƯỚC 3: ĐỌC HIỂU ]
                        </span>
                        <p className="text-xs text-neutral-300 font-medium">
                          Đoạn văn đọc hiểu đã hoàn tất! Hãy bước vào chặng cuối: Trò chuyện và nhắn tin phản xạ 2 chiều.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markStepCompleted('chat');
                        onSwitchTab?.('chat');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span>BƯỚC 4: NHẮN TIN TRÒ CHUYỆN 💬</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {currentResult.type === 'listening_lesson' && (
                <>
                  <ListeningLessonResultView
                    result={currentResult.data}
                    onGenerateAnother={() => handleGenerateListening()}
                    isAutomating={isAutomating}
                  />
                  <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-amber-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                          [ HOÀN THÀNH BÀI NGHE ]
                        </span>
                        <p className="text-xs text-neutral-300 font-medium">
                          Hãy chuyển sang tab Nhắn tin để trò chuyện đối đáp trực tiếp với AI!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markStepCompleted('chat');
                        onSwitchTab?.('chat');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span>TRÒ CHUYỆN MESSENGER 💬</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-center space-y-3 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                Chưa có bài học nào được mở hôm nay
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto font-sans">
                Bấm nút <strong className="text-sky-300">[ BẮT ĐẦU BUỔI HỌC HÔM NAY ]</strong> phía trên để AI tự động tạo bài từ vựng mở đầu theo trình độ <strong>{userLevel}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 7: SỔ NHỚ & ÔN TẬP (Memory Bank & Active Recall)
      ---------------------------------------------------- */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          {/* Top Memory Header */}
          <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  {lang === 'vi' ? 'Sổ Nhớ & Trung Tâm Ôn Tập (Active Recall)' : 'Memory Bank & Active Recall Hub'}
                </h2>
                <p className="text-xs text-neutral-400">
                  {lang === 'vi'
                    ? 'Tự động lưu trữ mọi kiến thức bạn đã học. Luyện tập ngẫu nhiên theo phương pháp Spaced Repetition.'
                    : 'Automatically stores all learned content. Practice with Spaced Repetition tests.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {memorySelectedTest && (
                <button
                  type="button"
                  onClick={() => setMemorySelectedTest(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-neutral-200 text-xs font-mono font-bold uppercase border border-zinc-750 cursor-pointer flex items-center gap-1.5 transition-all duration-150"
                >
                  <span>⬅ Quay lại Sổ Nhớ</span>
                </button>
              )}
              {onSwitchTab && (
                <button
                  type="button"
                  onClick={() => onSwitchTab('quiz')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold uppercase border border-amber-500 cursor-pointer flex items-center gap-1.5 transition-all duration-150 shadow-sm"
                  title="Tạo đề thi trắc nghiệm tổng hợp từ vựng và ngữ pháp"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{lang === 'vi' ? '📝 Đề Thi Trắc Nghiệm (Quiz)' : '📝 Quiz & Tests'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase border border-purple-500 cursor-pointer flex items-center gap-1.5 transition-all duration-150 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Mở Sổ Tay Chi Tiết' : 'Open Detailed Notebook'}</span>
              </button>
            </div>
          </div>

          {/* If a test is selected inside Memory tab */}
          {memorySelectedTest === 'vocab' && (
            <VocabTestView
              onWordsUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setMemorySelectedTest(null)}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {memorySelectedTest === 'grammar' && (
            <GrammarTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setMemorySelectedTest(null)}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {memorySelectedTest === 'reading' && (
            <ReadingTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setMemorySelectedTest(null)}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {memorySelectedTest === 'listening' && (
            <ListeningTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setMemorySelectedTest(null)}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {/* When no test is currently active: 4 Stat & Action Cards */}
          {!memorySelectedTest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Vocab */}
              <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 hover:border-zinc-700/80 transition-all duration-150 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {lang === 'vi' ? 'Từ Vựng & Wordform' : 'Vocab & Wordforms'}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {masteredWordsCount} / {learnedWords.length} {lang === 'vi' ? 'từ đã thuộc' : 'mastered'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {learnedWords.length > 0
                      ? `${Math.round((masteredWordsCount / learnedWords.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${learnedWords.length > 0 ? (masteredWordsCount / learnedWords.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMemoryModalOpen(true)}
                    className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    [ Xem danh sách từ ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorySelectedTest('vocab')}
                    disabled={learnedWords.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-150 border border-sky-500"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Luyện Test ({learnedWords.length})</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Grammar */}
              <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 hover:border-zinc-700/80 transition-all duration-150 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {lang === 'vi' ? 'Ngữ Pháp TOEIC' : 'Grammar Patterns'}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {masteredGrammarCount} / {learnedGrammar.length} {lang === 'vi' ? 'mẫu đã thuộc' : 'mastered'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {learnedGrammar.length > 0
                      ? `${Math.round((masteredGrammarCount / learnedGrammar.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${learnedGrammar.length > 0 ? (masteredGrammarCount / learnedGrammar.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMemoryModalOpen(true)}
                    className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    [ Xem danh sách ngữ pháp ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorySelectedTest('grammar')}
                    disabled={learnedGrammar.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-150 border border-indigo-500"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Luyện Test ({learnedGrammar.length})</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Reading */}
              <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 hover:border-zinc-700/80 transition-all duration-150 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {lang === 'vi' ? 'Đọc Hiểu Thực Chiến' : 'Reading Passages'}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {masteredReadingsCount} / {learnedReadings.length} {lang === 'vi' ? 'bài đã đọc' : 'mastered'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {learnedReadings.length > 0
                      ? `${Math.round((masteredReadingsCount / learnedReadings.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${learnedReadings.length > 0 ? (masteredReadingsCount / learnedReadings.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMemoryModalOpen(true)}
                    className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    [ Xem danh sách bài đọc ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorySelectedTest('reading')}
                    disabled={learnedReadings.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-150 border border-emerald-500"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Luyện Test ({learnedReadings.length})</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Listening */}
              <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-4 hover:border-zinc-700/80 transition-all duration-150 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {lang === 'vi' ? 'Nghe Hiểu Phản Xạ' : 'Listening Dialogues'}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {masteredListeningsCount} / {learnedListenings.length} {lang === 'vi' ? 'hội thoại đã nghe' : 'mastered'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {learnedListenings.length > 0
                      ? `${Math.round((masteredListeningsCount / learnedListenings.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${learnedListenings.length > 0 ? (masteredListeningsCount / learnedListenings.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMemoryModalOpen(true)}
                    className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    [ Xem danh sách hội thoại ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemorySelectedTest('listening')}
                    disabled={learnedListenings.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-150 border border-amber-400 shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Luyện Test ({learnedListenings.length})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty hint if 0 items */}
          {!memorySelectedTest && learnedWords.length === 0 && learnedGrammar.length === 0 && (
            <div className="p-8 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-center space-y-3 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {lang === 'vi' ? 'Sổ Nhớ Đang Trống' : 'Memory Bank is Empty'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {lang === 'vi'
                  ? 'Bạn chưa học bài nào. Khi học từ vựng, ngữ pháp, đọc hoặc nghe, hệ thống sẽ tự động lưu lại vào đây để bạn làm bài kiểm tra ôn tập.'
                  : 'Start learning in Today tab or specific modules to populate your memory bank.'}
              </p>
              {onSwitchTab && (
                <button
                  type="button"
                  onClick={() => onSwitchTab('today')}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-all duration-150 border border-purple-500 shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Học ngay tại tab Hôm Nay' : 'Start with Today Plan'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB CONTROLS: Khi vào các tab Chuyên đề
      ---------------------------------------------------- */}
      {activeTab !== 'today' && activeTab !== 'memory' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/80 gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {activeTab === 'vocab' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSubModeForCurrent('learn');
                    setVocabLearningMethod('core');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'learn' && vocabLearningMethod === 'core'
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-neutral-200 border border-zinc-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>[ ⚡ TỪ CỐT LÕI &amp; WORDFORM ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubModeForCurrent('learn');
                    setVocabLearningMethod('reading');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'learn' && vocabLearningMethod === 'reading'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-emerald-300 border border-zinc-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>[ 📖 TỪ VỰNG QUA BÀI ĐỌC ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubModeForCurrent('flashcard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'flashcard'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-amber-300 border border-zinc-800/60'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>[ 🎴 FLASHCARD ÔN TẬP ({learnedWords.length}) ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubModeForCurrent('test')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'test'
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-sky-300 border border-zinc-800/60'
                  }`}
                >
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>[ 🎯 KIỂM TRA ĐÃ HỌC ({learnedWords.length}) ]</span>
                </button>
              </>
            )}

            {activeTab === 'grammar' && (
              <>
                <button
                  type="button"
                  onClick={() => setSubModeForCurrent('learn')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'learn'
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-neutral-200 border border-zinc-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>[ 📖 HỌC MẪU CÂU TOEIC ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubModeForCurrent('test')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'test'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-amber-300 border border-zinc-800/60'
                  }`}
                >
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>[ 🎯 KIỂM TRA ĐÃ HỌC ({learnedGrammar.length}) ]</span>
                </button>
              </>
            )}

            {activeTab === 'read_listen' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDailyMode('reading');
                    setSubModeByPillar((prev) => ({ ...prev, reading: 'learn' }));
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    dailyMode === 'reading' && currentSubMode === 'learn'
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-neutral-200 border border-zinc-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>[ 📖 ĐỌC HIỂU ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDailyMode('listening');
                    setSubModeByPillar((prev) => ({ ...prev, listening: 'learn' }));
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    dailyMode === 'listening' && currentSubMode === 'learn'
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-neutral-200 border border-zinc-800/60'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>[ 🎧 NGHE PHẢN XẠ ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubModeForCurrent('test')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentSubMode === 'test'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                      : 'bg-zinc-850/40 text-neutral-400 hover:text-amber-300 border border-zinc-800/60'
                  }`}
                >
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>[ 🎯 TEST ĐÃ HỌC ]</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMemoryModalOpen(true)}
            className="text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 cursor-pointer self-end sm:self-center transition-all duration-150"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Sổ bộ nhớ ({learnedWords.length + learnedGrammar.length + learnedReadings.length + learnedListenings.length})</span>
          </button>
        </div>
      )}

      {/* =========================================================
          ACTIVE FLASHCARD VIEW (When Sub-Mode is 'flashcard')
      ========================================================= */}
      {activeTab === 'vocab' && currentSubMode === 'flashcard' && (
        <div className="space-y-4">
          <FlashcardDeckView
            items={learnedWords.map((w) => ({
              id: w.id,
              term: w.term,
              ipa: w.ipa,
              vietnamesePhonetic: w.vietnamesePhonetic,
              partOfSpeech: w.partOfSpeech,
              vietnameseMeaning: w.vietnameseMeaning,
              wordFamilyDetails: w.wordFamilyDetails,
              synonyms: w.synonyms,
              exampleSentence: w.exampleSentence,
              exampleTranslation: w.exampleTranslation,
              mastered: w.mastered,
              level: w.level,
              reviewCount: w.reviewCount,
            }))}
            title={`BỘ THẺ FLASHCARD ÔN TẬP TỪ VỰNG (${learnedWords.length} TỪ ĐÃ HỌC)`}
            onClose={() => setSubModeForCurrent('learn')}
            onWordMastered={() => setMemoryTick((t) => t + 1)}
            onDeckCompleted={() => setMemoryTick((t) => t + 1)}
            lang={lang}
          />
        </div>
      )}

      {/* =========================================================
          ACTIVE TEST VIEW (When Sub-Mode is 'test')
      ========================================================= */}
      {activeTab !== 'today' && activeTab !== 'memory' && currentSubMode === 'test' && (
        <div className="space-y-4">
          {dailyMode === 'vocab' && (
            <VocabTestView
              onWordsUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setSubModeForCurrent('learn')}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {dailyMode === 'grammar' && (
            <GrammarTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setSubModeForCurrent('learn')}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {dailyMode === 'reading' && (
            <ReadingTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setSubModeForCurrent('learn')}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}

          {dailyMode === 'listening' && (
            <ListeningTestView
              onMemoryUpdated={() => setMemoryTick((t) => t + 1)}
              onBackToLearn={() => setSubModeForCurrent('learn')}
              onOpenMemory={() => setIsMemoryModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* =========================================================
          PANEL 1: TỪ VỰNG CỐT LÕI & TỪ VỰNG QUA BÀI ĐỌC
      ========================================================= */}
      {activeTab === 'vocab' && currentSubMode === 'learn' && (
        <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-5 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>TRỤ CỘT 01: NẠP TỪ VỰNG TIẾNG ANH</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">[ LEVEL {userLevel} ]</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {vocabLearningMethod === 'reading'
                  ? '📖 HỌC TỪ VỰNG QUA BÀI ĐỌC & CÂU CHUYỆN TRUYỀN CẢM HỨNG'
                  : '⚡ NẠP 3 TỪ VỰNG CỐT LÕI & BIẾN THỂ WORD FORM'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {vocabLearningMethod === 'reading'
                  ? 'Đắm chìm vào những câu chuyện truyền cảm hứng, du ký và mẩu chuyện đời thường lôi cuốn. Từ vựng được tô sáng trực tiếp trong ngữ cảnh, có âm thanh Karaoke và tự động lưu vào bộ nhớ.'
                  : `AI sẽ soạn 3 từ vựng thiết yếu nhất theo trình độ ${userLevel}, kèm hướng dẫn phát âm tiếng Việt (ví dụ: Colleague → "CÓ-li-gừ") và bài tập dạng từ Part 5.`}
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400 bg-zinc-850/70 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
              🛡️ LOẠI TRỪ: <strong className="text-sky-300">{learnedWords.length}</strong> TỪ ĐÃ HỌC
            </div>
          </div>

          {/* Mode Selector Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <button
              type="button"
              onClick={() => setVocabLearningMethod('core')}
              className={`p-3 rounded-lg text-left transition-all duration-150 cursor-pointer flex items-start gap-3 ${
                vocabLearningMethod === 'core'
                  ? 'bg-zinc-850 border border-sky-500/40 shadow-sm'
                  : 'hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${vocabLearningMethod === 'core' ? 'bg-sky-500/20 text-sky-400' : 'bg-zinc-800 text-neutral-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${vocabLearningMethod === 'core' ? 'text-white' : 'text-neutral-300'}`}>
                    ⚡ Nạp Từ Cốt Lõi &amp; Word Form
                  </span>
                  {vocabLearningMethod === 'core' && (
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30">
                      ĐANG CHỌN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Ngắn gọn, trọng tâm thi cử &amp; giao tiếp chuẩn xác, bảng họ từ Noun/Verb/Adj/Adv.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setVocabLearningMethod('reading')}
              className={`p-3 rounded-lg text-left transition-all duration-150 cursor-pointer flex items-start gap-3 ${
                vocabLearningMethod === 'reading'
                  ? 'bg-zinc-850 border border-emerald-500/40 shadow-sm'
                  : 'hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${vocabLearningMethod === 'reading' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-neutral-400'}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${vocabLearningMethod === 'reading' ? 'text-white' : 'text-neutral-300'}`}>
                    📖 Học Qua Bài Đọc &amp; Câu Chuyện
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    ✨ TĂNG CẢM HỨNG
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Câu chuyện lôi cuốn, từ vựng tô sáng tương tác, Karaoke âm thanh và ngữ cảnh sống động.
                </p>
              </div>
            </button>
          </div>

          {/* METHOD 1: CORE VOCABULARY SELECTION */}
          {vocabLearningMethod === 'core' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
                  CHỦ ĐỀ NẠP TỪ HÔM NAY:
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOCAB_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedVocabTopic(topic);
                        setCustomVocabTopic('');
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                        selectedVocabTopic.id === topic.id && !customVocabTopic.trim()
                          ? 'bg-sky-600 text-white font-bold border border-sky-400 shadow-sm'
                          : 'bg-zinc-850/60 text-neutral-300 hover:bg-zinc-800 hover:text-white border border-zinc-750'
                      }`}
                    >
                      <span>{topic.icon}</span>
                      <span>{topic.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Vocab Topic Input */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400 shrink-0 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>HOẶC TỰ NHẬP CHỦ ĐỀ BẤT KỲ:</span>
                  </span>
                  <div className="flex-1 flex items-center gap-1.5 bg-zinc-850/70 border border-zinc-750 rounded-lg px-3 py-2">
                    <input
                      type="text"
                      value={customVocabTopic}
                      onChange={(e) => setCustomVocabTopic(e.target.value)}
                      placeholder="Nhập bất kỳ chủ đề nào (VD: Nuôi mèo, Leo núi, Du hành vũ trụ, Nấu ăn...)"
                      className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
                    />
                    {customVocabTopic && (
                      <button
                        type="button"
                        onClick={() => setCustomVocabTopic('')}
                        className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer shrink-0"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!focusMode ? (
                  <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>
                      ENGINE: <strong className="text-white">{provider.toUpperCase()}</strong>
                    </span>
                  </div>
                ) : <div />}

                <button
                  type="button"
                  disabled={isAutomating}
                  onClick={() => handleGenerateVocab(undefined, undefined, 'core')}
                  className={`w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                    isAutomating
                      ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                      : 'bg-sky-600 hover:bg-sky-500 border border-sky-400/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>
                    {isAutomating ? 'AI ĐANG SOẠN TỪ VỰNG...' : '🚀 TẠO BÀI TỪ VỰNG HÔM NAY (1-CLICK)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* METHOD 2: VOCABULARY THROUGH INSPIRING STORIES */}
          {vocabLearningMethod === 'reading' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CHỌN CHỦ ĐỀ CÂU CHUYỆN TRUYỀN CẢM HỨNG:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VOCAB_STORY_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedStoryTopic(topic);
                        setCustomStoryTopic('');
                      }}
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all duration-150 cursor-pointer text-left ${
                        selectedStoryTopic.id === topic.id && !customStoryTopic.trim()
                          ? 'bg-emerald-600 text-white font-bold border border-emerald-400 shadow-sm'
                          : 'bg-zinc-850/60 text-neutral-300 hover:bg-zinc-800 hover:text-white border border-zinc-750'
                      }`}
                    >
                      <span className="text-base shrink-0">{topic.icon}</span>
                      <span className="leading-snug">{topic.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Story Topic Input */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400 shrink-0 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>HOẶC TỰ NHẬP CÂU CHUYỆN BẠN THÍCH:</span>
                  </span>
                  <div className="flex-1 flex items-center gap-1.5 bg-zinc-850/70 border border-zinc-750 rounded-lg px-3 py-2">
                    <input
                      type="text"
                      value={customStoryTopic}
                      onChange={(e) => setCustomStoryTopic(e.target.value)}
                      placeholder="VD: Chuyến tàu đêm qua dãy Alps, Tiệm sách cũ ở London, Chú mèo tìm đường về nhà..."
                      className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
                    />
                    {customStoryTopic && (
                      <button
                        type="button"
                        onClick={() => setCustomStoryTopic('')}
                        className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer shrink-0"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Story Action Trigger */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!focusMode ? (
                  <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>
                      ENGINE: <strong className="text-white">{provider.toUpperCase()}</strong> [ STORY MODE ]
                    </span>
                  </div>
                ) : <div />}

                <button
                  type="button"
                  disabled={isAutomating}
                  onClick={() => handleGenerateVocab(undefined, undefined, 'reading')}
                  className={`w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                    isAutomating
                      ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>
                    {isAutomating ? 'AI ĐANG VIẾT CÂU CHUYỆN...' : '📖 TẠO CÂU CHUYỆN HỌC TỪ VỰNG (1-CLICK AI)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          PANEL 2: NGỮ PHÁP GHÉP CÂU (Practical Sentence Grammar)
      ========================================================= */}
      {activeTab === 'grammar' && currentSubMode === 'learn' && (
        <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TRỤ CỘT 02: NGỮ PHÁP GHÉP CÂU</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">[ LEVEL {userLevel} ]</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                1 MẪU CÂU GHÉP THỰC CHIẾN (ACTIONABLE PATTERN)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Không học thuật ngữ ngữ pháp phức tạp. Học trực tiếp công thức ghép câu chuẩn xác để ứng dụng ngay vào email và giao tiếp công sở.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400 bg-zinc-850/70 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
              🛡️ LOẠI TRỪ: <strong className="text-indigo-300">{learnedGrammar.length}</strong> CẤU TRÚC ĐÃ HỌC
            </div>
          </div>

          {/* Level Guidance Preview */}
          <div className="p-4 rounded-xl bg-zinc-850/60 border-l-4 border-l-indigo-500 border-y border-r border-zinc-800/80 space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block">
              [ HƯỚNG DẪN KIẾN THỨC LEVEL {userLevel} ]:
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {userLevel === 'A1'
                ? 'Học các mẫu câu nền tảng: "Please + Bare Verb", "Can I have + Noun", "I need to + Verb", "There is / There are".'
                : userLevel === 'A2'
                ? 'Học cách nhờ vả và đề nghị lịch thiệp: "Could you please + V", "I would like to + V", "How about + V-ing?", "Let\'s + V".'
                : userLevel === 'B1'
                ? 'Học các cụm giới từ và phối thì chuẩn TOEIC: "Be responsible for + V-ing", "Look forward to + V-ing", "In order to + Verb".'
                : 'Mẫu câu nâng cao TOEIC 700+: Mệnh đề giả định (Subjunctive: "recommend that he submit"), Đảo ngữ điều kiện loại 3.'}
            </p>
          </div>

          {/* TOEIC Signature Grammar Focus Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
              CHỌN DẠNG NGỮ PHÁP ĐẶC TRƯNG TOEIC (HOẶC ĐỂ TỰ ĐỘNG THEO CẤP {userLevel}):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGrammarFocus('toeic_all')}
                className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedGrammarFocus === 'toeic_all'
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-bold text-indigo-300">🎯 Tự động theo cấp {userLevel}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">Toàn diện các dạng bẫy Part 5 theo khung CEFR</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGrammarFocus('word_forms')}
                className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedGrammarFocus === 'word_forms'
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-bold text-indigo-300">🔤 Từ loại (Word Forms)</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">Vị trí Noun/Verb/Adj/Adv (Chiếm ~30% đề Part 5)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGrammarFocus('tenses')}
                className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedGrammarFocus === 'tenses'
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-bold text-indigo-300">⏱️ Phối thì &amp; Hòa hợp S-V</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">Dấu hiệu nhận biết thì &amp; bẫy Each/Neither/Plural</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGrammarFocus('conjunctions')}
                className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedGrammarFocus === 'conjunctions'
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-bold text-indigo-300">🔗 Liên từ vs Giới từ</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">Phân biệt Although vs Despite, Because vs Due to</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGrammarFocus('participles')}
                className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedGrammarFocus === 'participles'
                    ? 'bg-indigo-950/80 border-indigo-500/80 text-white font-bold shadow-sm'
                    : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="font-bold text-indigo-300">🔄 Bị động &amp; Rút gọn MĐQH</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">Bị động công sở &amp; Phân từ V-ing / V-ed</div>
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!focusMode ? (
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>
                  ENGINE: <strong className="text-white">{provider.toUpperCase()}</strong>
                </span>
              </div>
            ) : <div />}

            <button
              type="button"
              disabled={isAutomating}
              onClick={() => handleGenerateGrammar(selectedGrammarFocus)}
              className={`w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                isAutomating
                  ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/80'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>
                {isAutomating ? 'AI ĐANG SOẠN MẪU CÂU...' : '🧩 TẠO MẪU CÂU GHÉP HÔM NAY (1-CLICK)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          PANEL 3: ĐỌC HIỂU THỰC CHIẾN (Authentic Reading Comprehension)
      ========================================================= */}
      {activeTab === 'read_listen' && dailyMode === 'reading' && currentSubMode === 'learn' && (
        <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TRỤ CỘT 03: ĐỌC HIỂU THỰC CHIẾN</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">[ LEVEL {userLevel} ]</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                ĐOẠN VĂN EMAIL / THÔNG BÁO CHUẨN PART 7 (1-CLICK AI)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Rèn phản xạ đọc quét (Scanning) và nắm ý chính (Skimming) theo cấp độ <strong>{userLevel}</strong>. Có âm thanh đoạn văn, từ vựng trọng tâm và câu hỏi trắc nghiệm độ hiểu.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400 bg-zinc-850/70 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
              🛡️ ĐÃ LƯU: <strong className="text-emerald-300">{learnedReadings.length}</strong> BÀI ĐỌC
            </div>
          </div>

          {/* Reading Level & Word Count Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
            {/* 1. Reading Level Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold text-neutral-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>1. MỨC ĐỘ BÀI ĐỌC (CEFR LEVEL):</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {readingLevel}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetReadingLevel(lvl)}
                    className={`py-2 px-1 rounded-lg text-center font-mono text-xs font-bold transition-all cursor-pointer border ${
                      readingLevel === lvl
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-900/50 scale-[1.02]'
                        : 'bg-zinc-800/80 hover:bg-zinc-750 text-neutral-300 border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div>{lvl}</div>
                    <div className="text-[9px] font-sans font-normal opacity-80 mt-0.5">
                      {lvl === 'A1'
                        ? 'Cơ bản'
                        : lvl === 'A2'
                        ? 'Sơ cấp'
                        : lvl === 'B1'
                        ? 'Trung cấp'
                        : lvl === 'B2'
                        ? 'TOEIC 700'
                        : 'IELTS 7.5'}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pt-1">
                {readingLevel === 'A1'
                  ? 'A1 (Cơ bản): Câu ngắn rõ ràng, từ vựng thông dụng hàng ngày, giọng văn thân thiện, có bản dịch song ngữ chi tiết.'
                  : readingLevel === 'A2'
                  ? 'A2 (Sơ cấp): Giao tiếp đời sống, câu ghép tự nhiên, thông báo ngắn, tình huống mua sắm, du lịch, nhà hàng.'
                  : readingLevel === 'B1'
                  ? 'B1 (Trung cấp): Đọc hiểu văn sự, bài viết blog, email trao đổi, liên kết câu mạch lạc, chuẩn B1 / TOEIC 550+.'
                  : readingLevel === 'B2'
                  ? 'B2 (Trung cao): Báo chí, phân tích, thông cáo, hợp đồng, bình luận sâu sắc, từ vựng phong phú, chuẩn TOEIC 700+.'
                  : 'C1 (Cao cấp): Văn phong học thuật, tiểu luận chuyên sâu, bài viết tạp chí, cấu trúc đa tầng, chuẩn IELTS 7.5+ / C1.'}
              </p>
            </div>

            {/* 2. Target Word Count Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold text-neutral-200 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>2. SỐ TỪ & ĐỘ DÀI BÀI ĐỌC:</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  ~{effectiveReadingWordCount} TỪ
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: '150', label: '150 từ', sub: 'Ngắn gọn' },
                  { id: '250', label: '250 từ', sub: 'Chuẩn đẹp' },
                  { id: '400', label: '400 từ', sub: 'Dài bài báo' },
                  { id: '600', label: '600 từ', sub: 'Chuyên sâu' },
                  { id: 'custom', label: 'Tùy chỉnh', sub: `${customReadingWords}w` },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSetReadingWordPreset(preset.id as ReadingWordPreset)}
                    className={`py-2 px-1 rounded-lg text-center font-mono text-xs font-bold transition-all cursor-pointer border ${
                      readingWordPreset === preset.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm shadow-cyan-900/50 scale-[1.02]'
                        : 'bg-zinc-800/80 hover:bg-zinc-750 text-neutral-300 border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div>{preset.label}</div>
                    <div className="text-[9px] font-sans font-normal opacity-80 mt-0.5">{preset.sub}</div>
                  </button>
                ))}
              </div>

              {/* Custom Word Count Input if selected */}
              {readingWordPreset === 'custom' ? (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-mono text-neutral-300 shrink-0">Nhập số từ mong muốn:</span>
                  <input
                    type="number"
                    min={80}
                    max={1200}
                    step={25}
                    value={customReadingWords}
                    onChange={(e) => handleSetCustomReadingWords(Math.max(50, Math.min(1500, parseInt(e.target.value, 10) || 250)))}
                    className="w-24 bg-zinc-900 border border-cyan-500 rounded px-2.5 py-1 text-xs font-mono text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <span className="text-xs font-mono text-neutral-400">từ (80 - 1200 từ)</span>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pt-1">
                  Độ dài mục tiêu: <strong className="text-cyan-300 font-mono">~{effectiveReadingWordCount} từ</strong> (Bài đọc chia {effectiveReadingWordCount >= 500 ? '4 - 6' : effectiveReadingWordCount >= 300 ? '3 - 4' : '2 - 3'} đoạn văn hoàn chỉnh, phát triển ý đầy đủ, không bị ngắn cụt).
                </p>
              )}
            </div>
          </div>

          {/* Reading Topic Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
              CHỌN THỂ LOẠI BÀI ĐỌC HÔM NAY:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {READING_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedReadingTopic(topic);
                    setCustomReadingTopic('');
                  }}
                  className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                    selectedReadingTopic.id === topic.id && !customReadingTopic.trim()
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-white font-bold shadow-sm'
                      : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>{topic.icon}</span>
                    <span>{topic.enLabel}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">{topic.label}</div>
                </button>
              ))}
            </div>

            {/* Custom Reading Topic Input */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>HOẶC TỰ NHẬP BẤT KỲ CHỦ ĐỀ NÀO (KHÔNG GIỚI HẠN):</span>
              </span>
              <div className="flex-1 flex items-center gap-1.5 bg-zinc-850/70 border border-zinc-750 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={customReadingTopic}
                  onChange={(e) => setCustomReadingTopic(e.target.value)}
                  placeholder="VD: Nuôi chó mèo, Leo núi Everest, Khám phá ẩm thực Ý, Lịch sử điện ảnh..."
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
                />
                {customReadingTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomReadingTopic('')}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer shrink-0"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!focusMode ? (
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  ENGINE: <strong className="text-white">{provider.toUpperCase()}</strong>
                </span>
              </div>
            ) : <div />}

            <button
              type="button"
              disabled={isAutomating}
              onClick={() => handleGenerateReading()}
              className={`w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                isAutomating
                  ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/80'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>
                {isAutomating ? 'AI ĐANG BIÊN SOẠN BÀI ĐỌC...' : '📖 TẠO BÀI ĐỌC HIỂU HÔM NAY (1-CLICK)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          PANEL 4: NGHE HIỂU PHẢN XẠ (Authentic Listening Reflex)
      ========================================================= */}
      {activeTab === 'read_listen' && dailyMode === 'listening' && currentSubMode === 'learn' && (
        <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>TRỤ CỘT 04: NGHE HIỂU PHẢN XẠ</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">[ LEVEL {userLevel} ]</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                HỘI THOẠI THỰC CHIẾN PART 3 & 4 (1-CLICK AI)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Luyện tai bắt từ khóa âm thanh theo cấp độ <strong>{userLevel}</strong>. Có hỗ trợ nghe tốc độ chậm 0.7x, chế độ nghe mù, trắc nghiệm phản xạ và Shadowing.
              </p>
            </div>

            <div className="text-xs font-mono text-neutral-400 bg-zinc-850/70 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
              🛡️ ĐÃ LƯU: <strong className="text-amber-300">{learnedListenings.length}</strong> BÀI NGHE
            </div>
          </div>

          {/* Level Guidance Preview */}
          <div className="p-4 rounded-xl bg-zinc-850/60 border-l-4 border-l-amber-500 border-y border-r border-zinc-800/80 space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
              [ HƯỚNG DẪN NGHE HIỂU LEVEL {userLevel} ]:
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {userLevel === 'A1'
                ? 'Hội thoại 3-4 lượt thoại ngắn, phát âm chậm rõ ràng, từ vựng quen thuộc hàng ngày.'
                : userLevel === 'A2'
                ? 'Hội thoại 4-6 lượt thoại công sở: gọi điện, nhờ vả, trao đổi lịch họp.'
                : userLevel === 'B1'
                ? 'Hội thoại 6-8 lượt thoại: giải quyết vấn đề đơn hàng, báo cáo dự án, tốc độ nói tự nhiên.'
                : 'Hội thoại nâng cao: đa giọng đọc, ngữ điệu ngụ ý (Implication questions) bẫy Part 3-4 TOEIC 700+.'}
            </p>
          </div>

          {/* Listening Topic Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
              CHỌN TÌNH HUỐNG HỘI THOẠI HÔM NAY:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {LISTENING_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedListeningTopic(topic);
                    setCustomListeningTopic('');
                  }}
                  className={`p-2.5 rounded-lg text-left border text-xs font-mono transition-all duration-150 cursor-pointer ${
                    selectedListeningTopic.id === topic.id && !customListeningTopic.trim()
                      ? 'bg-amber-950/80 border-amber-500/80 text-white font-bold shadow-sm'
                      : 'bg-zinc-850/50 border-zinc-800 text-neutral-400 hover:text-neutral-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{topic.icon}</span>
                    <span>{topic.enLabel}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 font-sans">{topic.label}</div>
                </button>
              ))}
            </div>

            {/* Custom Listening Topic Input */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>HOẶC TỰ NHẬP BẤT KỲ TÌNH HUỐNG HỘI THOẠI:</span>
              </span>
              <div className="flex-1 flex items-center gap-1.5 bg-zinc-850/70 border border-zinc-750 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={customListeningTopic}
                  onChange={(e) => setCustomListeningTopic(e.target.value)}
                  placeholder="VD: Hẹn hò quán trà sữa, Hỏi đường ra sân bay, Thảo luận trận bóng đá..."
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-sans"
                />
                {customListeningTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomListeningTopic('')}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer shrink-0"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!focusMode ? (
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>
                  ENGINE: <strong className="text-white">{provider.toUpperCase()}</strong>
                </span>
              </div>
            ) : <div />}

            <button
              type="button"
              disabled={isAutomating}
              onClick={() => handleGenerateListening()}
              className={`w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-zinc-950 transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                isAutomating
                  ? 'bg-zinc-800 text-neutral-400 cursor-not-allowed border border-zinc-700'
                  : 'bg-amber-500 hover:bg-amber-400 border border-amber-400'
              }`}
            >
              <Headphones className="w-4 h-4 text-zinc-950" />
              <span>
                {isAutomating ? 'AI ĐANG THU ÂM HỘI THOẠI...' : '🎧 TẠO BÀI NGHE HIỂU HÔM NAY (1-CLICK)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          RESULT SECTION (Sharp Edges)
      ========================================================= */}
      {activeTab !== 'today' && activeTab !== 'memory' && currentResult && !isAutomating && currentSubMode === 'learn' &&
        ((dailyMode === 'vocab' && (currentResult.type === 'toeic_lesson' || currentResult.type === 'vocab')) ||
         (dailyMode === 'grammar' && currentResult.type === 'grammar_lesson') ||
         (dailyMode === 'reading' && currentResult.type === 'reading_lesson') ||
         (dailyMode === 'listening' && currentResult.type === 'listening_lesson')) && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'vi' ? 'KẾT QUẢ BÀI HỌC HÔM NAY' : 'TODAY’S LEARNING RESULT'}</span>
            </h3>

            {!isCompletedToday && (
              <button
                type="button"
                onClick={handleMarkCompleted}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-150 border border-emerald-500 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Hoàn thành bài (+1 Streak)' : 'Complete (+1 Streak)'}</span>
              </button>
            )}
          </div>

          {/* 1. TOEIC Vocab Lesson Result */}
          {currentResult.type === 'toeic_lesson' && dailyMode === 'vocab' && (
            <div className="space-y-4">
              <ToeicLessonResultView
                result={currentResult.data}
                onGenerateAnother={() => handleGenerateVocab()}
                isAutomating={isAutomating}
              />

              {/* Smart Next Step Action Bar */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-sky-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                      [ BƯỚC TIẾP THEO: TRỤ CỘT 02 ]
                    </span>
                    <p className="text-xs text-neutral-300 font-medium">
                      Bạn đã nạp xong từ vựng hôm nay! Hãy kiểm tra từ đã học hoặc chuyển ngay sang ghép câu ngữ pháp TOEIC.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setSubModeForCurrent('test')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 border border-amber-400 shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>TEST TỪ ĐÃ HỌC 🎯</span>
                  </button>

                  <button
                    type="button"
                    disabled={isAutomating}
                    onClick={() => {
                      setDailyMode('grammar');
                      setSubModeByPillar((prev) => ({ ...prev, grammar: 'learn' }));
                      handleGenerateGrammar();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                  >
                    <span>HỌC TIẾP: NGỮ PHÁP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Grammar Lesson Result */}
          {currentResult.type === 'grammar_lesson' && dailyMode === 'grammar' && (
            <div className="space-y-4">
              <GrammarLessonResultView
                result={currentResult.data}
                onGenerateAnother={() => handleGenerateGrammar()}
                isAutomating={isAutomating}
              />

              {/* Smart Next Step Action Bar */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-indigo-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      [ BƯỚC TIẾP THEO: TRỤ CỘT 03 ]
                    </span>
                    <p className="text-xs text-neutral-300 font-medium">
                      Đã nắm công thức ghép câu! Hãy làm bài test ngữ pháp hoặc chuyển sang đọc hiểu đoạn văn thực chiến.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setSubModeForCurrent('test')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 border border-amber-400 shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>TEST NGỮ PHÁP 🎯</span>
                  </button>

                  <button
                    type="button"
                    disabled={isAutomating}
                    onClick={() => {
                      setDailyMode('reading');
                      setSubModeByPillar((prev) => ({ ...prev, reading: 'learn' }));
                      handleGenerateReading();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                  >
                    <span>HỌC TIẾP: ĐỌC HIỂU</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Reading Lesson Result */}
          {currentResult.type === 'reading_lesson' && dailyMode === 'reading' && (
            <div className="space-y-4">
              <ReadingLessonResultView
                result={currentResult.data}
                onGenerateAnother={() => handleGenerateReading()}
                isAutomating={isAutomating}
              />

              {/* Smart Next Step Action Bar */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-l-emerald-500 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      [ BƯỚC TIẾP THEO: TRỤ CỘT 04 ]
                    </span>
                    <p className="text-xs text-neutral-300 font-medium">
                      Đã hoàn thành bài đọc hiểu! Hãy kiểm tra trắc nghiệm đọc hoặc chuyển sang luyện nghe phản xạ.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setSubModeForCurrent('test')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 border border-amber-400 shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>TEST ĐỌC HIỂU 🎯</span>
                  </button>

                  <button
                    type="button"
                    disabled={isAutomating}
                    onClick={() => {
                      setDailyMode('listening');
                      setSubModeByPillar((prev) => ({ ...prev, listening: 'learn' }));
                      handleGenerateListening();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 shadow-md"
                  >
                    <span>HỌC TIẾP: NGHE HIỂU</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Listening Lesson Result */}
          {currentResult.type === 'listening_lesson' && dailyMode === 'listening' && (
            <div className="space-y-4">
              <ListeningLessonResultView
                result={currentResult.data}
                onGenerateAnother={() => handleGenerateListening()}
                isAutomating={isAutomating}
              />

              {/* Complete All 4 Pillars Celebration Action Card */}
              <div className="p-5 rounded-xl bg-zinc-900/80 border-l-4 border-l-amber-400 border-y border-r border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>[ HOÀN THÀNH TOÀN BỘ 4 TRỤ CỘT HÔM NAY ]</span>
                    </span>
                    <p className="text-xs text-neutral-300 font-medium mt-0.5">
                      Bạn đã hoàn tất trọn vẹn lộ trình 4 trụ cột! Hãy lưu Streak hoặc kiểm tra lại các bài đã học trong chế độ Test.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  {!isCompletedToday && (
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 border border-emerald-500 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>+1 STREAK</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubModeForCurrent('test')}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 border border-amber-400 shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>TEST NGHE HIỂU 🎯</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Vocab Result */}
          {currentResult.type === 'vocab' && dailyMode === 'vocab' && (
            <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white">{currentResult.data.term}</h4>
                  <p className="text-xs text-neutral-400 font-mono">{currentResult.data.ipa}</p>
                </div>
                <button
                  type="button"
                  onClick={() => speak(currentResult.data.term)}
                  className="p-2 rounded-lg bg-zinc-850 text-sky-400 hover:text-white transition-all duration-150 cursor-pointer border border-zinc-750"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-neutral-200">{currentResult.data.vietnameseMeaning}</p>
            </div>
          )}
        </div>
      )}

      {/* Memory Bank Modal */}
      <MemoryBankModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        onMemoryUpdated={() => setMemoryTick((k) => k + 1)}
      />
    </div>
  );
};
