import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Key,
  BookOpen,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { GeneratedPassage } from '../../../server/passageGenerator';

interface GenerationErrorModalProps {
  isOpen: boolean;
  errorMessage: string;
  fallbackPassage?: GeneratedPassage;
  onRetry: () => void;
  onOpenSettings: () => void;
  onUseFallback?: (fallback: GeneratedPassage) => void;
  onClose: () => void;
  lang?: 'vi' | 'en';
}

export const GenerationErrorModal: React.FC<GenerationErrorModalProps> = ({
  isOpen,
  errorMessage,
  fallbackPassage,
  onRetry,
  onOpenSettings,
  onUseFallback,
  onClose,
  lang = 'vi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-rose-500/40 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-850 bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {lang === 'vi' ? 'Chưa Thể Tạo Bài Đọc Mới' : 'Could Not Generate New Lesson'}
              </h3>
              <span className="text-[10px] font-mono text-rose-400">
                GOOGLE GEMINI AI ERROR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Detailed Error Box */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
              {lang === 'vi' ? 'Chi tiết nguyên nhân:' : 'Error details:'}
            </span>
            <p className="text-xs text-rose-300 font-mono leading-relaxed break-words">
              {errorMessage}
            </p>
          </div>

          {/* User notification assurance */}
          <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-800/40 text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'vi' ? 'Thông báo minh bạch' : 'Transparency Notice'}</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
              {lang === 'vi'
                ? 'Hệ thống KHÔNG tự động hiển thị bài đọc cũ mà không có sự đồng ý của bạn. Bạn có thể thử lại, đăng nhập tài khoản Google, hoặc chủ động chọn dùng bài mẫu có sẵn.'
                : 'The system does NOT silently display cached or old content without your consent. You may retry, log into Google, or voluntarily use catalog lessons.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={onRetry}
              className="w-full p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Thử Lại Bằng Google Gemini' : 'Retry via Google Gemini'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Key className="w-4 h-4 text-sky-400" />
              <span>{lang === 'vi' ? 'Vào Cài Đặt (Đăng Nhập / Nhập API Key)' : 'Open Settings (Log In / API Key)'}</span>
            </button>

            {fallbackPassage && onUseFallback && (
              <button
                type="button"
                onClick={() => onUseFallback(fallbackPassage)}
                className="w-full p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 hover:text-emerald-100 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'vi'
                    ? `Dùng Bài Mẫu Thư Viện: "${fallbackPassage.title}"`
                    : `Use Catalog Lesson: "${fallbackPassage.title}"`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            {lang === 'vi' ? 'Đóng / Giữ Nguyên Bài Hiện Tại' : 'Close / Keep Current'}
          </button>
        </div>
      </div>
    </div>
  );
};
