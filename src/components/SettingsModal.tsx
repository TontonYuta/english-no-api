import React, { useState } from 'react';
import {
  X,
  Settings,
  Globe,
  Sliders,
  Bot,
  Eye,
  EyeOff,
  Volume2,
  Check,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Target,
  BookOpen,
  Compass,
  Layers,
  Sparkles,
  Trash2,
  AlertTriangle,
  Key,
  ExternalLink,
} from 'lucide-react';
import { AppSettings, ChatbotProvider, Language } from '../types';
import { translations } from '../translations';
import { playAudioPronunciation } from '../utils/speechUtils';
import { resetAllAppData } from '../utils/learningMemory';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedMessage, setSavedMessage] = useState(false);
  const [clearingProfile, setClearingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);
  const [isClosingBrowser, setIsClosingBrowser] = useState(false);
  const [loginStatusMessage, setLoginStatusMessage] = useState<string | null>(null);

  const handleOpenLogin = async (targetProvider: 'gemini' | 'chatgpt' = 'gemini') => {
    setIsOpeningBrowser(true);
    setLoginStatusMessage(null);
    try {
      const res = await fetch('/api/playwright/open-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: targetProvider }),
      });
      const data = await res.json();
      if (data.message) {
        setLoginStatusMessage(data.message + ' (Lưu ý: Sau khi đăng nhập xong, hãy đóng cửa sổ trình duyệt để giải phóng phiên cho chế độ tự động).');
      }
    } catch (err: any) {
      setLoginStatusMessage('Lỗi mở trình duyệt: ' + err.message);
    } finally {
      setIsOpeningBrowser(false);
    }
  };

  const handleCloseLogin = async () => {
    setIsClosingBrowser(true);
    try {
      const res = await fetch('/api/playwright/close-login', { method: 'POST' });
      const data = await res.json();
      setLoginStatusMessage(data.message || 'Đã đóng trình duyệt đăng nhập.');
    } catch (err: any) {
      setLoginStatusMessage('Lỗi đóng trình duyệt: ' + err.message);
    } finally {
      setIsClosingBrowser(false);
    }
  };

  if (!isOpen) return null;

  const t = translations[localSettings.language];

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 600);
  };

  const handleTestConnection = async () => {
    setClearingProfile(true);
    setProfileStatus(null);
    try {
      const res = await fetch('/api/playwright/status');
      const data = await res.json();
      setProfileStatus(
        localSettings.language === 'vi'
          ? `Đã kết nối hồ sơ Playwright thành công (${data.userDataDir})`
          : `Playwright profile connected: ${data.userDataDir}`
      );
    } catch (e) {
      setProfileStatus(
        localSettings.language === 'vi'
          ? 'Không thể kiểm tra kết nối trình duyệt'
          : 'Failed to query Playwright status'
      );
    } finally {
      setClearingProfile(false);
    }
  };

  const handleResetAll = () => {
    setResetting(true);
    resetAllAppData();
    setResetSuccessMessage(true);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight uppercase">
                {t.settingsModalTitle}
              </h3>
              <p className="text-xs text-zinc-400">
                {t.settingsModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-300 font-sans">
          {/* Language Selection */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2 font-mono">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>{t.settingLangLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'vi' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.language === 'vi'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇻🇳</span>
                  <div>
                    <span className="block font-bold">Tiếng Việt</span>
                    <span className="text-[10px] text-zinc-400">Giao diện tiếng Việt chuẩn</span>
                  </div>
                </div>
                {localSettings.language === 'vi' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.language === 'en'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇬🇧</span>
                  <div>
                    <span className="block font-bold">English</span>
                    <span className="text-[10px] text-zinc-400">Native English interface</span>
                  </div>
                </div>
                {localSettings.language === 'en' && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>

          {/* Focus Mode (Chế độ học tinh gọn) */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Target className="w-4 h-4 text-amber-400" />
                <span>{localSettings.language === 'vi' ? 'Chế độ học tinh gọn (Focus Mode)' : 'Distraction-Free Focus Mode'}</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                {localSettings.language === 'vi' ? 'Phím tắt: Shift + F' : 'Hotkey: Shift + F'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              {localSettings.language === 'vi'
                ? 'Ẩn các thông số kỹ thuật (Provider, DOM logs, inspector prompt). Giữ giao diện siêu sạch 100% cho việc đọc, nghe, nói, phản xạ.'
                : 'Hides technical parameters (AI providers, DOM logs, prompt inspector). Keeps UI ultra-clean and distraction-free.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, focusMode: true })}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  localSettings.focusMode
                    ? 'bg-amber-950/40 border-amber-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-amber-300">
                    🎯 {localSettings.language === 'vi' ? 'Bật Tinh Gọn (Focus ON)' : 'Focus Mode ON'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {localSettings.language === 'vi' ? 'Tối giản & chống rối' : 'Clean & minimal UI'}
                  </span>
                </div>
                {localSettings.focusMode && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, focusMode: false })}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  !localSettings.focusMode
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-zinc-200">
                    🛠️ {localSettings.language === 'vi' ? 'Đầy đủ (Pro / Dev)' : 'Standard / Pro Mode'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {localSettings.language === 'vi' ? 'Hiện mọi thông số & logs' : 'Show all parameters & logs'}
                  </span>
                </div>
                {!localSettings.focusMode && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>

          {/* Chatbot Provider Selection */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{t.settingProviderLabel}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'gemini' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'gemini' || localSettings.defaultProvider === 'fast'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-sky-300">✨ Google Gemini</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Web Playwright / Direct API</span>
                </div>
                {(localSettings.defaultProvider === 'gemini' || localSettings.defaultProvider === 'fast') && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'antigravity' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'antigravity' || localSettings.defaultProvider === 'agy'
                    ? 'bg-purple-950/40 border-purple-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-purple-300">🚀 Antigravity (agy)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Local Native CLI Mode</span>
                </div>
                {(localSettings.defaultProvider === 'antigravity' || localSettings.defaultProvider === 'agy') && <Check className="w-4 h-4 text-purple-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'chatgpt' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'chatgpt'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-emerald-300">🤖 ChatGPT Web</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Playwright Headless</span>
                </div>
                {localSettings.defaultProvider === 'chatgpt' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Gemini AI Detailed Configuration Card */}
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Cấu hình Google Gemini AI (Miễn phí & Tốc độ cao)</span>
              </label>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-900/40 px-2 py-0.5 rounded border border-sky-800">
                PlayEng AI
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              PlayEng hỗ trợ 2 chế độ Google Gemini để chấm điểm khách quan và phân tích bài học:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1">
                  Cách 1: Google Gemini API Key (Tùy chọn - Phản hồi 1.5s tức thì)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="AIzaSy... (Lấy miễn phí tại aistudio.google.com)"
                      value={localSettings.geminiApiKey || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {localSettings.geminiApiKey && (
                    <button
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, geminiApiKey: '' })}
                      className="px-2.5 py-2 text-xs font-mono text-zinc-400 hover:text-red-400 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  * Nếu không có API Key, hãy để trống. Hệ thống sẽ tự động dùng Gemini Web miễn phí bên dưới.
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <span className="block text-[11px] font-mono font-bold text-zinc-300">
                    Cách 2: Gemini Web Playwright (Miễn phí 100%, không cần API Key)
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Tự động hóa qua Playwright. Bấm nút để đăng nhập tài khoản Google của bạn một lần duy nhất:
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    disabled={isOpeningBrowser}
                    onClick={() => handleOpenLogin('gemini')}
                    className="px-3 py-1.5 rounded-lg bg-sky-900/60 hover:bg-sky-850 border border-sky-600/50 text-sky-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isOpeningBrowser ? 'Đang mở...' : '🔑 Mở Trình Duyệt Đăng Nhập'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isClosingBrowser}
                    onClick={handleCloseLogin}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Đóng cửa sổ đăng nhập để giải phóng phiên cho chế độ tự động"
                  >
                    <span>{isClosingBrowser ? 'Đang đóng...' : '✖ Đóng Trình Duyệt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={clearingProfile}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sky-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Kiểm tra trạng thái hồ sơ Playwright"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>{clearingProfile ? 'Đang kiểm tra...' : '🛡️ Kiểm Tra Hồ Sơ'}</span>
                  </button>
                </div>
              </div>

              {loginStatusMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-mono">
                  {loginStatusMessage}
                </div>
              )}

              {profileStatus && (
                <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/40 text-xs text-sky-300 font-mono">
                  {profileStatus}
                </div>
              )}
            </div>
          </div>

          {/* CEFR English Proficiency Level Selection */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Target className="w-4 h-4 text-sky-400" />
                <span>{t.settingUserLevelLabel}</span>
              </label>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
                [ HIỆN TẠI: {localSettings.userLevel || 'A1'} ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">{t.settingUserLevelDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'A1',
                  label: '🌱 Level A1: Khởi Đầu (Beginner)',
                  desc: 'Mất gốc / Mới bắt đầu - Tốc độ chậm, câu ngắn 5-8 từ, có mẹo phát âm tiếng Việt',
                  target: 'Giao tiếp cơ bản hàng ngày',
                },
                {
                  id: 'A2',
                  label: '🌿 Level A2: Cơ Bản (Elementary)',
                  desc: 'Công sở quen thuộc - Câu 8-12 từ, bối cảnh đàm thoại văn phòng chuẩn mực',
                  target: 'Bối cảnh đồng nghiệp & email ngắn',
                },
                {
                  id: 'B1',
                  label: '🌳 Level B1: Trung Cấp (Intermediate)',
                  desc: 'TOEIC 500–650 - Collocations & Phrasal verbs công sở, email dự án & báo cáo',
                  target: 'Họp nội bộ & trao đổi đối tác',
                },
                {
                  id: 'B2',
                  label: '🎯 Level B2: Nâng Cao (Upper-Intermediate)',
                  desc: 'Bứt phá TOEIC 700+ - Hợp đồng thương mại, đàm phán ngoại giao & bẫy đề thi',
                  target: 'Đàm phán chuyên nghiệp & hợp đồng',
                },
              ].map((lvl) => {
                const isSelected = (localSettings.userLevel || 'A1') === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        userLevel: lvl.id as any,
                      })
                    }
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-l-4 border-l-sky-500 bg-sky-950/30 border-zinc-700 text-white shadow-sm'
                        : 'border-l-2 border-l-zinc-700 bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{lvl.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                      {lvl.desc}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-500">
                      🎯 Mục tiêu: {lvl.target}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Vocabulary Target */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{t.settingDailyVocabCountLabel}</span>
              </label>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800">
                [ {localSettings.dailyVocabCount || 3} TỪ / BUỔI ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">{t.settingDailyVocabCountDesc}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { count: 3, label: '🌱 3 Từ / Ngày', sub: 'Nhẹ nhàng (5-8 phút)' },
                { count: 5, label: '🌿 5 Từ / Ngày', sub: 'Chuẩn mực (10-12 phút)' },
                { count: 8, label: '🌳 8 Từ / Ngày', sub: 'Tăng tốc (15 phút)' },
                { count: 10, label: '🎯 10 Từ / Ngày', sub: 'Cường độ cao (20 phút)' },
              ].map((opt) => {
                const isSelected = (localSettings.dailyVocabCount || 3) === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() =>
                      setLocalSettings({ ...localSettings, dailyVocabCount: opt.count })
                    }
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-l-4 border-l-amber-500 bg-amber-950/30 border-zinc-700 text-white shadow-sm'
                        : 'border-l-2 border-l-zinc-700 bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-Generation Old Vocabulary Review Quiz Count */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {localSettings.language === 'vi'
                    ? 'Trắc nghiệm từ vựng cũ trước khi tạo bài mới'
                    : 'Pre-Generation Vocab Review Quiz'}
                </span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                [ {(localSettings.reviewVocabQuestionCount ?? 3) === 0 ? (localSettings.language === 'vi' ? 'ĐANG TẮT' : 'DISABLED') : `${localSettings.reviewVocabQuestionCount ?? 3} CÂU`} ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
              {localSettings.language === 'vi'
                ? 'Tự động mở bài trắc nghiệm nhanh để bạn ôn lại các từ vựng đã lưu trong kho trước khi tạo bài học mới, giúp củng cố phản xạ và nhớ từ vựng sâu hơn.'
                : 'Automatically opens an active recall quiz from your saved vocabulary bank before generating each new lesson.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { count: 0, label: 'Tắt', sub: 'Tạo bài ngay' },
                { count: 3, label: '🌱 3 Câu', sub: '1 phút (Gợi ý)' },
                { count: 5, label: '🌿 5 Câu', sub: '2 phút (Chuẩn)' },
                { count: 8, label: '🌳 8 Câu', sub: '3 phút (Kỹ)' },
                { count: 10, label: '🎯 10 Câu', sub: 'Thử thách sâu' },
              ].map((opt) => {
                const isSelected = (localSettings.reviewVocabQuestionCount ?? 3) === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() =>
                      setLocalSettings({ ...localSettings, reviewVocabQuestionCount: opt.count })
                    }
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-950/40 border-zinc-700 text-white shadow-sm'
                        : 'border-l-2 border-l-zinc-700 bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browser Display Mode (Headless / Headed) */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
              {localSettings.headless ? (
                <EyeOff className="w-4 h-4 text-zinc-400" />
              ) : (
                <Eye className="w-4 h-4 text-amber-400" />
              )}
              <span>{t.settingHeadlessLabel}</span>
            </label>
            <p className="text-[11px] text-zinc-400 mb-2">{t.settingHeadlessDesc}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, headless: true })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  localSettings.headless
                    ? 'bg-zinc-950 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="block font-bold">Headless Mode</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {localSettings.language === 'vi' ? 'Chạy ngầm (Mặc định)' : 'Background (Default)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, headless: false })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  !localSettings.headless
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200 font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="block font-bold">Headed Mode</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {localSettings.language === 'vi' ? 'Hiện cửa sổ Chrome' : 'Visible Chromium Window'}
                </span>
              </button>
            </div>
          </div>

          {/* Speech Audio Preferences */}
          <div className="space-y-3 pb-4 border-b border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>{t.settingSpeechSpeedLabel}</span>
            </label>

            <div className="flex items-center gap-3">
              {[0.8, 1.0, 1.2].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, speechRate: speed })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                    localSettings.speechRate === speed
                      ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-zinc-400 text-[11px] font-mono">{t.settingSpeechVoiceLabel}:</span>
                {(['en-US', 'en-GB'] as const).map((vc) => (
                  <button
                    key={vc}
                    type="button"
                    onClick={() => setLocalSettings({ ...localSettings, speechVoice: vc })}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                      localSettings.speechVoice === vc
                        ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {vc === 'en-US' ? 'US (Mỹ)' : 'UK (Anh)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Voice Test Button */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
              <span className="text-[11px] text-zinc-400 font-mono">
                Kiểm tra âm thanh ngay tại đây:
              </span>
              <button
                type="button"
                onClick={() => {
                  playAudioPronunciation(
                    localSettings.speechVoice === 'en-GB'
                      ? 'Welcome to PlayEng Studio. Practice your British English pronunciation!'
                      : 'Welcome to PlayEng Studio. Practice your American English pronunciation!',
                    {
                      rate: localSettings.speechRate,
                      voice: localSettings.speechVoice,
                    }
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-sky-400 hover:text-sky-300 text-xs font-mono font-bold border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>[ 🔊 NGHE THỬ GIỌNG ĐỌC ]</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Xóa Toàn Bộ & Làm Lại Từ Đầu */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 font-mono">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{t.settingResetAllTitle}</span>
              </label>
              <span className="text-[10px] font-mono text-rose-400/90 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/60">
                [ DANGER ZONE ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {t.settingResetAllDesc}
            </p>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/70 text-rose-300 hover:text-rose-100 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.settingResetAllBtn}</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800/80 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5 text-rose-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="font-sans leading-relaxed">
                    {t.settingResetAllConfirmPrompt}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={resetting}
                    onClick={handleResetAll}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{resetting ? 'Resetting...' : t.settingResetAllConfirmBtn}</span>
                  </button>
                  <button
                    type="button"
                    disabled={resetting}
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs transition-colors border border-zinc-700 cursor-pointer"
                  >
                    {t.settingResetAllCancelBtn}
                  </button>
                </div>
              </div>
            )}

            {resetSuccessMessage && (
              <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60 animate-fade-in flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t.settingResetAllSuccess}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between font-mono">
          <div>
            {savedMessage && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" />
                {t.settingSaveSuccess}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors uppercase cursor-pointer"
            >
              {t.closeBtn}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-xs font-black text-white bg-sky-600 hover:bg-sky-500 border border-sky-400 transition-all cursor-pointer uppercase shadow-sm"
            >
              {t.saveCloseBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
