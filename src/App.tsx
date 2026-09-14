import React, { useState, useEffect } from 'react';
import {
  TaskType,
  ChatbotProvider,
  PipelineStep,
  AutomationLog,
  TaskResult,
  PipelineStepId,
  RoleplayLength,
  DialogueDifficulty,
  Language,
  AppSettings,
  MainTabType,
} from './types';
import { Navbar } from './components/Navbar';
import { DailyHabitView } from './components/DailyHabitView';
import { TaskSelector } from './components/TaskSelector';
import { WritingForm } from './components/forms/WritingForm';
import { VocabForm } from './components/forms/VocabForm';
import { RoleplayForm } from './components/forms/RoleplayForm';
import { QuizForm } from './components/forms/QuizForm';
import { AutomationModal } from './components/AutomationModal';
import { PromptPreviewModal } from './components/PromptPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileRemoteModal } from './components/remote/MobileRemoteModal';
import { MobileRemoteView } from './components/remote/MobileRemoteView';
import { WritingResultView } from './components/results/WritingResultView';
import { VocabResultView } from './components/results/VocabResultView';
import { RoleplayResultView } from './components/results/RoleplayResultView';
import { QuizResultView } from './components/results/QuizResultView';
import { ToeicLessonResultView } from './components/results/ToeicLessonResultView';
import { GrammarLessonResultView } from './components/results/GrammarLessonResultView';
import { ReadingLessonResultView } from './components/results/ReadingLessonResultView';
import { ListeningLessonResultView } from './components/results/ListeningLessonResultView';
import { ReflexChallengeResultView } from './components/results/ReflexChallengeResultView';
import {
  addLearnedWords,
  addLearnedGrammar,
  addLearnedReading,
  addLearnedListening
} from './utils/learningMemory';
import { translations } from './translations';
import {
  Play,
  Terminal,
  FileCode2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Settings,
  Globe,
  MessageSquare,
  PenTool,
} from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'vi',
  defaultProvider: 'fast',
  headless: true,
  speechRate: 1.0,
  speechVoice: 'en-US',
  defaultRoleplayLength: 'medium',
  defaultRoleplayDifficulty: 'B2',
  defaultUserRole: 'Hành khách (Passenger)',
  defaultAiRole: 'Nhân viên quầy làm thủ tục (Agent)',
  simulateIfBlocked: true,
  userLevel: 'A1',
  focusMode: false,
};

function getSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('playeng_settings');
    const savedLevel = localStorage.getItem('playeng_user_level') as any;
    const savedFocus = localStorage.getItem('playeng_focus_mode');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        userLevel: parsed.userLevel || savedLevel || 'A1',
        focusMode: savedFocus !== null ? savedFocus === 'true' : (parsed.focusMode ?? false),
      };
    }
    if (savedLevel) {
      return {
        ...DEFAULT_SETTINGS,
        userLevel: savedLevel,
        focusMode: savedFocus === 'true',
      };
    }
  } catch (e) {
    console.warn('Failed to parse saved settings', e);
  }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(getSavedSettings);
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('playeng_focus_mode');
    if (saved !== null) return saved === 'true';
    return settings.focusMode ?? false;
  });

  const handleToggleFocusMode = () => {
    setFocusMode((prev) => {
      const next = !prev;
      localStorage.setItem('playeng_focus_mode', String(next));
      setSettings((s) => ({ ...s, focusMode: next }));
      return next;
    });
  };

  // Keyboard shortcut: Shift + F to toggle Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleToggleFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [currentTab, setCurrentTab] = useState<MainTabType>(() => {
    return (localStorage.getItem('playeng_current_tab') as MainTabType) || 'today';
  });
  const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false);

  const handleSetCurrentTab = (tab: MainTabType) => {
    setCurrentTab(tab);
    localStorage.setItem('playeng_current_tab', tab);
  };

  const [userLevel, setUserLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>(() => {
    return (localStorage.getItem('playeng_user_level') as 'A1' | 'A2' | 'B1' | 'B2') || settings.userLevel || 'A1';
  });

  const handleSetUserLevel = (lvl: 'A1' | 'A2' | 'B1' | 'B2') => {
    setUserLevel(lvl);
    localStorage.setItem('playeng_user_level', lvl);
    setSettings((prev) => ({ ...prev, userLevel: lvl }));
  };

  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('playeng_streak') || '1', 10);
  });
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('playeng_last_completed') === today;
  });

  const handleMarkCompleted = () => {
    if (isCompletedToday) return;
    const newStreak = streak + 1;
    const today = new Date().toDateString();
    setStreak(newStreak);
    setIsCompletedToday(true);
    localStorage.setItem('playeng_streak', newStreak.toString());
    localStorage.setItem('playeng_last_completed', today);
  };

  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('playeng_lang') as Language;
    return savedLang === 'en' ? 'en' : 'vi';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileRemoteModalOpen, setIsMobileRemoteModalOpen] = useState(false);
  const [isMobileRemoteMode, setIsMobileRemoteMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/remote') ||
        window.location.search.includes('remote')
      );
    }
    return false;
  });

  const t = translations[lang];

  const [activeTask, setActiveTask] = useState<TaskType>('writing');
  const [provider, setProvider] = useState<ChatbotProvider>(settings.defaultProvider);
  const [headless, setHeadless] = useState<boolean>(settings.headless);
  const [simulateIfBlocked, setSimulateIfBlocked] = useState<boolean>(true);

  // Task 1: Writing state
  const [writingTopic, setWritingTopic] = useState(
    'The impact of artificial intelligence on future employment and human creativity'
  );
  const [writingTargetBand, setWritingTargetBand] = useState('C1');
  const [writingEssay, setWritingEssay] = useState(
    `In contemporary society, artificial intelligence is developing more and more faster. Many people believe that AI will replace many human jobs and make workers to lose their careers. On the other hand, others think that it will create new opportunities and make our work more easier and productive. In my personal opinion, although technology causes some short term problems, government should to invest in education and training programs so workers can adapt on this transformation. Overall, AI is a very big benefit if we use it wisely.`
  );

  // Task 2: Vocab state
  const [vocabTerm, setVocabTerm] = useState('Cut corners');
  const [vocabContext, setVocabContext] = useState(
    'Engineering quality control and corporate management ethics'
  );

  // Task 3: Roleplay state
  const [roleplayScenario, setRoleplayScenario] = useState(
    'Airport check-in counter with 2.5kg overweight baggage and tight boarding window'
  );
  const [roleplayUserRole, setRoleplayUserRole] = useState(settings.defaultUserRole);
  const [roleplayAiRole, setRoleplayAiRole] = useState(settings.defaultAiRole);
  const [roleplayLength, setRoleplayLength] = useState<RoleplayLength>(
    settings.defaultRoleplayLength
  );
  const [roleplayDifficulty, setRoleplayDifficulty] = useState<DialogueDifficulty>(
    settings.defaultRoleplayDifficulty
  );

  // Task 4: Quiz state
  const [quizTopic, setQuizTopic] = useState('Inverted Conditionals and Mixed Hypotheticals');
  const [quizDifficulty, setQuizDifficulty] = useState('Advanced (C1)');

  // Pipeline execution & modal states
  const [isAutomating, setIsAutomating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const getInitialSteps = (): PipelineStep[] => [
    {
      id: 'launching_browser',
      stepNumber: 1,
      label: lang === 'vi' ? 'Khởi động Trình duyệt' : 'Launching Browser',
      subtext:
        lang === 'vi' ? 'Mở hồ sơ lưu trữ persistent profile' : 'Persistent context with custom profile',
      status: 'idle',
    },
    {
      id: 'navigating',
      stepNumber: 2,
      label: lang === 'vi' ? 'Mở Trang Web Chatbot' : 'Navigating to Chatbot',
      subtext:
        lang === 'vi' ? 'Tải cổng Gemini / ChatGPT Web' : 'Loading Gemini/ChatGPT Web portal',
      status: 'idle',
    },
    {
      id: 'injecting_prompt',
      stepNumber: 3,
      label: lang === 'vi' ? 'Điền Prompt vào Khung Chat' : 'Injecting Prompt',
      subtext:
        lang === 'vi'
          ? 'Định vị contenteditable và gửi input'
          : 'Locating contenteditable & dispatching',
      status: 'idle',
    },
    {
      id: 'waiting_generation',
      stepNumber: 4,
      label: lang === 'vi' ? 'Chờ AI Tạo Nội Dung' : 'Waiting for Generation',
      subtext:
        lang === 'vi'
          ? 'Theo dõi DOM 3 giây ổn định'
          : 'Monitoring stop button & 3s DOM stability',
      status: 'idle',
    },
    {
      id: 'extracting_response',
      stepNumber: 5,
      label: lang === 'vi' ? 'Trích xuất Phản hồi' : 'Extracting Response',
      subtext:
        lang === 'vi'
          ? 'Bóc tách thẻ tin nhắn và codeblock JSON'
          : 'Scraping assistant bubble & codeblock',
      status: 'idle',
    },
    {
      id: 'rendered',
      stepNumber: 6,
      label: lang === 'vi' ? 'Hiển thị Giao diện Học' : 'Rendered in UI',
      subtext:
        lang === 'vi'
          ? 'Phân tích JSON thành bảng học tập tương tác'
          : 'Parsing JSON into interactive views',
      status: 'idle',
    },
  ];

  const [steps, setSteps] = useState<PipelineStep[]>(getInitialSteps);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [rawChunk, setRawChunk] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync settings when changed
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setLang(newSettings.language);
    setProvider(newSettings.defaultProvider);
    setHeadless(newSettings.headless);
    setRoleplayLength(newSettings.defaultRoleplayLength);
    setRoleplayDifficulty(newSettings.defaultRoleplayDifficulty);
    if (newSettings.userLevel) {
      localStorage.setItem('playeng_user_level', newSettings.userLevel);
    }
    if (newSettings.focusMode !== undefined) {
      setFocusMode(newSettings.focusMode);
      localStorage.setItem('playeng_focus_mode', String(newSettings.focusMode));
    }
    localStorage.setItem('playeng_settings', JSON.stringify(newSettings));
    localStorage.setItem('playeng_lang', newSettings.language);
  };

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    const updated = { ...settings, language: nextLang };
    setSettings(updated);
    localStorage.setItem('playeng_lang', nextLang);
    localStorage.setItem('playeng_settings', JSON.stringify(updated));
  };

  // Update step labels on language toggle if idle
  useEffect(() => {
    if (!isAutomating) {
      setSteps(getInitialSteps());
    }
  }, [lang]);

  // Current prompt calculation for preview
  const getCurrentPrompt = () => {
    switch (activeTask) {
      case 'writing':
        return `[System: Cambridge/IELTS Senior Writing Assessor]\nTopic: ${writingTopic}\nTarget: ${writingTargetBand}\n\nEssay:\n${writingEssay}\n\n[Instruction: Return strict JSON with CEFR Band, corrections, and improved rewrite]`;
      case 'vocab':
        return `[System: English-Vietnamese Lexicographer]\nTerm: ${vocabTerm}\nContext: ${vocabContext}\n\n[Instruction: Return strict JSON with IPA, Vietnamese meaning, nuances, 3 examples, common traps]`;
      case 'roleplay':
        return `[System: Communicative Roleplay Coach]\nScenario: ${roleplayScenario}\nPerson 1 (User): ${roleplayUserRole}\nPerson 2 (Partner): ${roleplayAiRole}\nLength: ${roleplayLength}\nTarget Difficulty: ${roleplayDifficulty}\n\n[Instruction: Return strict JSON with 2-way dialogue, Vietnamese translations, pronunciation tips, and speech challenge]`;
      case 'quiz':
        return `[System: Cambridge Item Writer]\nTopic: ${quizTopic}\nLevel: ${quizDifficulty}\n\n[Instruction: Return strict JSON with 5 multiple-choice questions, answer key, and rule explanations]`;
    }
  };

  const handleStartAutomation = () => {
    // Validate inputs
    if (activeTask === 'writing' && !writingEssay.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập hoặc dán bài luận trước.' : 'Please enter or paste an essay first.');
      return;
    }
    if (activeTask === 'vocab' && !vocabTerm.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập từ hoặc thành ngữ cần học.' : 'Please enter a word or idiom first.');
      return;
    }
    if (activeTask === 'roleplay' && !roleplayScenario.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập bối cảnh tình huống hội thoại.' : 'Please enter a roleplay scenario first.');
      return;
    }
    if (activeTask === 'quiz' && !quizTopic.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập chủ điểm trắc nghiệm.' : 'Please enter a quiz topic first.');
      return;
    }

    runAutomationPipeline(activeTask, undefined, true);
  };

  const runAutomationPipeline = (
    taskType: TaskType,
    customInputData?: Record<string, unknown>,
    showModal: boolean = false
  ) => {
    // Reset steps
    setSteps(
      getInitialSteps().map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'running' : 'idle',
      }))
    );
    setLogs([]);
    setRawChunk('');
    setErrorMessage(null);
    setIsAutomating(true);
    if (showModal) {
      setIsModalOpen(true);
    }

    // Prepare request payload
    let inputData: Record<string, unknown> = customInputData || {};
    if (!customInputData) {
      if (taskType === 'writing') {
        inputData = { essay: writingEssay, topic: writingTopic, targetBand: writingTargetBand };
      } else if (taskType === 'vocab') {
        inputData = { term: vocabTerm, context: vocabContext };
      } else if (taskType === 'roleplay') {
        inputData = {
          scenario: roleplayScenario,
          userRole: roleplayUserRole,
          aiRole: roleplayAiRole,
          length: roleplayLength,
          difficulty: roleplayDifficulty,
        };
      } else if (taskType === 'quiz') {
        inputData = { topic: quizTopic, difficulty: quizDifficulty };
      }
    }

    const payload = {
      taskType,
      provider,
      headless,
      userDataDir: '.playwright-profile',
      simulateIfBlocked,
      inputData,
    };

    const sseUrl = `/api/playwright/stream?payload=${encodeURIComponent(JSON.stringify(payload))}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'step') {
          setSteps((prev) =>
            prev.map((s) => {
              if (s.id === data.stepId) {
                return { ...s, status: data.stepStatus };
              }
              const currentStepIdx = prev.findIndex((p) => p.id === data.stepId);
              const thisIdx = prev.findIndex((p) => p.id === s.id);
              if (data.stepStatus === 'running' && thisIdx < currentStepIdx) {
                return { ...s, status: 'completed' };
              }
              return s;
            })
          );
        } else if (data.type === 'log' && data.log) {
          setLogs((prev) => [...prev, data.log]);
        } else if (data.type === 'raw_chunk' && data.rawChunk) {
          setRawChunk(data.rawChunk);
        } else if (data.type === 'result' && data.result) {
          setResult(data.result);
          if (data.result.type === 'toeic_lesson' && data.result.data?.targetWords) {
            addLearnedWords(data.result.data.targetWords);
          } else if (data.result.type === 'grammar_lesson' && data.result.data) {
            addLearnedGrammar(data.result.data);
          } else if (data.result.type === 'reading_lesson' && data.result.data) {
            addLearnedReading({
              title: data.result.data.title,
              passage: data.result.data.passage,
              translationVi: data.result.data.translationVi,
              level: data.result.data.userLevel || 'A1',
              topic: data.result.data.topic,
              keyWords: data.result.data.keyVocabulary?.map((k: any) => ({ term: k.term, meaning: k.meaning })),
              questions: data.result.data.comprehensionQuiz ? [data.result.data.comprehensionQuiz] : [],
            });
          } else if (data.result.type === 'listening_lesson' && data.result.data) {
            addLearnedListening({
              title: data.result.data.title,
              dialogue: data.result.data.dialogue,
              level: data.result.data.userLevel || 'A1',
              topic: data.result.data.topic,
              questions: data.result.data.listeningQuiz ? [data.result.data.listeningQuiz] : [],
            });
          }
        } else if (data.type === 'error') {
          setErrorMessage(data.error);
          setIsAutomating(false);
          eventSource.close();
        } else if (data.type === 'done') {
          setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
          setIsAutomating(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('SSE JSON error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection closed or ended:', err);
      setIsAutomating(false);
      eventSource.close();
    };
  };

  if (isMobileRemoteMode) {
    return (
      <MobileRemoteView
        settings={settings}
        userLevel={userLevel}
        streak={streak}
        onSetUserLevel={handleSetUserLevel}
        onSwitchToFullApp={() => {
          setIsMobileRemoteMode(false);
          if (typeof window !== 'undefined' && window.history && window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSetCurrentTab}
        userLevel={userLevel}
        setUserLevel={handleSetUserLevel}
        streak={streak}
        provider={provider}
        setProvider={setProvider}
        isAutomating={isAutomating}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobileRemote={() => setIsMobileRemoteModalOpen(true)}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocusMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TABS: Hôm Nay, Từ Vựng, Ngữ Pháp, Đọc & Nghe, Sổ Nhớ */}
        {(currentTab === 'today' ||
          currentTab === 'vocab' ||
          currentTab === 'grammar' ||
          currentTab === 'read_listen' ||
          currentTab === 'memory') && (
          <DailyHabitView
            provider={provider}
            isAutomating={isAutomating}
            steps={steps}
            currentResult={result}
            onRunDailyTask={(taskType, inputData) => {
              setActiveTask(taskType);
              runAutomationPipeline(taskType, inputData, false);
            }}
            lang={lang}
            onOpenTerminal={() => setIsModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            activeTab={currentTab}
            onSwitchTab={handleSetCurrentTab}
            userLevel={userLevel}
            setUserLevel={handleSetUserLevel}
            streak={streak}
            isCompletedToday={isCompletedToday}
            onMarkCompleted={handleMarkCompleted}
            focusMode={focusMode}
          />
        )}

        {/* TAB 5: Live Messenger (Trò Chuyện & Nhắn Tin 2 Chiều) */}
        {currentTab === 'chat' && (
          <div className="space-y-6">
            {/* If a roleplay dialogue is active: */}
            {result && result.type === 'roleplay' && result.data ? (
              <div className="space-y-4">
                {/* Collapsible Scenario Settings Drawer */}
                {isScenarioDrawerOpen && (
                  <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-4 animate-fade-in backdrop-blur-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                        [ THIẾT LẬP KỊCH BẢN HỘI THOẠI ]
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsScenarioDrawerOpen(false)}
                        className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                      >
                        ✕ Đóng lại
                      </button>
                    </div>
                    <RoleplayForm
                      scenario={roleplayScenario}
                      setScenario={setRoleplayScenario}
                      userRole={roleplayUserRole}
                      setUserRole={setRoleplayUserRole}
                      aiRole={roleplayAiRole}
                      setAiRole={setRoleplayAiRole}
                      length={roleplayLength}
                      setLength={setRoleplayLength}
                      difficulty={roleplayDifficulty}
                      setDifficulty={setRoleplayDifficulty}
                      onSelectSample={(s, u, a) => {
                        setRoleplayScenario(s);
                        setRoleplayUserRole(u);
                        setRoleplayAiRole(a);
                      }}
                      disabled={isAutomating}
                      lang={lang}
                    />
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={isAutomating}
                        onClick={() => {
                          setIsScenarioDrawerOpen(false);
                          setActiveTask('roleplay');
                          runAutomationPipeline('roleplay', {
                            scenario: roleplayScenario,
                            userRole: roleplayUserRole,
                            aiRole: roleplayAiRole,
                            length: roleplayLength,
                            difficulty: roleplayDifficulty,
                          }, false);
                        }}
                        className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase border border-sky-400/80 cursor-pointer transition-all duration-150 shadow-md"
                      >
                        Bắt Đầu Kịch Bản Mới ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* Optional Slim Scenario Bar (Only shown outside Focus Mode) */}
                {!focusMode && !isScenarioDrawerOpen && (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-xs font-mono backdrop-blur-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-neutral-500 uppercase text-[10px]">Tình huống:</span>
                      <span className="text-sky-300 font-bold truncate max-w-sm sm:max-w-md">{roleplayScenario}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScenarioDrawerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-neutral-300 hover:text-white border border-zinc-750 text-[11px] cursor-pointer transition-all duration-150 shrink-0"
                    >
                      ⚙ Đổi Kịch Bản
                    </button>
                  </div>
                )}

                {/* Pure Live Messenger View */}
                <RoleplayResultView result={result.data} lang={lang} />
              </div>
            ) : (
              /* Starter Screen if no active dialogue yet */
              <div className="space-y-6">
                {isScenarioDrawerOpen && (
                  <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                        [ TÙY BIẾN KỊCH BẢN HỘI THOẠI ]
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsScenarioDrawerOpen(false)}
                        className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                      >
                        ✕ Đóng lại
                      </button>
                    </div>
                    <RoleplayForm
                      scenario={roleplayScenario}
                      setScenario={setRoleplayScenario}
                      userRole={roleplayUserRole}
                      setUserRole={setRoleplayUserRole}
                      aiRole={roleplayAiRole}
                      setAiRole={setRoleplayAiRole}
                      length={roleplayLength}
                      setLength={setRoleplayLength}
                      difficulty={roleplayDifficulty}
                      setDifficulty={setRoleplayDifficulty}
                      onSelectSample={(s, u, a) => {
                        setRoleplayScenario(s);
                        setRoleplayUserRole(u);
                        setRoleplayAiRole(a);
                      }}
                      disabled={isAutomating}
                      lang={lang}
                    />
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={isAutomating}
                        onClick={() => {
                          setIsScenarioDrawerOpen(false);
                          setActiveTask('roleplay');
                          runAutomationPipeline('roleplay', {
                            scenario: roleplayScenario,
                            userRole: roleplayUserRole,
                            aiRole: roleplayAiRole,
                            length: roleplayLength,
                            difficulty: roleplayDifficulty,
                          }, false);
                        }}
                        className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase border border-sky-400/80 cursor-pointer transition-all duration-150 shadow-md"
                      >
                        Lưu &amp; Bắt Đầu Trò Chuyện ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* Messenger Starter Screen if no active dialogue */}
                <div className="p-8 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-center space-y-5 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    Sẵn sàng trò chuyện phản xạ 2 chiều
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Giao diện tin nhắn Live Messenger mô phỏng trò chuyện thực tế. Bấm vào một tình huống phổ biến bên dưới hoặc bấm nút bắt đầu để AI nhập vai cùng bạn!
                  </p>
                </div>

                {/* Quick Starter Scenario Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                  {[
                    {
                      title: '☕ Cafe & Đồ Uống',
                      desc: 'Gọi cà phê tại quầy, yêu cầu ít đường & thêm đá',
                      scenario: 'Ordering at a busy coffee shop with special drink customization',
                      userRole: 'Khách hàng (Customer)',
                      aiRole: 'Nhân viên pha chế (Barista)',
                    },
                    {
                      title: '✈️ Sân Bay & Hành Lý',
                      desc: 'Check-in tại quầy vé, xử lý hành lý quá cân 2kg',
                      scenario: 'Airport check-in counter with 2kg overweight luggage',
                      userRole: 'Hành khách (Passenger)',
                      aiRole: 'Nhân viên mặt đất (Agent)',
                    },
                    {
                      title: '💼 Phỏng Vấn Công Việc',
                      desc: 'Tự giới thiệu bản thân và kinh nghiệm làm việc',
                      scenario: 'Job interview introduction and discussing relevant experience',
                      userRole: 'Ứng viên (Candidate)',
                      aiRole: 'Người phỏng vấn (Interviewer)',
                    },
                    {
                      title: '🍽️ Nhà Hàng & Đặt Bàn',
                      desc: 'Hỏi thực đơn đặc biệt và đặt bàn cho 2 người',
                      scenario: 'Booking a table for two and asking for chef specials',
                      userRole: 'Thực khách (Diner)',
                      aiRole: 'Quản lý nhà hàng (Host)',
                    },
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAutomating}
                      onClick={() => {
                        setRoleplayScenario(pill.scenario);
                        setRoleplayUserRole(pill.userRole);
                        setRoleplayAiRole(pill.aiRole);
                        setActiveTask('roleplay');
                        runAutomationPipeline('roleplay', {
                          scenario: pill.scenario,
                          userRole: pill.userRole,
                          aiRole: pill.aiRole,
                          length: 'medium',
                          difficulty: userLevel,
                        }, false);
                      }}
                      className="p-3.5 rounded-xl bg-zinc-850/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-sky-500/50 transition-all duration-150 text-left group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                        {pill.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                        {pill.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isAutomating}
                  onClick={() => {
                    setActiveTask('roleplay');
                    runAutomationPipeline('roleplay', {
                      scenario: roleplayScenario,
                      userRole: roleplayUserRole,
                      aiRole: roleplayAiRole,
                      length: roleplayLength,
                      difficulty: roleplayDifficulty,
                    }, false);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-all duration-150 border border-sky-400/80 shadow-md shadow-sky-600/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isAutomating ? 'ĐANG KẾT NỐI MESSENGER...' : 'BẮT ĐẦU TRÒ CHUYỆN NGAY ➔'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

        {/* TAB 6: Writing Assessor (Luyện Viết & Chấm Chữa) */}
        {currentTab === 'writing' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm space-y-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-rose-400" />
                      <span>✍️ CHUYÊN ĐỀ 06: LUYỆN VIẾT &amp; CHẤM CHỮA</span>
                    </span>
                    <span className="text-xs font-mono text-neutral-400">[ CEFR / IELTS BAND ]</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    CHẤM BÀI LUẬN &amp; NÂNG CẤP BAND ĐIỂM TỰ ĐỘNG
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Nhập bài luận hoặc đoạn văn của bạn. AI sẽ chấm điểm theo 4 tiêu chí chuẩn quốc tế (Task Response, Coherence, Lexical Resource, Grammatical Accuracy), chỉ rõ lỗi sai và viết lại phiên bản Band cao hơn.
                  </p>
                </div>

                {!focusMode && (
                  <button
                    type="button"
                    onClick={() => setIsPromptModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-neutral-300 hover:text-white transition-all duration-150 cursor-pointer uppercase self-start sm:self-center"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t.inspectPrompt}</span>
                  </button>
                )}
              </div>

              <WritingForm
                topic={writingTopic}
                setTopic={setWritingTopic}
                targetBand={writingTargetBand}
                setTargetBand={setWritingTargetBand}
                essay={writingEssay}
                setEssay={setWritingEssay}
                onLoadSample={() => {
                  setWritingTopic('The impact of artificial intelligence on future employment');
                  setWritingEssay(
                    `In today's fast changing world, artificial intelligence is developing more and more faster. Many people believe that AI will replace many human jobs and make workers to lose their careers. On the other hand, others think that it will create new opportunities and make our work more easier and productive. In my personal opinion, although technology causes some short term problems, government should to invest in education and training programs so workers can adapt on this transformation. Overall, AI is a very big benefit if we use it wisely.`
                  );
                }}
                disabled={isAutomating}
                lang={lang}
              />

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-800/80">
                {!focusMode ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Động cơ: {provider === 'fast' ? '⚡ Siêu Tốc (0.5s)' : provider.toUpperCase()}</span>
                  </div>
                ) : <div />}

                <button
                  type="button"
                  disabled={isAutomating}
                  onClick={() => {
                    setActiveTask('writing');
                    handleStartAutomation();
                  }}
                  className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 border border-sky-400/80 shadow-md shadow-sky-600/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isAutomating ? 'ĐANG CHẤM BÀI...' : 'CHẤM CHỮA BÀI LUẬN NGAY ➔'}</span>
                </button>
              </div>
            </div>

            {/* Writing Assessment Result */}
            {result && result.type === 'writing' && result.data && (
              <WritingResultView result={result.data} />
            )}
          </div>
        )}

        {/* Floating Focus Mode Indicator Pill */}
        {focusMode && (
          <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
            <button
              type="button"
              onClick={handleToggleFocusMode}
              className="px-3.5 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-850 text-amber-300 border border-amber-500/40 shadow-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer backdrop-blur-md transition-all duration-150 hover:scale-105"
              title="Nhấn Shift+F hoặc bấm để thoát Focus Mode"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>🎯 FOCUS MODE</span>
              <span className="text-[10px] text-neutral-400 border-l border-zinc-700 pl-1.5 font-normal">Shift+F</span>
            </button>
          </div>
        )}
      </main>

      {/* Real-time Automation Terminal Modal */}
      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        steps={steps}
        logs={logs}
        rawChunk={rawChunk}
        provider={provider}
        headless={headless}
        onToggleHeadless={setHeadless}
        isRunning={isAutomating}
        error={errorMessage}
        onViewResults={() => {
          const el = document.getElementById('learning-output-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* Prompt Inspector Modal */}
      <PromptPreviewModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        prompt={getCurrentPrompt()}
        provider={provider}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Mobile Remote QR Modal */}
      <MobileRemoteModal
        isOpen={isMobileRemoteModalOpen}
        onClose={() => setIsMobileRemoteModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
