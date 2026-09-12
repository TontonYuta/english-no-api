import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface VocabFormProps {
  term: string;
  setTerm: (val: string) => void;
  context: string;
  setContext: (val: string) => void;
  onSelectSample: (term: string, context: string) => void;
  disabled?: boolean;
  lang: Language;
}

export const VocabForm: React.FC<VocabFormProps> = ({
  term,
  setTerm,
  context,
  setContext,
  onSelectSample,
  disabled,
  lang,
}) => {
  const isVi = lang === 'vi';

  const sampleIdioms = [
    {
      term: 'Cut corners',
      context: isVi ? 'Quản lý dự án và tiêu chuẩn an toàn' : 'Project management and safety compliance',
    },
    {
      term: 'Bite the bullet',
      context: isVi ? 'Quyết định kinh doanh khó khăn dưới áp lực' : 'Hard business decision under pressure',
    },
    {
      term: 'Hit the ground running',
      context: isVi ? 'Nhận việc mới và bắt nhịp năng suất ngay' : 'New job onboarding and productivity',
    },
    {
      term: 'Through the grapevine',
      context: isVi ? 'Tin đồn nội bộ tại công sở' : 'Workplace rumors and informal gossip',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            {isVi ? 'Từ vựng / Thành ngữ / Phrasal Verb cần học' : 'Target Word / Idiom / Phrasal Verb'}
          </label>
          <input
            id="vocab-term-input"
            type="text"
            disabled={disabled}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={isVi ? 'Ví dụ: Cut corners, Serendipity, Call it a day...' : 'e.g. Cut corners, Serendipity, Call it a day...'}
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            {isVi ? 'Ngữ cảnh sử dụng hoặc Lĩnh vực' : 'Usage Context or Domain'}
          </label>
          <input
            id="vocab-context-input"
            type="text"
            disabled={disabled}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={
              isVi
                ? 'Ví dụ: Đạo đức kinh doanh, giao tiếp thường ngày, văn viết học thuật...'
                : 'e.g. Engineering ethics, casual social chat, academic writing...'
            }
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          {isVi ? 'Hoặc chọn nhanh thành ngữ thực tế phổ biến:' : 'Or try a popular idiom preset:'}
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleIdioms.map((sample) => (
            <button
              key={sample.term}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample.term, sample.context)}
              className="text-xs px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{sample.term}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
