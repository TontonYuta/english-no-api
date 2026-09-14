import React, { useEffect, useRef, useState } from 'react';
import {
  PipelineStep,
  AutomationLog,
  PipelineStepId,
  ChatbotProvider,
  Language,
} from '../types';
import {
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  Terminal,
  Copy,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  X,
  FileCode2,
  Sparkles,
} from 'lucide-react';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: PipelineStep[];
  logs: AutomationLog[];
  rawChunk: string;
  provider: ChatbotProvider;
  headless: boolean;
  onToggleHeadless: (val: boolean) => void;
  isRunning: boolean;
  error?: string | null;
  onViewResults?: () => void;
  lang?: Language;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  steps,
  logs,
  rawChunk,
  provider,
  headless,
  onToggleHeadless,
  isRunning,
  error,
  onViewResults,
  lang = 'vi',
}) => {
  const isVi = lang === 'vi';
  const [activeTab, setActiveTab] = useState<'terminal' | 'raw'>('terminal');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, rawChunk, autoScroll]);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.stepId}] ${l.message} ${l.detail ? `(${l.detail})` : ''}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-sky-500 animate-spin shrink-0" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />;
    }
  };

  const getLogLevelBadge = (level: AutomationLog['level']) => {
    switch (level) {
      case 'scraper':
        return 'text-purple-400 bg-purple-950/50 border-purple-800/60';
      case 'dom':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      case 'wait':
        return 'text-sky-400 bg-sky-950/50 border-sky-800/60';
      case 'success':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/50 border-yellow-800/60';
      case 'error':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
      default:
        return 'text-neutral-400 bg-neutral-900 border-neutral-700';
    }
  };

  const isAllComplete = steps.every((s) => s.status === 'completed');

  return (
    <div
      id="automation-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="automation-modal-container"
        className={`bg-neutral-950 border border-neutral-700 rounded-none shadow-2xl flex flex-col transition-all duration-300 w-full overflow-hidden border-l-4 border-l-sky-500 ${
          isExpanded ? 'h-[95vh] max-w-6xl' : 'h-[85vh] max-w-5xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {isVi ? 'Quy Trình Tự Động Hóa Playwright' : 'Playwright Automation Pipeline'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-none font-bold uppercase bg-neutral-900 text-neutral-300 border border-neutral-700">
                  [{provider === 'gemini' ? 'Gemini Web' : 'ChatGPT Web'}]
                </span>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-none font-bold uppercase bg-sky-950 text-sky-400 border border-sky-700/70 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-none bg-sky-400 animate-ping" />
                    {isVi ? '[ ĐANG CHẠY TRỰC TIẾP ]' : '[ EXECUTING LIVE ]'}
                  </span>
                )}
                {isAllComplete && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-none font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {isVi ? '[ HOÀN THÀNH ]' : '[ COMPLETED ]'}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                {isVi
                  ? 'Điều khiển phiên trình duyệt bảo mật, kết nối trực tiếp không tốn token API'
                  : 'Stealth persistent browser context automating web AI without paid API billing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Headless Toggle */}
            <button
              id="headless-toggle-btn"
              type="button"
              disabled={isRunning}
              onClick={() => onToggleHeadless(!headless)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-none border transition-colors ${
                headless
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  : 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-950'
              } ${isRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Toggle between background headless execution and visible Chromium window"
            >
              {headless ? <EyeOff className="w-3.5 h-3.5 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
              <span>{headless ? '[ HEADLESS ]' : '[ VISIBLE ]'}</span>
            </button>

            {/* Expand / Minimize */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize modal' : 'Expand modal'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              id="close-automation-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6-Step Visual Pipeline Tracker */}
        <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-950">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {steps.map((step) => {
              const isCurrent = step.status === 'running';
              const isDone = step.status === 'completed';
              const isErr = step.status === 'failed';

              return (
                <div
                  key={step.id}
                  id={`pipeline-step-${step.stepNumber}`}
                  className={`p-2.5 rounded-none border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-sky-950/40 border-sky-500 border-l-4'
                      : isDone
                      ? 'bg-neutral-900 border-emerald-800/60 border-l-2 border-l-emerald-500'
                      : isErr
                      ? 'bg-rose-950/40 border-rose-800/60 border-l-2 border-l-rose-500'
                      : 'bg-neutral-900/40 border-neutral-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none border ${
                        isCurrent
                          ? 'bg-sky-500 text-neutral-950 border-sky-400'
                          : isDone
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      STEP {step.stepNumber}
                    </span>
                    {getStepIcon(step.status)}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-mono font-bold uppercase leading-tight line-clamp-1 ${
                        isCurrent ? 'text-sky-300' : isDone ? 'text-neutral-200' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[10px] font-mono text-neutral-500 line-clamp-1 mt-0.5">
                      {step.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal & Content Tabs */}
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 font-mono">
          {/* Terminal Sub-header / Controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeTab === 'terminal'
                    ? 'bg-neutral-800 text-white font-bold border-neutral-600'
                    : 'text-neutral-400 hover:text-neutral-200 border-transparent'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Execution Logs ({logs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'bg-neutral-800 text-white font-bold border-neutral-600'
                    : 'text-neutral-400 hover:text-neutral-200 border-transparent'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Scraped DOM Payload</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 cursor-pointer select-none font-mono text-xs">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded-none border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] uppercase">Auto-scroll</span>
              </label>

              <button
                type="button"
                onClick={handleCopyLogs}
                className="flex items-center gap-1 px-2.5 py-1 rounded-none font-mono uppercase text-xs text-neutral-300 hover:text-white bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '[ COPIED ]' : '[ COPY LOGS ]'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            id="playwright-terminal-logs"
            className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-1.5 bg-neutral-950"
          >
            {activeTab === 'terminal' ? (
              logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-xs font-mono">
                  <Terminal className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                  <span>Awaiting Playwright automation launch sequence...</span>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2.5 py-0.5 hover:bg-neutral-900/60 rounded-none px-1 group font-mono"
                  >
                    <span className="text-neutral-500 shrink-0 select-none">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-none border text-[10px] uppercase font-bold shrink-0 ${getLogLevelBadge(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <div className="flex-1 text-neutral-200 break-words">
                      <span className="text-white">{log.message}</span>
                      {log.detail && (
                        <span className="block text-[11px] text-neutral-400 mt-0.5 font-normal">
                          ↳ {log.detail}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="text-neutral-300 whitespace-pre-wrap font-mono text-xs bg-neutral-950 p-3 rounded-none border border-neutral-800">
                {rawChunk || '// No raw response stream extracted yet.'}
              </div>
            )}

            {error && (
              <div className="p-3 my-2 rounded-none bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
            <span>Target: <strong className="text-neutral-300">{provider === 'gemini' ? 'https://gemini.google.com/app' : 'https://chatgpt.com'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold uppercase text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-none border border-neutral-700 transition-colors cursor-pointer"
            >
              {isAllComplete ? '[ CLOSE MONITOR ]' : '[ MINIMIZE ]'}
            </button>

            {isAllComplete && onViewResults && (
              <button
                id="view-rendered-result-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onViewResults();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase text-white bg-sky-600 hover:bg-sky-500 rounded-none border border-sky-400 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>[ VIEW OUTPUT ]</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
