import React from 'react';
import { MessageSquare, Sparkles, Users, Sliders, Volume2, Shield } from 'lucide-react';
import { DialogueDifficulty, RoleplayLength, Language } from '../../types';
import { translations } from '../../translations';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';

interface RoleplayFormProps {
  scenario: string;
  setScenario: (val: string) => void;
  userRole: string;
  setUserRole: (val: string) => void;
  aiRole: string;
  setAiRole: (val: string) => void;
  length: RoleplayLength;
  setLength: (val: RoleplayLength) => void;
  difficulty: DialogueDifficulty;
  setDifficulty: (val: DialogueDifficulty) => void;
  onSelectSample: (scenario: string, userRole: string, aiRole: string) => void;
  disabled?: boolean;
  lang: Language;
}

export const RoleplayForm: React.FC<RoleplayFormProps> = ({
  scenario,
  setScenario,
  userRole,
  setUserRole,
  aiRole,
  setAiRole,
  length,
  setLength,
  difficulty,
  setDifficulty,
  onSelectSample,
  disabled,
  lang,
}) => {
  const t = translations[lang];

  const sampleScenarios = [
    {
      title: lang === 'vi' ? 'Check-in Sân bay' : 'Airport Check-in',
      scenario:
        lang === 'vi'
          ? 'Quầy làm thủ tục sân bay, hành lý bị quá cân 2.5kg và chỉ còn 25 phút trước giờ lên máy bay'
          : 'Airport check-in counter with 2.5kg overweight baggage and tight boarding cutoff',
      userRole: lang === 'vi' ? 'Hành khách (Passenger)' : 'Passenger',
      aiRole: lang === 'vi' ? 'Nhân viên quầy bay (Agent)' : 'SkyWings Check-in Agent',
    },
    {
      title: lang === 'vi' ? 'Phỏng vấn Tech Lead' : 'Tech Job Interview',
      scenario:
        lang === 'vi'
          ? 'Giải thích giải pháp kiến trúc hệ thống và cách xử lý sự cố máy chủ chịu tải cao'
          : 'Explaining a complex technical challenge and architectural trade-off',
      userRole: lang === 'vi' ? 'Ứng viên lập trình' : 'Software Engineer Candidate',
      aiRole: lang === 'vi' ? 'Giám đốc công nghệ' : 'Engineering Director',
    },
    {
      title: lang === 'vi' ? 'Khiếu nại Khách sạn' : 'Hotel Complaint',
      scenario:
        lang === 'vi'
          ? 'Check-in lúc nửa đêm, điều hòa phòng bị hỏng và không có nước nóng'
          : 'Arrived at hotel after midnight to discover AC broken and no hot water',
      userRole: lang === 'vi' ? 'Khách lưu trú' : 'Hotel Guest',
      aiRole: lang === 'vi' ? 'Quản lý trực đêm' : 'Duty Front Desk Manager',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Scenario Input */}
      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
          <span>{t.scenarioLabel}</span>
          <span className="text-[11px] text-neutral-500 font-normal">
            {lang === 'vi' ? 'Bối cảnh chi tiết' : 'Detailed context'}
          </span>
        </label>
        <input
          id="roleplay-scenario-input"
          type="text"
          disabled={disabled}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder={t.scenarioPlaceholder}
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
        />
      </div>

      {/* 2-Person Roles Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Users className="w-4 h-4" />
            <span>{t.userRoleLabel}</span>
          </div>
          <input
            id="roleplay-user-role-input"
            type="text"
            disabled={disabled}
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            placeholder={t.userRolePlaceholder}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Users className="w-4 h-4" />
            <span>{t.aiRoleLabel}</span>
          </div>
          <input
            id="roleplay-ai-role-input"
            type="text"
            disabled={disabled}
            value={aiRole}
            onChange={(e) => setAiRole(e.target.value)}
            placeholder={t.aiRolePlaceholder}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Dialogue Length & Difficulty Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.dialogueLengthLabel}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'short', label: t.lengthShort },
                { id: 'medium', label: t.lengthMedium },
                { id: 'long', label: t.lengthLong },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => setLength(item.id)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  length === item.id
                    ? 'bg-sky-950 border-sky-500 text-sky-300 font-semibold shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.dialogueDifficultyLabel}</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['A2', 'B1', 'B2', 'C1', 'C2'] as DialogueDifficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() => setDifficulty(level)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  difficulty === level
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Scenarios Quick Select */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          {t.sampleScenariosLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleScenarios.map((sample) => (
            <button
              key={sample.title}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample.scenario, sample.userRole, sample.aiRole)}
              className="text-xs px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Speech Evaluator Embedded Module */}
      <div className="pt-2">
        <UserSpeechEvaluator
          userRole={userRole || (lang === 'vi' ? 'Người nói' : 'Speaker')}
          aiRole={aiRole || (lang === 'vi' ? 'Đối tác' : 'Partner')}
          scenario={scenario || (lang === 'vi' ? 'Tình huống thường ngày' : 'Daily situation')}
          targetDifficulty={difficulty}
          lang={lang}
        />
      </div>
    </div>
  );
};
