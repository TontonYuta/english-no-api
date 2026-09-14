import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Layers,
  Mic,
  CalendarCheck,
  Headphones,
  Flame,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Target,
  Brain,
  Award,
  Play,
  Check,
} from 'lucide-react';
import { FlashcardDeckView } from '../flashcard/FlashcardDeckView';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';
import { playAudioPronunciation } from '../../utils/speechUtils';
import {
  getLearnedWords,
  getLearnedGrammar,
  getLearnedReadings,
  getLearnedListenings,
} from '../../utils/learningMemory';
import { AppSettings, FlashcardItem, LearnedWord } from '../../types';

interface MobileRemoteViewProps {
  settings: AppSettings;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  streak: number;
  onSetUserLevel: (level: 'A1' | 'A2' | 'B1' | 'B2') => void;
  onSwitchToFullApp: () => void;
}

type RemoteTab = 'flashcard' | 'speech' | 'habit' | 'listening';

// Starter words if user hasn't learned any word yet
const STARTER_WORDS: Record<'A1' | 'A2' | 'B1' | 'B2', FlashcardItem[]> = {
  A1: [
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
      term: 'Schedule',
      ipa: '/ˈskedʒ.uːl/',
      vietnamesePhonetic: 'xke-giun',
      partOfSpeech: 'noun / verb',
      vietnameseMeaning: 'lịch trình, thời gian biểu',
      exampleSentence: 'Let us check the weekly schedule.',
      exampleTranslation: 'Hãy cùng kiểm tra lịch trình hàng tuần.',
      mastered: false,
    },
    {
      term: 'Confirm',
      ipa: '/kənˈfɜːrm/',
      vietnamesePhonetic: 'cơn-phơm',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'xác nhận, khẳng định',
      exampleSentence: 'Please confirm your arrival time.',
      exampleTranslation: 'Vui lòng xác nhận giờ đến của bạn.',
      mastered: false,
    },
    {
      term: 'Colleague',
      ipa: '/ˈkɑː.liːɡ/',
      vietnamesePhonetic: 'co-ly-g',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'đồng nghiệp',
      exampleSentence: 'She is my favorite colleague.',
      exampleTranslation: 'Cô ấy là người đồng nghiệp tôi quý nhất.',
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
      exampleSentence: 'Both teams collaborate on the marketing campaign.',
      exampleTranslation: 'Cả hai đội hợp tác thực hiện chiến dịch tiếp thị.',
      mastered: false,
    },
    {
      term: 'Deadline',
      ipa: '/ˈded.laɪn/',
      vietnamesePhonetic: 'đét-lai-n',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'hạn chót, thời hạn hoàn thành',
      exampleSentence: 'The project deadline is this Friday afternoon.',
      exampleTranslation: 'Hạn chót dự án là chiều thứ Sáu tuần này.',
      mastered: false,
    },
    {
      term: 'Efficient',
      ipa: '/ɪˈfɪʃ.ənt/',
      vietnamesePhonetic: 'i-phi-sừn-t',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'hiệu quả, năng suất cao',
      exampleSentence: 'We use an efficient method to handle customer requests.',
      exampleTranslation: 'Chúng tôi dùng phương pháp hiệu quả để xử lý yêu cầu khách hàng.',
      mastered: false,
    },
  ],
  B1: [
    {
      term: 'Negotiate',
      ipa: '/nəˈɡoʊ.ʃi.eɪt/',
      vietnamesePhonetic: 'nơ-gâu-xi-ây-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'đàm phán, thương lượng',
      exampleSentence: 'They negotiate the terms before signing the contract.',
      exampleTranslation: 'Họ đàm phán các điều khoản trước khi ký hợp đồng.',
      mastered: false,
    },
    {
      term: 'Implement',
      ipa: '/ˈɪm.plə.ment/',
      vietnamesePhonetic: 'im-plơ-mừn-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'triển khai, thi hành',
      exampleSentence: 'We will implement the new software next month.',
      exampleTranslation: 'Chúng tôi sẽ triển khai phần mềm mới vào tháng tới.',
      mastered: false,
    },
    {
      term: 'Comprehensive',
      ipa: '/ˌkɑːm.prəˈhen.sɪv/',
      vietnamesePhonetic: 'com-prơ-hen-síp',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'toàn diện, bao quát',
      exampleSentence: 'The company provides comprehensive training for all employees.',
      exampleTranslation: 'Công ty cung cấp khóa đào tạo toàn diện cho toàn bộ nhân viên.',
      mastered: false,
    },
  ],
  B2: [
    {
      term: 'Substantiate',
      ipa: '/səbˈstæn.ʃi.eɪt/',
      vietnamesePhonetic: 'xớp-x-ten-si-ây-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'chứng minh, cung cấp bằng chứng xác thực',
      exampleSentence: 'The auditor requested documentation to substantiate the expenses.',
      exampleTranslation: 'Kiểm toán viên yêu cầu chứng từ để xác thực các khoản chi phí.',
      mastered: false,
    },
    {
      term: 'Discrepancy',
      ipa: '/dɪˈskrep.ən.si/',
      vietnamesePhonetic: 'đít-x-cre-pừn-xi',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'sự sai lệch, điểm không khớp nhau',
      exampleSentence: 'There was a noticeable discrepancy between the budget and actual costs.',
      exampleTranslation: 'Có một sự sai lệch đáng kể giữa ngân sách dự toán và chi phí thực tế.',
      mastered: false,
    },
    {
      term: 'Prerequisite',
      ipa: '/ˌpriːˈrek.wə.zɪt/',
      vietnamesePhonetic: 'pri-re-kwi-zịt',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'điều kiện tiên quyết',
      exampleSentence: 'English proficiency is a vital prerequisite for this international role.',
      exampleTranslation: 'Khả năng tiếng Anh lưu loát là điều kiện tiên quyết cho vị trí quốc tế này.',
      mastered: false,
    },
  ],
};

