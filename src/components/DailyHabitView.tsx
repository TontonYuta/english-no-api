import React, { useState, useEffect } from 'react';
import { TaskType, ChatbotProvider, Language, PipelineStep, TaskResult, VocabResult, WritingResult, QuizResult, ToeicLessonResult } from '../types';
import { ToeicLessonResultView } from './results/ToeicLessonResultView';
import {
  Flame,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  Play,
  Check,
  RotateCcw,
  Target,
  Briefcase
} from 'lucide-react';

interface DailyHabitViewProps {
  provider: ChatbotProvider;
  isAutomating: boolean;
  steps: PipelineStep[];
  currentResult: TaskResult | null;
  onRunDailyTask: (taskType: TaskType, inputData: Record<string, unknown>) => void;
  lang: Language;
  onOpenTerminal: () => void;
}

export interface DailyPhrase {
  term: string;
  context: string;
}

export interface DailyTopicCategory {
  id: string;
  label: string;
  enLabel: string;
  icon: string;
  phrases: DailyPhrase[];
}

const DAILY_TOPICS: DailyTopicCategory[] = [
  {
    id: 'daily_talk',
    label: 'Giao Tiếp Hàng Ngày',
    enLabel: 'Daily Conversation',
    icon: '💬',
    phrases: [
      { term: 'Ring a bell', context: 'Everyday friendly conversation' },
      { term: 'Under the weather', context: 'Explaining minor health issues politely' },
      { term: 'Speak of the devil', context: 'When someone appears right as you mention them' },
      { term: 'See eye to eye', context: 'Agreeing with friends or colleagues' },
      { term: 'Call it a day', context: 'Deciding to finish work or an activity' },
      { term: 'Once in a blue moon', context: 'Describing very rare events' },
      { term: 'Spill the beans', context: 'Accidentally or intentionally revealing a secret' },
      { term: 'Cut to the chase', context: 'Getting straight to the main point' },
      { term: 'Piece of cake', context: 'Describing something effortlessly simple' },
      { term: 'No hard feelings', context: 'Reconciling after a disagreement' },
    ],
  },
  {
    id: 'workplace',
    label: 'Công Sở & Email',
    enLabel: 'Workplace & Email',
    icon: '💼',
    phrases: [
      { term: 'Touch base', context: 'Professional workplace collaboration' },
      { term: 'Keep me in the loop', context: 'Asking to be kept updated on project progress' },
      { term: 'On the same page', context: 'Ensuring shared alignment and understanding' },
      { term: 'Back to the drawing board', context: 'Restarting a plan from scratch after a failure' },
      { term: 'Ball is in your court', context: 'Passing the responsibility of the next step to someone' },
      { term: 'Bring to the table', context: 'Highlighting skills, value, or resources offered' },
      { term: 'Think outside the box', context: 'Encouraging creative and unconventional problem-solving' },
      { term: 'Hit the ground running', context: 'Starting a new job or project at full speed and energy' },
      { term: 'Across the board', context: 'Applying equally to all departments or members' },
      { term: 'Raise the bar', context: 'Elevating standards of quality and performance' },
    ],
  },
  {
    id: 'social',
    label: 'Cà Phê & Đời Sống',
    enLabel: 'Coffee & Social Life',
    icon: '☕',
    phrases: [
      { term: 'Grab a bite', context: 'Casual weekend meeting with friends' },
      { term: 'My treat', context: 'Offering to pay for a friend’s meal or drink' },
      { term: 'Rain check', context: 'Politely postponing an invitation to a later date' },
      { term: 'Hit the spot', context: 'Describing delicious food or drink that satisfies cravings' },
      { term: 'Catch up', context: 'Sharing personal updates with an old friend' },
      { term: 'Chill out', context: 'Relaxing and unwinding after a stressful week' },
      { term: 'On the house', context: 'Complimentary food or drink offered by restaurant' },
      { term: 'Play it by ear', context: 'Making plans spontaneously without a rigid schedule' },
      { term: 'Down to earth', context: 'Praising a humble, friendly, unpretentious person' },
      { term: 'Wrap things up', context: 'Concluding a gathering or meeting pleasantly' },
    ],
  },
  {
    id: 'travel',
    label: 'Du Lịch & Sân Bay',
    enLabel: 'Travel & Dining',
    icon: '✈️',
    phrases: [
      { term: 'On the fly', context: 'Travel planning and itinerary changes' },
      { term: 'Travel light', context: 'Packing minimally to move easily between destinations' },
      { term: 'Off the beaten track', context: 'Exploring hidden, non-touristy local places' },
      { term: 'Hit the road', context: 'Departing on a journey or road trip' },
      { term: 'Red-eye flight', context: 'Taking an overnight flight arriving early morning' },
      { term: 'Live out of a suitcase', context: 'Staying in hotels frequently during non-stop travel' },
      { term: 'Smooth sailing', context: 'A trip or process progressing without any hiccups' },
      { term: 'Jet lag', context: 'Coping with fatigue across different time zones' },
      { term: 'Call it a night', context: 'Going to bed after an exhausting day of sightseeing' },
      { term: 'In transit', context: 'Being between flights or destinations during a layover' },
    ],
  },
  {
    id: 'reaction',
    label: 'Thành Ngữ Bản Xứ Đắt',
    enLabel: 'Native Idioms',
    icon: '💎',
    phrases: [
      { term: 'Bite the bullet', context: 'Overcoming hesitation and facing a difficult reality' },
      { term: 'Blessing in disguise', context: 'Something that seemed bad at first but turned out great' },
      { term: 'Burn the midnight oil', context: 'Working or studying tirelessly late into the night' },
      { term: 'Hit the nail on the head', context: 'Pinpointing the exact truth of a complex matter' },
      { term: 'Cut corners', context: 'Sacrificing quality or safety for fast short-term savings' },
      { term: 'The best of both worlds', context: 'Enjoying the advantages of two contrasting situations' },
      { term: 'Through thick and thin', context: 'Staying loyal and supportive through all hardships' },
      { term: 'Barking up the wrong tree', context: 'Pursuing a mistaken line of thought or blaming wrong party' },
      { term: 'Face the music', context: 'Accepting unpleasant consequences of one’s own actions' },
      { term: 'Every cloud has a silver lining', context: 'Finding optimism and hope in every difficult moment' },
    ],
  },
];

