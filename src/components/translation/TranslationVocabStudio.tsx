import React, { useState, useEffect } from 'react';
import {
  ChatbotProvider,
  DialogueDifficulty,
  CEFRLevel,
  Language,
  TranslationVocabResult,
  PipelineStep,
} from '../../types';
import {
  Sparkles,
  Zap,
  Bot,
  Key,
  Volume2,
  RotateCcw,
  BookOpen,
  Send,
  Languages,
  CheckCircle2,
  Copy,
  Check,
  Pencil,
  Trash2,
  Trophy,
  RefreshCw,
  Plus,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Columns,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  playAudioPronunciation,
  getUserAudioSettings,
} from '../../utils/speechUtils';
import { addLearnedWords } from '../../utils/learningMemory';

export interface TranslationVocabStudioProps {
  passage: string;
  setPassage: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  topic: string;
  setTopic: (val: string) => void;
  difficulty: DialogueDifficulty;
  setDifficulty: (val: DialogueDifficulty) => void;
  targetWords: Array<{ word: string; contextSentence: string }>;
  setTargetWords: React.Dispatch<React.SetStateAction<Array<{ word: string; contextSentence: string }>>>;
  userTranslation: string;
  setUserTranslation: (val: string) => void;
  userVocabGuesses: Record<string, string>;
  setUserVocabGuesses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  isAutomating: boolean;
  provider: ChatbotProvider;
  lang?: Language;
  onGeneratePassage: (level?: string, topic?: string, customTopic?: string) => void;
  isGeneratingPassage: boolean;
  referenceTranslation?: string;
  userLevel?: CEFRLevel;
  setUserLevel?: (level: CEFRLevel) => void;
  result: TranslationVocabResult | null;
  onPracticeAgain: () => void;
  setProvider?: (p: ChatbotProvider) => void;
  onOpenSettings?: () => void;
  onOpenLoginBrowser?: (provider?: 'gemini' | 'chatgpt') => void;
  steps?: PipelineStep[];
}

const TOPIC_CHIPS = [
  { id: 'tech', label: 'Công Nghệ & AI', icon: '💻' },
  { id: 'business', label: 'Kinh Doanh & Khởi Nghiệp', icon: '💼' },
  { id: 'daily', label: 'Đời Sống & Thói Quen', icon: '☕' },
  { id: 'psychology', label: 'Tâm Lý & Phát Triển', icon: '🧠' },
  { id: 'nature', label: 'Môi Trường & Đô Thị', icon: '🌿' },
  { id: 'travel', label: 'Du Lịch & Văn Hóa', icon: '✈️' },
  { id: 'food', label: 'Ẩm Thực & Sức Khỏe', icon: '🍜' },
  { id: 'science', label: 'Khoa Học & Tương Lai', icon: '🔬' },
  { id: 'arts', label: 'Nghệ Thuật & Sáng Tạo', icon: '🎨' },
];

