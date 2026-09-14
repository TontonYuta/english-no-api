// Comprehensive Speech & Pronunciation Engine for PlayEng Studio
// Supports Studio Audio via /api/tts proxy, Web Speech API fallback, and Real-time Pronunciation Evaluation

export interface AudioSettings {
  speechRate: number; // 0.7, 0.8, 1.0, 1.2
  speechVoice: 'en-US' | 'en-GB';
}

export interface PronunciationOptions {
  rate?: number;
  voice?: 'en-US' | 'en-GB';
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export interface AudioTurn {
  text: string;
  speaker?: string;
  voice?: 'en-US' | 'en-GB';
  pitch?: number;
  rate?: number;
  translationVi?: string;
}

export interface SequentialPlayerOptions {
  rate?: number;
  pauseBetweenMs?: number;
  onIndexChange?: (index: number, turn: AudioTurn) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export interface SequentialAudioController {
  play: (fromIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (newRate: number) => void;
  getCurrentIndex: () => number;
  isPlaying: () => boolean;
  isPaused: () => boolean;
}

let activeAudio: HTMLAudioElement | null = null;

/**
 * Split text into natural, clean sentences while protecting abbreviations (Mr., Dr., etc.)
 */
export function splitTextIntoSentences(text: string): string[] {
  if (!text) return [];
  const protectedText = text
    .replace(/\bMr\./g, 'Mr__DOT__')
    .replace(/\bMrs\./g, 'Mrs__DOT__')
    .replace(/\bMs\./g, 'Ms__DOT__')
    .replace(/\bDr\./g, 'Dr__DOT__')
    .replace(/\bE\.g\./g, 'Eg__DOT__')
    .replace(/\be\.g\./g, 'eg__DOT__')
    .replace(/\bI\.e\./g, 'Ie__DOT__')
    .replace(/\bi\.e\./g, 'ie__DOT__')
    .replace(/\ba\.m\./gi, 'am__DOT__')
    .replace(/\bp\.m\./gi, 'pm__DOT__')
    .replace(/\betc\./gi, 'etc__DOT__')
    .replace(/\bvs\./gi, 'vs__DOT__')
    .replace(/\bapprox\./gi, 'approx__DOT__');

  const rawSentences = protectedText.split(/(?<=[.!?])\s+|\n+/);

  return rawSentences
    .map((s) =>
      s
        .replace(/Mr__DOT__/g, 'Mr.')
        .replace(/Mrs__DOT__/g, 'Mrs.')
        .replace(/Ms__DOT__/g, 'Ms.')
        .replace(/Dr__DOT__/g, 'Dr.')
        .replace(/Eg__DOT__/g, 'E.g.')
        .replace(/eg__DOT__/g, 'e.g.')
        .replace(/Ie__DOT__/g, 'I.e.')
        .replace(/ie__DOT__/g, 'i.e.')
        .replace(/am__DOT__/g, 'a.m.')
        .replace(/pm__DOT__/g, 'p.m.')
        .replace(/etc__DOT__/g, 'etc.')
        .replace(/vs__DOT__/g, 'vs.')
        .replace(/approx__DOT__/g, 'approx.')
        .trim()
    )
    .filter((s) => s.length > 0);
}

/**
 * Get current audio settings from localStorage
 */
export function getUserAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem('playeng_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        speechRate: parsed.speechRate || 1.0,
        speechVoice: parsed.speechVoice || 'en-US',
      };
    }
  } catch {}
  return {
    speechRate: 1.0,
    speechVoice: 'en-US',
  };
}

/**
 * Stop any current audio or speech synthesis playback
 */
