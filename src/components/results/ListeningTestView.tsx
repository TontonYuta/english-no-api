import React, { useState, useEffect } from 'react';
import { LearnedListening } from '../../types';
import {
  Headphones,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Bookmark,
  Volume2,
  Eye,
  EyeOff,
  Mic
} from 'lucide-react';
import {
  getLearnedListenings,
  toggleListeningMastery,
  addLearnedListening,
} from '../../utils/learningMemory';
import {
  generateListeningTestQuestions,
  ListeningTestQuestion,
  SAMPLE_LISTENING_FOR_TEST,
} from '../../utils/quizUtils';
import { playAudioPronunciation } from '../../utils/speechUtils';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

interface ListeningTestViewProps {
  onListeningsUpdated?: () => void;
}

export const ListeningTestView: React.FC<ListeningTestViewProps> = ({ onListeningsUpdated }) => {
  const [learnedListenings, setLearnedListenings] = useState<LearnedListening[]>(() => getLearnedListenings());
  const [questions, setQuestions] = useState<ListeningTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [sampleLoadedNotice, setSampleLoadedNotice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Coach modal state
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const initQuestions = (list: LearnedListening[]) => {
    const generated = generateListeningTestQuestions(list, Math.min(4, Math.max(2, list.length)));
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsTestFinished(false);
    setShowTranscript(false);
  };

  useEffect(() => {
    const list = getLearnedListenings();
    setLearnedListenings(list);
    initQuestions(list);
  }, []);

  const handleLoadSample = () => {
    SAMPLE_LISTENING_FOR_TEST.forEach((s) => {
      addLearnedListening({
        title: s.title,
        dialogue: [{ speaker: 'Speaker', text: s.audioPrompt, translationVi: '' }],
        level: s.level,
        topic: 'Workplace Listening',
        questions: [
          {
            audioPrompt: s.audioPrompt,
            question: s.prompt,
            options: [s.correctAnswer, ...s.distractors],
            correctIndex: 0,
            explanation: s.explanation,
          },
        ],
      });
    });
    const updated = getLearnedListenings();
    setLearnedListenings(updated);
    initQuestions(updated);
    setSampleLoadedNotice(true);
    onListeningsUpdated?.();
    setTimeout(() => setSampleLoadedNotice(false), 3000);
  };

  const handlePlayAudio = (rate: number = 1.0) => {
    const text = questions[currentIndex]?.audioPrompt;
    if (!text) return;
    setIsPlayingAudio(true);
    playAudioPronunciation(text, {
      rate,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleToggleMastery = (listeningIdOrTitle: string) => {
    toggleListeningMastery(listeningIdOrTitle);
    const updated = getLearnedListenings();
    setLearnedListenings(updated);
    onListeningsUpdated?.();
  };

  const correctCount = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => questions[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCurrentCorrect = isAnswered && selectedAnswers[currentIndex] === currentQ?.correctIndex;

  // Empty state
  if (learnedListenings.length === 0 && questions.length === 0) {
    return (
      <div className="p-8 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 text-center shadow-sm">
        <div className="w-12 h-12 rounded-none bg-amber-950 border border-amber-800 text-amber-400 mx-auto flex items-center justify-center">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-mono font-bold text-white uppercase tracking-tight">
            [ CHƯA CÓ BÀI NGHE NÀO TRONG SỔ TAY ]
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Học 1 bài nghe ở tab "Học Mới" và bấm "Đánh dấu đã hiểu", hoặc nạp 3 bài nghe hội thoại công sở mẫu để kiểm tra tai nghe ngay!
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-5 py-2.5 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-neutral-950" />
            <span>Nạp 3 bài nghe hội thoại mẫu để test ngay</span>
          </button>
        </div>

        {sampleLoadedNotice && (
          <p className="text-xs font-mono text-emerald-400 animate-fade-in">
            ✓ Đã nạp thành công! Đang tạo bài test nghe...
          </p>
        )}
      </div>
    );
  }

  // Finished view
  if (isTestFinished) {
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 shadow-sm border-l-4 border-l-amber-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800">
                [ KẾT QUẢ TEST NGHE HIỂU ]
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {correctCount} / {questions.length} CÂU ĐÚNG ({percentage}%)
              </span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
              {percentage >= 80 ? 'TUYỆT VỜI! PHẢN XẠ ÂM THANH RẤT NHẠY' : 'HOÀN TẤT! HÃY LUYỆN NGHE CHẬM 0.7X THÊM'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => initQuestions(learnedListenings)}
            className="px-4 py-2 rounded-none bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 flex items-center gap-2 cursor-pointer uppercase"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LÀM BÀI TEST KHÁC</span>
          </button>
        </div>

        {/* Review list */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase">
            CHI TIẾT CÂU TRẢ LỜI:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {questions.map((q, idx) => {
              const selectedOpt = selectedAnswers[idx];
              const isCorrect = selectedOpt === q.correctIndex;
              const item = learnedListenings.find((l) => l.id === q.listeningId || l.title === q.title);
              const isMastered = item?.mastered;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-none border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-900/60 border-l-4 border-l-emerald-500'
                      : 'bg-rose-950/20 border-rose-900/60 border-l-4 border-l-rose-500'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">
                        {q.title}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans mt-0.5">
                      {q.prompt}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono">
                      {isCorrect ? '✓ Trả lời đúng' : `✗ Bạn chọn: "${q.options[selectedOpt]}" (Đúng: "${q.options[q.correctIndex]}")`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleMastery(q.listeningId || q.title)}
                      className={`px-2.5 py-1 rounded-none text-xs font-mono transition-colors border flex items-center gap-1 cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-amber-300'
                      }`}
                    >
                      <Bookmark className={`w-3 h-3 ${isMastered ? 'fill-emerald-400' : ''}`} />
                      <span>{isMastered ? 'ĐÃ HIỂU ⭐' : 'CẦN ÔN'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Test View
  return (
    <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-6 shadow-sm border-l-4 border-l-amber-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800">
              [ KIỂM TRA NGHE HIỂU ĐÃ HỌC ]
            </span>
            <span className="text-xs font-mono text-neutral-400">
              CÂU {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase mt-1">
            {currentQ?.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-neutral-400">Điểm hiện tại:</span>
            <span className="text-emerald-400 font-bold">{correctCount}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400">{currentIndex + (isAnswered ? 1 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-900 h-1.5 rounded-none overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Audio Playback Console Card */}
      <div className="p-5 rounded-none bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase font-bold text-white">
              BĂNG ÂM THANH (AUDIO TRACK):
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleMastery(currentQ?.listeningId || currentQ?.title)}
              className={`px-2 py-1 rounded-none text-xs font-mono transition-colors border flex items-center gap-1 cursor-pointer ${
                currentQ?.mastered
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-amber-300'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${currentQ?.mastered ? 'fill-emerald-400' : ''}`} />
              <span>{currentQ?.mastered ? 'ĐÃ HIỂU ⭐' : 'ĐÁNH DẤU'}</span>
            </button>
          </div>
        </div>

        {/* Audio Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handlePlayAudio(1.0)}
            className="px-4 py-2 rounded-none bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all border border-sky-400 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span>[ 🔊 PHÁT AUDIO 1.0X ]</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayAudio(0.7)}
            className="px-3.5 py-2 rounded-none bg-neutral-800 hover:bg-neutral-750 text-amber-300 font-mono text-xs font-bold transition-all border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🐢 NGHE CHẬM 0.7X</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-3 py-2 rounded-none bg-neutral-850 hover:bg-neutral-800 text-neutral-300 font-mono text-xs transition-all border border-neutral-750 flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTranscript ? 'ẨN TRANSCRIPT' : 'XEM TRANSCRIPT'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCoachTarget({
                term: currentQ?.audioPrompt || '',
                ipa: '',
                vietnameseMeaning: 'Luyện Shadowing câu này',
              });
              setIsCoachOpen(true);
            }}
            className="px-3 py-2 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-mono text-xs font-bold transition-all border border-emerald-800 flex items-center gap-1.5 cursor-pointer"
            title="Luyện Shadowing nhắc lại theo audio"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHADOWING</span>
          </button>
        </div>

        {/* Revealed Transcript (if toggled) */}
        {showTranscript && (
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-none text-xs font-sans text-neutral-300 whitespace-pre-line animate-fade-in">
            <span className="font-mono text-neutral-500 block mb-1 text-[10px] uppercase">
              Lời thoại chi tiết:
            </span>
            {currentQ?.transcript || currentQ?.audioPrompt}
          </div>
        )}
      </div>

      {/* Question Prompt */}
      <div className="p-5 rounded-none bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed font-sans">
          ❓ {currentQ?.prompt}
        </h4>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentQ?.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const isThisOptionCorrect = optIdx === currentQ.correctIndex;

            let btnStyle = 'bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border-neutral-800 hover:border-neutral-700';

            if (isAnswered) {
              if (isThisOptionCorrect) {
                btnStyle = 'bg-emerald-950/90 text-emerald-200 border-emerald-500 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-rose-950/90 text-rose-200 border-rose-500 font-bold';
              } else {
                btnStyle = 'bg-neutral-950 text-neutral-500 border-neutral-850 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(currentIndex, optIdx)}
                className={`p-3.5 rounded-none text-left transition-all border flex items-center justify-between gap-3 cursor-pointer text-sm font-sans ${btnStyle} ${
                  isAnswered ? 'cursor-default' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-none bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-xs font-bold text-neutral-300 shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isThisOptionCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div
            className={`p-4 rounded-none border space-y-2 animate-fade-in ${
              isCurrentCorrect
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-100'
                : 'bg-rose-950/30 border-rose-800 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-mono font-bold uppercase ${isCurrentCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isCurrentCorrect ? '[ BẮT ÂM CHÍNH XÁC 🎯 ]' : '[ CHƯA CHUẨN XÁC ]'}
              </span>

              <button
                type="button"
                onClick={() => handleToggleMastery(currentQ?.listeningId || currentQ?.title)}
                className="text-xs font-mono text-neutral-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer underline"
              >
                <Bookmark className="w-3 h-3 text-amber-400" />
                <span>Đánh dấu đã hiểu bài nghe này</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => initQuestions(learnedListenings)}
          className="px-3.5 py-2 rounded-none bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold transition-all border border-neutral-700 flex items-center gap-1.5 cursor-pointer uppercase"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>TẠO BỘ TEST MỚI</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            disabled={!isAnswered}
            onClick={() => {
              setCurrentIndex((prev) => prev + 1);
              setShowTranscript(false);
            }}
            className="px-5 py-2.5 rounded-none bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 flex items-center gap-2 cursor-pointer uppercase"
          >
            <span>CÂU TIẾP THEO</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!isAnswered}
            onClick={() => setIsTestFinished(true)}
            className="px-5 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-black transition-all border border-emerald-400 flex items-center gap-2 cursor-pointer uppercase shadow-md shadow-emerald-600/20"
          >
            <span>XEM KẾT QUẢ TỔNG KẾT</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pronunciation Coach for Shadowing */}
      <PronunciationCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        target={coachTarget}
      />
    </div>
  );
};
