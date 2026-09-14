import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Mic,
  CalendarCheck,
  Headphones,
  Flame,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  VolumeX,
} from 'lucide-react';
import { FlashcardDeckView } from '../flashcard/FlashcardDeckView';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';
import { DailyHabitView } from '../DailyHabitView';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { getLearnedWords, getLearnedListenings } from '../../utils/learningMemory';
import { AppSettings } from '../../types';

interface MobileRemoteViewProps {
  settings: AppSettings;
  userLevel: 'A1' | 'A2' | 'B1' | 'B2';
  streak: number;
  onSetUserLevel: (level: 'A1' | 'A2' | 'B1' | 'B2') => void;
  onSwitchToFullApp: () => void;
}

type RemoteTab = 'flashcard' | 'speech' | 'habit' | 'listening';

export const MobileRemoteView: React.FC<MobileRemoteViewProps> = ({
  settings,
  userLevel,
  streak,
  onSetUserLevel,
  onSwitchToFullApp,
}) => {
  const [activeTab, setActiveTab] = useState<RemoteTab>('flashcard');
  const [isSecureTunnel, setIsSecureTunnel] = useState(false);

  useEffect(() => {
    // Check if current hostname is trycloudflare.com
    if (window.location.hostname.includes('trycloudflare.com')) {
      setIsSecureTunnel(true);
    }
  }, []);

  const levelOptions: Array<'A1' | 'A2' | 'B1' | 'B2'> = ['A1', 'A2', 'B1', 'B2'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-sky-500/30 font-sans pb-20">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-850 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-tight text-white">
                PlayEng Mobile
              </span>
              {isSecureTunnel ? (
                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.2 rounded-full">
                  ⚡ 4G/5G Tunnel
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/80 px-1.5 py-0.2 rounded-full">
                  📶 Wi-Fi LAN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level & Streak Indicators */}
        <div className="flex items-center gap-2">
          {/* Level Picker */}
          <select
            value={userLevel}
            onChange={(e) => onSetUserLevel(e.target.value as any)}
            aria-label="Chọn cấp độ CEFR"
            className="text-[11px] font-mono font-bold bg-zinc-900 text-sky-300 border border-zinc-750 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500"
          >
            {levelOptions.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Streak pill */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-300 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}d</span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-lg mx-auto w-full p-3 sm:p-4 space-y-4">
        {/* TAB 1: FLASHCARD POCKET */}
        {activeTab === 'flashcard' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white">Thẻ Nhớ Leitner Spaced Repetition</h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Level {userLevel}</span>
            </div>

            <FlashcardDeckView
              settings={settings}
              userLevel={userLevel}
              onClose={() => {}}
            />
          </div>
        )}

        {/* TAB 2: SPEECH PRONUNCIATION */}
        {activeTab === 'speech' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Luyện Phát Âm & Phản Xạ Âm Thanh</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                AI Coach
              </span>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Câu luyện tập mẫu ({userLevel}):
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  {userLevel === 'A1' && 'Good morning, where can I find the nearest bus stop?'}
                  {userLevel === 'A2' && 'Could you please confirm the delivery schedule for next Monday?'}
                  {userLevel === 'B1' && 'We need to streamline our workflow to meet the project deadline.'}
                  {userLevel === 'B2' && 'The executive committee negotiated the contractual terms thoroughly.'}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        userLevel === 'A1'
                          ? 'Good morning, where can I find the nearest bus stop?'
                          : userLevel === 'A2'
                          ? 'Could you please confirm the delivery schedule for next Monday?'
                          : userLevel === 'B1'
                          ? 'We need to streamline our workflow to meet the project deadline.'
                          : 'The executive committee negotiated the contractual terms thoroughly.';
                      playAudioPronunciation(text, {
                        voice: settings.speechVoice,
                        rate: settings.speechRate,
                      });
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe câu mẫu</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <UserSpeechEvaluator
                  scenario="Everyday Professional Communication"
                  userRole="Speaker"
                  aiRole="Coach"
                  targetDifficulty={userLevel}
                  lang={settings.language}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY HABIT ROUTINE */}
        {activeTab === 'habit' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Thói Quen 5 Trụ Cột Hàng Ngày</h2>
              </div>
              <span className="text-[10px] font-mono text-amber-400">Streak: {streak}d</span>
            </div>

            <DailyHabitView
              settings={settings}
              onLaunchTask={() => onSwitchToFullApp()}
            />
          </div>
        )}

        {/* TAB 4: LISTENING PLAYER */}
        {activeTab === 'listening' && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Bài Nghe Audio & Hội Thoại</h2>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/70 border border-purple-800/80 px-2 py-0.5 rounded-full">
                Audio Stream
              </span>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm">
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Bạn có thể mở bài luyện nghe với các file đàm thoại thực tế kèm điều chỉnh tốc độ giọng đọc AI chuẩn US/UK.
              </p>

              <button
                type="button"
                onClick={onSwitchToFullApp}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Headphones className="w-4 h-4" />
                <span>Mở Phòng Luyện Nghe Đầy Đủ</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Switch to Full App Link Footer */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToFullApp}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-sky-300 py-1.5 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Giao Diện Đầy Đủ (Desktop Mode)</span>
          </button>
        </div>
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 px-2 py-1.5">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('flashcard')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'flashcard'
                ? 'text-sky-400 bg-sky-950/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>Flashcard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('speech')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'speech'
                ? 'text-emerald-400 bg-emerald-950/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic className="w-5 h-5 mb-0.5" />
            <span>Luyện Nói</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habit')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'habit'
                ? 'text-amber-400 bg-amber-950/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span>Thói Quen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listening')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'listening'
                ? 'text-purple-400 bg-purple-950/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Headphones className="w-5 h-5 mb-0.5" />
            <span>Luyện Nghe</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