const SAMPLE_SPEECH_PROMPTS: Record<'A1' | 'A2' | 'B1' | 'B2', string[]> = {
  A1: [
    'Good morning, where can I find the meeting room?',
    'I would like to order a black coffee, please.',
    'Could you please tell me what time the flight departs?',
  ],
  A2: [
    'Could you please confirm the delivery schedule for next Monday?',
    'I have attached the updated invoice for your review.',
    'Our team will finish the presentation before noon.',
  ],
  B1: [
    'We need to streamline our workflow to meet the tight deadline.',
    'Please review the attached contract and let me know your thoughts.',
    'Could we reschedule the quarterly review to next Wednesday?',
  ],
  B2: [
    'The executive committee negotiated the contractual terms thoroughly.',
    'We conducted a comprehensive audit to eliminate operational bottlenecks.',
    'The proposed strategy substantially mitigates foreign exchange risks.',
  ],
};

const SAMPLE_LISTENING_DIALOGUE = [
  {
    speaker: 'Alex (Project Manager)',
    text: 'Hi Sarah, did you have a chance to review the quarterly milestone report?',
    translationVi: 'Chào Sarah, bạn đã có thời gian xem qua báo cáo cột mốc quý chưa?',
  },
  {
    speaker: 'Sarah (Lead Engineer)',
    text: 'Yes Alex, everything looks solid. We just need to finalize the deployment timeline.',
    translationVi: 'Rồi Alex, mọi thứ nhìn rất ổn. Chúng ta chỉ cần chốt lịch triển khai.',
  },
  {
    speaker: 'Alex (Project Manager)',
    text: 'Great! Let us schedule a brief alignment call with the client this afternoon.',
    translationVi: 'Tuyệt vời! Hãy hẹn một cuộc họp ngắn với khách hàng vào chiều nay nhé.',
  },
  {
    speaker: 'Sarah (Lead Engineer)',
    text: 'Sounds perfect. I will prepare the presentation slides right now.',
    translationVi: 'Rất hợp lý. Tôi sẽ chuẩn bị slide thuyết trình ngay bây giờ.',
  },
];

