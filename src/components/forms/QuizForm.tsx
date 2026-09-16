import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface QuizFormProps {
  topic: string;
  setTopic: (val: string) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  questionCount?: number;
  setQuestionCount?: (val: number) => void;
  quizType?: 'mixed' | 'vocab' | 'grammar';
  setQuizType?: (val: 'mixed' | 'vocab' | 'grammar') => void;
  onSelectSample: (topic: string, difficulty: string) => void;
  disabled?: boolean;
  lang: Language;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  questionCount = 5,
  setQuestionCount,
  quizType = 'mixed',
  setQuizType,
  onSelectSample,
  disabled,
  lang,
}) => {
  const isVi = lang === 'vi';

  const sampleTopics = [
    {
      topic: isVi ? 'Đảo ngữ câu điều kiện (Inverted Conditionals)' : 'Inverted Conditionals & Hypotheticals',
      difficulty: isVi ? 'Cao cấp (C1)' : 'Advanced (C1)',
    },
    {
      topic: isVi ? 'Thể giả định (Subjunctive Mood trong Anh-Mỹ)' : 'Subjunctive Mood in Formal English',
      difficulty: isVi ? 'Cao cấp (C1)' : 'Advanced (C1)',
    },
    {
      topic: isVi ? 'Cụm động từ với TAKE, GET và PUT tần suất cao' : 'High-frequency Phrasal Verbs with TAKE, GET, and PUT',
      difficulty: isVi ? 'Trung cao cấp (B2)' : 'Upper-Intermediate (B2)',
    },
    {
      topic: isVi ? 'Collocations C1 với giới từ (prone to, liable for)' : 'C1 Collocations with Prepositions (prone to, liable for)',
      difficulty: isVi ? 'Thành thạo (C2)' : 'Mastery (C2)',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
            {isVi ? 'Chủ điểm ngữ pháp / Từ vựng bài trắc nghiệm' : 'English Grammar / Lexical Topic'}
          </label>
          <input
            id="quiz-topic-input"
            type="text"
            disabled={disabled}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              isVi
                ? 'Ví dụ: Đảo ngữ câu điều kiện, Phrasal verbs với TAKE, Thì quá khứ hoàn thành...'
                : 'e.g. Inverted Conditionals, Phrasal verbs with TAKE...'
            }
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
            {isVi ? 'Độ khó mục tiêu' : 'Target Proficiency Level'}
          </label>
          <select
            id="quiz-difficulty-select"
            disabled={disabled}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white focus:outline-none focus:border-sky-500 transition-colors font-mono"
          >
            <option value="Intermediate (B1)">Intermediate (B1) - Trung cấp</option>
            <option value="Upper-Intermediate (B2)">Upper-Intermediate (B2) - Khá</option>
            <option value="Advanced (C1)">Advanced (C1) - Nâng cao</option>
            <option value="Mastery (C2)">Mastery (C2) - Bản ngữ</option>
          </select>
        </div>
      </div>

      {/* Quiz Question Count & Scope Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-none">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5 flex items-center justify-between">
            <span>{isVi ? 'Số lượng câu hỏi:' : 'Question Count:'}</span>
            <span className="text-sky-400 font-bold">{questionCount} {isVi ? 'câu' : 'questions'}</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[5, 10, 15, 20].map((count) => {
              const isSelected = questionCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  disabled={disabled}
                  onClick={() => setQuestionCount?.(count)}
                  className={`py-1.5 text-xs font-mono font-bold uppercase rounded-none border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
            {isVi ? 'Nội dung đề thi:' : 'Quiz Content Scope:'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'mixed', labelVi: 'Cả 2 (Từ + Ngữ)', labelEn: 'Mixed' },
              { id: 'vocab', labelVi: 'Từ Vựng', labelEn: 'Vocab' },
              { id: 'grammar', labelVi: 'Ngữ Pháp', labelEn: 'Grammar' },
            ].map((opt) => {
              const isSelected = quizType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setQuizType?.(opt.id as 'mixed' | 'vocab' | 'grammar')}
                  className={`py-1.5 px-2 text-xs font-mono font-bold uppercase rounded-none border transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                  title={isVi ? opt.labelVi : opt.labelEn}
                >
                  {isVi ? opt.labelVi : opt.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
          {isVi ? 'Hoặc chọn nhanh chủ điểm thường gặp trong đề thi:' : 'Quick-load targeted exam topics:'}
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleTopics.map((sample) => (
            <button
              key={sample.topic}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample.topic, sample.difficulty)}
              className="text-xs px-3 py-1.5 rounded-none bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>[{sample.topic}]</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
