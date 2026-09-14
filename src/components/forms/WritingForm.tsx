import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Language } from '../../types';

interface WritingFormProps {
  topic: string;
  setTopic: (val: string) => void;
  targetBand: string;
  setTargetBand: (val: string) => void;
  essay: string;
  setEssay: (val: string) => void;
  onLoadSample: () => void;
  disabled?: boolean;
  lang: Language;
}

export const WritingForm: React.FC<WritingFormProps> = ({
  topic,
  setTopic,
  targetBand,
  setTargetBand,
  essay,
  setEssay,
  onLoadSample,
  disabled,
  lang,
}) => {
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0;
  const isVi = lang === 'vi';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
            {isVi ? 'Đề bài / Chủ đề luận' : 'Essay Prompt / Topic'}
          </label>
          <input
            id="writing-topic-input"
            type="text"
            disabled={disabled}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              isVi
                ? 'Ví dụ: Tác động của trí tuệ nhân tạo đối với thị trường việc làm tương lai...'
                : 'e.g. The impact of artificial intelligence on future employment...'
            }
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
            {isVi ? 'Cấp độ CEFR Mục tiêu' : 'Target CEFR Band'}
          </label>
          <select
            id="writing-target-band-select"
            disabled={disabled}
            value={targetBand}
            onChange={(e) => setTargetBand(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white focus:outline-none focus:border-sky-500 transition-colors font-mono"
          >
            <option value="B1">B1 (Threshold / Intermediate)</option>
            <option value="B2">B2 (Vantage / Upper-Intermediate)</option>
            <option value="C1">C1 (Effective Operational / Advanced)</option>
            <option value="C2">C2 (Mastery / Native Fluency)</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
            <span>{isVi ? 'Bản thảo bài viết của bạn' : "Learner's Essay Draft"}</span>
            <span className="text-neutral-500 font-normal">
              [{wordCount} {isVi ? 'từ' : 'words'}]
            </span>
          </label>
          <button
            type="button"
            disabled={disabled}
            onClick={onLoadSample}
            className="text-xs font-mono uppercase text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isVi ? '[ Tải bài mẫu ]' : '[ Load Sample Essay ]'}</span>
          </button>
        </div>

        <textarea
          id="writing-essay-textarea"
          rows={7}
          disabled={disabled}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={
            isVi
              ? 'Dán hoặc gõ bài văn tiếng Anh của bạn tại đây. Bot Playwright sẽ tự động nhập vào Gemini/ChatGPT để trích xuất điểm CEFR, sửa lỗi ngữ pháp/collocation và viết lại bài văn mẫu C1/C2...'
              : 'Paste or write your English essay here. The Playwright bot will feed this into Gemini/ChatGPT to extract detailed CEFR band analysis, grammar/collocation corrections, and an improved rewrite...'
          }
          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors leading-relaxed font-mono"
        />
      </div>
    </div>
  );
};
