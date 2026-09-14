import React, { useState, useRef, useEffect } from 'react';
import { ListeningLessonResult } from '../../types';
import {
  Headphones,
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
  Mic,
  Play,
  Pause,
  Square,
} from 'lucide-react';
import {
  createDialoguePlayer,
  SequentialAudioController,
  playAudioPronunciation,
} from '../../utils/speechUtils';
import { toggleListeningMastery, getLearnedListenings } from '../../utils/learningMemory';
import { PronunciationCoachModal, PronunciationCoachTarget } from '../speech/PronunciationCoachModal';

interface ListeningLessonResultViewProps {
  result: ListeningLessonResult;
  onGenerateAnother?: () => void;
  isAutomating?: boolean;
}

export const ListeningLessonResultView: React.FC<ListeningLessonResultViewProps> = ({
  result,
  onGenerateAnother,
  isAutomating,
}) => {
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Audio Playback & Dialogue Controller State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [activeTurnIndex, setActiveTurnIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speakingLine, setSpeakingLine] = useState<number | null>(null);
  const audioControllerRef = useRef<SequentialAudioController | null>(null);

  // Pronunciation Coach Modal
  const [coachTarget, setCoachTarget] = useState<PronunciationCoachTarget | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Mastered state
  const [isMastered, setIsMastered] = useState<boolean>(() => {
    try {
      const listenings = getLearnedListenings();
      const match = listenings.find((l) => l.title.toLowerCase() === result.title.toLowerCase());
      return !!match?.mastered;
    } catch {
      return false;
    }
  });

  const dialogue = result.dialogue || [];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioControllerRef.current?.stop();
    };
  }, []);

  const handleToggleMastery = () => {
    toggleListeningMastery(result.title);
    setIsMastered((prev) => !prev);
  };

  const handleCopy = () => {
    const lines = dialogue.map((d) => `${d.speaker}: ${d.text}\n(${d.translationVi || ''})`).join('\n\n');
    const text = `${result.title || 'Bài nghe'}\n\n${lines}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play full dialogue with 2-speaker voice differentiation and karaoke highlighting
  const handlePlayFullAudio = () => {
    if (dialogue.length === 0) return;

    if (isPausedAudio && audioControllerRef.current) {
      audioControllerRef.current.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    audioControllerRef.current?.stop();
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    setActiveTurnIndex(0);

    const controller = createDialoguePlayer(dialogue, {
      rate: playbackSpeed,
      pauseBetweenMs: 550,
      onIndexChange: (index) => {
        setActiveTurnIndex(index);
      },
      onEnd: () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
        setActiveTurnIndex(null);
      },
      onError: () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
        setActiveTurnIndex(null);
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
    setActiveTurnIndex(null);
  };

  // Play a single line from the dialogue
  const handlePlayLine = (text: string, idx: number, rate: number = 1.0) => {
    handleStopAudio();
    if (!text) return;
    setSpeakingLine(idx);

    // Differentiate voice by speaker index
    const isFirstSpeaker = idx % 2 === 0;
    playAudioPronunciation(text, {
      rate,
      voice: isFirstSpeaker ? 'en-US' : 'en-GB',
      pitch: isFirstSpeaker ? 1.08 : 0.92,
      onEnd: () => setSpeakingLine(null),
      onError: () => setSpeakingLine(null),
    });
  };

  const quiz = result.listeningQuiz;
  const isCorrect = quiz && selectedOption !== null ? selectedOption === quiz.correctIndex : false;

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="p-6 rounded-none bg-neutral-950 border border-neutral-800 space-y-4 border-l-4 border-l-amber-500 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800">
                [ TRỤ CỘT 04: NGHE HIỂU 2 GIỌNG ĐỌC ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-neutral-900 text-amber-300 border border-neutral-800">
                LEVEL {result.userLevel || 'A1'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {result.title}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Tình huống: <strong className="text-amber-300">{result.situation || result.topic}</strong>
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
                className="px-3.5 py-1.5 rounded-none text-xs font-mono font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all border border-amber-300 cursor-pointer disabled:opacity-50 uppercase flex items-center gap-1"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutomating ? 'animate-spin' : ''}`} />
                <span>{isAutomating ? 'ĐANG TẠO...' : 'ĐỔI BÀI NGHE'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Listening Master Toolbar with Play/Pause/Stop & 2-Speaker Engine */}
        <div className="p-3 bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {!isPlayingAudio ? (
              <button
                type="button"
                onClick={handlePlayFullAudio}
                className="px-4 py-2 rounded-none bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold border border-sky-400 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPausedAudio ? '[ TIẾP TỤC NGHE ]' : '[ ▶ PHÁT HỘI THOẠI 2 GIỌNG ]'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseAudio}
                className="px-4 py-2 rounded-none bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold border border-amber-400 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>[ ⏸ TẠM DỪNG ]</span>
              </button>
            )}

            {(isPlayingAudio || isPausedAudio) && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="px-3 py-2 rounded-none bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-mono font-bold border border-neutral-700 flex items-center gap-1 cursor-pointer"
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
                      ? 'bg-amber-900 text-amber-200 font-bold border-l border-r border-amber-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Active turn indicator */}
            {activeTurnIndex !== null && dialogue[activeTurnIndex] && (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 border border-amber-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Đang nói: {dialogue[activeTurnIndex].speaker} ({activeTurnIndex + 1}/{dialogue.length})
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="px-3 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              {showScript ? <EyeOff className="w-3.5 h-3.5 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{showScript ? 'ẨN LỜI THOẠI (NGHE MÙ)' : 'HIỆN LỜI THOẠI'}</span>
            </button>

            {showScript && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-2.5 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors border border-neutral-700 cursor-pointer"
              >
                {showTranslation ? 'ẨN DỊCH' : 'DỊCH VIỆT'}
              </button>
            )}
          </div>
        </div>

        {/* Dialogue Lines Display */}
        <div className="space-y-3 pt-2">
          {!showScript ? (
            <div className="p-8 text-center bg-neutral-900/40 border border-dashed border-neutral-800 space-y-2">
              <Headphones className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-mono text-white uppercase font-bold">
                [ CHẾ ĐỘ NGHE MÙ - TẬP TRUNG TAI NGHE ]
              </p>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Bấm nút phát audio phía trên để nghe trước 1-2 lần bằng 2 giọng đọc tự nhiên. Khi đã sẵn sàng kiểm tra, bấm "HIỆN LỜI THOẠI" để đối chiếu phụ đề.
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {dialogue.map((line, idx) => {
                const isActiveTurn = activeTurnIndex === idx;
                const isSingleSpeaking = speakingLine === idx;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-none transition-all border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActiveTurn
                        ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                          idx % 2 === 0
                            ? 'text-amber-300 bg-amber-950/80 border-amber-800/60'
                            : 'text-sky-300 bg-sky-950/80 border-sky-800/60'
                        }`}>
                          {line.speaker}
                        </span>

                        {isActiveTurn && (
                          <span className="text-[10px] font-mono text-amber-300 animate-pulse">
                            [ Đang phát giọng... ]
                          </span>
                        )}

                        <p className={`text-sm font-semibold font-sans ${
                          isActiveTurn ? 'text-white' : 'text-neutral-100'
                        }`}>
                          {line.text}
                        </p>
                      </div>

                      {showTranslation && line.translationVi && (
                        <p className="text-xs text-neutral-400 font-sans pl-1">
                          → {line.translationVi}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handlePlayLine(line.text, idx, playbackSpeed)}
                        className="p-1.5 rounded-none bg-neutral-800 hover:bg-neutral-700 text-sky-400 border border-neutral-700 cursor-pointer transition-colors"
                        title="Nghe câu này"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isSingleSpeaking ? 'animate-bounce' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayLine(line.text, idx, 0.75)}
                        className="px-1.5 py-0.5 rounded-none bg-neutral-850 hover:bg-neutral-800 text-amber-300 text-[10px] font-mono border border-neutral-750 cursor-pointer"
                        title="Nghe chậm (0.75x)"
                      >
                        0.75x
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStopAudio();
                          setCoachTarget({
                            term: line.text,
                            ipa: '',
                            vietnameseMeaning: line.translationVi || 'Luyện Shadowing theo câu thoại',
                          });
                          setIsCoachOpen(true);
                        }}
                        className="px-2 py-1 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Luyện nói nhại lại theo câu thoại"
                      >
                        <Mic className="w-3 h-3 text-emerald-400" />
                        <span>Luyện đọc câu</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Key Listening Vocabulary & Native Phrases */}
      {result.keyPhrases && result.keyPhrases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CỤM TỪ NÓI NỔI BẬT TRONG BÀI NGHE</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.keyPhrases.map((phrase, i) => (
              <div
                key={i}
                className="p-3.5 rounded-none bg-neutral-950 border border-neutral-800 hover:border-neutral-700 space-y-2 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-300 font-mono">{phrase.phrase}</h4>
                    {phrase.ipa && <span className="text-[11px] font-mono text-neutral-400">{phrase.ipa}</span>}
                  </div>
                  <p className="text-xs text-neutral-300 font-sans mt-1">{phrase.meaningVi}</p>
                  {phrase.usageNote && (
                    <p className="text-[11px] text-neutral-400 italic mt-1 border-l border-neutral-800 pl-2">
                      💡 {phrase.usageNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900">
                  <button
                    type="button"
                    onClick={() => playAudioPronunciation(phrase.phrase)}
                    className="p-1 rounded-none bg-neutral-900 hover:bg-neutral-800 text-sky-400 border border-neutral-800 cursor-pointer"
                    title="Nghe phát âm cụm từ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStopAudio();
                      setCoachTarget({
                        term: phrase.phrase,
                        ipa: phrase.ipa || '',
                        vietnameseMeaning: phrase.meaningVi,
                        exampleSentence: phrase.usageNote,
                      });
                      setIsCoachOpen(true);
                    }}
                    className="px-2 py-1 rounded-none bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800 flex items-center gap-1 cursor-pointer"
                    title="Luyện phát âm cụm từ này"
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

      {/* Listening Comprehension Quiz */}
      {quiz && quiz.question && (
        <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-amber-950 text-amber-300 border border-amber-800 uppercase">
              CÂU HỎI KIỂM TRA NGHE HIỂU
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
