import React, { useState } from 'react';
import { MainTabType, ChatbotProvider, Language } from '../types';
import {
  Bot,
  Settings,
  Flame,
  BookOpen,
  Layers,
  Headphones,
  MessageSquare,
  PenTool,
  Brain,
  ChevronDown,
  Zap,
  Target,
} from 'lucide-react';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: MainTabType;
  setCurrentTab: (tab: MainTabType) => void;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  setUserLevel: (lvl: 'A1' | 'A2' | 'B1' | 'B2') => void;
  streak: number;
  provider: ChatbotProvider;
  setProvider: (provider: ChatbotProvider) => void;
  isAutomating: boolean;
  lang: Language;
  onToggleLang: () => void;
  onOpenSettings: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userLevel,
  setUserLevel,
  streak,
  provider,
  setProvider,
  isAutomating,
  lang,
  onToggleLang,
  onOpenSettings,
  focusMode = false,
  onToggleFocusMode,
}) => {
  const t = translations[lang];
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  const TABS: {
    id: MainTabType;
    icon: React.ReactNode;
    labelVi: string;
    labelEn: string;
    badge?: string;
  }[] = [
    {
      id: 'today',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      labelVi: 'Hôm Nay',
      labelEn: 'Today',
      badge: '1-Click',
    },
    {
      id: 'vocab',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      labelVi: 'Từ Vựng & Wordform',
      labelEn: 'Vocabulary',
    },
    {
      id: 'grammar',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      labelVi: 'Ngữ Pháp TOEIC',
      labelEn: 'Grammar',
    },
    {
      id: 'read_listen',
      icon: <Headphones className="w-4 h-4 text-emerald-400" />,
      labelVi: 'Đọc & Nghe',
      labelEn: 'Read & Listen',
    },
    {
      id: 'chat',
      icon: <MessageSquare className="w-4 h-4 text-sky-400" />,
      labelVi: 'Nhắn Tin (Chat)',
      labelEn: 'Messenger',
      badge: 'Live',
    },
    {
      id: 'writing',
      icon: <PenTool className="w-4 h-4 text-rose-400" />,
      labelVi: 'Luyện Viết',
      labelEn: 'Writing',
    },
    {
      id: 'memory',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      labelVi: 'Sổ Nhớ & Ôn Tập',
      labelEn: 'Memory Bank',
    },
  ];

  const levelLabels: Record<'A1' | 'A2' | 'B1' | 'B2', string> = {
    A1: 'A1 (Khởi Đầu)',
    A2: 'A2 (Cơ Bản)',
    B1: 'B1 (Trung Cấp)',
    B2: 'B2 (Nâng Cao)',
  };

  return (
    <header className="border-b border-zinc-850 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand & Level Picker */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 border border-sky-400/30 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-white uppercase">
              PlayEng
            </h1>

            {/* Quick Level Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-750 text-xs font-mono font-semibold text-sky-300 transition-colors cursor-pointer shadow-xs"
                title="Thay đổi trình độ học"
              >
                <span>LEVEL {userLevel}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isLevelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsLevelDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-40 py-1 font-mono text-xs overflow-hidden">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setUserLevel(lvl);
                          setIsLevelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-800 cursor-pointer transition-colors ${
                          userLevel === lvl ? 'text-sky-300 font-bold bg-sky-950/40' : 'text-zinc-300'
                        }`}
                      >
                        <span>{levelLabels[lvl]}</span>
                        {userLevel === lvl && <span className="text-sky-400 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Streak, Engine Badge, Settings, Language */}
        <div className="flex items-center gap-2">
          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-bold shadow-xs"
            title="Chuỗi ngày học liên tục"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}D</span>
          </div>

          {/* Focus Mode Toggle */}
          {onToggleFocusMode && (
            <button
              id="navbar-focus-mode-toggle-btn"
              type="button"
              onClick={onToggleFocusMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                focusMode
                  ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={
                focusMode
                  ? (lang === 'vi' ? 'Đang BẬT chế độ Tinh Gọn (Focus Mode) - Bấm hoặc nhấn Shift+F để tắt' : 'Focus Mode is ON - Click or press Shift+F to exit')
                  : (lang === 'vi' ? 'Bật chế độ Tinh Gọn (Focus Mode) - Ẩn bớt thông số kỹ thuật (Shift+F)' : 'Enable Focus Mode - Clean & minimal UI (Shift+F)')
              }
            >
              <Target className={`w-3.5 h-3.5 ${focusMode ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">
                {focusMode ? (lang === 'vi' ? 'FOCUS: BẬT' : 'FOCUS: ON') : 'FOCUS'}
              </span>
            </button>
          )}

          {/* Engine Status Badge (Hidden in Focus Mode) */}
          {!focusMode && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Đổi bộ máy AI (Cài đặt)"
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span className="uppercase">
                {provider === 'fast'
                  ? '⚡ Siêu Tốc'
                  : provider === 'gemini'
                  ? 'Gemini'
                  : provider === 'chatgpt'
                  ? 'ChatGPT'
                  : 'agy'}
              </span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            id="navbar-language-toggle-btn"
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Đổi ngôn ngữ"
          >
            <span>{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
            <span className="font-bold">{lang === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          {/* Settings Button */}
          <button
            id="navbar-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={t.settingsBtn}
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">{t.settingsBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="border-t border-zinc-850 bg-zinc-950/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-850 text-white font-semibold shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{lang === 'vi' ? tab.labelVi : tab.labelEn}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
