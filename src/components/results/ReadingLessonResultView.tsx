import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ReadingLessonResult } from '../../types';
import {
  BookOpen,
  Volume2,
  Bookmark,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Square,
  Mic,
} from 'lucide-react';
import {
  splitTextIntoSentences,
  createSequentialAudioPlayer,
  SequentialAudioController,
  playAudioPronunciation,
} from '../../utils/speechUtils';
import { toggleReadingMastery, getLearnedReadings } from '../../utils/learningMemory';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

interface ReadingLessonResultViewProps {
  result: ReadingLessonResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const ReadingLessonResultView: React.FC<ReadingLessonResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Audio Playback & Karaoke State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speakingSentenceIdx, setSpeakingSentenceIdx] = useState<number | null>(null);
  const audioControllerRef = useRef<SequentialAudioController | null>(null);

  // Pronunciation Coach Modal
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Mastered state
  const [isMastered, setIsMastered] = useState<boolean>(() => {
    try {
      const readings = getLearnedReadings();
      const match = readings.find((r) => r.title.toLowerCase() === result.title.toLowerCase());
      return !!match?.mastered;
    } catch {
      return false;
    }
  });

  // Extract sentences with abbreviation preservation
  const sentences = useMemo(() => {
    return splitTextIntoSentences(result.passage || '');
  }, [result.passage]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  const handleToggleMastery = () => {
    toggleReadingMastery(result.title);
    setIsMastered((prev) => !prev);
  };

  const handleCopy = () => {
    const text = `${result.title || 'Bài đọc'}\n\n${result.passage || ''}\n\nBản dịch:\n${result.translationVi || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play entire passage sequentially with sentence karaoke
  const handlePlayFullReading = () => {
    if (sentences.length === 0) return;

    if (isPausedAudio && audioControllerRef.current) {
      audioControllerRef.current.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    audioControllerRef.current?.stop();
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    setActiveSentenceIndex(0);

    const controller = createSequentialAudioPlayer(sentences, {
      rate: playbackSpeed,
      pauseBetweenMs: 450,
      onIndexChange: (index) => {
        setActiveSentenceIndex(index);
      },
      onEnd: () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
        setActiveSentenceIndex(null);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
        setActiveSentenceIndex(null);
      },
    });

    audioControllerRef.current = controller;
    controller.play(0);
  };

  const handlePauseAudio = () => {
    if (audioControllerRef.current) {
      audioControllerRef.current.pause();
      setIsPausedAudio(true);
      setIsPlayingAudio(false);
    }
  };

  const handleStopAudio = () => {
    if (audioControllerRef.current) {
      audioControllerRef.current.stop();
      audioControllerRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setActiveSentenceIndex(null);
  };

  // Play a specific single sentence
  const handlePlaySentence = (sentenceText: string, idx: number) => {
    handleStopAudio();
    setSpeakingSentenceIdx(idx);
    playAudioPronunciation(sentenceText, {
      rate: playbackSpeed,
      onEnd: () => setSpeakingSentenceIdx(null),
      onError: () => setSpeakingSentenceIdx(null),
    });
  };

  // Open Pronunciation Coach Modal for a sentence
  const handleCoachSentence = (sentenceText: string) => {
    handleStopAudio();
    setCoachTarget({
      term: sentenceText,
      ipa: '',
      vietnameseMeaning: 'Luyện phát âm chuẩn cả câu theo bài đọc',
    });
    setIsCoachOpen(true);
  };

  const quiz = result.comprehensionQuiz;
  const isCorrect = quiz && selectedOption !== null ? selectedOption === quiz.correctIndex : false;

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-4 border-l-4 border-l-purple-500 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-purple-950 text-purple-300 border border-purple-800">
                [ TRỤ CỘT 03: ĐỌC HIỂU ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                {result.genre || 'Notice'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-900 text-purple-300 border border-neutral-800">
                LEVEL {result.userLevel || 'A1'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {result.title}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Chủ đề: <strong className="text-purple-300">{result.topic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleMastery}
              className={`px-3 py-1.5 rounded-none border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isMastered
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-neutral-300 hover:text-amber-300'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isMastered ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              <span>{isMastered ? 'ĐÃ HIỂU ⭐' : 'ĐÁNH DẤU ĐÃ HIỂU'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-none text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors border border-neutral-700 uppercase cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'ĐÃ CHÉP' : 'SAO CHÉP'}</span>
            </button>

            {onGenerateAnother && (
              <button
                type="button"
                disabled={isAutomating}
                onClick={onGenerateAnother}
                className="px-3.5 py-1.5 rounded-none text-xs font-mono font-black bg-purple-600 hover:bg-purple-500 text-white transition-all border border-purple-400 cursor-pointer disabled:opacity-50 uppercase flex items-center gap-1"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                <span>{isAutomating ? 'ĐANG TẠO...' : 'ĐỔI BÀI ĐỌC'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Audio & Karaoke Control Toolbar */}
        <div className="p-3 bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {!isPlayingAudio ? (
              <button
                type="button"
                onClick={handlePlayFullReading}
                className="px-3.5 py-1.5 rounded-none bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold border border-sky-400 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPausedAudio ? '[ TIẾP TỤC ĐỌC ]' : '[ ▶ ĐỌC TOÀN BÀI ]'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseAudio}
                className="px-3.5 py-1.5 rounded-none bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>[ ⏸ TẠM DỪNG ]</span>
              </button>
            )}

            {(isPlayingAudio || isPausedAudio) && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="px-3 py-1.5 rounded-none bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-mono font-bold border border-neutral-700 flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>DỪNG</span>
              </button>
            )}

            {/* Speed selection */}
            <div className="flex items-center border border-neutral-800 bg-neutral-950 text-xs font-mono">
              <span className="px-2 py-1 text-[10px] text-neutral-500 uppercase">Tốc độ:</span>
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-purple-900 text-purple-200 font-bold border-l border-r border-purple-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Karaoke sentence progress */}
            {activeSentenceIndex !== null && (
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 border border-purple-800">
                Đang đọc câu: {activeSentenceIndex + 1}/{sentences.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="px-3 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              {showTranslation ? <EyeOff className="w-3.5 h-3.5 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{showTranslation ? 'ẨN BẢN DỊCH' : 'DỊCH SONG NGỮ'}</span>
            </button>
          </div>
        </div>

        {/* Main Passage Box with Interactive Karaoke Sentences */}
        <div className="p-5 rounded-none bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="text-sm sm:text-base text-neutral-100 leading-relaxed font-sans space-y-2">
            {sentences.map((sent, idx) => {
              const isCurrentPlaying = activeSentenceIndex === idx;
              const isSingleSpeaking = speakingSentenceIdx === idx;

              return (
                <div
                  key={idx}
                  className={`group relative p-2.5 transition-all border ${
                    isCurrentPlaying
                      ? 'bg-purple-950/50 border-purple-500 text-white font-medium shadow-md'
                      : 'bg-transparent border-transparent hover:bg-neutral-850/50 hover:border-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <p className="flex-1 leading-relaxed">
                      {isCurrentPlaying && (
                        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping mr-2" />
                      )}
                      {sent}
                    </p>

                    {/* Sentence Action Toolbar */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handlePlaySentence(sent, idx)}
                        className="p-1.5 rounded-none bg-neutral-800 hover:bg-neutral-700 text-sky-400 border border-neutral-700 cursor-pointer transition-colors"
                        title="Nghe riêng câu này"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isSingleSpeaking ? 'animate-bounce' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCoachSentence(sent)}
                        className="px-2 py-1 rounded-none bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Bấm để nói câu này và nhận điểm phát âm"
                      >
                        <Mic className="w-3 h-3 text-emerald-400" />
                        <span>Luyện đọc câu</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showTranslation && (
            <div className="pt-4 border-t border-neutral-800/80 animate-fade-in">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Bản dịch tiếng Việt chuẩn:
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
                {result.translationVi}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Key Vocabulary in Context */}
      {result.keyVocabulary && result.keyVocabulary.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>TỪ KHÓA ĐỌC HIỂU QUAN TRỌNG TRONG BÀI</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.keyVocabulary.map((v, i) => (
              <div
                key={i}
                className="p-3.5 rounded-none bg-neutral-950 border border-neutral-800 hover:border-neutral-700 space-y-2 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white font-mono">{v.term}</h4>
                    {v.ipa && <span className="text-[11px] font-mono text-neutral-400">{v.ipa}</span>}
                  </div>
                  <p className="text-xs text-purple-300 font-sans mt-1">{v.meaningVi}</p>
                  {v.contextSentence && (
                    <p className="text-[11px] text-neutral-400 italic mt-1 border-l border-neutral-800 pl-2">
                      "{v.contextSentence}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900">
                  <button
                    type="button"
                    onClick={() => playAudioPronunciation(v.term)}
                    className="p-1 rounded-none bg-neutral-900 hover:bg-neutral-800 text-sky-400 border border-neutral-800 cursor-pointer"
                    title="Nghe phát âm từ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCoachTarget({
                        term: v.term,
                        ipa: v.ipa || '',
                        vietnameseMeaning: v.meaningVi,
                        exampleSentence: v.contextSentence,
                      });
                      setIsCoachOpen(true);
                    }}
                    className="px-2 py-1 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800 flex items-center gap-1 cursor-pointer"
                    title="Luyện phát âm từ vựng này"
                  >
                    <Mic className="w-3 h-3 text-emerald-400" />
                    <span>Luyện phát âm</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading Comprehension Quiz */}
      {quiz && quiz.question && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-purple-950 text-purple-300 border border-purple-800 uppercase">
              CÂU HỎI KIỂM TRA ĐỌC HIỂU
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white font-sans">
            {quiz.question}
          </h3>

          {quiz.options && quiz.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {quiz.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isThisCorrect = idx === quiz.correctIndex;

                let btnStyle = 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700';

                if (hasSubmitted) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-950/80 text-emerald-200 border-emerald-600 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 text-rose-200 border-rose-600 font-bold';
                  } else {
                    btnStyle = 'bg-neutral-950 text-neutral-500 border-neutral-850 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasSubmitted}
                    onClick={() => {
                      setSelectedOption(idx);
                      setHasSubmitted(true);
                    }}
                    className={`p-3 rounded-none text-left transition-all border flex items-center justify-between text-xs font-sans cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-none bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-[10px] font-bold text-neutral-300 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {hasSubmitted && (
                      <div>
                        {isThisCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isSelected ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {hasSubmitted && (
            <div
              className={`p-3.5 rounded-none border text-xs font-sans animate-fade-in ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800 text-rose-200'
              }`}
            >
              <span className="font-mono font-bold block mb-1">
                {isCorrect ? '✓ CHÍNH XÁC!' : '✗ CHƯA CHUẨN XÁC:'}
              </span>
              <p>{quiz.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Pronunciation Coach Modal */}
      {isCoachOpen && coachTarget && (
        <PronunciationCoachModal
          isOpen={isCoachOpen}
          target={coachTarget}
          onClose={() => {
            setIsCoachOpen(false);
            setCoachTarget(null);
          }}
        />
      )}
    </div>
  );
};