export function stopAudioPronunciation(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Play high-fidelity studio pronunciation via /api/tts with seamless Web Speech fallback
 */
export function playAudioPronunciation(
  text: string,
  options: PronunciationOptions = {}
): () => void {
  stopAudioPronunciation();

  const cleanText = text.trim();
  if (!cleanText) return () => {};

  const userSettings = getUserAudioSettings();
  const rate = options.rate !== undefined ? options.rate : userSettings.speechRate;
  const voice = options.voice || userSettings.speechVoice;
  const pitch = options.pitch !== undefined ? options.pitch : 1.0;

  let hasEnded = false;
  const triggerEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (options.onEnd) options.onEnd();
    }
  };

  // 1. Primary Strategy: Studio Audio via /api/tts MP3 proxy
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(voice)}`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    // Apply playback rate (e.g. 0.7x for slow, 1.0x for normal)
    audio.playbackRate = Math.max(0.5, Math.min(rate, 1.5));

    audio.onplay = () => {
      if (options.onStart) options.onStart();
    };

    audio.onended = () => {
      activeAudio = null;
      triggerEnd();
    };

    audio.onerror = () => {
      // Upstream /api/tts failed or network offline -> Fallback to Web Speech API
      activeAudio = null;
      fallbackToWebSpeech(cleanText, rate, voice, pitch, options.onStart, triggerEnd, options.onError);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or fetch error -> Fallback to Web Speech API
        activeAudio = null;
        fallbackToWebSpeech(cleanText, rate, voice, pitch, options.onStart, triggerEnd, options.onError);
      });
    }
  } catch {
    // Immediate fallback
    fallbackToWebSpeech(cleanText, rate, voice, pitch, options.onStart, triggerEnd, options.onError);
  }

  // Return cancel function
  return () => {
    stopAudioPronunciation();
    triggerEnd();
  };
}

/**
 * Robust Web Speech API fallback with natural voice and pitch selection
 */
function fallbackToWebSpeech(
  text: string,
  rate: number,
  voiceLocale: 'en-US' | 'en-GB',
  pitch: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError(new Error('SpeechSynthesis not supported'));
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(rate, 1.3));
    utterance.lang = voiceLocale;
    utterance.pitch = Math.max(0.7, Math.min(pitch, 1.4));

    // Try to pick high quality English voice with speaker differentiation
    const selectBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      const langPrefix = voiceLocale.toLowerCase().replace('_', '-');
      const matchingVoices = voices.filter((v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
      );

      // Differentiate male vs female voice based on pitch
      if (pitch > 1.0) {
        const female = matchingVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen')
        );
        if (female) return female;
      } else if (pitch < 1.0) {
        const male = matchingVoices.find(
          (v) =>
            v.name.toLowerCase().includes('male') ||
            v.name.includes('Daniel') ||
            v.name.includes('David') ||
            v.name.includes('George') ||
            v.name.includes('Alex')
        );
        if (male) return male;
      }

      const preferred = matchingVoices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel')
      );

      return preferred || matchingVoices[0] || voices.find((v) => v.lang.startsWith('en')) || null;
    };

    const voice = selectBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    if (onError) onError(err);
    if (onEnd) onEnd();
  }
}

/**
 * Sequential Audio Player: plays a list of sentences or dialogue turns
 * with live index tracking, pause/resume, and natural cadence.
 */
export function createSequentialAudioPlayer(
  turns: (AudioTurn | string)[],
  options: SequentialPlayerOptions = {}
): SequentialAudioController {
  const normalizedTurns: AudioTurn[] = turns.map((t) =>
    typeof t === 'string' ? { text: t } : t
  );
  let currentIndex = 0;
  let isPlayingState = false;
  let isPausedState = false;
  let activeCancelFn: (() => void) | null = null;
  let pauseTimer: any = null;
  let currentRate = options.rate || getUserAudioSettings().speechRate || 1.0;
  const pauseBetweenMs = options.pauseBetweenMs !== undefined ? options.pauseBetweenMs : 400;

  const playTurnAtIndex = (index: number) => {
    if (index >= normalizedTurns.length) {
      isPlayingState = false;
      isPausedState = false;
      currentIndex = 0;
      options.onEnd?.();
      return;
    }

    currentIndex = index;
    isPlayingState = true;
    isPausedState = false;

    const turn = normalizedTurns[index];
    options.onIndexChange?.(index, turn);

    activeCancelFn = playAudioPronunciation(turn.text, {
      rate: turn.rate || currentRate,
      voice: turn.voice || getUserAudioSettings().speechVoice,
      pitch: turn.pitch,
      onStart: () => {
        if (index === 0) options.onStart?.();
      },
      onEnd: () => {
        activeCancelFn = null;
        if (!isPlayingState || isPausedState) return;

        pauseTimer = setTimeout(() => {
          if (isPlayingState && !isPausedState) {
            playTurnAtIndex(index + 1);
          }
        }, pauseBetweenMs);
      },
      onError: (err) => {
        activeCancelFn = null;
        options.onError?.(err);
        if (isPlayingState && !isPausedState) {
          pauseTimer = setTimeout(() => {
            playTurnAtIndex(index + 1);
          }, pauseBetweenMs);
        }
      },
    });
  };

  return {
    play: (fromIndex = 0) => {
      stopAudioPronunciation();
      if (pauseTimer) clearTimeout(pauseTimer);
      playTurnAtIndex(fromIndex);
    },
    pause: () => {
      isPausedState = true;
      if (pauseTimer) clearTimeout(pauseTimer);
      if (activeCancelFn) {
        activeCancelFn();
        activeCancelFn = null;
      }
      stopAudioPronunciation();
      options.onPause?.();
    },
    resume: () => {
      if (!isPausedState) return;
      isPausedState = false;
      options.onResume?.();
      playTurnAtIndex(currentIndex);
    },
    stop: () => {
      isPlayingState = false;
      isPausedState = false;
      currentIndex = 0;
      if (pauseTimer) clearTimeout(pauseTimer);
      if (activeCancelFn) {
        activeCancelFn();
        activeCancelFn = null;
      }
      stopAudioPronunciation();
      options.onEnd?.();
    },
    setRate: (newRate: number) => {
      currentRate = newRate;
    },
    getCurrentIndex: () => currentIndex,
    isPlaying: () => isPlayingState && !isPausedState,
    isPaused: () => isPausedState,
  };
}

/**
 * Specialized 2-Speaker Dialogue Player: assigns distinct voices and pitches
 * to Speaker A vs Speaker B with natural turn pauses.
 */
export function createDialoguePlayer(
  dialogue: { speaker: string; text: string; translationVi?: string }[],
  options: SequentialPlayerOptions = {}
): SequentialAudioController {
  if (!dialogue || dialogue.length === 0) {
    return {
      play: () => {},
      pause: () => {},
      resume: () => {},
      stop: () => {},
      setRate: () => {},
      getCurrentIndex: () => 0,
      isPlaying: () => false,
      isPaused: () => false,
    };
  }

  const firstSpeaker = dialogue[0]?.speaker || '';
  const turns: AudioTurn[] = dialogue.map((d) => {
    const isFirstSpeaker = d.speaker === firstSpeaker;
    return {
      text: d.text,
      speaker: d.speaker,
      translationVi: d.translationVi,
      voice: isFirstSpeaker ? 'en-US' : 'en-GB',
      pitch: isFirstSpeaker ? 1.08 : 0.92,
      rate: options.rate,
    };
  });

  return createSequentialAudioPlayer(turns, {
    ...options,
    pauseBetweenMs: options.pauseBetweenMs !== undefined ? options.pauseBetweenMs : 550,
  });
}

// -------------------------------------------------------------
// Pronunciation Evaluation & Scoring Engine
// -------------------------------------------------------------

export interface WordFeedback {
  word: string;
  status: 'correct' | 'incorrect' | 'missing';
  userSpoke?: string;
}

export interface PronunciationScoreResult {
  score: number; // 0 - 100
  verdict: 'perfect' | 'great' | 'good' | 'retry';
  verdictTextVi: string;
  feedbackMessageVi: string;
  words: WordFeedback[];
  phoneticTips: string[];
}

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Levenshtein distance for string fuzzy match
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates similarity ratio between 0 and 1
 */
function wordSimilarity(w1: string, w2: string): number {
  const c1 = cleanWord(w1);
  const c2 = cleanWord(w2);
  if (!c1 && !c2) return 1.0;
  if (!c1 || !c2) return 0.0;
  if (c1 === c2) return 1.0;

  const maxLen = Math.max(c1.length, c2.length);
  const dist = levenshteinDistance(c1, c2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Evaluate pronunciation accuracy between target phrase and student's speech transcript
 */
export function evaluatePronunciationLocally(
  targetText: string,
  spokenText: string,
  ipa?: string,
  vietnamesePhonetic?: string
): PronunciationScoreResult {
  const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.trim().split(/\s+/).filter(Boolean);

  if (targetWords.length === 0) {
    return {
      score: 0,
      verdict: 'retry',
      verdictTextVi: 'Chưa nhận diện được âm thanh',
      feedbackMessageVi: 'Vui lòng bấm mic và đọc lại to, rõ ràng hơn.',
      words: [],
      phoneticTips: ['Hãy giữ khoảng cách mic 15-20cm và phát âm tròn vành rõ chữ.'],
    };
  }

  const wordFeedback: WordFeedback[] = [];
  let totalSimilarity = 0;

  targetWords.forEach((targetW, idx) => {
    // Check corresponding spoken word or search in sliding window
    const spokenCandidate = spokenWords[idx] || '';
    const sim = wordSimilarity(targetW, spokenCandidate);

    if (sim >= 0.8) {
      wordFeedback.push({
        word: targetW,
        status: 'correct',
        userSpoke: spokenCandidate,
      });
      totalSimilarity += 1.0;
    } else if (sim >= 0.5) {
      wordFeedback.push({
        word: targetW,
        status: 'incorrect',
        userSpoke: spokenCandidate || undefined,
      });
      totalSimilarity += 0.6;
    } else {
      // Look elsewhere in spokenWords
      const anyMatch = spokenWords.find((sw) => wordSimilarity(targetW, sw) >= 0.8);
      if (anyMatch) {
        wordFeedback.push({
          word: targetW,
          status: 'correct',
          userSpoke: anyMatch,
        });
        totalSimilarity += 0.9;
      } else {
        wordFeedback.push({
          word: targetW,
          status: spokenCandidate ? 'incorrect' : 'missing',
          userSpoke: spokenCandidate || undefined,
        });
        totalSimilarity += 0.0;
      }
    }
  });

  const rawScore = Math.round((totalSimilarity / targetWords.length) * 100);
  const score = Math.max(0, Math.min(100, rawScore));

  let verdict: 'perfect' | 'great' | 'good' | 'retry' = 'retry';
  let verdictTextVi = 'Cần luyện thêm';
  let feedbackMessageVi = 'Bạn chưa phát âm rõ một số âm tiết hoặc nuốt âm đuôi. Hãy xem mẹo đọc bên dưới và thử lại nhé!';

  if (score >= 90) {
    verdict = 'perfect';
    verdictTextVi = 'Xuất Sắc! Chuẩn Bản Xứ';
    feedbackMessageVi = 'Ngữ điệu và trọng âm rất chuẩn xác! Các âm tiết được bật rõ ràng.';
  } else if (score >= 75) {
    verdict = 'great';
    verdictTextVi = 'Rất Tốt & Rõ Ràng';
    feedbackMessageVi = 'Người nghe hoàn toàn có thể hiểu được bạn. Chú ý trau chuốt thêm các âm đuôi (ending sounds).';
  } else if (score >= 55) {
    verdict = 'good';
    verdictTextVi = 'Khá Tốt (Cần Chỉnh Âm Đuôi)';
    feedbackMessageVi = 'Đã nắm được phần lớn âm cơ bản, nhưng cần nhấn đúng trọng âm và bật dứt khoát âm cuối.';
  }

  // Generate Vietnamese specific phonetic tips
  const phoneticTips: string[] = [];

  if (vietnamesePhonetic) {
    phoneticTips.push(`Mẹo đọc tiếng Việt: "${vietnamesePhonetic}"`);
  }

  if (ipa) {
    phoneticTips.push(`Phiên âm quốc tế IPA: [ ${ipa} ]`);
  }

  // Check common Vietnamese pronunciation traps in target words
  const lowerTarget = targetText.toLowerCase();
  if (/[st|ed|t|d|k|p|ch|sh|ce|ss|x]$/.test(lowerTarget) || /\b\w+(ed|tion|cial|sion|ness)\b/.test(lowerTarget)) {
    phoneticTips.push('Bật rõ âm đuôi (Ending Sound): Người Việt hay nuốt âm cuối /s/, /t/, /d/, /k/. Hãy bật nhẹ hơi ở cuối từ.');
  }

  if (targetWords.length > 3) {
    phoneticTips.push('Nối âm & Ngắt nhịp: Hãy đọc liền mạch theo cụm nghĩa (chunking), không đọc rời rạc từng từ một.');
  }

  return {
    score,
    verdict,
    verdictTextVi,
    feedbackMessageVi,
    words: wordFeedback,
    phoneticTips,
  };
}
