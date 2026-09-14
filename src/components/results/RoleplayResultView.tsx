import React, { useState, useEffect, useRef } from 'react';
import { RoleplayResult, RoleplayDialogueTurn, Language } from '../../types';
import {
  MessageSquare,
  Volume2,
  Globe,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Mic,
  MicOff,
  Send,
  RotateCcw,
  CheckCheck,
  Shield,
  HelpCircle,
  Lightbulb,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';
import { playAudioPronunciation } from '../../utils/speechUtils';
import {
  generateContextualReply,
  getChatQuickReplies,
  getOpeningChatMessage,
  detectGrammarFeedback,
} from '../../utils/chatUtils';

interface RoleplayResultViewProps {
  result: RoleplayResult;
  lang?: Language;
}

export const RoleplayResultView: React.FC<RoleplayResultViewProps> = ({
  result,
  lang = 'vi',
}) => {
  const isVi = lang === 'vi';

  // Chat conversation state - starts with authentic live opening turn from partner
  const [messages, setMessages] = useState<RoleplayDialogueTurn[]>(() => {
    const openingTurn = getOpeningChatMessage({
      scenario: result.scenario,
      userRole: result.userRole,
      aiRole: result.aiRole,
      dialogue: result.dialogue,
    });
    return [openingTurn];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [autoVoice, setAutoVoice] = useState(true);
  const [copied, setCopied] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'script' | 'vocab' | 'tips' | 'speaking'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    if (isPartnerTyping || messages.length > 1) {
      scrollToBottom('smooth');
    }
  }, [isPartnerTyping, messages.length]);

  // Speech Recognition setup for live voice messaging
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
            setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      } catch (e) {
        console.warn('SpeechRecognition setup error:', e);
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert(isVi ? 'Trình duyệt không hỗ trợ nhận diện giọng nói Web Speech API.' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    setSpeakingText(text);
    playAudioPronunciation(text, {
      rate: 0.95,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  const handleCopyScript = () => {
    const text =
      `Scenario: ${result.scenario}\n` +
      `User (${result.userRole}) & Partner (${result.aiRole})\n\n` +
      messages
        .map((d) => `[${d.speaker}]: ${d.text}\n(${d.translationVi || ''})\n`)
        .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetChat = () => {
    const freshOpening = getOpeningChatMessage({
      scenario: result.scenario,
      userRole: result.userRole,
      aiRole: result.aiRole,
      dialogue: result.dialogue,
    });
    setMessages([freshOpening]);
    setIsPartnerTyping(false);
    setInputMessage('');
  };

  // Live direct chat sender: sends user sentence, triggers typing status, awaits bot reply
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputMessage).trim();
    if (!textToSend || isPartnerTyping) return;

    setInputMessage('');

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check for grammar feedback on user utterance
    const localGrammarFeedback = detectGrammarFeedback(textToSend);

    const userTurn: RoleplayDialogueTurn = {
      speaker: result.userRole || 'You',
      text: textToSend,
      translationVi: '',
      timestamp: formattedTime,
      isUser: true,
      grammarFeedback: localGrammarFeedback,
    };

    const updatedHistory = [...messages, userTurn];
    setMessages(updatedHistory);
    setIsPartnerTyping(true);

    setTimeout(() => scrollToBottom('smooth'), 50);

    try {
      // Call backend endpoint /api/chat-reply
      const res = await fetch('/api/chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: result.scenario,
          userRole: result.userRole,
          aiRole: result.aiRole,
          history: updatedHistory,
          lastUserMessage: textToSend,
          difficulty: result.difficulty || 'B2',
        }),
      });

      if (res.ok) {
        const reply: RoleplayDialogueTurn = await res.json();
        // Natural typing pause (1.2s)
        setTimeout(() => {
          setIsPartnerTyping(false);
          setMessages((prev) => [...prev, reply]);
          setTimeout(() => scrollToBottom('smooth'), 80);

          // Auto-play partner voice if toggle enabled
          if (autoVoice && reply.text) {
            speakText(reply.text);
          }
        }, 1200);
        return;
      }
    } catch {
      // Graceful local fallback
    }

    // Local realistic typing fallback
    setTimeout(() => {
      const fallbackReply = generateContextualReply({
        scenario: result.scenario,
        userRole: result.userRole,
        aiRole: result.aiRole,
        history: updatedHistory,
        lastUserMessage: textToSend,
        difficulty: result.difficulty || 'B2',
      });

      setIsPartnerTyping(false);
      setMessages((prev) => [...prev, fallbackReply]);
      setTimeout(() => scrollToBottom('smooth'), 80);

      if (autoVoice && fallbackReply.text) {
        speakText(fallbackReply.text);
      }
    }, 1300);
  };

  const quickReplies = getChatQuickReplies(result.scenario, result.aiRole);

  const checkIsUser = (turn: RoleplayDialogueTurn) => {
    if (turn.isUser !== undefined) return turn.isUser;
    const speakerLower = (turn.speaker || '').toLowerCase();
    const userRoleLower = (result.userRole || '').toLowerCase();
    return (
      speakerLower.includes(userRoleLower) ||
      speakerLower.includes('you') ||
      speakerLower.includes('bạn') ||
      speakerLower.includes('student') ||
      speakerLower.includes('passenger') ||
      speakerLower.includes('guest') ||
      speakerLower.includes('candidate')
    );
  };

  return (
    <div className="space-y-6">
      {/* Messenger Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
            activeTab === 'chat'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850'
          }`}
        >
          💬 {isVi ? 'Hội Thoại Trực Tiếp (Live)' : 'Live Interactive Chat'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
            activeTab === 'script'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850'
          }`}
        >
          📜 {isVi ? 'Kịch Bản Mẫu Toàn Bài' : 'Sample Script'} ({result.dialogue?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vocab')}
          className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
            activeTab === 'vocab'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850'
          }`}
        >
          📖 {isVi ? 'Từ Vựng & Cụm Diễn Đạt' : 'Key Vocabulary'} ({result.keyVocabulary?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
            activeTab === 'tips'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850'
          }`}
        >
          🌍 {isVi ? 'Mẹo Văn Hóa & Lịch Sự' : 'Pragmatic Tips'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('speaking')}
          className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
            activeTab === 'speaking'
              ? 'bg-sky-950 text-sky-300 border border-sky-800'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850'
          }`}
        >
          🎙️ {isVi ? 'Chấm Điểm Phát Âm CEFR' : 'CEFR Speech Coach'}
        </button>
      </div>

      {/* Main Tab: Live Interactive Chat Mode */}
      {activeTab === 'chat' && (
        <div className="rounded-none bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col animate-fade-in">
          {/* Messenger Header Bar */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-neutral-900/95 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {/* Partner Avatar with Live Online Indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-none bg-gradient-to-br from-purple-800 to-indigo-950 border border-purple-600/60 flex items-center justify-center text-purple-200 font-mono font-black text-sm shadow-inner">
                  {result.aiRole.charAt(0).toUpperCase()}
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-none bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-neutral-950"
                  title="Đang trực tuyến / Online"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
                    {result.aiRole}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                    [{isVi ? 'ĐỐI TÁC TRỰC TIẾP' : 'LIVE PARTNER'}]
                  </span>
                  {result.difficulty && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-neutral-800 text-neutral-300 border border-neutral-700">
                      CEFR: {result.difficulty}
                    </span>
                  )}
                </div>

                {/* Real-time typing status in header */}
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono">
                  {isPartnerTyping ? (
                    <span className="text-sky-400 font-semibold flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      <span>{isVi ? 'Đang soạn câu trả lời...' : 'Typing a message...'}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-neutral-400">{isVi ? 'Đang sẵn sàng trò chuyện' : 'Active now'}</span>
                    </span>
                  )}
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400 truncate max-w-[200px] sm:max-w-[320px]">
                    {result.scenario}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
              {/* Auto Voice Toggle */}
              <button
                type="button"
                onClick={() => setAutoVoice(!autoVoice)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-mono font-bold border transition-colors cursor-pointer uppercase ${
                  autoVoice
                    ? 'bg-purple-950/80 border-purple-700 text-purple-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                title={isVi ? 'Tự động đọc to tin nhắn mới của đối tác' : 'Auto speak partner messages'}
              >
                {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{autoVoice ? (isVi ? 'TỰ ĐỌC: BẬT' : 'VOICE: ON') : (isVi ? 'TỰ ĐỌC: TẮT' : 'VOICE: OFF')}</span>
              </button>

              {/* Translation Toggle */}
              <button
                type="button"
                onClick={() => setShowTranslations(!showTranslations)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-mono font-bold border transition-colors cursor-pointer uppercase ${
                  showTranslations
                    ? 'bg-sky-950/80 border-sky-700 text-sky-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                title={isVi ? 'Bật/Tắt dịch tiếng Việt' : 'Toggle translation'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showTranslations ? (isVi ? 'DỊCH: BẬT' : 'VI: ON') : (isVi ? 'DỊCH: TẮT' : 'VI: OFF')}</span>
              </button>

              {/* Copy chat */}
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-mono font-bold uppercase bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title={isVi ? 'Sao chép toàn bộ tin nhắn' : 'Copy chat transcript'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isVi ? 'ĐÃ LƯU' : 'COPIED') : (isVi ? 'SAO CHÉP' : 'COPY')}</span>
              </button>

              {/* Reset Chat */}
              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-none text-xs font-mono font-bold uppercase bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={isVi ? 'Bắt đầu lại cuộc trò chuyện từ đầu' : 'Reset chat to beginning'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'BẮT ĐẦU LẠI' : 'RESET'}</span>
              </button>
            </div>
          </div>

          {/* Messenger Chat Area (Scrollable Message Stream) */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[580px] min-h-[380px] overflow-y-auto bg-neutral-950/70 border-b border-neutral-800">
            {/* Day Separator Pill */}
            <div className="flex items-center justify-center my-2">
              <span className="px-3 py-1 rounded-none bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                ── {isVi ? 'Hội thoại trực tiếp 2 chiều • Mỗi câu gửi lên chatbot' : 'Live 2-Way Direct Conversation'} ──
              </span>
            </div>

            {/* Scenario Context Card in Chat */}
            <div className="p-3 bg-neutral-900/60 border-l-2 border-l-purple-500 border-y border-r border-neutral-800/80 text-xs font-mono text-neutral-300 flex items-start gap-2.5 mb-4">
              <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white uppercase block mb-0.5">
                  {isVi ? 'TÌNH HUỐNG GIAO TIẾP:' : 'SCENARIO CONTEXT:'}
                </span>
                <p className="font-sans text-neutral-300 leading-relaxed">{result.scenario}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                  <span>{isVi ? 'Bạn là:' : 'You are:'} <strong className="text-sky-300">{result.userRole}</strong></span>
                  <span>•</span>
                  <span>{isVi ? 'Đối tác là:' : 'Partner is:'} <strong className="text-purple-300">{result.aiRole}</strong></span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            {messages.map((turn, idx) => {
              const isUser = checkIsUser(turn);

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {/* Partner Avatar on Left */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-none bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`space-y-1.5 max-w-[88%] sm:max-w-[76%] transition-all ${
                      isUser
                        ? 'bg-sky-600 text-white border border-sky-500 p-3.5 rounded-none shadow-md shadow-sky-950/40'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-100 p-3.5 rounded-none shadow-sm'
                    }`}
                  >
                    {/* Sender Header */}
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono pb-1 border-b border-black/10 dark:border-white/10">
                      <span className={`font-bold uppercase ${isUser ? 'text-sky-200' : 'text-purple-400'}`}>
                        {isUser ? `${isVi ? 'Bạn' : 'You'} (${result.userRole})` : turn.speaker}
                      </span>

                      <button
                        type="button"
                        onClick={() => speakText(turn.text)}
                        className={`p-1 rounded-none transition-colors cursor-pointer shrink-0 ${
                          isUser
                            ? 'hover:bg-sky-700 text-sky-100'
                            : 'hover:bg-neutral-800 text-neutral-400 hover:text-sky-400'
                        }`}
                        title={isVi ? 'Nghe phát âm chuẩn' : 'Listen pronunciation'}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${speakingText === turn.text ? 'animate-bounce text-amber-300' : ''}`} />
                      </button>
                    </div>

                    {/* Message Content */}
                    <p className="text-sm sm:text-[15px] font-sans leading-relaxed break-words font-medium">
                      {turn.text}
                    </p>

                    {/* Vietnamese Translation */}
                    {showTranslations && turn.translationVi && (
                      <div
                        className={`text-xs italic font-sans p-2 rounded-none border-l-2 mt-1 leading-snug ${
                          isUser
                            ? 'bg-sky-700/40 border-l-sky-300 text-sky-100/90'
                            : 'bg-neutral-950/70 border-l-neutral-700 text-neutral-400'
                        }`}
                      >
                        ↳ {turn.translationVi}
                      </div>
                    )}

                    {/* Grammar Coaching Feedback Badge */}
                    {turn.grammarFeedback && (
                      <div className={`p-2 rounded-none text-xs font-sans mt-1.5 border-l-2 flex items-start gap-1.5 ${
                        isUser
                          ? 'bg-sky-800/80 border-l-amber-300 text-amber-200'
                          : 'bg-amber-950/70 border-l-amber-400 text-amber-200 border border-amber-800/80'
                      }`}>
                        <span className="font-bold text-amber-300 shrink-0">💡 Gợi ý:</span>
                        <p className="leading-snug">{turn.grammarFeedback}</p>
                      </div>
                    )}

                    {/* Audio Intonation or Key Expression Chips */}
                    {(turn.audioTip || turn.usefulExpression) && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-mono">
                        {turn.audioTip && (
                          <span
                            className={`px-1.5 py-0.5 rounded-none border uppercase ${
                              isUser
                                ? 'bg-sky-700 text-sky-200 border-sky-400/50'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            }`}
                          >
                            🎵 {turn.audioTip}
                          </span>
                        )}
                        {turn.usefulExpression && (
                          <span
                            className={`px-1.5 py-0.5 rounded-none border uppercase ${
                              isUser
                                ? 'bg-sky-700 text-sky-200 border-sky-400/50'
                                : 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                            }`}
                          >
                            💡 {turn.usefulExpression}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Timestamp & Read Status Indicator */}
                    <div
                      className={`text-[10px] font-mono flex items-center justify-end gap-1 pt-0.5 ${
                        isUser ? 'text-sky-200' : 'text-neutral-500'
                      }`}
                    >
                      <span>{turn.timestamp || 'Just now'}</span>
                      {isUser && (
                        <span title="Đã chuyển phát / Delivered">
                          <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Avatar on Right */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-none bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-300 font-bold text-xs shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator Bubble */}
            {isPartnerTyping && (
              <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] animate-fade-in">
                <div className="w-8 h-8 rounded-none bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0 mt-1 relative">
                  <Bot className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-none bg-sky-400 animate-ping absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-400 uppercase">
                    <span>{result.aiRole}</span>
                    <span className="text-sky-400 animate-pulse">● {isVi ? 'Đang nhập...' : 'Typing...'}</span>
                  </div>

                  {/* Authentic 3-dot Animated Typing Bubble */}
                  <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-none flex items-center gap-2.5 shadow-md">
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                    </div>
                    <span className="text-xs font-mono text-neutral-400 italic">
                      {result.aiRole} {isVi ? 'đang soạn câu trả lời...' : 'is typing a response...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Messenger Bottom Interactive Bar */}
          <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 space-y-2.5">
            {/* Quick Reply Suggestions Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{isVi ? 'Gợi ý nhanh:' : 'Quick replies:'}</span>
              </span>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isPartnerTyping}
                  onClick={() => handleSendMessage(reply)}
                  className="text-xs px-2.5 py-1 rounded-none bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-600 text-neutral-300 hover:text-white font-sans whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  "{reply}"
                </button>
              ))}
            </div>

            {/* Input Form & Buttons */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Input Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isPartnerTyping}
                className={`p-2.5 rounded-none border transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-neutral-950 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
                }`}
                title={isListening ? (isVi ? 'Đang lắng nghe... Bấm để dừng' : 'Listening... Click to stop') : (isVi ? 'Bấm để nói tiếng Anh' : 'Click to speak')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                disabled={isPartnerTyping}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isPartnerTyping
                    ? isVi
                      ? `Chờ ${result.aiRole} trả lời...`
                      : `Waiting for ${result.aiRole} to reply...`
                    : isVi
                    ? `Nhập câu nói tiếng Anh của bạn và gửi cho ${result.aiRole}... (Nhấn Enter)`
                    : `Type an English sentence to send to ${result.aiRole}... (Press Enter)`
                }
                className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-sans transition-colors"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isPartnerTyping}
                className={`px-4 py-2.5 rounded-none font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  inputMessage.trim() && !isPartnerTyping
                    ? 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-400 shadow-sm'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isVi ? 'GỬI' : 'SEND'}</span>
              </button>
            </form>

            {isListening && (
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{isVi ? 'Đang lắng nghe giọng nói tiếng Anh của bạn...' : 'Listening to your spoken English...'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Sample Script Full Reference */}
      {activeTab === 'script' && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-4 border-l-4 border-l-sky-500 animate-fade-in">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 flex-wrap">
            <div className="flex items-center gap-2 text-sky-400">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                {isVi ? 'Kịch Bản Mẫu Toàn Diện (Study Reference Script)' : 'Full Dialogue Study Script'}
              </h4>
            </div>
            <button
              type="button"
              onClick={handleCopyScript}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 cursor-pointer"
            >
              {copied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP KỊCH BẢN'}
            </button>
          </div>

          <div className="space-y-3">
            {(result.dialogue || []).map((turn, idx) => {
              const isUserTurn = checkIsUser(turn);
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-none border ${
                    isUserTurn
                      ? 'bg-sky-950/30 border-sky-800/60 pl-3'
                      : 'bg-neutral-900/60 border-neutral-800'
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                      isUserTurn
                        ? 'bg-sky-950 text-sky-300 border-sky-700'
                        : 'bg-purple-950 text-purple-300 border-purple-800'
                    }`}>
                      {turn.speaker}
                    </span>

                    <button
                      type="button"
                      onClick={() => speakText(turn.text)}
                      className="p-1 rounded-none text-sky-400 hover:bg-neutral-800 cursor-pointer"
                      title="Nghe câu này"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-white font-sans">{turn.text}</p>
                  {turn.translationVi && (
                    <p className="text-xs text-neutral-400 font-sans">→ {turn.translationVi}</p>
                  )}
                  {turn.usefulExpression && (
                    <p className="text-[11px] font-mono text-sky-300 pt-0.5">
                      💡 Mẫu câu hữu ích: <span className="underline">{turn.usefulExpression}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Key Vocabulary */}
      {activeTab === 'vocab' && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-sky-500 animate-fade-in">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              {isVi ? 'Từ Vựng & Cụm Diễn Đạt Trọng Tâm Trong Cuộc Trò Chuyện' : 'Dialogue Key Vocabulary & Expressions'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.keyVocabulary?.map((item, idx) => (
              <div key={idx} className="p-3 rounded-none bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-1">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>{item.term}</span>
                  <button
                    type="button"
                    onClick={() => speakText(item.term)}
                    className="text-sky-400 hover:text-sky-300 p-1 cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-neutral-200 font-sans">{item.meaning}</div>
                <div className="text-[11px] text-neutral-400 italic pt-1 border-t border-neutral-800">
                  💡 {item.usage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Cultural Tips */}
      {activeTab === 'tips' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2 text-emerald-400">
              <Globe className="w-4 h-4" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                {isVi ? 'Mẹo Văn Hóa & Phép Lịch Sự Trong Giao Tiếp Bản Xứ' : 'Cultural Pragmatics & Politeness Strategy'}
              </h4>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-200">
              {result.culturalTips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 bg-neutral-900/60 border border-neutral-800">
                  <span className="text-emerald-400 font-mono text-xs mt-0.5 shrink-0">✔</span>
                  <span className="leading-relaxed font-sans">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.followUpChallenge && (
            <div className="p-5 rounded-none bg-amber-950/20 border border-amber-900/40 space-y-2 border-l-4 border-l-amber-500">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                [ {isVi ? 'Thử Thách Luyện Nói Mở Rộng' : 'Speaking Challenge for Practice'} ]
              </span>
              <p className="text-xs text-amber-200 leading-relaxed font-mono">
                {result.followUpChallenge}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Speech Coach */}
      {activeTab === 'speaking' && (
        <div className="animate-fade-in">
          <UserSpeechEvaluator
            userRole={result.userRole}
            aiRole={result.aiRole}
            scenario={result.scenario}
            targetDifficulty={result.difficulty || 'B2'}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
};