const MINI_QUIZ_TOPICS = [
  'Essential Daily Conversational Phrasing & Common Traps',
  'Collocations & Phrasal Verbs in Professional Workplace',
  'Avoiding Literal Translation Traps from Vietnamese to English',
  'Polite Indirect Questions & Diplomatic Tone in Everyday English',
  'High-Frequency Prepositional Dependencies and Idiomatic Particles',
];

const SAMPLE_QUICK_SENTENCES = [
  'I very want to improve my English speaking skill every day.',
  'Can you send me the contract as soon as possible please?',
  'Sorry for reply you late because yesterday I was very busy with works.',
  'In my opinion, I think this plan is more better than the old one.',
];

const TOEIC_TOPICS = [
  { id: 'random', label: '🎲 Ngẫu Nhiên Bất Ngờ (Surprise Me)', enLabel: '🎲 Surprise Scenario (Random)', icon: '🎲' },
  { id: 'email', label: '📧 Email Công Sở & Deadline Gấp', enLabel: '📧 Urgent Workplace Email', icon: '📧' },
  { id: 'contract', label: '🤝 Đàm Phán & Hợp Đồng Đối Tác', enLabel: '🤝 Contract & Vendor Terms', icon: '🤝' },
  { id: 'travel', label: '✈️ Lịch Trình Công Tác & Sự Cố', enLabel: '✈️ Business Travel & Itinerary', icon: '✈️' },
  { id: 'hr', label: '💼 Nhân Sự & Phỏng Vấn Tuyển Dụng', enLabel: '💼 HR, Hiring & Appraisal', icon: '💼' },
  { id: 'finance', label: '📊 Ngân Sách, Chiết Khấu & Hóa Đơn', enLabel: '📊 Budget, Invoicing & Discount', icon: '📊' },
];

