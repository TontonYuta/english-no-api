import React from 'react';
import { ChatbotProvider, Language } from '../types';
import { Bot, Terminal, Eye, EyeOff, Settings, Globe } from 'lucide-react';
import { translations } from '../translations';

interface NavbarProps {
  appMode: 'daily' | 'studio';
  setAppMode: (mode: 'daily' | 'studio') => void;
  provider: ChatbotProvider;
  setProvider: (provider: ChatbotProvider) => void;
  headless: boolean;
  setHeadless: (val: boolean) => void;
  onOpenTerminal: () => void;
  isAutomating: boolean;
  lang: Language;
  onToggleLang: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  provider,
  setProvider,
  headless,
  setHeadless,
  onOpenTerminal,
  isAutomating,
  lang,
  onToggleLang,
  onOpenSettings,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                {t.appName}
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-semibold hidden sm:inline">
                {appMode === 'daily' ? (lang === 'vi' ? '☀️ Học Hàng Ngày' : '☀️ Daily Mode') : t.engineBadge}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans hidden md:block">
              {appMode === 'daily'
                ? (lang === 'vi' ? '5–10 phút luyện phản xạ mỗi ngày cùng AI' : '5–10 minutes daily bite-sized English routine')
                : t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Engine Controls & Settings */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setAppMode('daily')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                appMode === 'daily'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>🔥</span>
              <span className="hidden sm:inline">{lang === 'vi' ? 'Học Hàng Ngày' : 'Daily Routine'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAppMode('studio')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                appMode === 'studio'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>🛠️</span>
              <span className="hidden sm:inline">{lang === 'vi' ? 'Chuyên Sâu' : 'Studio'}</span>
            </button>
          </div>
          {/* Language Switcher Button (prominent) */}
          <button
            id="navbar-language-toggle-btn"
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/50 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
            title="Đổi ngôn ngữ / Switch language"
          >
            <span className="text-sm">{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
            <span className="hidden sm:inline font-mono">
              {lang === 'vi' ? 'Tiếng Việt' : 'English'}
            </span>
          </button>

          {/* Target Web Chatbot Selector */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-xs">
            <button
              id="provider-gemini-btn"
              type="button"
              disabled={isAutomating}
              onClick={() => setProvider('gemini')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
                provider === 'gemini'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              } ${isAutomating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Gemini
            </button>
            <button
              id="provider-chatgpt-btn"
              type="button"
              disabled={isAutomating}
              onClick={() => setProvider('chatgpt')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
                provider === 'chatgpt'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              } ${isAutomating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              ChatGPT
            </button>
          </div>

          {/* Headless Toggle */}
          <button
            id="navbar-headless-btn"
            type="button"
            disabled={isAutomating}
            onClick={() => setHeadless(!headless)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs text-neutral-300 transition-colors"
            title="Toggle headless browser mode"
          >
            {headless ? (
              <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-mono">{headless ? 'Headless' : 'Headed'}</span>
          </button>

          {/* Settings Button (Explicitly requested by user) */}
          <button
            id="navbar-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={t.settingsBtn}
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">{t.settingsBtn}</span>
          </button>

          {/* Open Terminal Monitor Button */}
          <button
            id="open-terminal-monitor-btn"
            type="button"
            onClick={onOpenTerminal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              isAutomating
                ? 'bg-sky-950/80 border-sky-700 text-sky-300 animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.monitorStream}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
