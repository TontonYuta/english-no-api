import { LearnedWord, LearnedGrammar, LearnedReading, LearnedListening } from '../types';

const WORDS_STORAGE_KEY = 'playeng_learned_words';
const GRAMMAR_STORAGE_KEY = 'playeng_learned_grammar';
const READINGS_STORAGE_KEY = 'playeng_learned_readings';
const LISTENINGS_STORAGE_KEY = 'playeng_learned_listenings';

export function getLearnedWords(): LearnedWord[] {
  try {
    const raw = localStorage.getItem(WORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading learned words:', e);
    return [];
  }
}

export function saveLearnedWords(words: LearnedWord[]): void {
  try {
    localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('Error saving learned words:', e);
  }
}

export function addLearnedWords(
  newWords: {
    term: string;
    ipa: string;
    vietnamesePhonetic?: string;
    partOfSpeech: string;
    vietnameseMeaning: string;
    wordFamily?: string;
    wordFamilyDetails?: LearnedWord['wordFamilyDetails'];
    wordFormExercise?: LearnedWord['wordFormExercise'];
    exampleSentence?: string;
    exampleTranslation?: string;
    level?: 'A1' | 'A2' | 'B1' | 'B2';
  }[]
): void {
  const existing = getLearnedWords();
  const existingMap = new Map(existing.map((w, index) => [w.term.toLowerCase(), index]));

  for (const nw of newWords) {
    const key = nw.term.toLowerCase();
    if (!existingMap.has(key)) {
      existing.push({
        id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        term: nw.term,
        ipa: nw.ipa,
        vietnamesePhonetic: nw.vietnamesePhonetic,
        partOfSpeech: nw.partOfSpeech,
        vietnameseMeaning: nw.vietnameseMeaning,
        wordFamily: nw.wordFamily,
        wordFamilyDetails: nw.wordFamilyDetails,
        wordFormExercise: nw.wordFormExercise,
        exampleSentence: nw.exampleSentence,
        exampleTranslation: nw.exampleTranslation,
        level: nw.level || 'A1',
        learnedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
      });
      existingMap.set(key, existing.length - 1);
    } else {
      // Enrich existing record with new exercises or details if missing
      const idx = existingMap.get(key)!;
      const target = existing[idx];
      if (!target.wordFamily && nw.wordFamily) target.wordFamily = nw.wordFamily;
      if (!target.wordFamilyDetails && nw.wordFamilyDetails) target.wordFamilyDetails = nw.wordFamilyDetails;
      if (!target.wordFormExercise && nw.wordFormExercise) target.wordFormExercise = nw.wordFormExercise;
      if (!target.exampleSentence && nw.exampleSentence) target.exampleSentence = nw.exampleSentence;
      if (!target.exampleTranslation && nw.exampleTranslation) target.exampleTranslation = nw.exampleTranslation;
      if (!target.vietnamesePhonetic && nw.vietnamesePhonetic) target.vietnamesePhonetic = nw.vietnamesePhonetic;
    }
  }

  saveLearnedWords(existing);
}

export function toggleWordMastery(idOrTerm: string): LearnedWord[] {
  const words = getLearnedWords();
  const lower = idOrTerm.toLowerCase();
  const matchIndex = words.findIndex((w) => w.id === idOrTerm || (w.term && w.term.toLowerCase() === lower));
  if (matchIndex >= 0) {
    words[matchIndex] = { ...words[matchIndex], mastered: !words[matchIndex].mastered };
  } else {
    // If not found in memory yet, auto-register it as mastered
    words.push({
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      term: idOrTerm,
      ipa: '',
      partOfSpeech: 'vocab',
      vietnameseMeaning: idOrTerm,
      level: 'A1',
      learnedAt: new Date().toISOString(),
      reviewCount: 1,
      mastered: true,
    });
  }
  saveLearnedWords(words);
  return words;
}

export function recordWordReview(idOrTerm: string, isCorrect: boolean): LearnedWord[] {
  const words = getLearnedWords();
  const lower = idOrTerm.toLowerCase();
  const updated = words.map((w) => {
    if (w.id === idOrTerm || (w.term && w.term.toLowerCase() === lower)) {
      const reviewCount = (w.reviewCount || 0) + 1;
      const mastered = w.mastered || (isCorrect && reviewCount >= 2);
      return { ...w, reviewCount, mastered };
    }
    return w;
  });
  saveLearnedWords(updated);
  return updated;
}

export function getLearnedGrammar(): LearnedGrammar[] {
  try {
    const raw = localStorage.getItem(GRAMMAR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading learned grammar:', e);
    return [];
  }
}

export function saveLearnedGrammar(grammar: LearnedGrammar[]): void {
  try {
    localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(grammar));
  } catch (e) {
    console.error('Error saving learned grammar:', e);
  }
}

export function addLearnedGrammar(newG: {
  ruleName: string;
  formula: string;
  vietnameseMeaning: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
}): void {
  const existing = getLearnedGrammar();
  const exists = existing.some(
    (g) => g.ruleName.toLowerCase() === newG.ruleName.toLowerCase()
  );

  if (!exists) {
    existing.push({
      id: `grammar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ruleName: newG.ruleName,
      formula: newG.formula,
      vietnameseMeaning: newG.vietnameseMeaning,
      level: newG.level,
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: false,
    });
    saveLearnedGrammar(existing);
  }
}

export function toggleGrammarMastery(idOrRuleName: string): LearnedGrammar[] {
  const list = getLearnedGrammar();
  const lower = idOrRuleName.toLowerCase();
  const matchIndex = list.findIndex(
    (g) => g.id === idOrRuleName || (g.ruleName && g.ruleName.toLowerCase() === lower)
  );
  if (matchIndex >= 0) {
    list[matchIndex] = { ...list[matchIndex], mastered: !list[matchIndex].mastered };
  }
  saveLearnedGrammar(list);
  return list;
}

/**
 * Trả về danh sách các từ đã học để gửi vào Prompt yêu cầu AI KHÔNG lặp lại
 */
export function getExcludeWordsList(): string[] {
  const words = getLearnedWords();
  return words.map((w) => w.term);
}

/**
 * Trả về danh sách các mẫu ngữ pháp đã học để AI không lặp lại
 */
export function getExcludeGrammarList(): string[] {
  const list = getLearnedGrammar();
  return list.map((g) => g.ruleName);
}

/**
 * Lấy ngẫu nhiên 1-3 từ hoặc ngữ pháp trong bộ nhớ để làm nguyên liệu cho Tab Phản Xạ
 */
export function getTargetItemsForReflex(): {
  words: LearnedWord[];
  grammar: LearnedGrammar[];
} {
  const words = getLearnedWords();
  const grammar = getLearnedGrammar();

  // Ưu tiên các từ chưa mastered
  const unmasteredWords = words.filter((w) => !w.mastered);
  const poolWords = unmasteredWords.length > 0 ? unmasteredWords : words;
  const pickedWords = [...poolWords].sort(() => 0.5 - Math.random()).slice(0, 2);

  const unmasteredGrammar = grammar.filter((g) => !g.mastered);
  const poolGrammar = unmasteredGrammar.length > 0 ? unmasteredGrammar : grammar;
  const pickedGrammar = [...poolGrammar].sort(() => 0.5 - Math.random()).slice(0, 1);

  return {
    words: pickedWords,
    grammar: pickedGrammar,
  };
}

// ==========================================
// READING MEMORY (BÀI ĐỌC ĐÃ HỌC)
// ==========================================
export function getLearnedReadings(): LearnedReading[] {
  try {
    const raw = localStorage.getItem(READINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading learned readings:', e);
    return [];
  }
}

export function saveLearnedReadings(readings: LearnedReading[]): void {
  try {
    localStorage.setItem(READINGS_STORAGE_KEY, JSON.stringify(readings));
  } catch (e) {
    console.error('Error saving learned readings:', e);
  }
}

export function addLearnedReading(newR: {
  title: string;
  passage: string;
  translationVi: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  keyWords?: { term: string; meaning: string }[];
  questions?: { question: string; options: string[]; correctIndex: number; explanation: string }[];
}): void {
  const existing = getLearnedReadings();
  const exists = existing.some(
    (r) => r.title.toLowerCase() === newR.title.toLowerCase()
  );
  if (!exists) {
    existing.push({
      id: `reading_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: newR.title,
      passage: newR.passage,
      translationVi: newR.translationVi,
      level: newR.level,
      topic: newR.topic,
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: false,
      keyWords: newR.keyWords,
      questions: newR.questions,
    });
    saveLearnedReadings(existing);
  }
}

export function toggleReadingMastery(idOrTitle: string): LearnedReading[] {
  const list = getLearnedReadings();
  const lower = idOrTitle.toLowerCase();
  const matchIndex = list.findIndex(
    (r) => r.id === idOrTitle || (r.title && r.title.toLowerCase() === lower)
  );
  if (matchIndex >= 0) {
    list[matchIndex] = { ...list[matchIndex], mastered: !list[matchIndex].mastered };
  }
  saveLearnedReadings(list);
  return list;
}

// ==========================================
// LISTENING MEMORY (BÀI NGHE ĐÃ HỌC)
// ==========================================
export function getLearnedListenings(): LearnedListening[] {
  try {
    const raw = localStorage.getItem(LISTENINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading learned listenings:', e);
    return [];
  }
}

export function saveLearnedListenings(listenings: LearnedListening[]): void {
  try {
    localStorage.setItem(LISTENINGS_STORAGE_KEY, JSON.stringify(listenings));
  } catch (e) {
    console.error('Error saving learned listenings:', e);
  }
}

export function addLearnedListening(newL: {
  title: string;
  dialogue: { speaker: string; text: string; translationVi: string }[];
  level: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  questions?: { audioPrompt: string; question: string; options: string[]; correctIndex: number; explanation: string }[];
}): void {
  const existing = getLearnedListenings();
  const exists = existing.some(
    (l) => l.title.toLowerCase() === newL.title.toLowerCase()
  );
  if (!exists) {
    existing.push({
      id: `listening_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: newL.title,
      dialogue: newL.dialogue,
      level: newL.level,
      topic: newL.topic,
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: false,
      questions: newL.questions,
    });
    saveLearnedListenings(existing);
  }
}

export function toggleListeningMastery(idOrTitle: string): LearnedListening[] {
  const list = getLearnedListenings();
  const lower = idOrTitle.toLowerCase();
  const matchIndex = list.findIndex(
    (l) => l.id === idOrTitle || (l.title && l.title.toLowerCase() === lower)
  );
  if (matchIndex >= 0) {
    list[matchIndex] = { ...list[matchIndex], mastered: !list[matchIndex].mastered };
  }
  saveLearnedListenings(list);
  return list;
}

/**
 * Xóa sạch 4 trụ cột dữ liệu học tập (Từ vựng, Ngữ pháp, Bài đọc, Bài nghe)
 */
export function clearAllLearningMemory(): void {
  try {
    localStorage.removeItem(WORDS_STORAGE_KEY);
    localStorage.removeItem(GRAMMAR_STORAGE_KEY);
    localStorage.removeItem(READINGS_STORAGE_KEY);
    localStorage.removeItem(LISTENINGS_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing learning memory:', e);
  }
}

/**
 * Khôi phục cài đặt gốc: Xóa toàn bộ dữ liệu học tập, tiến trình, streak, level, settings để làm lại từ đầu
 */
export function resetAllAppData(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const knownKeys = [
        WORDS_STORAGE_KEY,
        GRAMMAR_STORAGE_KEY,
        READINGS_STORAGE_KEY,
        LISTENINGS_STORAGE_KEY,
        'playeng_streak',
        'playeng_last_completed',
        'playeng_user_level',
        'playeng_settings',
        'playeng_last_progress_date',
        'playeng_completed_steps',
        'playeng_flashcard_autoplay',
        'playeng_focus_mode',
        'playeng_current_tab',
        'playeng_lang',
      ];
      knownKeys.forEach((k) => localStorage.removeItem(k));

      // Clear any additional playeng_ items
      if (typeof localStorage.clear === 'function') {
        localStorage.clear();
      }
    }
  } catch (e) {
    console.error('Error resetting app data:', e);
  }
}


