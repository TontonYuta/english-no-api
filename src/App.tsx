import React, { useState, useEffect } from 'react';
import {
  TaskType,
  ChatbotProvider,
  PipelineStep,
  AutomationLog,
  TaskResult,
  DialogueDifficulty,
  CEFRLevel,
  Language,
  AppSettings,
} from './types';
import { Navbar } from './components/Navbar';
import { AutomationModal } from './components/AutomationModal';
import { PromptPreviewModal } from './components/PromptPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileRemoteModal } from './components/remote/MobileRemoteModal';
import { TranslationVocabStudio } from './components/translation/TranslationVocabStudio';
import { MemoryBankModal } from './components/MemoryBankModal';
import {
  addLearnedWords,
  addLearnedReading,
} from './utils/learningMemory';
import { translations } from './translations';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'vi',
  defaultProvider: 'fast',
  headless: true,
  speechRate: 1.0,
  speechVoice: 'en-US',
  defaultRoleplayLength: 'medium',
  defaultRoleplayDifficulty: 'B2',
  defaultUserRole: 'Passenger',
  defaultAiRole: 'Officer',
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

  const [userLevel, setUserLevel] = useState<CEFRLevel>(() => {
    return (localStorage.getItem('playeng_user_level') as CEFRLevel) || settings.userLevel || 'B1';
  });

  const handleSetUserLevel = (lvl: CEFRLevel) => {
    setUserLevel(lvl);
    setPassageDifficulty(lvl as DialogueDifficulty);
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

  const t = translations[lang];

  const [activeTask, setActiveTask] = useState<TaskType>('translation_vocab');
  const [provider, setProvider] = useState<ChatbotProvider>(settings.defaultProvider);
  const [headless, setHeadless] = useState<boolean>(settings.headless);
  const [simulateIfBlocked, setSimulateIfBlocked] = useState<boolean>(true);

  const handleSelectProvider = (newProvider: ChatbotProvider) => {
    setProvider(newProvider);
    setSettings((prev) => {
      const updated = { ...prev, defaultProvider: newProvider };
      localStorage.setItem('playeng_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Core Feature: Translation & Contextual Vocab Guessing State (Clean initial state - No mock data)
  const [passage, setPassage] = useState<string>('');
  const [passageTitle, setPassageTitle] = useState<string>('');
  const [passageTopic, setPassageTopic] = useState<string>('Công Nghệ & AI');
  const [passageDifficulty, setPassageDifficulty] = useState<DialogueDifficulty>(() => {
    return (localStorage.getItem('playeng_user_level') as DialogueDifficulty) || 'B1';
  });
  const [targetWords, setTargetWords] = useState<Array<{ word: string; contextSentence: string }>>([]);
  const [userTranslation, setUserTranslation] = useState<string>('');
  const [userVocabGuesses, setUserVocabGuesses] = useState<Record<string, string>>({});
  const [referenceTranslation, setReferenceTranslation] = useState<string>('');
  const [isMemoryBankModalOpen, setIsMemoryBankModalOpen] = useState(false);
  const [isGeneratingPassage, setIsGeneratingPassage] = useState(false);

  const handleGeneratePassage = async (
    targetLevel?: string,
    targetTopic?: string,
    customTopic?: string
  ) => {
    setIsGeneratingPassage(true);
    try {
      const selectedLevel = (targetLevel || userLevel || passageDifficulty || 'B1').toUpperCase();
      const res = await fetch('/api/passage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedLevel,
          topic: targetTopic || passageTopic,
          customTopic: customTopic || undefined,
          provider: provider,
          geminiApiKey: settings.geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.success && data.passage) {
        setPassage(data.passage.passage);
        setPassageTitle(data.passage.title);
        setPassageTopic(data.passage.topic);
        const effectiveDifficulty = (data.passage.difficulty || selectedLevel) as DialogueDifficulty;
        setPassageDifficulty(effectiveDifficulty);
        setTargetWords(data.passage.targetWords || []);
        if (data.passage.translationVi) {
          setReferenceTranslation(data.passage.translationVi);
        }
        setUserTranslation('');
        setUserVocabGuesses({});
        setResult(null);
        if (selectedLevel !== userLevel) {
          handleSetUserLevel(selectedLevel as CEFRLevel);
        }
      }
    } catch (err) {
      console.error('Failed to generate passage:', err);
    } finally {
      setIsGeneratingPassage(false);
    }
  };

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
    const guessesStr = targetWords
      .map((tw) => `- "${tw.word}": ${userVocabGuesses[tw.word] || '(Chưa đoán)'}`)
      .join('\n');
    return `[System: Senior Bilingual English-Vietnamese Translation Professor]\nTitle: ${passageTitle}\nTopic: ${passageTopic} (${passageDifficulty})\nPassage:\n${passage}\n\nUser Translation:\n${userTranslation}\n\nVocab Guesses:\n${guessesStr}\n\n[Instruction: Return strict JSON evaluating translation and contextual vocab guessing]`;
  };

  const handleSubmitTranslationVocab = () => {
    if (!passage.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập hoặc chọn một đoạn văn tiếng Anh.' : 'Please enter or select an English passage.');
      return;
    }

    const guessesArray = targetWords.map((tw) => ({
      word: tw.word,
      guess: userVocabGuesses[tw.word] || '',
    }));

    const inputPayload = {
      passage,
      title: passageTitle,
      topic: passageTopic,
      difficulty: passageDifficulty,
      targetWords,
      userTranslation,
      userVocabGuesses: guessesArray,
      referenceTranslation,
      translationVi: referenceTranslation,
    };

    setActiveTask('translation_vocab');
    runAutomationPipeline('translation_vocab', inputPayload, false);
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
      const guessesArray = targetWords.map((tw) => ({
        word: tw.word,
        guess: userVocabGuesses[tw.word] || '',
      }));
      inputData = {
        passage,
        title: passageTitle,
        topic: passageTopic,
        difficulty: passageDifficulty,
        targetWords,
        userTranslation,
        userVocabGuesses: guessesArray,
        referenceTranslation,
        translationVi: referenceTranslation,
      };
    }

    const payload = {
      taskType,
      provider,
      headless,
      userDataDir: '.playwright-profile',
      simulateIfBlocked,
      geminiApiKey: settings.geminiApiKey,
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
          if (data.result.type === 'translation_vocab' && data.result.data) {
            const tv = data.result.data;
            if (tv.vocabEvaluations && tv.vocabEvaluations.length > 0) {
              addLearnedWords(
                tv.vocabEvaluations.map((v: any) => ({
                  term: v.word,
                  ipa: v.ipa || '',
                  partOfSpeech: v.partOfSpeech || 'vocab',
                  vietnameseMeaning: v.actualMeaningInContext,
                  exampleSentence: v.exampleSentence || v.contextSentence || '',
                  level: tv.cefrLevel || 'B2',
                }))
              );
            }
            if (tv.passage) {
              addLearnedReading({
                title: tv.title || 'Bài Luyện Dịch & Đoán Từ',
                passage: tv.passage,
                translationVi: tv.translationEvaluation?.referenceTranslation || '',
                level: (tv.cefrLevel as any) || 'B2',
                topic: tv.topic || 'Dịch Thuật',
                keyWords: tv.vocabEvaluations?.map((v: any) => ({
                  term: v.word,
                  meaning: v.actualMeaningInContext,
                })) || [],
                questions: [],
              });
            }
            handleMarkCompleted();
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

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Navbar
        userLevel={userLevel}
        setUserLevel={handleSetUserLevel}
        streak={streak}
        provider={provider}
        setProvider={handleSelectProvider}
        isAutomating={isAutomating}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobileRemote={() => setIsMobileRemoteModalOpen(true)}
        onOpenMemoryBank={() => setIsMemoryBankModalOpen(true)}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocusMode}
        onGeneratePassage={handleGeneratePassage}
        isGeneratingPassage={isGeneratingPassage}
      />

      {/* Main Container: Focused Single-Function Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Core Studio: Reading Passage & Vocab (Left), Translation & AI Grading (Right) */}
        <TranslationVocabStudio
          passage={passage}
          setPassage={setPassage}
          title={passageTitle}
          setTitle={setPassageTitle}
          topic={passageTopic}
          setTopic={setPassageTopic}
          difficulty={passageDifficulty}
          setDifficulty={setPassageDifficulty}
          targetWords={targetWords}
          setTargetWords={setTargetWords}
          userTranslation={userTranslation}
          setUserTranslation={setUserTranslation}
          userVocabGuesses={userVocabGuesses}
          setUserVocabGuesses={setUserVocabGuesses}
          onSubmit={handleSubmitTranslationVocab}
          isAutomating={isAutomating}
          provider={provider}
          setProvider={handleSelectProvider}
          onOpenSettings={() => setIsSettingsOpen(true)}
          steps={steps}
          lang={lang}
          onGeneratePassage={handleGeneratePassage}
          isGeneratingPassage={isGeneratingPassage}
          userLevel={userLevel}
          setUserLevel={handleSetUserLevel}
          referenceTranslation={referenceTranslation}
          result={result && result.type === 'translation_vocab' ? result.data : null}
          onPracticeAgain={() => setResult(null)}
        />

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

      {/* Memory Bank Modal */}
      <MemoryBankModal
        isOpen={isMemoryBankModalOpen}
        onClose={() => setIsMemoryBankModalOpen(false)}
      />
    </div>
  );
}
