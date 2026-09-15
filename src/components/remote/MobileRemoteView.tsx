import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  MessageSquare,
  Send,
  MicOff,
  Globe,
  VolumeX,
  Lightbulb,
  Bot,
  User,
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
import {
  POPULAR_CHAT_SCENARIOS,
  PredefinedScenario,
  getOpeningChatMessage,
  generateContextualReply,
  getChatQuickReplies,
  detectGrammarFeedback,
} from '../../utils/chatUtils';
import { AppSettings, FlashcardItem, LearnedWord, RoleplayDialogueTurn } from '../../types';

interface MobileRemoteViewProps {
  settings: AppSettings;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  streak: number;
  onSetUserLevel: (level: 'A1' | 'A2' | 'B1' | 'B2') => void;
  onSwitchToFullApp: () => void;
}

type RemoteTab = 'chat' | 'flashcard' | 'speech' | 'habit' | 'listening';

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
  const [activeTab, setActiveTab] = useState<RemoteTab>('chat');
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

  // Mobile Live Chat state
  const [chatScenario, setChatScenario] = useState<PredefinedScenario>(POPULAR_CHAT_SCENARIOS[0]);
  const [chatMessages, setChatMessages] = useState<RoleplayDialogueTurn[]>(() => [
    getOpeningChatMessage({
      scenario: POPULAR_CHAT_SCENARIOS[0].scenario,
      userRole: POPULAR_CHAT_SCENARIOS[0].userRole,
      aiRole: POPULAR_CHAT_SCENARIOS[0].aiRole,
    }),
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [chatAutoVoice, setChatAutoVoice] = useState(true);
  const [chatShowTranslations, setChatShowTranslations] = useState(true);
  const [chatIsListening, setChatIsListening] = useState(false);
  const [chatRecognition, setChatRecognition] = useState<any>(null);
  const [chatSpeakingText, setChatSpeakingText] = useState<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setChatInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setChatIsListening(false);
        };

        recog.onerror = () => {
          setChatIsListening(false);
        };

        recog.onend = () => {
          setChatIsListening(false);
        };

        setChatRecognition(recog);
      } catch (e) {
        console.warn('Mobile Chat SpeechRecognition error:', e);
      }
    }
  }, []);

  const toggleChatListening = () => {
    if (!chatRecognition) {
      alert('Trình duyệt mobile không hỗ trợ Web Speech API hoặc chưa cấp quyền micro.');
      return;
    }
    if (chatIsListening) {
      chatRecognition.stop();
      setChatIsListening(false);
    } else {
      try {
        chatRecognition.start();
        setChatIsListening(true);
      } catch (e) {
        console.error(e);
        setChatIsListening(false);
      }
    }
  };

  const speakChatTurn = (text: string) => {
    setChatSpeakingText(text);
    playAudioPronunciation(text, {
      rate: speechSpeed,
      onStart: () => setChatSpeakingText(text),
      onEnd: () => setChatSpeakingText(null),
      onError: () => setChatSpeakingText(null),
    });
  };

  const scrollChatToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSelectMobileScenario = (scen: PredefinedScenario) => {
    setChatScenario(scen);
    const freshOpening = getOpeningChatMessage({
      scenario: scen.scenario,
      userRole: scen.userRole,
      aiRole: scen.aiRole,
    });
    setChatMessages([freshOpening]);
    setChatInput('');
    setIsChatTyping(false);
    if (chatAutoVoice && freshOpening.text) {
      speakChatTurn(freshOpening.text);
    }
  };

  const handleSendMobileChatMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || chatInput).trim();
    if (!textToSend || isChatTyping) return;

    setChatInput('');

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localGrammarFeedback = detectGrammarFeedback(textToSend);

    const userTurn: RoleplayDialogueTurn = {
      speaker: chatScenario.userRole || 'You',
      text: textToSend,
      translationVi: '',
      timestamp: formattedTime,
      isUser: true,
      grammarFeedback: localGrammarFeedback,
    };

    const updatedHistory = [...chatMessages, userTurn];
    setChatMessages(updatedHistory);
    setIsChatTyping(true);

    setTimeout(() => scrollChatToBottom('smooth'), 50);

    try {
      const res = await fetch('/api/chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: chatScenario.scenario,
          userRole: chatScenario.userRole,
          aiRole: chatScenario.aiRole,
          history: updatedHistory,
          lastUserMessage: textToSend,
          difficulty: userLevel,
        }),
      });

      if (res.ok) {
        const reply: RoleplayDialogueTurn = await res.json();
        setTimeout(() => {
          setIsChatTyping(false);
          setChatMessages((prev) => [...prev, reply]);
          setTimeout(() => scrollChatToBottom('smooth'), 80);
          if (chatAutoVoice && reply.text) {
            speakChatTurn(reply.text);
          }
        }, 900);
        return;
      }
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      const fallbackReply = generateContextualReply({
        scenario: chatScenario.scenario,
        userRole: chatScenario.userRole,
        aiRole: chatScenario.aiRole,
        history: updatedHistory,
        lastUserMessage: textToSend,
        difficulty: userLevel,
      });
      setIsChatTyping(false);
      setChatMessages((prev) => [...prev, fallbackReply]);
      setTimeout(() => scrollChatToBottom('smooth'), 80);
      if (chatAutoVoice && fallbackReply.text) {
        speakChatTurn(fallbackReply.text);
      }
    }, 900);
  };

  const lastAiTurn = [...chatMessages].reverse().find((m) => !m.isUser);
  const mobileQuickReplies = getChatQuickReplies(chatScenario.scenario, lastAiTurn?.text);

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
        {/* TAB 0: LIVE CHAT PARTNER */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in space-y-3">
            {/* Scenario Picker Carousel */}
            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kịch bản đàm thoại trực tiếp
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {POPULAR_CHAT_SCENARIOS.length} kịch bản
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                {POPULAR_CHAT_SCENARIOS.map((scen) => {
                  const isCurrent = scen.scenario === chatScenario.scenario;
                  return (
                    <button
                      key={scen.scenario}
                      type="button"
                      onClick={() => handleSelectMobileScenario(scen)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-xs'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-sm">{scen.icon}</span>
                      <span>{scen.nameVi}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario Card & Voice Control Toolbar */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{chatScenario.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">
                      {chatScenario.nameVi}
                    </h3>
                    <p className="text-[10px] text-zinc-400 truncate">
                      Bạn: <span className="text-sky-300 font-medium">{chatScenario.userRole}</span> • Đối tác:{' '}
                      <span className="text-emerald-300 font-medium">{chatScenario.aiRole}</span>
                    </p>
                  </div>
                </div>

                {/* Quick actions: Sound, Translation, Reset */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChatAutoVoice((v) => !v)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      chatAutoVoice
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800/80 text-zinc-500 border-zinc-700'
                    }`}
                    title={chatAutoVoice ? 'Tắt đọc tự động' : 'Bật đọc tự động'}
                  >
                    {chatAutoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatShowTranslations((v) => !v)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      chatShowTranslations
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        : 'bg-zinc-800/80 text-zinc-500 border-zinc-700'
                    }`}
                    title={chatShowTranslations ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectMobileScenario(chatScenario)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
                    title="Bắt đầu lại cuộc hội thoại"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listening Waveform Banner */}
            {chatIsListening && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 flex items-center justify-between text-rose-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-semibold">
                    Đang lắng nghe giọng nói của bạn... Hãy nói tiếng Anh!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleChatListening}
                  className="text-xs font-bold text-rose-400 underline hover:text-rose-200 cursor-pointer"
                >
                  Dừng
                </button>
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 min-h-[320px] max-h-[50vh] overflow-y-auto space-y-3.5 shadow-inner">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.isUser;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white'
                          : 'bg-zinc-800 border border-zinc-700 text-emerald-400'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-none'
                          : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/70 rounded-tl-none'
                      }`}
                    >
                      {/* Speaker header */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-bold text-[10px] uppercase tracking-wider ${
                            isUser ? 'text-sky-200' : 'text-emerald-400'
                          }`}
                        >
                          {msg.speaker}
                        </span>
                        {msg.timestamp && (
                          <span
                            className={`text-[9px] font-mono ${
                              isUser ? 'text-sky-300/80' : 'text-zinc-500'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        )}
                      </div>

                      {/* English Text & Audio button */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{msg.text}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speakChatTurn(msg.text)}
                            className="text-zinc-400 hover:text-sky-300 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2
                              className={`w-3.5 h-3.5 ${
                                chatSpeakingText === msg.text ? 'text-sky-400 animate-pulse' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Translation */}
                      {chatShowTranslations && msg.translationVi && (
                        <p className="mt-1.5 pt-1.5 border-t border-zinc-700/50 text-[11px] text-zinc-400 italic">
                          {msg.translationVi}
                        </p>
                      )}

                      {/* Grammar Feedback */}
                      {msg.grammarFeedback && (
                        <div className="mt-2 p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-[10px] text-amber-200 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold text-amber-300">
                            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Gợi ý ngữ pháp:</span>
                          </div>
                          <p className="leading-snug">{msg.grammarFeedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing animation */}
              {isChatTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-zinc-800/80 border border-zinc-700/70 rounded-2xl rounded-tl-none px-3 py-2 text-zinc-400 text-xs flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-zinc-400 ml-1">Đang soạn câu trả lời...</span>
                  </div>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Suggestions Carousel */}
            {mobileQuickReplies.length > 0 && !isChatTyping && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1 px-1">
                  <Lightbulb className="w-3 h-3 text-amber-400" /> Gợi ý phản xạ nhanh:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {mobileQuickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMobileChatMessage(qr)}
                      className="shrink-0 text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white hover:border-sky-500/50 hover:bg-sky-950/40 transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input & Mic Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMobileChatMessage();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <button
                type="button"
                onClick={toggleChatListening}
                className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  chatIsListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400/50 shadow-md'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-750 hover:text-white hover:border-zinc-600'
                }`}
                title={chatIsListening ? 'Đang nghe... Bấm để dừng' : 'Chạm để nói tiếng Anh'}
              >
                {chatIsListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập hoặc chạm micro nói tiếng Anh..."
                className="flex-1 bg-zinc-900 text-white text-xs border border-zinc-750 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 placeholder:text-zinc-500"
              />

              <button
                type="submit"
                disabled={!chatInput.trim() || isChatTyping}
                className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

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
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'text-sky-400 bg-sky-950/60 border border-sky-800/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Chat Live</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flashcard')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'flashcard'
                ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 shadow-xs'
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
