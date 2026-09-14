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
  Users,
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
} from 'lucide-react';
import { AppSettings, ChatbotProvider, DialogueDifficulty, RoleplayLength, Language } from '../types';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'fast' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'fast'
                    ? 'bg-amber-950/40 border-amber-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-amber-300">⚡ AI Siêu Tốc</span>
                  <span className="text-[10px] text-zinc-400 font-mono">100% Ổn định, 0.5s</span>
                </div>
                {localSettings.defaultProvider === 'fast' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'gemini' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'gemini'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-sky-300">Gemini Web</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Playwright Headless</span>
                </div>
                {localSettings.defaultProvider === 'gemini' && <Check className="w-4 h-4 text-sky-400" />}
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
                  <span className="block font-bold text-emerald-300">ChatGPT Web</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Playwright Headless</span>
                </div>
                {localSettings.defaultProvider === 'chatgpt' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'antigravity' })}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'antigravity'
                    ? 'bg-purple-950/40 border-purple-500 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-purple-300">Antigravity</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Local CLI (agy)</span>
                </div>
                {localSettings.defaultProvider === 'antigravity' && <Check className="w-4 h-4 text-purple-400" />}
              </button>
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

          {/* Topic Theme Preference */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>{t.settingTopicPreferenceLabel}</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                [ {localSettings.topicPreference || 'all'} ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">{t.settingTopicPreferenceDesc}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: '🌐 Đa Dạng Mọi Chủ Đề', desc: 'Tự động đổi sinh động mỗi ngày' },
                { id: 'workplace', label: '🏢 Công Sở & TOEIC', desc: 'Email, hợp đồng, đàm phán' },
                { id: 'daily_life', label: '☕ Đời Sống Hàng Ngày', desc: 'Giao tiếp, mua sắm, ẩm thực' },
                { id: 'travel', label: '✈️ Du Lịch & Khám Phá', desc: 'Sân bay, khách sạn, chỉ đường' },
                { id: 'tech', label: '💻 Công Nghệ Hiện Đại', desc: 'AI, thiết bị, mạng xã hội' },
                { id: 'custom', label: '✍️ Tùy Chỉnh Theo Ý', desc: 'Tự nhập chủ đề bạn mong muốn' },
              ].map((tp) => {
                const isSelected = (localSettings.topicPreference || 'all') === tp.id;
                return (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() =>
                      setLocalSettings({ ...localSettings, topicPreference: tp.id as any })
                    }
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-950/30 border-zinc-700 text-white shadow-sm'
                        : 'border-l-2 border-l-zinc-700 bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tp.label}</span>
                    <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">{tp.desc}</span>
                  </button>
                );
              })}
            </div>

            {localSettings.topicPreference === 'custom' && (
              <div className="pt-2 animate-fade-in">
                <input
                  type="text"
                  value={localSettings.customTopic || ''}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, customTopic: e.target.value })
                  }
                  placeholder={t.settingCustomTopicPlaceholder}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* TOEIC Signature Grammar Pattern Focus */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{t.settingGrammarFocusLabel}</span>
              </label>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800">
                [ {localSettings.grammarFocus || 'toeic_all'} ]
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">{t.settingGrammarFocusDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'toeic_all',
                  label: '🎯 Tổng Hợp Bẫy TOEIC Theo Level (Khuyên dùng)',
                  desc: 'Học lần lượt các cấu trúc cốt lõi từ A1 đến B2 (mệnh lệnh, từ loại, hòa hợp S-V, mệnh đề quan hệ)',
                },
                {
                  id: 'word_forms',
                  label: '🧩 Nhận Diện & Biến Đổi Từ Loại (Word Forms)',
                  desc: 'Bẫy nhận diện Danh từ, Tính từ, Động từ, Trạng từ trong Part 5 chiếm 30% đề thi',
                },
                {
                  id: 'tenses',
                  label: '⏱️ Thì & Sự Hòa Hợp Chủ Ngữ - Động Từ',
                  desc: 'Bẫy chia động từ, Hiện tại hoàn thành (since/for), Each of, Neither/Either',
                },
                {
                  id: 'conjunctions',
                  label: '🔗 Phân Biệt Liên Từ vs Giới Từ',
                  desc: 'Bẫy kinh điển: Although vs Despite, Because vs Due to, While vs During',
                },
                {
                  id: 'participles',
                  label: '⚡ Bị Động & Rút Gọn Mệnh Đề Phân Từ',
                  desc: 'Phân biệt V-ing (chủ động) vs V-ed/V3 (bị động) - Dạng câu phân loại điểm 700+',
                },
              ].map((gf) => {
                const isSelected = (localSettings.grammarFocus || 'toeic_all') === gf.id;
                return (
                  <button
                    key={gf.id}
                    type="button"
                    onClick={() =>
                      setLocalSettings({ ...localSettings, grammarFocus: gf.id as any })
                    }
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-l-4 border-l-indigo-500 bg-indigo-950/30 border-zinc-700 text-white shadow-sm'
                        : 'border-l-2 border-l-zinc-700 bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{gf.label}</span>
                    <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">{gf.desc}</span>
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

          {/* Dialogue 2-Party Defaults */}
          <div className="space-y-3 pb-4 border-b border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{t.settingDefaultRolesTitle}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  {t.settingDefaultUserRole}
                </span>
                <input
                  type="text"
                  value={localSettings.defaultUserRole}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, defaultUserRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  {t.settingDefaultAiRole}
                </span>
                <input
                  type="text"
                  value={localSettings.defaultAiRole}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, defaultAiRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  {t.settingDefaultLength}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['short', 'medium', 'long'] as RoleplayLength[]).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, defaultRoleplayLength: len })}
                      className={`py-1.5 px-2 rounded-md text-[11px] border capitalize font-mono ${
                        localSettings.defaultRoleplayLength === len
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">
                  {t.settingDefaultDifficulty}
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {(['A2', 'B1', 'B2', 'C1', 'C2'] as DialogueDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, defaultRoleplayDifficulty: diff })
                      }
                      className={`py-1.5 rounded-md text-[11px] font-mono font-bold border ${
                        localSettings.defaultRoleplayDifficulty === diff
                          ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
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

          {/* Test & Profile management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Playwright Profile &amp; Stealth Status
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={clearingProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-sky-400 hover:text-sky-300 transition-colors font-mono text-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{clearingProfile ? 'Checking...' : 'Check Connection'}</span>
              </button>
            </div>
            {profileStatus && (
              <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40">
                {profileStatus}
              </p>
            )}
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