export const DailyHabitView: React.FC<DailyHabitViewProps> = ({
  provider,
  isAutomating,
  steps,
  currentResult,
  onRunDailyTask,
  lang,
  onOpenTerminal,
}) => {
  // Streak state
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('playeng_streak') || '1', 10);
  });
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('playeng_last_completed') === today;
  });

  // Daily Mode sub-tab: default to 'toeic'
  const [dailyMode, setDailyMode] = useState<'toeic' | 'dose' | 'quick_fix' | 'mini_quiz'>('toeic');

  // TOEIC State
  const [selectedToeicTopic, setSelectedToeicTopic] = useState(TOEIC_TOPICS[0]);
  const handleGenerateToeicLesson = (customTopic?: string) => {
    const topicToUse = customTopic || selectedToeicTopic.label;
    onRunDailyTask('toeic_lesson', {
      topic: topicToUse.includes('Ngẫu Nhiên') || topicToUse.includes('Surprise')
        ? 'Random High-Yield Workplace TOEIC 700+ Scenario'
        : topicToUse,
    });
  };

  // Dose state
  const [selectedTopic, setSelectedTopic] = useState<DailyTopicCategory>(DAILY_TOPICS[0]);
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState<number>(0);
  const currentPhrase = selectedTopic.phrases[selectedPhraseIndex] || selectedTopic.phrases[0];

  const handleShufflePhrase = () => {
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * selectedTopic.phrases.length);
    } while (nextIdx === selectedPhraseIndex && selectedTopic.phrases.length > 1);
    setSelectedPhraseIndex(nextIdx);
  };

  const handleSelectTopic = (topic: DailyTopicCategory) => {
    setSelectedTopic(topic);
    const randomIdx = Math.floor(Math.random() * topic.phrases.length);
    setSelectedPhraseIndex(randomIdx);
  };

  // Quick-fix state
  const [userSentence, setUserSentence] = useState<string>('');

  // Audio helper
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingText(text);
      utterance.onend = () => setSpeakingText(null);
      utterance.onerror = () => setSpeakingText(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Complete goal handler
  const handleMarkCompleted = () => {
    const today = new Date().toDateString();
    const newStreak = isCompletedToday ? streak : streak + 1;
    setStreak(newStreak);
    setIsCompletedToday(true);
    localStorage.setItem('playeng_streak', newStreak.toString());
    localStorage.setItem('playeng_last_completed', today);
  };

  // Run Dose
  const handleGenerateDose = () => {
    onRunDailyTask('vocab', {
      term: currentPhrase.term,
      context: currentPhrase.context,
    });
    // Auto-advance to next phrase for variety
    const nextIdx = (selectedPhraseIndex + 1) % selectedTopic.phrases.length;
    setSelectedPhraseIndex(nextIdx);
  };

  // Run Quick-Fix
  const handleRunQuickFix = () => {
    if (!userSentence.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập câu bạn muốn sửa.' : 'Please enter a sentence to check.');
      return;
    }
    onRunDailyTask('writing', {
      topic: 'Daily Sentence Polish & Native Phrasing Check',
      targetBand: 'C1 (Natural Native)',
      essay: userSentence.trim(),
    });
  };

  // Run Mini-Quiz with rotating topics
  const [quizTopicIndex, setQuizTopicIndex] = useState(0);
  const handleRunMiniQuiz = () => {
    const topic = MINI_QUIZ_TOPICS[quizTopicIndex % MINI_QUIZ_TOPICS.length];
    onRunDailyTask('quiz', {
      topic,
      difficulty: 'B2 (Upper-Intermediate)',
    });
    setQuizTopicIndex((prev) => (prev + 1) % MINI_QUIZ_TOPICS.length);
  };

  // Find active step
  const activeStep = steps.find((s) => s.status === 'running') || steps[steps.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Streak & Motivation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white">
                {streak} {lang === 'vi' ? 'Ngày Liên Tiếp' : 'Day Streak'}
              </span>
              {isCompletedToday ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {lang === 'vi' ? 'Đã hoàn thành hôm nay' : 'Completed today'}
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                  {lang === 'vi' ? 'Mục tiêu: 5 phút hôm nay' : 'Target: 5 mins today'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {lang === 'vi'
                ? 'Học ít nhưng đều đặn mỗi ngày. AI Playwright sẽ tự động chuẩn bị bài học cho bạn!'
                : 'Consistency beats intensity. Playwright AI fetches fresh daily bite-sized lessons.'}
            </p>
          </div>
        </div>

        {/* Quick Streak Action */}
        {!isCompletedToday ? (
          <button
            type="button"
            onClick={handleMarkCompleted}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Đánh dấu hoàn thành' : 'Mark Completed'}</span>
          </button>
        ) : (
          <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5 bg-neutral-800/60 px-3 py-1.5 rounded-xl border border-neutral-700/50">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{lang === 'vi' ? 'Tuyệt vời! Quay lại vào ngày mai' : 'Awesome! See you tomorrow'}</span>
          </div>
        )}
      </div>

      {/* 4 Action Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setDailyMode('toeic')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            dailyMode === 'toeic'
              ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-950/30'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">🎯</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${dailyMode === 'toeic' ? 'bg-purple-500/20 text-purple-300 border border-purple-800' : 'bg-neutral-800 text-neutral-400'}`}>
              TOEIC 700+
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">
              {lang === 'vi' ? 'Tình Huống TOEIC 700+' : 'TOEIC 700+ Scenario'}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {lang === 'vi' ? '1-Click: AI tự động tạo bối cảnh công sở + 3 từ vựng vàng + phản xạ.' : '1-click: AI crafts real business context + 3 high-yield words.'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDailyMode('dose')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            dailyMode === 'dose'
              ? 'bg-sky-950/40 border-sky-500 text-white shadow-md shadow-sky-950/30'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">✨</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${dailyMode === 'dose' ? 'bg-sky-500/20 text-sky-300' : 'bg-neutral-800 text-neutral-400'}`}>
              3 Phút
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">
              {lang === 'vi' ? '1 Cụm Từ Hàng Ngày' : 'Daily Idiom Spark'}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {lang === 'vi' ? 'Thành ngữ giao tiếp + IPA + Âm thanh + Ví dụ thực chiến.' : '1 High-value idiom with audio, IPA, and native examples.'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDailyMode('quick_fix')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            dailyMode === 'quick_fix'
              ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-950/30'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">⚡</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${dailyMode === 'quick_fix' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-800 text-neutral-400'}`}>
              1 Phút
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">
              {lang === 'vi' ? 'Sửa Nhanh 1 Câu Của Tôi' : 'Daily Quick-Fix'}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {lang === 'vi' ? 'Gõ 1 câu bất kỳ bạn muốn nói, AI sửa lại chuẩn bản xứ.' : 'Write 1 sentence, get instant native polish and corrections.'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDailyMode('mini_quiz')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
            dailyMode === 'mini_quiz'
              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/30'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">🧪</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${dailyMode === 'mini_quiz' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-400'}`}>
              2 Phút
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">
              {lang === 'vi' ? 'Thử Thách Phản Xạ Nhanh' : 'Daily Mini Quiz'}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {lang === 'vi' ? 'Luyện 3 câu trắc nghiệm ngữ cảnh để tăng phản xạ.' : '3 quick multiple-choice questions to boost retention.'}
            </p>
          </div>
        </button>
      </div>

      {/* Mode: TOEIC 700+ Scenario Panel */}
      {dailyMode === 'toeic' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950/30 border border-neutral-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Học Tự Nhiên Không Cày Đề</span>
                </span>
                <span className="text-xs text-neutral-400">• Mục tiêu: 700+</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {lang === 'vi' ? 'Tạo Bài Học TOEIC 700+ Bằng Trí Tuệ Nhân Tạo (1-Click)' : 'AI-Generated TOEIC 700+ Scenario Lesson'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'vi'
                  ? 'Mỗi lần bấm nút, AI sẽ tự động tạo một bối cảnh công sở thực tế, bóc tách 3 từ vựng cốt lõi (Gia đình từ, Từ đồng nghĩa trong đề thi, Bẫy điểm) và 1 thử thách phản xạ nhẹ nhàng.'
                  : 'Zero test-fatigue. Every click triggers AI to craft a realistic business situation with 3 high-yield words and a quick reflex challenge.'}
              </p>
            </div>
          </div>

          {/* Theme Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300">
              {lang === 'vi' ? 'Chọn bối cảnh bạn muốn học hôm nay (hoặc để Ngẫu nhiên):' : 'Select workplace context (or keep Random):'}
            </label>
            <div className="flex flex-wrap gap-2">
              {TOEIC_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedToeicTopic(topic)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedToeicTopic.id === topic.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white border border-neutral-700/60'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{lang === 'vi' ? topic.label : topic.enLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Action Button */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>
                {lang === 'vi' ? 'Trí tuệ nhân tạo:' : 'AI Engine:'}{' '}
                <strong className="text-white">{provider.toUpperCase()} Web Automation / agy</strong>
              </span>
            </div>

            <button
              type="button"
              disabled={isAutomating}
              onClick={() => handleGenerateToeicLesson()}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                isAutomating
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:via-indigo-500 hover:to-sky-500 shadow-purple-600/30 hover:shadow-purple-500/50 hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isAutomating
                  ? (lang === 'vi' ? 'AI Đang Soạn Bài Học...' : 'AI is Crafting Lesson...')
                  : (lang === 'vi' ? '✨ Bấm Để AI Tạo Bài Học Hôm Nay (1-Click)' : '✨ Generate Today’s TOEIC Lesson')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 1: Daily Dose Panel */}
      {dailyMode === 'dose' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>✨</span>
              <span>{lang === 'vi' ? 'Chọn Chủ Đề Bạn Thích Hôm Nay:' : 'Select Today’s Vibe:'}</span>
            </h3>
            <p className="text-xs text-neutral-400">
              {lang === 'vi'
                ? 'Không cần nghĩ từ vựng phức tạp, chọn 1 chủ đề bên dưới và bấm nút là xong!'
                : 'Select a theme and click to fetch your fresh daily lesson automatically.'}
            </p>
          </div>

          {/* Topic Pills */}
          <div className="flex flex-wrap gap-2.5">
            {DAILY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTopic.id === topic.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{lang === 'vi' ? topic.label : topic.enLabel}</span>
              </button>
            ))}
          </div>

          {/* Active Phrase Card with Shuffle / Quick Pick */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  {lang === 'vi' ? 'Cụm từ được chọn cho lượt này:' : 'Selected phrase for this round:'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="text-base font-extrabold text-white">
                    "{currentPhrase.term}"
                  </h4>
                  <span className="text-xs text-neutral-400">• {currentPhrase.context}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShufflePhrase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-neutral-700"
                title={lang === 'vi' ? 'Đổi cụm từ ngẫu nhiên khác trong chủ đề này' : 'Shuffle random phrase'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'vi' ? '🎲 Đổi Cụm Từ Khác' : '🎲 Shuffle Phrase'}</span>
              </button>
            </div>

            {/* Quick Chips of all phrases in category */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block">
                {lang === 'vi' ? 'Hoặc chọn nhanh 1 cụm từ bên dưới:' : 'Or quickly choose any phrase below:'}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {selectedTopic.phrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhraseIndex(idx)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedPhraseIndex === idx
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500 font-semibold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {phrase.term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>
                {lang === 'vi' ? 'Chạy tự động ngầm qua:' : 'Automated via:'}{' '}
                <strong className="text-white">{provider.toUpperCase()} Web</strong> (Không cần API key)
              </span>
            </div>

            <button
              type="button"
              disabled={isAutomating}
              onClick={handleGenerateDose}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAutomating
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/25 hover:shadow-sky-500/40 hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isAutomating
                  ? (lang === 'vi' ? 'Đang Lấy Bài Học...' : 'Fetching Lesson...')
                  : (lang === 'vi' ? `✨ Học "${currentPhrase.term}" (1-Click)` : `✨ Learn "${currentPhrase.term}"`)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Quick-Fix Panel */}
      {dailyMode === 'quick_fix' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>⚡</span>
              <span>{lang === 'vi' ? 'Hôm Nay Bạn Muốn Nói Câu Gì Bằng Tiếng Anh?' : 'What sentence do you want to say today?'}</span>
            </h3>
            <p className="text-xs text-neutral-400">
              {lang === 'vi'
                ? 'Gõ câu tiếng Anh bất kỳ của bạn (dù chưa chắc đúng). AI sẽ sửa lại thành câu người bản xứ hay dùng nhất.'
                : 'Write any sentence you want to say. The AI will polish it into native-level English.'}
            </p>
          </div>

          <div>
            <textarea
              rows={3}
              value={userSentence}
              onChange={(e) => setUserSentence(e.target.value)}
              placeholder={lang === 'vi' ? 'Ví dụ: I very want to talk with him about this problem...' : 'Type your sentence here...'}
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {/* Quick Sample Buttons */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-neutral-500 font-medium">
                {lang === 'vi' ? 'Thử câu mẫu:' : 'Try sample:'}
              </span>
              {SAMPLE_QUICK_SENTENCES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserSentence(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer text-left truncate max-w-[260px]"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>
                {lang === 'vi' ? 'Phân tích & Viết lại tự nhiên qua:' : 'Polished via:'}{' '}
                <strong className="text-white">{provider.toUpperCase()} Web</strong>
              </span>
            </div>

            <button
              type="button"
              disabled={isAutomating || !userSentence.trim()}
              onClick={handleRunQuickFix}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAutomating || !userSentence.trim()
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
              }`}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isAutomating ? (lang === 'vi' ? 'Đang Sửa Câu...' : 'Polishing...') : (lang === 'vi' ? '⚡ Sửa Tự Nhiên Nhất' : '⚡ Polish to Native')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Mini-Quiz Panel */}
      {dailyMode === 'mini_quiz' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>🎯</span>
              <span>{lang === 'vi' ? 'Thử Thách Phản Xạ 1 Phút (3 Câu Trắc Nghiệm)' : '1-Minute Reaction Challenge (3 MCQs)'}</span>
            </h3>
            <p className="text-xs text-neutral-400">
              {lang === 'vi'
                ? 'AI sẽ tạo 3 câu trắc nghiệm thực chiến về các cụm từ giao tiếp hay gặp để bạn kiểm tra phản xạ.'
                : 'AI generates 3 real-world contextual questions to test and sharpen your daily instinct.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300">
              {lang === 'vi'
                ? 'Chủ đề hôm nay: Cụm từ bản xứ thông dụng & Cách tránh bẫy dịch từng từ (Word-by-word trap).'
                : 'Today’s theme: Common native idioms & avoiding literal translation traps.'}
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {lang === 'vi' ? 'Sinh đề thi qua:' : 'Generated via:'}{' '}
                <strong className="text-white">{provider.toUpperCase()} Web</strong>
              </span>
            </div>

            <button
              type="button"
              disabled={isAutomating}
              onClick={handleRunMiniQuiz}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAutomating
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isAutomating ? (lang === 'vi' ? 'Đang Tạo Quiz...' : 'Creating Quiz...') : (lang === 'vi' ? '🎲 Bắt Đầu Quiz Ngay' : '🎲 Start Mini Quiz')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Seamless Inline Automation Status (No popup blocking view!) */}
      {isAutomating && (
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/40 shadow-sm animate-pulse flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>🤖 {lang === 'vi' ? 'Playwright Bot đang chạy ngầm:' : 'Playwright Bot working:'}</span>
                <span className="text-sky-300">{activeStep?.label}</span>
              </div>
              <p className="text-[11px] text-neutral-400">{activeStep?.subtext}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTerminal}
            className="text-xs text-sky-400 hover:text-sky-300 underline font-mono cursor-pointer shrink-0"
          >
            {lang === 'vi' ? 'Xem nhật ký Playwright' : 'View Playwright logs'}
          </button>
        </div>
      )}

      {/* Rendered Daily Result Card */}
      {currentResult && !isAutomating && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{lang === 'vi' ? 'Kết Quả Bài Học Hôm Nay' : 'Today’s Learning Result'}</span>
            </h3>

            {!isCompletedToday && (
              <button
                type="button"
                onClick={handleMarkCompleted}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Hoàn thành bài hôm nay (+1 Streak)' : 'Complete (+1 Streak)'}</span>
              </button>
            )}
          </div>

          {/* If TOEIC Lesson Result */}
          {currentResult.type === 'toeic_lesson' && (
            <ToeicLessonResultView
              result={currentResult.data}
              onGenerateAnother={() => handleGenerateToeicLesson()}
              isAutomating={isAutomating}
            />
          )}

          {/* If Vocab Result (from Dose) */}
          {currentResult.type === 'vocab' && (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {currentResult.data.partOfSpeech || 'Phrase'}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      {currentResult.data.register || 'Natural'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {currentResult.data.term}
                  </h2>
                  <p className="text-sm font-mono text-sky-400 mt-0.5">
                    {currentResult.data.ipa}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => speak(currentResult.data.term)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    speakingText === currentResult.data.term
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700 hover:border-sky-500/50'
                  }`}
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Vietnamese Meaning & Nuances */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] uppercase font-bold text-neutral-500 block mb-1">
                  {lang === 'vi' ? 'Ý Nghĩa Cốt Lõi:' : 'Core Meaning:'}
                </span>
                <p className="text-base font-semibold text-emerald-400">
                  {currentResult.data.vietnameseMeaning}
                </p>
                {currentResult.data.nuances && (
                  <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                    {currentResult.data.nuances}
                  </p>
                )}
              </div>

              {/* Examples with Pronunciation */}
              {currentResult.data.examples && currentResult.data.examples.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider block">
                    {lang === 'vi' ? 'Ví Dụ Thực Tế Trong Giao Tiếp:' : 'Real-life Examples:'}
                  </span>
                  <div className="space-y-2.5">
                    {currentResult.data.examples.slice(0, 2).map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">"{ex.en}"</p>
                          <p className="text-xs text-neutral-400">{ex.vi}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(ex.en)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If Writing Result (from Quick-Fix) */}
          {currentResult.type === 'writing' && (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-5">
              {/* Native Rewrite Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/50 to-neutral-950 border border-indigo-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'vi' ? 'Cách Nói Tự Nhiên Chuẩn Bản Xứ:' : 'Polished Native Phrasing:'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(currentResult.data.improvedRewrite)}
                    className="p-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 transition-colors cursor-pointer"
                    title="Nghe phát âm câu sửa"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-white leading-relaxed">
                  "{currentResult.data.improvedRewrite}"
                </p>
              </div>

              {/* What was fixed */}
              {currentResult.data.corrections && currentResult.data.corrections.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider block">
                    {lang === 'vi' ? 'Điểm Cần Sửa Trong Câu Gốc:' : 'Corrections in Original:'}
                  </span>
                  {currentResult.data.corrections.map((cor, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-rose-400 line-through">"{cor.original}"</span>
                        <ArrowRight className="w-3 h-3 text-neutral-500" />
                        <span className="text-emerald-400 font-bold">"{cor.suggested}"</span>
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-mono">
                          {cor.type}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">{cor.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* If Quiz Result */}
          {currentResult.type === 'quiz' && (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider block">
                {lang === 'vi' ? '3 Câu Trắc Nghiệm Phản Xạ Nhanh:' : 'Quick Reaction Questions:'}
              </span>
              <div className="space-y-4">
                {currentResult.data.questions.slice(0, 3).map((q: any, idx: number) => {
                  const questionText = q.question || q.prompt;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {idx + 1}. {questionText}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt: any, optIdx: number) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const optText = typeof opt === 'string' ? opt : (opt?.text ?? opt);
                          const isCorrect =
                            q.correctAnswerIndex !== undefined
                              ? optIdx === q.correctAnswerIndex
                              : (opt?.key ? opt.key === q.correctAnswer : false);
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                              }`}
                            >
                              <span className="font-bold font-mono">[{letter}]</span>
                              <span>{optText}</span>
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-800/80">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
