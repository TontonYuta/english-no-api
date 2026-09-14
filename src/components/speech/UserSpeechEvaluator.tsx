import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Award,
  Volume2,
  AlertCircle,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { DialogueDifficulty, UserSpeechEvaluation, Language } from '../../types';
import { translations } from '../../translations';

interface UserSpeechEvaluatorProps {
  userRole: string;
  aiRole: string;
  scenario: string;
  targetDifficulty: DialogueDifficulty;
  lang: Language;
}

export const UserSpeechEvaluator: React.FC<UserSpeechEvaluatorProps> = ({
  userRole,
  aiRole,
  scenario,
  targetDifficulty,
  lang,
}) => {
  const t = translations[lang];
  const [speechText, setSpeechText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<UserSpeechEvaluation | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Web Speech API
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setSpeechText(transcript);
        };

        recog.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setRecognitionError(t.micDenied);
          }
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recog);
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }, [lang]);

  const toggleRecording = () => {
    setRecognitionError(null);
    if (!recognition) {
      setRecognitionError(t.micNotSupported);
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setIsRecording(false);
      }
    }
  };

  const handleEvaluate = async () => {
    if (!speechText.trim()) return;

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const res = await fetch('/api/evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speechText,
          scenario,
          userRole,
          aiRole,
          targetDifficulty,
          lang,
        }),
      });

      if (!res.ok) throw new Error('Speech eval API failed');
      const data: UserSpeechEvaluation = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.warn('Fallback to client evaluation:', err);
      // Client-side fallback
      const words = speechText.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      let level: DialogueDifficulty = 'B1';
      let fluency = 6.5;
      let vocab = 6.0;
      let grammar = 6.5;

      if (/furthermore|nevertheless|consequently|prioritize|leeway|redistribute/i.test(speechText)) {
        level = 'C1';
        fluency = 8.5;
        vocab = 8.5;
        grammar = 8.5;
      } else if (wordCount > 10 || /would it be possible|wondering if|appreciate/i.test(speechText)) {
        level = 'B2';
        fluency = 7.5;
        vocab = 7.5;
        grammar = 7.5;
      } else if (wordCount <= 4) {
        level = 'A2';
        fluency = 5.0;
        vocab = 5.0;
        grammar = 6.0;
      }

      setEvaluation({
        userSpeech: speechText,
        assessedLevel: level,
        levelDescription:
          lang === 'vi'
            ? `Lời nói của bạn đạt trình độ CEFR ${level}. Cấu trúc câu tự nhiên, giao tiếp truyền tải được thông điệp rõ ràng.`
            : `Your speech demonstrates CEFR ${level} proficiency with clear communicative intent.`,
        scoreBreakdown: { fluency, vocabulary: vocab, grammar, naturalness: fluency },
        upgradedPhrasings: [
          {
            level: 'B2',
            sentence: `I was wondering if there is any flexibility regarding the current policy?`,
          },
          {
            level: 'C1',
            sentence: `Would there be any leeway in this circumstance, or is the excess fee mandatory?`,
          },
          {
            level: 'C2',
            sentence: `Could discretionary leeway be granted on this occasion, or does protocol strictly dictate an excess fee?`,
          },
        ],
        culturalTips: [
          lang === 'vi'
            ? 'Khi đàm phán trong dịch vụ khách hàng quốc tế, cách hỏi gián tiếp (như "Would it be possible...", "I was wondering if...") sẽ tạo thiện cảm tốt hơn.'
            : 'Polite indirect openers (e.g., "I was wondering if...") significantly soften negotiation.',
        ],
        followUpChallenge:
          lang === 'vi'
            ? 'Hãy thử bấm nút loa để nghe câu C1 và đọc to lại để làm quen với ngữ điệu chuẩn.'
            : 'Try repeating the C1 upgrade aloud to polish your cadence.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getLevelColor = (level: DialogueDifficulty) => {
    switch (level) {
      case 'C2':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'C1':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'B2':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'B1':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-amber-950 text-amber-300 border-amber-800';
    }
  };

  return (
    <div className="p-5 rounded-none bg-neutral-950 border border-neutral-800 shadow-sm space-y-4 border-l-4 border-l-sky-500">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-none bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              {t.evaluateSpeechTitle}
            </h4>
            <p className="text-xs text-neutral-400">
              {lang === 'vi'
                ? `Đóng vai "${userRole}" nói với "${aiRole}" và nhận đánh giá CEFR trực tiếp`
                : `Roleplay as "${userRole}" speaking to "${aiRole}" and receive instant CEFR grading`}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-none bg-neutral-900 border border-neutral-700 text-neutral-300">
          [ TARGET: {targetDifficulty} ]
        </span>
      </div>

      {/* Input area with Mic & Submit Button */}
      <div className="relative">
        <textarea
          rows={3}
          value={speechText}
          onChange={(e) => setSpeechText(e.target.value)}
          placeholder={t.speechInputPlaceholder}
          className="w-full pl-4 pr-28 py-3 bg-neutral-950 border border-neutral-800 rounded-none text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors leading-relaxed font-sans"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-none text-xs font-mono font-bold uppercase transition-all border ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700 cursor-pointer'
            }`}
            title={isRecording ? 'Dừng thu âm' : 'Bật micro thu âm giọng nói'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            type="button"
            disabled={!speechText.trim() || isEvaluating}
            onClick={handleEvaluate}
            className={`px-3 py-2 rounded-none text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
              !speechText.trim() || isEvaluating
                ? 'bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-sm cursor-pointer'
            }`}
          >
            {isEvaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isEvaluating ? t.evaluatingSpeech : t.evaluateSpeechBtn}
            </span>
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-950/30 border border-rose-900/40 p-2.5 rounded-none animate-pulse">
          <span className="w-2 h-2 rounded-none bg-rose-500 animate-ping" />
          <span>{t.micListening}</span>
        </div>
      )}

      {recognitionError && (
        <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-none">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{recognitionError}</span>
        </div>
      )}

      {/* Evaluation Results Card */}
      {evaluation && (
        <div className="mt-4 p-5 rounded-none bg-neutral-900/60 border border-neutral-800 space-y-4 animate-fade-in border-l-4 border-l-emerald-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">{t.speechLevelResult}:</span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-none border ${getLevelColor(
                      evaluation.assessedLevel
                    )}`}
                  >
                    [ CEFR {evaluation.assessedLevel} ]
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  {evaluation.levelDescription}
                </p>
              </div>
            </div>

            {/* Score pills breakdown */}
            <div className="flex items-center gap-2 text-center text-xs">
              <div className="px-2.5 py-1 rounded-none bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-400 block uppercase">{t.speechFluency}</span>
                <span className="font-bold text-sky-400">
                  {evaluation.scoreBreakdown.fluency}/10
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-none bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-400 block uppercase">{t.speechVocabulary}</span>
                <span className="font-bold text-sky-400">
                  {evaluation.scoreBreakdown.vocabulary}/10
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-none bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-400 block uppercase">{t.speechGrammar}</span>
                <span className="font-bold text-sky-400">
                  {evaluation.scoreBreakdown.grammar}/10
                </span>
              </div>
            </div>
          </div>

          {/* Upgraded Phrasings */}
          <div className="space-y-2">
            <h5 className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.speechUpgradeTitle}</span>
            </h5>

            <div className="space-y-2">
              {evaluation.upgradedPhrasings?.map((up, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-none bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3 group hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-none border mt-0.5 shrink-0 ${getLevelColor(
                        up.level
                      )}`}
                    >
                      [{up.level}]
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      "{up.sentence}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(up.sentence)}
                    className="p-1.5 rounded-none bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-sky-400 transition-colors shrink-0 cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pragmatic & Cultural Note */}
          {evaluation.culturalTips && evaluation.culturalTips.length > 0 && (
            <div className="p-3 rounded-none bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200/90 leading-relaxed font-mono">
              <strong className="text-emerald-300 font-bold block mb-1 uppercase">
                {lang === 'vi' ? 'Mẹo ứng xử văn hóa & Ngữ dụng:' : 'Cultural Pragmatics Tip:'}
              </strong>
              {evaluation.culturalTips[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