export const MobileRemoteView: React.FC<MobileRemoteViewProps> = ({
  settings,
  userLevel,
  streak,
  onSetUserLevel,
  onSwitchToFullApp,
}) => {
  const [activeTab, setActiveTab] = useState<RemoteTab>('flashcard');
  const [isSecureTunnel, setIsSecureTunnel] = useState(false);
  const [memoryTick, setMemoryTick] = useState(0);
  const [selectedSpeechIndex, setSelectedSpeechIndex] = useState(0);
  const [showTranslations, setShowTranslations] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  useEffect(() => {
    if (window.location.hostname.includes('trycloudflare.com')) {
      setIsSecureTunnel(true);
    }
  }, []);

  // Safe load of learned items
  const learnedWords = useMemo(() => getLearnedWords(), [memoryTick]);
  const learnedGrammar = useMemo(() => getLearnedGrammar(), [memoryTick]);
  const learnedReadings = useMemo(() => getLearnedReadings(), [memoryTick]);
  const learnedListenings = useMemo(() => getLearnedListenings(), [memoryTick]);

  // Construct flashcard deck
  const flashcardItems = useMemo<FlashcardItem[]>(() => {
    if (learnedWords.length > 0) {
      return learnedWords.map((w) => ({
        id: w.id,
        term: w.term,
        ipa: w.ipa,
        vietnamesePhonetic: w.vietnamesePhonetic,
        partOfSpeech: w.partOfSpeech,
        vietnameseMeaning: w.vietnameseMeaning,
        wordFamilyDetails: w.wordFamilyDetails,
        exampleSentence: w.exampleSentence,
        exampleTranslation: w.exampleTranslation,
        mastered: w.mastered,
        level: w.level || userLevel,
        reviewCount: w.reviewCount,
      }));
    }
    return STARTER_WORDS[userLevel] || STARTER_WORDS.A1;
  }, [learnedWords, userLevel]);

  const levelOptions: Array<'A1' | 'A2' | 'B1' | 'B2'> = ['A1', 'A2', 'B1', 'B2'];
  const speechPrompts = SAMPLE_SPEECH_PROMPTS[userLevel] || SAMPLE_SPEECH_PROMPTS.A1;
  const currentSpeechPrompt = speechPrompts[selectedSpeechIndex] || speechPrompts[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-sky-500/30 font-sans pb-24">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-850 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-tight text-white">
                PlayEng Mobile
              </span>
              {isSecureTunnel ? (
                <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-1.5 py-0.5 rounded-full">
                  ⚡ 4G/5G Tunnel
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800 px-1.5 py-0.5 rounded-full">
                  📶 Wi-Fi LAN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level & Streak Indicators */}
        <div className="flex items-center gap-2">
          {/* Level Picker */}
          <select
            value={userLevel}
            onChange={(e) => onSetUserLevel(e.target.value as any)}
            aria-label="Chọn cấp độ CEFR"
            className="text-[11px] font-mono font-bold bg-zinc-900 text-sky-300 border border-zinc-750 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {levelOptions.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Streak pill */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-300 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}d</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 sm:p-4 space-y-4">
        {/* TAB 1: FLASHCARD POCKET */}
        {activeTab === 'flashcard' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white">Thẻ Nhớ Leitner Spaced Repetition</h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {flashcardItems.length} thẻ • Level {userLevel}
              </span>
            </div>

            <FlashcardDeckView
              items={flashcardItems}
              title={`BỘ THẺ FLASHCARD DI ĐỘNG (${flashcardItems.length} THẺ)`}
              onWordMastered={() => setMemoryTick((t) => t + 1)}
              onDeckCompleted={() => setMemoryTick((t) => t + 1)}
              lang={settings.language}
            />
          </div>
        )}

        {/* TAB 2: SPEECH PRONUNCIATION */}
        {activeTab === 'speech' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Luyện Nói & Phản Xạ Âm Thanh</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                Level {userLevel}
              </span>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
              {/* Phrase Carousel Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Chọn câu luyện nói ({selectedSpeechIndex + 1}/{speechPrompts.length}):
                  </span>
                  <div className="flex items-center gap-1">
                    {speechPrompts.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSpeechIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          selectedSpeechIndex === idx ? 'bg-emerald-400 scale-125' : 'bg-zinc-700'
                        }`}
                        title={`Câu ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    "{currentSpeechPrompt}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpeechIndex((prev) => (prev + 1) % speechPrompts.length);
                      }}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đổi câu khác</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playAudioPronunciation(currentSpeechPrompt, {
                          voice: settings.speechVoice,
                          rate: settings.speechRate,
                        });
                      }}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-sky-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe mẫu</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Speech Evaluator Component */}
              <div className="pt-2 border-t border-zinc-800">
                <UserSpeechEvaluator
                  scenario="Everyday Communication"
                  userRole="Speaker"
                  aiRole="Coach"
                  targetDifficulty={userLevel}
                  lang={settings.language}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY HABIT ROUTINE */}
        {activeTab === 'habit' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Thói Quen 5 Trụ Cột Hàng Ngày</h2>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/80">
                🔥 {streak} ngày
              </span>
            </div>

            {/* Pillar Status Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">1. Từ Vựng & Flashcard</h3>
                    <p className="text-[11px] text-zinc-400">
                      Đã lưu: <strong className="text-sky-300 font-mono">{learnedWords.length}</strong> từ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('flashcard')}
                  className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900 text-sky-300 rounded-lg text-xs font-mono font-bold border border-sky-800/80 transition-colors cursor-pointer"
                >
                  Lật thẻ
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">2. Ngữ Pháp Trọng Tâm</h3>
                    <p className="text-[11px] text-zinc-400">
                      Đã lưu: <strong className="text-indigo-300 font-mono">{learnedGrammar.length}</strong> điểm ngữ pháp
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToFullApp}
                  className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 rounded-lg text-xs font-mono font-bold border border-indigo-800/80 transition-colors cursor-pointer"
                >
                  Luyện tập
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">3. Bài Đọc Hiểu Mini</h3>
                    <p className="text-[11px] text-zinc-400">
                      Đã lưu: <strong className="text-amber-300 font-mono">{learnedReadings.length}</strong> bài đọc
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToFullApp}
                  className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 rounded-lg text-xs font-mono font-bold border border-amber-800/80 transition-colors cursor-pointer"
                >
                  Luyện đọc
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">4. Bài Nghe Hội Thoại</h3>
                    <p className="text-[11px] text-zinc-400">
                      Đã lưu: <strong className="text-purple-300 font-mono">{learnedListenings.length}</strong> bài nghe
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('listening')}
                  className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-300 rounded-lg text-xs font-mono font-bold border border-purple-800/80 transition-colors cursor-pointer"
                >
                  Nghe ngay
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">5. Thử Thách Phản Xạ TOEIC</h3>
                    <p className="text-[11px] text-zinc-400">Trắc nghiệm nhanh củng cố phản xạ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToFullApp}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-800/80 transition-colors cursor-pointer"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LISTENING PLAYER */}
        {activeTab === 'listening' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Phòng Nghe Audio & Đối Thoại</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {[0.8, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeechSpeed(spd)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      speechSpeed === spd
                        ? 'bg-purple-950 border-purple-500 text-purple-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-purple-300">
                  🎧 Hội thoại công sở mẫu ({userLevel})
                </span>
                <button
                  type="button"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showTranslations ? 'Ẩn dịch' : 'Hiện dịch tiếng Việt'}
                </button>
              </div>

              {/* Dialogue Bubbles */}
              <div className="space-y-3">
                {SAMPLE_LISTENING_DIALOGUE.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      idx % 2 === 0
                        ? 'bg-zinc-950/90 border-sky-900/40 text-left'
                        : 'bg-zinc-950/90 border-purple-900/40 text-left'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          idx % 2 === 0 ? 'text-sky-400' : 'text-purple-400'
                        }`}
                      >
                        {line.speaker}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playAudioPronunciation(line.text, {
                            rate: speechSpeed,
                            voice: idx % 2 === 0 ? 'en-US' : 'en-GB',
                          });
                        }}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-white font-medium leading-relaxed">{line.text}</p>
                    {showTranslations && (
                      <p className="text-zinc-400 text-[11px] leading-relaxed pt-0.5">
                        {line.translationVi}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Play All Button */}
              <button
                type="button"
                onClick={() => {
                  const fullText = SAMPLE_LISTENING_DIALOGUE.map((d) => d.text).join(' ');
                  playAudioPronunciation(fullText, {
                    rate: speechSpeed,
                    voice: settings.speechVoice,
                  });
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Phát Toàn Bộ Đoạn Hội Thoại</span>
              </button>
            </div>
          </div>
        )}

        {/* Switch to Full App Link Footer */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onSwitchToFullApp}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-sky-300 py-2 px-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-all cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Giao Diện Đầy Đủ (Desktop Mode)</span>
          </button>
        </div>
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 px-2 py-1.5 shadow-2xl">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('flashcard')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'flashcard'
                ? 'text-sky-400 bg-sky-950/60 border border-sky-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>Flashcard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('speech')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'speech'
                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic className="w-5 h-5 mb-0.5" />
            <span>Luyện Nói</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habit')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'habit'
                ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span>Thói Quen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listening')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'listening'
                ? 'text-purple-400 bg-purple-950/60 border border-purple-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Headphones className="w-5 h-5 mb-0.5" />
            <span>Luyện Nghe</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
