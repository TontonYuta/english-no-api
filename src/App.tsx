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
import { WritingResultView } from './components/results/WritingResultView';
import { VocabResultView } from './components/results/VocabResultView';
import { RoleplayResultView } from './components/results/RoleplayResultView';
import { QuizResultView } from './components/results/QuizResultView';
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
} from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'vi',
  defaultProvider: 'gemini',
  headless: true,
  speechRate: 1.0,
  speechVoice: 'en-US',
  defaultRoleplayLength: 'medium',
  defaultRoleplayDifficulty: 'B2',
  defaultUserRole: 'Hành khách (Passenger)',
  defaultAiRole: 'Nhân viên quầy làm thủ tục (Agent)',
  simulateIfBlocked: true,
};

function getSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('playeng_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to parse saved settings', e);
  }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(getSavedSettings);
  const [appMode, setAppMode] = useState<'daily' | 'studio'>(() => {
    return (localStorage.getItem('playeng_app_mode') as 'daily' | 'studio') || 'daily';
  });
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('playeng_lang') as Language;
    return savedLang === 'en' ? 'en' : 'vi';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSetAppMode = (mode: 'daily' | 'studio') => {
    setAppMode(mode);
    localStorage.setItem('playeng_app_mode', mode);
  };

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
        appMode={appMode}
        setAppMode={handleSetAppMode}
        provider={provider}
        setProvider={setProvider}
        headless={headless}
        setHeadless={setHeadless}
        onOpenTerminal={() => setIsModalOpen(true)}
        isAutomating={isAutomating}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {appMode === 'daily' ? (
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
          />
        ) : (
          <>
        {/* Banner / Info Bar with Quick Settings Trigger */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {t.browserEngine}
                </span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-xs text-neutral-300">
                  {t.persistentContext}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t.bannerDesc(provider === 'gemini' ? 'Gemini Web' : 'ChatGPT Web')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.settingsBtn}</span>
            </button>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.persistentDirBadge}</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.realtimeSSEBadge}</span>
            </span>
          </div>
        </div>

        {/* Preset Task Selector */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              {t.selectPresetTitle}
            </h2>
            <span className="text-xs text-neutral-500">{t.presetSubtitle}</span>
          </div>
          <TaskSelector
            activeTask={activeTask}
            onSelectTask={(task) => {
              setActiveTask(task);
            }}
            disabled={isAutomating}
            lang={lang}
          />
        </section>

        {/* Task Form Configuration & Trigger Box */}
        <section className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {activeTask === 'writing' && (lang === 'vi' ? '✍️ Chấm Chữa Writing Chuẩn CEFR & IELTS' : '✍️ IELTS/Cambridge Writing Examiner')}
                {activeTask === 'vocab' && (lang === 'vi' ? '📖 Phân Tích Từ Vựng Chuyên Sâu & Thành Ngữ' : '📖 Lexical & Deep Idiom Master')}
                {activeTask === 'roleplay' && (lang === 'vi' ? '💬 Hội Thoại 2 Chiều & Đánh Giá Giọng Nói' : '💬 2-Party Dialogue & Speech Evaluator')}
                {activeTask === 'quiz' && (lang === 'vi' ? '🎯 Tạo Bộ Đề Trắc Nghiệm Ngữ Pháp Tự Động' : '🎯 Smart 5-Item Exam Quiz Generator')}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'vi'
                  ? `Thiết lập tham số bên dưới. Bot Playwright sẽ tự động nhập vào ${provider.toUpperCase()} Web để tạo tài liệu chuẩn.`
                  : `Configure your learning parameters below. The Playwright bot will inject this into ${provider.toUpperCase()} Web.`}
              </p>
            </div>

            <button
              id="inspect-prompt-payload-btn"
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.inspectPrompt}</span>
            </button>
          </div>

          {/* Form Switcher */}
          <div>
            {activeTask === 'writing' && (
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
            )}

            {activeTask === 'vocab' && (
              <VocabForm
                term={vocabTerm}
                setTerm={setVocabTerm}
                context={vocabContext}
                setContext={setVocabContext}
                onSelectSample={(term, context) => {
                  setVocabTerm(term);
                  setVocabContext(context);
                }}
                disabled={isAutomating}
                lang={lang}
              />
            )}

            {activeTask === 'roleplay' && (
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
            )}

            {activeTask === 'quiz' && (
              <QuizForm
                topic={quizTopic}
                setTopic={setQuizTopic}
                difficulty={quizDifficulty}
                setDifficulty={setQuizDifficulty}
                onSelectSample={(t, d) => {
                  setQuizTopic(t);
                  setQuizDifficulty(d);
                }}
                disabled={isAutomating}
                lang={lang}
              />
            )}
          </div>

          {/* Bottom Execution Bar */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                {t.targetLabel}: {provider === 'gemini' ? 'Gemini Web' : 'ChatGPT Web'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {t.modeLabel}: {headless ? t.headless : t.headed}
              </span>
            </div>

            <button
              id="start-playwright-automation-btn"
              type="button"
              disabled={isAutomating}
              onClick={handleStartAutomation}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAutomating
                  ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/25 hover:shadow-sky-500/40 hover:-translate-y-0.5'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isAutomating ? t.automatingBtn : t.startAutomation(provider)}</span>
            </button>
          </div>
        </section>

        {/* Output Section */}
        {result && (
          <section id="learning-output-section" className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.extractedResults}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                  {t.scrapedVia(provider)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{t.reopenTerminal}</span>
              </button>
            </div>

            {/* Render matched result view */}
            {result.type === 'writing' && <WritingResultView result={result.data} />}
            {result.type === 'vocab' && <VocabResultView result={result.data} />}
            {result.type === 'roleplay' && (
              <RoleplayResultView result={result.data} lang={lang} />
            )}
            {result.type === 'quiz' && <QuizResultView result={result.data} />}
          </section>
        )}
        </>
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
    </div>
  );
}
