import React, { useState } from 'react';
import { GrammarLessonResult } from '../../types';
import {
  Sparkles,
  Volume2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  Mic
} from 'lucide-react';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

interface GrammarLessonResultViewProps {
  result: GrammarLessonResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const GrammarLessonResultView: React.FC<GrammarLessonResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [copied, setCopied] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [userPracticeAnswer, setUserPracticeAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [revealedCheck, setRevealedCheck] = useState(false);

  // Pronunciation Coach Modal State
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const speakText = (text: string, rate: number = 1.0) => {
    setSpeakingText(text);
    playAudioPronunciation(text, {
      rate,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  const handleOpenCoach = (target: PronunciationCoachTarget) => {
    setCoachTarget(target);
    setIsCoachOpen(true);
  };

  const handleCopy = () => {
    const text = `🧩 Cấu trúc: ${result.ruleName}\nCông thức: ${result.formula}\nÝ nghĩa: ${result.vietnameseMeaning}\n\nVí dụ:\n${result.examples
      .map((ex) => `• ${ex.en} -> ${ex.vi}`)
      .join('\n')}\n\nLỗi bẫy: ${result.vietnameseTrap}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Grammar Rule Header Banner */}
      <div className="p-6 rounded-none bg-neutral-950 border-l-4 border-l-indigo-500 border-y border-r border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>MẪU CÂU GHÉP THỰC CHIẾN</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-none border ${
                  result.userLevel === 'A1'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : result.userLevel === 'A2'
                    ? 'bg-sky-950 text-sky-300 border-sky-800'
                    : result.userLevel === 'B1'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-purple-950 text-purple-300 border-purple-800'
                }`}
              >
                {result.userLevel === 'A1'
                  ? '[ A1: KHỞI ĐẦU ]'
                  : result.userLevel === 'A2'
                  ? '[ A2: CƠ BẢN ]'
                  : result.userLevel === 'B1'
                  ? '[ B1: TRUNG CẤP ]'
                  : '[ B2: TOEIC 700+ ]'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>ĐÃ LƯU VÀO BỘ NHỚ</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {result.ruleName}
            </h2>
            <p className="text-xs text-neutral-300 mt-1">
              Ý nghĩa: <strong className="text-indigo-300">{result.vietnameseMeaning}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer border border-neutral-700 uppercase"
              title="Sao chép cấu trúc"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'ĐÃ CHÉP' : 'SAO CHÉP'}</span>
            </button>

            {onGenerateAnother && (
              <button
                type="button"
                disabled={isAutomating}
                onClick={onGenerateAnother}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-mono font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-400 cursor-pointer disabled:opacity-50 uppercase"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                <span>{isAutomating ? 'ĐANG TẠO...' : 'ĐỔI MẪU CÂU KHÁC'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Formula Hero Display */}
        <div className="pt-5">
          <div className="p-4 rounded-none bg-neutral-900 border border-neutral-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1.5">
              📌 CÔNG THỨC GHÉP CÂU CHUẨN:
            </span>
            <div className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wide break-words">
              {result.formula}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-4 p-4 rounded-none bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Cách dùng tự nhiên &amp; Đơn giản:</span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed font-sans">
            {result.explanation}
          </p>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>VÍ DỤ ỨNG DỤNG THỰC TẾ (BẤM LOA ĐỂ NGHE)</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">[ REAL-LIFE SAMPLES ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.examples?.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-none bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-none bg-indigo-950 text-indigo-300 text-xs font-mono font-bold flex items-center justify-center border border-indigo-800 shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {ex.en}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => speakText(ex.en, 1.0)}
                    className="p-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer border border-neutral-800"
                    title="Nghe câu này (tốc độ chuẩn 1.0x)"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${speakingText === ex.en ? 'animate-bounce' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(ex.en, 0.7)}
                    className="px-1.5 py-1 rounded-none bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-[10px] font-mono transition-colors cursor-pointer border border-neutral-800"
                    title="Nghe chậm câu này (0.7x)"
                  >
                    🐢 0.7x
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCoach({
                        term: result.ruleName,
                        exampleSentence: ex.en,
                        exampleTranslation: ex.vi,
                        level: result.userLevel,
                      })
                    }
                    className="px-2 py-1 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Luyện đọc to câu này và chấm điểm phát âm"
                  >
                    <Mic className="w-3 h-3 text-emerald-400" />
                    <span>LUYỆN ĐỌC</span>
                  </button>
                </div>
              </div>

              <div className="pl-7">
                <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                  {ex.vi}
                </p>
                {ex.note && (
                  <p className="text-[11px] text-indigo-300/80 font-mono mt-1 bg-neutral-900 px-2 py-1 rounded-none border border-neutral-800">
                    💡 Lưu ý: {ex.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vietnamese Trap Warning Card */}
      {result.vietnameseTrap && (
        <div className="p-4 rounded-none bg-rose-950/20 border-l-4 border-l-rose-500 border-y border-r border-rose-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>CẢNH BÁO BẪY LỖI SAI NGƯỜI VIỆT HAY MẮC</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed font-medium">
            {result.vietnameseTrap}
          </p>
        </div>
      )}

      {/* Interactive Sentence Practice */}
      {result.practiceSentence && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>THỰC HÀNH TỰ GHÉP CÂU (ACTIVE RECALL)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 underline cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-semibold">
            {result.practiceSentence.prompt}
          </p>

          {showHint && result.practiceSentence.hint && (
            <div className="p-2.5 rounded-none bg-neutral-900 border-l-2 border-l-amber-500 border-y border-r border-neutral-800 text-xs text-amber-300/90 font-mono">
              💡 Gợi ý giải: {result.practiceSentence.hint}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={userPracticeAnswer}
              onChange={(e) => setUserPracticeAnswer(e.target.value)}
              placeholder="Gõ câu tiếng Anh của bạn vào đây..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-none px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
            {userPracticeAnswer.trim() && (
              <button
                type="button"
                onClick={() => setRevealedCheck(!revealedCheck)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none text-xs font-mono font-bold transition-colors cursor-pointer uppercase"
              >
                {revealedCheck ? 'THU GỌN' : 'KIỂM TRA'}
              </button>
            )}
          </div>

          {revealedCheck && (
            <div className="p-3.5 rounded-none bg-emerald-950/30 border-l-4 border-l-emerald-500 border-y border-r border-emerald-800/60 text-xs text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SO SÁNH VỚI CÔNG THỨC:</span>
              </div>
              <p className="font-mono text-white text-sm mt-1 font-bold">
                {result.formula}
              </p>
              <p className="text-neutral-400 text-[11px] mt-1">
                Đối chiếu câu của bạn với công thức trên xem đã dùng đúng vị trí và dạng động từ chưa nhé!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pronunciation Coach Modal */}
      <PronunciationCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        target={coachTarget}
      />
    </div>
  );
};
