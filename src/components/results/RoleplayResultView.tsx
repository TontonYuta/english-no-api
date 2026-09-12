import React, { useState } from 'react';
import { RoleplayResult, Language } from '../../types';
import {
  MessageSquare,
  Volume2,
  Globe,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Mic,
} from 'lucide-react';
import { UserSpeechEvaluator } from '../speech/UserSpeechEvaluator';

interface RoleplayResultViewProps {
  result: RoleplayResult;
  lang?: Language;
}

export const RoleplayResultView: React.FC<RoleplayResultViewProps> = ({
  result,
  lang = 'vi',
}) => {
  const [showTranslations, setShowTranslations] = useState(true);
  const [copied, setCopied] = useState(false);
  const isVi = lang === 'vi';

  const speakText = (text: string, isAi: boolean) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = isAi ? 0.95 : 1.0;
      utterance.pitch = isAi ? 0.9 : 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyScript = () => {
    const text =
      `Scenario: ${result.scenario}\n\n` +
      result.dialogue
        .map((d) => `[${d.speaker}]: ${d.text}\n(${d.translationVi})\n`)
        .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {isVi ? 'Người 1 (Bạn)' : 'Person 1'}: {result.userRole}
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {isVi ? 'Người 2 (Đối tác)' : 'Person 2'}: {result.aiRole}
            </span>
            {result.difficulty && (
              <>
                <span className="text-xs text-neutral-500">•</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                  Level: {result.difficulty}
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {result.scenario}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowTranslations(!showTranslations)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {showTranslations
                ? isVi
                  ? 'Ẩn dịch nghĩa'
                  : 'Hide Translation'
                : isVi
                ? 'Hiện dịch nghĩa'
                : 'Show Translation'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao chép kịch bản' : 'Copy Script')}</span>
          </button>
        </div>
      </div>

      {/* Turn-by-Turn Dialogue */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>{isVi ? 'Kịch Bản Hội Thoại 2 Chiều Chi Tiết' : 'Interactive Spoken Dialogue'}</span>
        </h3>

        <div className="space-y-3">
          {result.dialogue?.map((turn, idx) => {
            const isUser = turn.speaker.toLowerCase().includes(result.userRole.toLowerCase());

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isUser
                    ? 'bg-sky-950/20 border-sky-900/40 ml-0 md:ml-6'
                    : 'bg-neutral-900 border-neutral-800 mr-0 md:mr-6'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-full ${
                        isUser
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-neutral-200">
                      {turn.speaker}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {isVi ? 'Lượt' : 'Turn'} #{idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(turn.text, !isUser)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer shrink-0"
                    title={isVi ? 'Phát âm thanh' : 'Play voice audio'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm font-medium text-white leading-relaxed pl-7">
                  "{turn.text}"
                </p>

                {showTranslations && turn.translationVi && (
                  <p className="text-xs text-neutral-400 italic pl-7 mt-1">
                    ↳ {turn.translationVi}
                  </p>
                )}

                {(turn.audioTip || turn.usefulExpression) && (
                  <div className="flex items-center gap-2 flex-wrap pl-7 mt-2 pt-2 border-t border-neutral-800/60">
                    {turn.audioTip && (
                      <span className="text-[11px] text-amber-300/90 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {isVi ? 'Trọng âm / Ngữ điệu' : 'Intonation'}: {turn.audioTip}
                      </span>
                    )}
                    {turn.usefulExpression && (
                      <span className="text-[11px] text-sky-300 font-mono bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                        {isVi ? 'Cụm từ đắt giá' : 'Key Chunk'}: {turn.usefulExpression}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Speaking Practice & Evaluator */}
      <div className="pt-2">
        <UserSpeechEvaluator
          userRole={result.userRole}
          aiRole={result.aiRole}
          scenario={result.scenario}
          targetDifficulty={result.difficulty || 'B2'}
          lang={lang}
        />
      </div>

      {/* Key Vocabulary & Cultural Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Vocabulary */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {isVi ? 'Từ Vựng & Cụm Diễn Đạt Trọng Tâm' : 'Dialogue Vocabulary & Phrasing'}
            </h4>
          </div>

          <div className="space-y-2.5">
            {result.keyVocabulary?.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs">
                <div className="font-bold text-white mb-0.5">{item.term}</div>
                <div className="text-neutral-300 mb-0.5">{item.meaning}</div>
                <div className="text-[11px] text-neutral-500 font-mono">{item.usage}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural Tips & Challenge */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Globe className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {isVi ? 'Mẹo Văn Hóa & Phép Lịch Sự Trong Giao Tiếp' : 'Cultural & Pragmatic Politeness Tips'}
              </h4>
            </div>

            <ul className="space-y-2 text-xs text-neutral-300">
              {result.culturalTips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.followUpChallenge && (
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                {isVi ? 'Thử Thách Luyện Nói Mở Rộng' : 'Speaking Challenge for Practice'}
              </span>
              <p className="text-xs text-amber-200 leading-relaxed">
                {result.followUpChallenge}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
