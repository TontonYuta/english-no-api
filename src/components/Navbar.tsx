import React, { useState } from 'react';
import { ChatbotProvider, Language, CEFRLevel } from '../types';
import {
  Bot,
  Settings,
  Flame,
  ChevronDown,
  Zap,
  Target,
  QrCode,
  Brain,
  Sparkles,
} from 'lucide-react';
import { translations } from '../translations';

interface NavbarProps {
  userLevel: CEFRLevel;
  setUserLevel: (lvl: CEFRLevel) => void;
  streak: number;
  provider: ChatbotProvider;
  setProvider: (provider: ChatbotProvider) => void;
  isAutomating: boolean;
  lang: Language;
  onToggleLang: () => void;
  onOpenSettings: () => void;
  onOpenMobileRemote?: () => void;
  onOpenMemoryBank?: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  onGeneratePassage?: () => void;
  isGeneratingPassage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userLevel,
  setUserLevel,
  streak,
  provider,
  setProvider,
  isAutomating,
  lang,
  onToggleLang,
  onOpenSettings,
  onOpenMobileRemote,
  onOpenMemoryBank,
  focusMode = false,
  onToggleFocusMode,
  onGeneratePassage,
  isGeneratingPassage = false,
}) => {
  const t = translations[lang];
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const levelLabels: Record<CEFRLevel, string> = {
    A1: 'A1 (Khởi Đầu)',
    A2: 'A2 (Cơ Bản)',
    B1: 'B1 (Trung Cấp)',
    B2: 'B2 (Nâng Cao)',
    C1: 'C1 (Thành Thạo)',
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
                    {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
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
            {/* Quick Generate Passage Button */}
            {onGeneratePassage && (
              <button
                type="button"
                onClick={onGeneratePassage}
                disabled={isGeneratingPassage || isAutomating}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer ml-1"
                title="Tạo bài đọc mới ngẫu nhiên"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPassage ? 'animate-spin' : ''}`} />
                <span>{isGeneratingPassage ? 'Đang tạo...' : 'Tạo bài đọc'}</span>
              </button>
            )}
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

          {/* Quick Engine Switcher (Hidden in Focus Mode) */}
          {!focusMode && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-sky-500/25 text-sky-300 font-bold border border-sky-400/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Chuyển sang ✨ Google Gemini AI"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>✨ Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('fast')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  provider === 'fast'
                    ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Chuyển sang ⚡ AI Siêu Tốc (Offline)"
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>⚡ Siêu Tốc</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('chatgpt')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  provider === 'chatgpt'
                    ? 'bg-green-500/25 text-green-300 font-bold border border-green-400/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Chuyển sang 🤖 ChatGPT Web"
              >
                <Bot className="w-3 h-3 text-green-400" />
                <span>ChatGPT</span>
              </button>
            </div>
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

          {/* Memory Bank Button */}
          {onOpenMemoryBank && (
            <button
              id="navbar-memory-bank-btn"
              type="button"
              onClick={onOpenMemoryBank}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-mono font-bold text-purple-300 hover:text-purple-200 transition-all cursor-pointer shadow-xs"
              title="Mở Sổ Từ Vựng & Lịch Sử Ôn Tập"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Sổ Nhớ</span>
            </button>
          )}

          {/* Mobile Remote QR Button */}
          {onOpenMobileRemote && (
            <button
              id="navbar-mobile-remote-btn"
              type="button"
              onClick={onOpenMobileRemote}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 text-xs font-mono font-bold text-sky-300 hover:text-sky-200 transition-all cursor-pointer shadow-xs"
              title={lang === 'vi' ? 'Mở Remote Mobile qua mã QR (LAN & 4G/5G Cloudflare)' : 'Open Mobile Remote via QR (LAN & 4G/5G Cloudflare)'}
            >
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Mobile QR</span>
            </button>
          )}

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
    </header>
  );
};
