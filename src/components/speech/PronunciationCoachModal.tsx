import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Award,
  Languages,
  Info
} from 'lucide-react';
import {
  playAudioPronunciation,
  stopAudioPronunciation,
  evaluatePronunciationLocally,
  PronunciationScoreResult,
  getUserAudioSettings
} from '../../utils/speechUtils';

export interface PronunciationCoachTarget {
  term: string;
  ipa?: string;
  vietnamesePhonetic?: string;
  vietnameseMeaning?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  level?: string;
}

interface PronunciationCoachModalProps {
  isOpen?: boolean;
  onClose: () => void;
  target: PronunciationCoachTarget | null;
}

export const PronunciationCoachModal: React.FC<PronunciationCoachModalProps> = ({
  isOpen = true,
  onClose,
  target,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number>(1.0);
  const [voiceLocale, setVoiceLocale] = useState<'en-US' | 'en-GB'>(() => {
    return getUserAudioSettings().speechVoice;
  });

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<PronunciationScoreResult | null>(null);

  // Focus mode: 'word' or 'sentence'
  const [practiceMode, setPracticeMode] = useState<'word' | 'sentence'>('word');

  const recognitionRef = useRef<any>(null);

  // Sync settings when opening
  useEffect(() => {
    if (isOpen) {
      const settings = getUserAudioSettings();
      setVoiceLocale(settings.speechVoice);
      setTranscript('');
      setEvaluation(null);
      setMicError(null);
      setIsRecording(false);
      setPracticeMode('word');
    } else {
      stopAudioPronunciation();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const currentTargetText =
    practiceMode === 'sentence' && target.exampleSentence
      ? target.exampleSentence
      : target.term;

  const handlePlayAudio = (rate: number = 1.0) => {
    setActiveSpeed(rate);
    setIsPlayingAudio(true);
    playAudioPronunciation(currentTargetText, {
      rate,
      voice: voiceLocale,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const startRecording = () => {
    setMicError(null);
    setTranscript('');
    setEvaluation(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError(
        'Trình duyệt chưa hỗ trợ Web Speech API trực tiếp. Hãy sử dụng Chrome hoặc Edge để luyện đọc.'
      );
      return;
    }

    try {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = voiceLocale;

      recog.onstart = () => {
        setIsRecording(true);
      };

      recog.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recog.onerror = (event: any) => {
        console.warn('Speech recog error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setMicError('Quyền truy cập Microphone bị từ chối. Vui lòng cho phép truy cập micro trong trình duyệt.');
        } else if (event.error === 'no-speech') {
          setMicError('Chưa phát hiện giọng nói. Hãy đưa mic lại gần và đọc to hơn.');
        }
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
      recog.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setMicError('Không thể kích hoạt microphone: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecordingAndEvaluate = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);

    // Evaluate current transcript
    const result = evaluatePronunciationLocally(
      currentTargetText,
      transcript,
      target.ipa,
      target.vietnamesePhonetic
    );
    setEvaluation(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-950 border-2 border-neutral-700 shadow-2xl rounded-none flex flex-col max-h-[92vh] overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight font-mono">
                  [ HUẤN LUYỆN VIÊN PHÁT ÂM CHUẨN XÃ ]
                </h3>
                {target.level && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-none bg-sky-950 text-sky-300 border border-sky-800">
                    {target.level}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                Luyện đọc từng âm tiết, bắt lỗi nuốt âm đuôi và chấm điểm theo thời gian thực
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Practice Target Card */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Toggle Practice Mode (Word vs Full Sentence) */}
          {target.exampleSentence && (
            <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-none w-fit text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setPracticeMode('word');
                  setTranscript('');
                  setEvaluation(null);
                }}
                className={`px-3 py-1.5 rounded-none transition-all cursor-pointer font-bold ${
                  practiceMode === 'word'
                    ? 'bg-sky-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                [ 1. LUYỆN TỪ ĐƠN ]
              </button>
              <button
                type="button"
                onClick={() => {
                  setPracticeMode('sentence');
                  setTranscript('');
                  setEvaluation(null);
                }}
                className={`px-3 py-1.5 rounded-none transition-all cursor-pointer font-bold ${
                  practiceMode === 'sentence'
                    ? 'bg-sky-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                [ 2. LUYỆN NGUYÊN CÂU ]
              </button>
            </div>
          )}

          {/* Target Focus Box */}
          <div className="p-5 rounded-none bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {practiceMode === 'word' ? target.term : target.exampleSentence}
                </h2>
                {practiceMode === 'word' && target.ipa && (
                  <div className="text-xs font-mono text-sky-400 mt-1 flex items-center gap-2">
                    <span>{target.ipa}</span>
                  </div>
                )}
              </div>

              {practiceMode === 'word' && target.vietnamesePhonetic && (
                <div className="px-2.5 py-1 rounded-none bg-purple-950/70 border border-purple-800/80 text-xs text-purple-300 font-mono">
                  MẸO ĐỌC: <strong className="text-white">"{target.vietnamesePhonetic}"</strong>
                </div>
              )}
            </div>

            {/* Meaning Translation */}
            <div className="text-xs text-neutral-300 border-t border-neutral-800/80 pt-2 font-sans">
              {practiceMode === 'word' ? (
                <p>Nghĩa tiếng Việt: <strong className="text-white">{target.vietnameseMeaning}</strong></p>
              ) : (
                <p>Bản dịch câu: <strong className="text-white">{target.exampleTranslation}</strong></p>
              )}
            </div>

            {/* Studio Audio Pronunciation Controls */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-neutral-800/60">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1.0x Normal Audio */}
                <button
                  type="button"
                  onClick={() => handlePlayAudio(1.0)}
                  disabled={isPlayingAudio}
                  className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio && activeSpeed === 1.0
                      ? 'bg-sky-500 text-neutral-950 border-sky-400 animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-sky-300 border-neutral-700'
                  }`}
                  title="Nghe tốc độ chuẩn"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 1.0x Chuẩn</span>
                </button>

                {/* 0.7x Slow Audio */}
                <button
                  type="button"
                  onClick={() => handlePlayAudio(0.7)}
                  disabled={isPlayingAudio}
                  className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio && activeSpeed === 0.7
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-neutral-700'
                  }`}
                  title="Nghe chậm từng âm tiết (Dành cho người mới bắt đầu)"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🐢 0.7x Chậm</span>
                </button>
              </div>

              {/* Accent Switcher */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                <span>GIỌNG:</span>
                <button
                  type="button"
                  onClick={() => setVoiceLocale('en-US')}
                  className={`px-2 py-0.5 rounded-none border cursor-pointer ${
                    voiceLocale === 'en-US'
                      ? 'bg-sky-950 text-sky-300 border-sky-700 font-bold'
                      : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                  }`}
                >
                  🇺🇸 Mỹ (US)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLocale('en-GB')}
                  className={`px-2 py-0.5 rounded-none border cursor-pointer ${
                    voiceLocale === 'en-GB'
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-700 font-bold'
                      : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                  }`}
                >
                  🇬🇧 Anh (UK)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Voice Recording Console */}
          <div className="p-5 rounded-none bg-neutral-900 border border-neutral-800 text-center space-y-4">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              [ PHÒNG THU LUYỆN ĐỌC &amp; CHẤM ĐIỂM TỨC THÌ ]
            </span>

            {/* Big Mic Trigger */}
            <div className="flex flex-col items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-8 py-3.5 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2.5 cursor-pointer shadow-lg transition-all border border-emerald-400"
                >
                  <Mic className="w-4 h-4" />
                  <span>[ 🎙️ BẤM VÀ ĐỌC TO ]</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecordingAndEvaluate}
                  className="px-8 py-3.5 rounded-none bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2.5 cursor-pointer shadow-lg animate-pulse border border-rose-400"
                >
                  <MicOff className="w-4 h-4" />
                  <span>[ ⏹️ DỪNG VÀ CHẤM ĐIỂM ]</span>
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-mono animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-none bg-rose-500" />
                  <span>ĐANG LẮNG NGHE BẠN ĐỌC... HÃY PHÁT ÂM RÕ RÀNG!</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {micError && (
              <div className="p-3 rounded-none bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-mono text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{micError}</span>
              </div>
            )}

            {/* Live Transcript Display */}
            {transcript && (
              <div className="p-3 rounded-none bg-neutral-950 border border-neutral-800 text-left space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  ÂM THANH NHẬN DIỆN ĐƯỢC:
                </span>
                <p className="text-sm font-mono text-sky-300 font-bold">
                  "{transcript}"
                </p>
              </div>
            )}
          </div>

          {/* Assessment & Feedback Section */}
          {evaluation && (
            <div className="p-5 rounded-none bg-neutral-900 border-2 border-neutral-700 space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-none border ${
                      evaluation.score >= 80
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : evaluation.score >= 60
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block">
                      KẾT QUẢ ĐÁNH GIÁ:
                    </span>
                    <h4 className="text-base font-black text-white">
                      {evaluation.verdictTextVi}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-neutral-400 block">ĐỘ CHÍNH XÁC:</span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      evaluation.score >= 80
                        ? 'text-emerald-400'
                        : evaluation.score >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {evaluation.score}%
                  </span>
                </div>
              </div>

              {/* Word by Word Breakdown */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-neutral-300 uppercase block">
                  CHI TIẾT TỪNG TỪ ĐÃ ĐỌC:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {evaluation.words.map((w, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-none text-xs font-mono font-bold border flex items-center gap-1.5 ${
                        w.status === 'correct'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : w.status === 'incorrect'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700'
                      }`}
                    >
                      <span>{w.word}</span>
                      {w.status === 'correct' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-amber-400">
                          {w.userSpoke ? `(bạn đọc: "${w.userSpoke}")` : '(thiếu âm)'}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-950 p-3 rounded-none border border-neutral-800">
                {evaluation.feedbackMessageVi}
              </p>

              {/* Phonetic & Accent Tips */}
              {evaluation.phoneticTips.length > 0 && (
                <div className="p-3.5 rounded-none bg-neutral-950 border-l-2 border-l-sky-500 border-y border-r border-neutral-800 space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>MẸO KHẨU HÌNH &amp; ÂM ĐUÔI CHO NGƯỜI VIỆT:</span>
                  </span>
                  <ul className="text-xs text-neutral-300 space-y-1 list-disc pl-4 font-sans">
                    {evaluation.phoneticTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Retry button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 rounded-none bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold transition-all border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>[ ĐỌC LẠI ]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayAudio(0.7)}
                  className="px-4 py-2 rounded-none bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono text-xs font-black transition-all border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>[ 🐢 NGHE LẠI MẪU CHẬM ]</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="text-[11px] font-mono text-neutral-400">
            ENGINE: <strong className="text-white">STUDIO AUDIO + WEB SPEECH RECOGNITION</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-none bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold transition-all border border-neutral-700 cursor-pointer"
          >
            [ ĐÓNG ]
          </button>
        </div>
      </div>
    </div>
  );
};