const CEFR_LEVELS: Array<{ id: CEFRLevel; label: string; desc: string; badgeColor: string }> = [
  { id: 'A1', label: 'A1', desc: 'Khởi đầu', badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
  { id: 'A2', label: 'A2', desc: 'Cơ bản', badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  { id: 'B1', label: 'B1', desc: 'Trung cấp', badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  { id: 'B2', label: 'B2', desc: 'Nâng cao', badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  { id: 'C1', label: 'C1', desc: 'Thành thạo', badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
];

export const TranslationVocabStudio: React.FC<TranslationVocabStudioProps> = ({
  passage,
  setPassage,
  title,
  setTitle,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  targetWords,
  setTargetWords,
  userTranslation,
  setUserTranslation,
  userVocabGuesses,
  setUserVocabGuesses,
  onSubmit,
  isAutomating,
  provider,
  lang = 'vi',
  onGeneratePassage,
  isGeneratingPassage,
  referenceTranslation,
  userLevel = 'B2',
  setUserLevel,
  result,
  onPracticeAgain,
  setProvider,
  onOpenSettings,
  onOpenLoginBrowser,
  steps,
}) => {
  // Mobile tab state: 'reading' | 'translation'
  const [mobileTab, setMobileTab] = useState<'reading' | 'translation'>('reading');
  // Right column view: 'input' | 'result'
  const [rightPanelTab, setRightPanelTab] = useState<'input' | 'result'>('input');
  // Sub-tabs in result view: 'model' | 'sentences' | 'vocab' | 'advice'
  const [resultSubTab, setResultSubTab] = useState<'model' | 'sentences' | 'vocab' | 'advice'>('model');

  // Generator control panel state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedGenLevel, setSelectedGenLevel] = useState<CEFRLevel>(
    userLevel || (difficulty as CEFRLevel) || 'B1'
  );
  const [selectedGenTopic, setSelectedGenTopic] = useState<string>('daily');
  const [isCustomTopicActive, setIsCustomTopicActive] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');

  // Audio & UI states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [copiedPassage, setCopiedPassage] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);
  const [copiedUserTranslation, setCopiedUserTranslation] = useState(false);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [showCustomPassageInput, setShowCustomPassageInput] = useState(false);
  const [showSideBySideComparison, setShowSideBySideComparison] = useState(true);

  // Sync selected level when userLevel or difficulty changes
  useEffect(() => {
    if (userLevel) {
      setSelectedGenLevel(userLevel);
    } else if (difficulty) {
      setSelectedGenLevel(difficulty as CEFRLevel);
    }
  }, [userLevel, difficulty]);

  // Switch right panel to result automatically when result arrives
  useEffect(() => {
    if (result) {
      setRightPanelTab('result');
      setMobileTab('translation');
    }
  }, [result]);

  const handlePlayPassageAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }
    const cleanText = passage.replace(/[*_#`]/g, '');
    playAudioPronunciation(cleanText, { voice: 'en-US', rate: 0.95 });
    setIsPlayingAudio(true);
    const estDuration = (cleanText.split(/\s+/).length / 2.2) * 1000;
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, Math.min(estDuration, 60000));
  };

  const handlePlayVietnameseAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayWordAudio = (word: string) => {
    setPlayingWord(word);
    playAudioPronunciation(word, { voice: 'en-US', rate: 0.9 });
    setTimeout(() => {
      setPlayingWord(null);
    }, 1500);
  };

  const handleCopyPassage = () => {
    navigator.clipboard.writeText(`${title}\n\n${passage}`);
    setCopiedPassage(true);
    setTimeout(() => setCopiedPassage(false), 2000);
  };

  const handleCopyReference = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedReference(true);
    setTimeout(() => setCopiedReference(false), 2000);
  };

  const handleCopyUserTranslation = () => {
    navigator.clipboard.writeText(userTranslation);
    setCopiedUserTranslation(true);
    setTimeout(() => setCopiedUserTranslation(false), 2000);
  };

  const handleAddWordToMemory = (
    term: string,
    ipa: string,
    meaning: string,
    example: string
  ) => {
    addLearnedWords([
      {
        term,
        ipa: ipa || '',
        partOfSpeech: 'vocab',
        vietnameseMeaning: meaning,
        exampleSentence: example,
        level: (result?.cefrLevel as any) || difficulty,
      },
    ]);
    setAddedWords((prev) => ({ ...prev, [term]: true }));
  };

  const handleTriggerGenerate = () => {
    const finalCustom = isCustomTopicActive ? customTopicInput.trim() : undefined;
    onGeneratePassage(selectedGenLevel, selectedGenTopic, finalCustom);
    setIsGeneratorOpen(false);
  };

  // Word count helpers
  const passageWordCount = passage.trim() ? passage.trim().split(/\s+/).length : 0;
  const userWordCount = userTranslation.trim() ? userTranslation.trim().split(/\s+/).length : 0;
  const targetWordsCount = targetWords.length;
  const answeredVocabCount = targetWords.filter(
    (tw) => (userVocabGuesses[tw.word] || '').trim().length > 0
  ).length;

  // Resolved reference translation to display
  const effectiveRefTranslation =
    result?.translationEvaluation?.referenceTranslation || referenceTranslation || '';

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. TOP CONTROL BAR: LESSON GENERATOR & TOPIC SELECTOR     */}
      {/* ========================================================= */}
      <section className="p-3 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md backdrop-blur-sm transition-all">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left info: Quick CEFR level switcher & topic */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Level Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] font-mono font-bold text-zinc-400 px-1.5 uppercase">Cấp độ:</span>
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => {
                const isSelected = selectedGenLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedGenLevel(lvl);
                      if (setUserLevel) setUserLevel(lvl);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400/50'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                    title={`Chọn học theo cấp độ CEFR ${lvl}`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold">
              <span>Chủ đề: {topic || 'Tự do'}</span>
            </div>

            {passageWordCount > 0 && (
              <span className="text-xs font-mono text-zinc-400">
                {passageWordCount} từ • {targetWordsCount} từ vựng
              </span>
            )}
          </div>

          {/* Action button: Open / Close Lesson Generator */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                isGeneratorOpen
                  ? 'bg-zinc-800 text-sky-300 border border-sky-500/40'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPassage ? 'animate-spin' : ''}`} />
              <span>{isGeneratorOpen ? 'Đóng Bảng Tạo Bài' : '✨ Tạo Bài Học Mới'}</span>
              {isGeneratorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* EXPANDABLE GENERATOR PANEL */}
        {isGeneratorOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4 animate-fade-in">
            {/* Step 1: Select CEFR Level */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 font-bold mb-2">
                1. Chọn Cấp Độ CEFR:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CEFR_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setSelectedGenLevel(lvl.id);
                      if (setUserLevel) setUserLevel(lvl.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedGenLevel === lvl.id
                        ? `${lvl.badgeColor} bg-zinc-850 shadow-md ring-1 ring-sky-400`
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm">{lvl.label}</span>
                      {selectedGenLevel === lvl.id && <span className="text-xs font-bold">✓</span>}
                    </div>
                    <span className="text-[11px] font-sans text-zinc-400">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Topic Category */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 font-bold mb-2">
                2. Chọn Chủ Đề Bài Học:
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedGenTopic(chip.id);
                      setIsCustomTopicActive(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      !isCustomTopicActive && selectedGenTopic === chip.id
                        ? 'bg-sky-600/20 border-sky-500 text-sky-200 shadow-sm font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-850 text-zinc-300'
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}

                {/* Custom Topic Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCustomTopicActive(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCustomTopicActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <span>✍️</span>
                  <span>Chủ Đề Riêng...</span>
                </button>
              </div>

              {/* Custom Topic Input Field */}
              {isCustomTopicActive && (
                <div className="mt-3 flex items-center gap-2 animate-fade-in">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="Nhập bất kỳ chủ đề nào bạn thích (VD: Nấu món ăn Việt, Khám phá vũ trụ, Bóng đá, Lập trình...)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-amber-500/50 text-white font-sans text-xs focus:outline-none focus:border-amber-400 placeholder-zinc-500"
                  />
                  {customTopicInput && (
                    <button
                      type="button"
                      onClick={() => setCustomTopicInput('')}
                      className="p-2 text-zinc-400 hover:text-white"
                      title="Xóa chữ"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Trigger Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleTriggerGenerate}
                disabled={isGeneratingPassage || isAutomating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPassage ? 'animate-spin' : ''}`} />
                <span>{isGeneratingPassage ? 'ĐANG TẠO BÀI ĐỌC...' : '⚡ BẮT ĐẦU TẠO BÀI HỌC'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Generating Passage Live Banner */}
      {isGeneratingPassage && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-sky-950/60 to-zinc-900 border border-sky-500/40 shadow-lg space-y-1.5 animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span className="font-bold text-sky-200">
                ✨ GOOGLE GEMINI ĐANG BIÊN SOẠN BÀI ĐỌC TIẾNG ANH...
              </span>
            </div>
            <span className="text-[10px] text-sky-300 font-semibold px-2 py-0.5 rounded-full bg-sky-900/50 border border-sky-700/50">
              {difficulty} • {topic || 'Tự do'}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans">
            AI đang viết đoạn văn tự nhiên phù hợp chuẩn CEFR {difficulty}, đối chiếu bản dịch tiếng Việt và trích xuất các từ vựng trọng tâm...
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MOBILE RESPONSIVE SEGMENTED TABS (< lg)                */}
      {/* ========================================================= */}
      <div className="lg:hidden flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab('reading')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === 'reading'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Bài Đọc & Đoán Từ</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('translation')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === 'translation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>2. Bản Dịch & Kết Quả {result ? '⭐' : ''}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. CORE DUAL-PANEL GRID (LEFT: READING | RIGHT: TRANSLATE) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================== */}
        {/* CỘT TRÁI (6/12): BÀI ĐỌC & ĐOÁN TỪ VỰNG   */}
        {/* ========================================== */}
        <section
          className={`lg:col-span-6 space-y-4 ${
            mobileTab === 'reading' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Card: English Reading Passage */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-4">
            {/* Header info & tools */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bài Đọc Tiếng Anh</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  {passageWordCount} words
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Audio TTS Button */}
                <button
                  type="button"
                  onClick={handlePlayPassageAudio}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                    isPlayingAudio
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-750'
                  }`}
                  title={isPlayingAudio ? 'Dừng đọc' : 'Nghe phát âm chuẩn (TTS)'}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline text-[11px]">
                    {isPlayingAudio ? 'Dừng' : 'Nghe'}
                  </span>
                </button>

                {/* Copy Passage Button */}
                <button
                  type="button"
                  onClick={handleCopyPassage}
                  className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-750 text-xs font-mono transition-colors cursor-pointer"
                  title="Sao chép bài đọc"
                >
                  {copiedPassage ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Custom Passage Input Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCustomPassageInput(!showCustomPassageInput)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    showCustomPassageInput
                      ? 'bg-zinc-700 text-white border-zinc-600'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title="Nhập bài đọc riêng của bạn"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Passage Input Drawer */}
            {showCustomPassageInput && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5 animate-fade-in">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề bài đọc..."
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-750 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
                <textarea
                  rows={4}
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="Dán đoạn văn tiếng Anh của bạn tại đây..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-lg text-xs font-sans text-neutral-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {/* Title & Passage Content */}
            {!passage.trim() ? (
              <div className="py-8 px-4 text-center space-y-5 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
                <div className="w-12 h-12 mx-auto rounded-full bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-white font-mono">Chưa có bài đọc nào</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Chọn cấp độ CEFR và chủ đề bạn muốn luyện tập, sau đó bấm nút bên dưới để Google Gemini biên soạn bài đọc và trích xuất từ vựng tương ứng:
                  </p>
                </div>

                {/* Direct CEFR Level Selection Chips */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase text-zinc-400">
                    1. Chọn cấp độ CEFR mục tiêu:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-lg mx-auto">
                    {CEFR_LEVELS.map((lvl) => {
                      const isSelected = selectedGenLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            setSelectedGenLevel(lvl.id);
                            if (setUserLevel) setUserLevel(lvl.id);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600/30 border-sky-400 text-sky-200 ring-2 ring-sky-500/40 shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="font-mono font-black text-sm">{lvl.label}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{lvl.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Topic Selection Chips */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase text-zinc-400">
                    2. Chọn chủ đề bài học:
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
                    {TOPIC_CHIPS.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          setSelectedGenTopic(chip.id);
                          setIsCustomTopicActive(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-1 ${
                          !isCustomTopicActive && selectedGenTopic === chip.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-semibold shadow-xs'
                            : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400'
                        }`}
                      >
                        <span>{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerGenerate}
                    disabled={isGeneratingPassage}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-600/25 transition-all hover:scale-105"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingPassage ? 'animate-spin' : ''}`} />
                    <span>
                      {isGeneratingPassage
                        ? `✨ GEMINI ĐANG TẠO BÀI ĐỌC CẤP ĐỘ ${selectedGenLevel}...`
                        : `✨ TẠO BÀI ĐỌC CẤP ĐỘ ${selectedGenLevel} (GEMINI)`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white leading-snug">
                  {title}
                </h2>

                <div className="text-neutral-200 font-sans text-sm sm:text-base leading-relaxed space-y-3 select-text">
                  {passage.split(/\n\s*\n/).map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-zinc-200 leading-relaxed font-sans">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Contextual Vocabulary Guessing */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Thử Thách Đoán Từ Ngữ Cảnh</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {answeredVocabCount}/{targetWordsCount} từ
                </span>
              </div>
            </div>

            {targetWords.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center space-y-1.5 bg-zinc-950/40">
                <p className="text-xs text-zinc-400">
                  Chưa có từ vựng mục tiêu. Hãy bấm <strong className="text-amber-300">Tạo bài đọc mới</strong> để Gemini tự động trích xuất các từ vựng cốt lõi.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dựa vào câu văn trích dẫn, hãy phỏng đoán nghĩa tiếng Việt phù hợp nhất trong bối cảnh:
                </p>

                <div className="space-y-2.5">
                  {targetWords.map((tw, idx) => {
                    const guessVal = userVocabGuesses[tw.word] || '';
                    const isFilled = guessVal.trim().length > 0;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isFilled
                            ? 'bg-zinc-950/80 border-amber-500/30 ring-1 ring-amber-500/20'
                            : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-750'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-mono font-bold text-amber-300">
                              {tw.word}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayWordAudio(tw.word)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Nghe phát âm từ"
                          >
                            <Volume2
                              className={`w-3.5 h-3.5 ${
                                playingWord === tw.word ? 'animate-pulse text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {tw.contextSentence && (
                          <p className="text-xs text-zinc-400 italic font-sans mb-2 pl-2 border-l-2 border-zinc-750">
                            "{tw.contextSentence}"
                          </p>
                        )}

                        <input
                          type="text"
                          value={guessVal}
                          onChange={(e) =>
                            setUserVocabGuesses((prev) => ({
                              ...prev,
                              [tw.word]: e.target.value,
                            }))
                          }
                          placeholder={`Nghĩa của "${tw.word}" trong câu trên là gì?...`}
                          className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-sans placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* CỘT PHẢI (6/12): BẢN DỊCH & BÀI DỊCH SAU KHI LÀM XONG    */}
        {/* ========================================================= */}
        <section
          className={`lg:col-span-6 space-y-4 ${
            mobileTab === 'translation' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Card: Translation Workspace & AI Feedback */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md space-y-4">
            {/* Right Panel Sub-header: Switch between Edit vs Result */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rightPanelTab === 'input'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Bản Dịch Của Bạn ({userWordCount} từ)</span>
                </button>

                {result && (
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('result')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      rightPanelTab === 'result'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kết Quả AI ({result.overallScore}đ)</span>
                  </button>
                )}
              </div>

              {/* Clear button if editing */}
              {rightPanelTab === 'input' && (
                <button
                  type="button"
                  onClick={() => {
                    if (userTranslation.trim() && confirm('Xóa nội dung bản dịch để làm lại?')) {
                      setUserTranslation('');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  title="Xóa trắng bản dịch"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* =================================================== */}
            {/* VIEW A: TRANSLATION INPUT (KHI ĐANG LÀM BÀI)         */}
            {/* =================================================== */}
            {rightPanelTab === 'input' && (
              <div className="space-y-4 animate-fade-in">
                <textarea
                  rows={9}
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  disabled={!passage.trim() || isAutomating}
                  placeholder={
                    !passage.trim()
                      ? "Vui lòng bấm '✨ TẠO BÀI ĐỌC MỚI (GEMINI)' ở cột bên trái để bắt đầu luyện dịch..."
                      : "Dịch đoạn văn tiếng Anh sang tiếng Việt tự nhiên, thoát ý và chuẩn xác tại đây..."
                  }
                  className={`w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-sans text-sm sm:text-base leading-relaxed placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-y transition-colors ${
                    !passage.trim() ? 'opacity-60 cursor-not-allowed bg-zinc-950/50' : ''
                  }`}
                />

                {/* Model preview hint (optional peek) */}
                {effectiveRefTranslation && (
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>💡 Mẹo: Dịch thoát ý theo từng ngữ cảnh, tránh dịch thô từng chữ.</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !userTranslation.trim() ||
                          confirm('Xem trước bản dịch tham khảo sẽ giúp bạn học từ vựng, nhưng thử tự dịch trước sẽ ghi nhớ tốt hơn. Bạn có muốn xem?')
                        ) {
                          setRightPanelTab('result');
                          setResultSubTab('model');
                        }
                      }}
                      className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                    >
                      Xem bài dịch mẫu ➔
                    </button>
                  </div>
                )}

                {/* Live Automation Progress Bar (When automating) */}
                {isAutomating && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/60 via-indigo-950/50 to-zinc-900 border border-sky-500/40 shadow-lg space-y-2 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                        <span className="font-bold text-sky-200">
                          {provider === 'gemini'
                            ? '✨ GOOGLE GEMINI AI ĐANG CHẤM BÀI...'
                            : provider === 'chatgpt'
                            ? '🤖 CHATGPT ĐANG CHẤM BÀI...'
                            : '⚡ AI SIÊU TỐC ĐANG TỔNG HỢP...'}
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-900/40 border border-sky-700/50">
                        {provider === 'gemini' ? 'Google Gemini AI' : provider.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      {steps?.find((s) => s.status === 'running')?.subtext ||
                        (provider === 'gemini'
                          ? 'Đang gửi bản dịch vào Google Gemini, phân tích đối chiếu nghĩa ngữ cảnh và độ chuẩn CEFR...'
                          : 'Đang trích xuất đối chiếu câu dịch và nhận xét từng từ vựng...')}
                    </p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-400 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                )}

                {/* Submit & Engine Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  {/* Interactive Engine Switcher */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold">Động cơ:</span>
                    <div className="inline-flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setProvider && setProvider('gemini')}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          provider === 'gemini'
                            ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                        title="Dùng ✨ Google Gemini AI để chấm điểm khách quan, phân tích ngữ nghĩa sâu"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>✨ Gemini (Google AI)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider && setProvider('fast')}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          provider === 'fast'
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                        title="Dùng ⚡ AI Siêu Tốc (Offline - 0.5s tức thì)"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>⚡ Siêu Tốc</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider && setProvider('chatgpt')}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          provider === 'chatgpt'
                            ? 'bg-green-500/25 text-green-300 border border-green-400/50 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                        title="Dùng 🤖 ChatGPT Web Playwright"
                      >
                        <Bot className="w-3.5 h-3.5 text-green-400" />
                        <span>🤖 ChatGPT</span>
                      </button>
                    </div>

                    {onOpenSettings && (
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-sky-300 border border-zinc-800 transition-colors cursor-pointer"
                        title="Cài đặt khóa API hoặc cấu hình trình duyệt"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isAutomating || !passage.trim() || !userTranslation.trim()}
                    onClick={onSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5 fill-white" />
                    <span>{isAutomating ? 'ĐANG CHẤM ĐIỂM...' : '🚀 CHẤM ĐIỂM & GÓP Ý'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* =================================================== */}
            {/* VIEW B: BÀI DỊCH & KẾT QUẢ SAU KHI LÀM XONG         */}
            {/* =================================================== */}
            {rightPanelTab === 'result' && (
              <div className="space-y-4 animate-fade-in">
                {/* 1. Score Summary Banner */}
                {result && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                          result.overallScore >= 80
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : result.overallScore >= 65
                            ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                            : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        <span className="text-xl font-black font-mono leading-none">
                          {result.overallScore}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 mt-0.5">
                          Điểm
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white uppercase">
                            {result.performanceBadge}
                          </span>
                          <span className="text-xs font-mono font-bold text-sky-400">
                            CEFR {result.cefrLevel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-950/80 border border-sky-500/40 text-sky-300 flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
                            <span>{result.evaluatedBy || (provider === 'gemini' ? '✨ Google Gemini AI' : '⚡ AI Siêu Tốc')}</span>
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {result.executiveSummary}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end text-xs font-mono text-zinc-400 shrink-0">
                      <span>Dịch: <b className="text-emerald-400">{result.translationScore}đ</b></span>
                      <span>Đoán từ: <b className="text-amber-400">{result.vocabScore}đ</b></span>
                    </div>
                  </div>
                )}

                {/* 2. Sub-tab navigation */}
                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-850 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setResultSubTab('model')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      resultSubTab === 'model'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🌟 Bản Dịch Chuẩn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultSubTab('sentences')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      resultSubTab === 'sentences'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🔍 So Sánh Từng Câu ({result?.translationEvaluation?.sentenceBySentenceFeedback?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultSubTab('vocab')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      resultSubTab === 'vocab'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>💡 Đoán Từ ({result?.vocabEvaluations?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultSubTab('advice')}
                    className={`flex-1 py-1.5 px-2.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      resultSubTab === 'advice'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🎓 Góp Ý AI</span>
                  </button>
                </div>

                {/* =================================================== */}
                {/* TAB 1: BẢN DỊCH CHUẨN CỦA AI & ĐỐI CHIẾU SONG SONG  */}
                {/* =================================================== */}
                {resultSubTab === 'model' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Primary Model Translation Box */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                            <span>🌟</span>
                            <span>Bản Dịch Mẫu Tiếng Việt (Thoát Ý & Chuẩn Ngữ Cảnh)</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Speak Vietnamese TTS */}
                          <button
                            type="button"
                            onClick={() => handlePlayVietnameseAudio(effectiveRefTranslation)}
                            className="px-2 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            title="Nghe giọng đọc tiếng Việt"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nghe</span>
                          </button>

                          {/* Copy reference */}
                          <button
                            type="button"
                            onClick={() => handleCopyReference(effectiveRefTranslation)}
                            className="px-2 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedReference ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">{copiedReference ? 'Đã chép' : 'Sao chép'}</span>
                          </button>

                          {/* Toggle Side-by-Side comparison */}
                          {userTranslation.trim() && (
                            <button
                              type="button"
                              onClick={() => setShowSideBySideComparison(!showSideBySideComparison)}
                              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                                showSideBySideComparison
                                  ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                                  : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                              }`}
                              title="Bật/Tắt đối chiếu song song cùng bài dịch của bạn"
                            >
                              <Columns className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Đối chiếu</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reference Text */}
                      <div className="text-neutral-100 text-sm sm:text-base leading-relaxed space-y-2.5 font-sans">
                        {effectiveRefTranslation ? (
                          effectiveRefTranslation.split(/\n\s*\n/).map((p, i) => (
                            <p key={i} className="text-zinc-200 leading-relaxed font-sans">
                              {p}
                            </p>
                          ))
                        ) : (
                          <p className="text-zinc-400 italic">Đang cập nhật bản dịch mẫu...</p>
                        )}
                      </div>
                    </div>

                    {/* SIDE-BY-SIDE COMPARISON: YOURS VS MODEL */}
                    {showSideBySideComparison && userTranslation.trim() && (
                      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-850 space-y-2.5 animate-fade-in">
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-850">
                          <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1">
                            <Columns className="w-3.5 h-3.5" />
                            <span>Đối Chiếu Trực Tiếp: Bài Của Bạn vs Bài Dịch Mẫu</span>
                          </span>

                          <button
                            type="button"
                            onClick={handleCopyUserTranslation}
                            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedUserTranslation ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUserTranslation ? 'Đã chép bài của bạn' : 'Chép bài của bạn'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Left: User Translation */}
                          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-sky-300 block">
                              ✍️ Bản Dịch Của Bạn ({userWordCount} từ):
                            </span>
                            <div className="text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                              {userTranslation}
                            </div>
                          </div>

                          {/* Right: AI Reference */}
                          <div className="p-3 rounded-lg bg-zinc-900 border border-emerald-500/30 space-y-1.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-emerald-300 block">
                              🌟 Bản Dịch Mẫu Tham Khảo:
                            </span>
                            <div className="text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                              {effectiveRefTranslation}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================== */}
                {/* TAB 2: SO SÁNH TỪNG CÂU SONG NGỮ (SENTENCE BY SENT) */}
                {/* =================================================== */}
                {resultSubTab === 'sentences' && result && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 animate-fade-in">
                    {result.translationEvaluation.sentenceBySentenceFeedback.map((st, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-zinc-500 font-bold">
                            Câu #{st.sentenceIndex || i + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              st.status === 'good'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : st.status === 'acceptable'
                                ? 'bg-sky-500/20 text-sky-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {st.status === 'good'
                              ? 'Xuất sắc'
                              : st.status === 'acceptable'
                              ? 'Đạt ý'
                              : 'Cần sửa'}
                          </span>
                        </div>

                        {/* English original */}
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                            🇬🇧 Câu gốc tiếng Anh:
                          </span>
                          <p className="text-zinc-300 font-sans italic">{st.originalSentence}</p>
                        </div>

                        {/* User translated sentence */}
                        {st.userTranslatedSentence && (
                          <div>
                            <span className="text-[10px] font-mono text-sky-400 block uppercase">
                              ✍️ Bạn đã dịch:
                            </span>
                            <p className="text-zinc-200 font-sans">{st.userTranslatedSentence}</p>
                          </div>
                        )}

                        {/* Suggested model sentence */}
                        <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                          <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                            💡 Gợi ý chuẩn xác của AI:
                          </span>
                          <p className="text-emerald-200 font-sans font-medium">{st.suggestedSentence}</p>
                        </div>

                        {/* Pedagogical Critique */}
                        {st.critique && (
                          <p className="text-zinc-400 text-[11px] leading-relaxed pt-1">
                            💬 {st.critique}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* =================================================== */}
                {/* TAB 3: ĐOÁN TỪ NGỮ CẢNH & THÊM VÀO SỔ NHỚ           */}
                {/* =================================================== */}
                {resultSubTab === 'vocab' && result && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 animate-fade-in">
                    {result.vocabEvaluations.map((v, i) => {
                      const isAdded = addedWords[v.word];

                      return (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-300 text-sm">
                                {v.word}
                              </span>
                              <span className="font-mono text-zinc-500 text-[11px]">
                                {v.ipa}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePlayWordAudio(v.word)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleAddWordToMemory(
                                  v.word,
                                  v.ipa,
                                  v.actualMeaningInContext,
                                  v.exampleSentence
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>Đã lưu sổ nhớ</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ Sổ Nhớ</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                              <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                                Bạn đã đoán:
                              </span>
                              <p className="text-zinc-200 font-sans font-medium">
                                {v.userGuess || '(Chưa điền)'}
                              </p>
                            </div>

                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                              <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                                Nghĩa chuẩn trong ngữ cảnh:
                              </span>
                              <p className="text-emerald-200 font-sans font-bold">
                                {v.actualMeaningInContext}
                              </p>
                            </div>
                          </div>

                          {v.nuanceExplanation && (
                            <p className="text-zinc-400 text-[11px] leading-relaxed">
                              🔍 <b>Sắc thái:</b> {v.nuanceExplanation}
                            </p>
                          )}

                          {v.collocations && v.collocations.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-[10px] font-mono text-zinc-500">Cụm hay gặp:</span>
                              {v.collocations.map((col, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-sky-300"
                                >
                                  {col}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* =================================================== */}
                {/* TAB 4: GÓP Ý HỌC THUẬT & MẸO DỊCH THUẬT             */}
                {/* =================================================== */}
                {resultSubTab === 'advice' && result && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3.5 animate-fade-in text-xs">
                    {/* Strengths */}
                    {result.translationEvaluation.strengths?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Điểm Mạnh Của Bạn:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1">
                          {result.translationEvaluation.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {result.translationEvaluation.weaknesses?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                        <span className="font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Điểm Cần Chuốt Lại:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1">
                          {result.translationEvaluation.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Translation Tips */}
                    {result.objectiveAdvice?.translationTips?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                        <span className="font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Nguyên Tắc Dịch Thoát Ý:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1">
                          {result.objectiveAdvice.translationTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('input')}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>← Sửa Lại Bản Dịch & Chấm Lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGeneratorOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Luyện Bài Tiếp Theo ➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
