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
} from 'lucide-react';
import { AppSettings, ChatbotProvider, DialogueDifficulty, RoleplayLength, Language } from '../types';
import { translations } from '../translations';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.settingsModalTitle}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.settingsModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-300 font-sans">
          {/* Language Selection */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>{t.settingLangLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'vi' })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  localSettings.language === 'vi'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇻🇳</span>
                  <div>
                    <span className="block font-bold">Tiếng Việt</span>
                    <span className="text-[10px] text-neutral-400">Giao diện tiếng Việt chuẩn</span>
                  </div>
                </div>
                {localSettings.language === 'vi' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  localSettings.language === 'en'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇬🇧</span>
                  <div>
                    <span className="block font-bold">English</span>
                    <span className="text-[10px] text-neutral-400">English Native Mode</span>
                  </div>
                </div>
                {localSettings.language === 'en' && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>

          {/* Chatbot Provider Selection */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{t.settingProviderLabel}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'gemini' })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'gemini'
                    ? 'bg-sky-950/40 border-sky-500 text-white font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-sky-300">Gemini Web</span>
                  <span className="text-[10px] text-neutral-400">gemini.google.com/app</span>
                </div>
                {localSettings.defaultProvider === 'gemini' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'chatgpt' })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'chatgpt'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-emerald-300">ChatGPT Web</span>
                  <span className="text-[10px] text-neutral-400">chatgpt.com</span>
                </div>
                {localSettings.defaultProvider === 'chatgpt' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, defaultProvider: 'antigravity' })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  localSettings.defaultProvider === 'antigravity'
                    ? 'bg-purple-950/40 border-purple-500 text-white font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div>
                  <span className="block font-bold text-purple-300">Antigravity</span>
                  <span className="text-[10px] text-neutral-400">Local CLI (agy Engine)</span>
                </div>
                {localSettings.defaultProvider === 'antigravity' && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Browser Display Mode (Headless / Headed) */}
          <div className="space-y-2 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              {localSettings.headless ? (
                <EyeOff className="w-4 h-4 text-neutral-400" />
              ) : (
                <Eye className="w-4 h-4 text-amber-400" />
              )}
              <span>{t.settingHeadlessLabel}</span>
            </label>
            <p className="text-[11px] text-neutral-400 mb-2">{t.settingHeadlessDesc}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, headless: true })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localSettings.headless
                    ? 'bg-neutral-950 border-sky-500 text-white font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                }`}
              >
                <span className="block font-bold">Headless Mode</span>
                <span className="text-[10px] text-neutral-400">
                  {localSettings.language === 'vi' ? 'Chạy ngầm (Mặc định)' : 'Background (Default)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, headless: false })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !localSettings.headless
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                }`}
              >
                <span className="block font-bold">Headed Mode</span>
                <span className="text-[10px] text-neutral-400">
                  {localSettings.language === 'vi' ? 'Hiện cửa sổ Chrome' : 'Visible Chromium Window'}
                </span>
              </button>
            </div>
          </div>

          {/* Dialogue 2-Party Defaults */}
          <div className="space-y-3 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{t.settingDefaultRolesTitle}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">
                  {t.settingDefaultUserRole}
                </span>
                <input
                  type="text"
                  value={localSettings.defaultUserRole}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, defaultUserRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">
                  {t.settingDefaultAiRole}
                </span>
                <input
                  type="text"
                  value={localSettings.defaultAiRole}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, defaultAiRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">
                  {t.settingDefaultLength}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['short', 'medium', 'long'] as RoleplayLength[]).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, defaultRoleplayLength: len })}
                      className={`py-1.5 px-2 rounded text-[11px] border capitalize ${
                        localSettings.defaultRoleplayLength === len
                          ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">
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
                      className={`py-1.5 rounded text-[11px] font-bold border ${
                        localSettings.defaultRoleplayDifficulty === diff
                          ? 'bg-sky-950 border-sky-500 text-sky-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
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
          <div className="space-y-3 pb-4 border-b border-neutral-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
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
                      ? 'bg-sky-950 border-sky-500 text-sky-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">{t.settingSpeechVoiceLabel}:</span>
                {(['en-US', 'en-GB'] as const).map((vc) => (
                  <button
                    key={vc}
                    type="button"
                    onClick={() => setLocalSettings({ ...localSettings, speechVoice: vc })}
                    className={`px-2.5 py-1 rounded text-xs font-bold border ${
                      localSettings.speechVoice === vc
                        ? 'bg-sky-950 border-sky-500 text-sky-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {vc === 'en-US' ? 'US (Mỹ)' : 'UK (Anh)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test & Profile management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Playwright Profile &amp; Stealth Status
              </span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={clearingProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-sky-400 hover:text-sky-300 transition-colors"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div>
            {savedMessage && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                {t.settingSaveSuccess}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
            >
              {t.closeBtn}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              {t.saveCloseBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
