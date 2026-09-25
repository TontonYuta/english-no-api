export type TaskType =
  | 'translation_vocab'
  | 'writing'
  | 'vocab'
  | 'roleplay'
  | 'quiz'
  | 'toeic_lesson'
  | 'grammar_lesson'
  | 'reading_lesson'
  | 'listening_lesson'
  | 'reflex_challenge';
export type RoleplayLength = 'short' | 'medium' | 'long';
export type DialogueDifficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Language = 'vi' | 'en';

export type ChatbotProvider = 'fast' | 'gemini' | 'chatgpt' | 'antigravity';

export type MainTabType =
  | 'today'
  | 'vocab'
  | 'grammar'
  | 'read_listen'
  | 'chat'
  | 'writing'
  | 'quiz'
  | 'memory';

export type PipelineStepId =
  | 'launching_browser'
  | 'navigating'
  | 'injecting_prompt'
  | 'waiting_generation'
  | 'extracting_response'
  | 'rendered';

export type StepState = 'idle' | 'running' | 'completed' | 'failed';

export interface PipelineStep {
  id: PipelineStepId;
  stepNumber: number;
  label: string;
  subtext: string;
  status: StepState;
  timestamp?: string;
  durationMs?: number;
}

export type LogLevel = 'info' | 'scraper' | 'dom' | 'wait' | 'success' | 'warn' | 'error';

export interface AutomationLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  stepId: PipelineStepId;
  message: string;
  detail?: string;
}

export interface PlaywrightConfig {
  provider: ChatbotProvider;
  headless: boolean;
  userDataDir: string;
  timeoutMs: number;
  simulateIfBlocked: boolean;
  geminiApiKey?: string;
}

export interface WritingCorrection {
  original: string;
  suggested: string;
  type: 'grammar' | 'collocation' | 'spelling' | 'punctuation' | 'style';
  explanation: string;
}

export interface VocabUpgrade {
  originalWord: string;
  upgradedWord: string;
  context: string;
  level: string;
}

export interface WritingResult {
  cefrBand: string;
  summary: string;
  scoreBreakdown: {
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    overallBand: number;
  };
  corrections: WritingCorrection[];
  vocabularyUpgrades: VocabUpgrade[];
  improvedRewrite: string;
}

export interface VocabExample {
  en: string;
  vi: string;
  contextNote: string;
}

export interface SynonymItem {
  word: string;
  meaning?: string;
  nuance?: string;
}

export interface VocabResult {
  term: string;
  ipa: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  nuances: string;
  register: 'formal' | 'informal' | 'slang' | 'neutral' | 'idiomatic';
  examples: VocabExample[];
  commonTraps: string[];
  collocations: string[];
  synonyms?: (string | SynonymItem)[];
  wordFamily?: string;
  wordFamilyDetails?: WordFamilyDetails;
}

export interface RoleplayDialogueTurn {
  speaker: string;
  text: string;
  translationVi: string;
  audioTip?: string;
  usefulExpression?: string;
  grammarFeedback?: string;
  timestamp?: string;
  isUser?: boolean;
}

export interface RoleplayResult {
  scenario: string;
  userRole: string;
  aiRole: string;
  length?: RoleplayLength;
  difficulty?: DialogueDifficulty;
  dialogue: RoleplayDialogueTurn[];
  keyVocabulary: {
    term: string;
    meaning: string;
    usage: string;
  }[];
  culturalTips: string[];
  followUpChallenge: string;
}

export interface UserSpeechEvaluation {
  userSpeech: string;
  assessedLevel: DialogueDifficulty;
  levelDescription: string;
  scoreBreakdown: {
    fluency: number; // 0-10
    vocabulary: number; // 0-10
    grammar: number; // 0-10
    naturalness: number; // 0-10
  };
  upgradedPhrasings: {
    level: DialogueDifficulty;
    sentence: string;
  }[];
  culturalTips: string[];
  followUpChallenge: string;
}

export type TopicPreference = 'all' | 'workplace' | 'daily_life' | 'travel' | 'tech' | 'custom';
export type GrammarFocus = 'toeic_all' | 'word_forms' | 'tenses' | 'participles' | 'conjunctions';

export interface AppSettings {
  language: Language;
  defaultProvider: ChatbotProvider;
  headless: boolean;
  speechRate: number; // 0.8, 1.0, 1.2
  speechVoice: 'en-US' | 'en-GB';
  defaultRoleplayLength: RoleplayLength;
  defaultRoleplayDifficulty: DialogueDifficulty;
  defaultUserRole: string;
  defaultAiRole: string;
  simulateIfBlocked: boolean;
  userLevel?: CEFRLevel;
  dailyVocabCount?: number; // 3, 5, 8, 10
  quizQuestionCount?: number; // 5, 10, 15, 20
  quizIncludeVocab?: boolean;
  quizIncludeGrammar?: boolean;
  topicPreference?: TopicPreference;
  customTopic?: string;
  grammarFocus?: GrammarFocus;
  focusMode?: boolean;
  geminiApiKey?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  grammarRule: string;
  category?: 'vocab' | 'grammar';
  sourceTerm?: string;
}

export interface QuizResult {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface WordFamilyDetails {
  noun?: string;
  nounMeaning?: string;
  verb?: string;
  verbMeaning?: string;
  adjective?: string;
  adjectiveMeaning?: string;
  adverb?: string;
  adverbMeaning?: string;
}

export interface WordFormExercise {
  sentence: string; // e.g. "The board was impressed by the candidate's _______ in negotiations."
  options: string[]; // 4 choices (noun, verb, adjective, adverb)
  correctIndex: number;
  targetForm: 'noun' | 'verb' | 'adjective' | 'adverb';
  explanation: string; // Detailed grammar reasoning in Vietnamese
}

export interface ToeicWord {
  term: string;
  ipa: string;
  vietnamesePhonetic?: string; // Mẹo phát âm tiếng Việt gần đúng cho người mới A1 (e.g. "x-két-giu-ồ")
  partOfSpeech: string;
  vietnameseMeaning: string;
  wordFamily?: string;
  wordFamilyDetails?: WordFamilyDetails;
  synonyms?: (string | SynonymItem)[];
  wordFormExercise?: WordFormExercise;
  toeicParaphrase?: string;
  exampleSentence: string;
  exampleTranslation: string;
  simpleBreakdown?: string; // Mổ xẻ cấu trúc câu đơn giản cho người A1
  etsTrapTip?: string;
}

export interface ToeicLessonResult {
  topic: string;
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  situationType: 'email' | 'memo' | 'meeting' | 'chat' | 'announcement' | 'story' | 'article' | 'reading';
  vocabMethod?: 'core' | 'reading';
  situationTitle: string;
  scenarioText: string;
  scenarioTranslationVi: string;
  targetWords: ToeicWord[];
  interactiveChallenge: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    takeawayTip: string;
  };
}

export type LeitnerRating = 'again' | 'hard' | 'good' | 'easy';

export interface FlashcardItem {
  id?: string;
  term: string;
  ipa: string;
  vietnamesePhonetic?: string;
  partOfSpeech?: string;
  vietnameseMeaning: string;
  wordFamily?: string;
  wordFamilyDetails?: WordFamilyDetails;
  synonyms?: (string | SynonymItem)[];
  exampleSentence?: string;
  exampleTranslation?: string;
  simpleBreakdown?: string;
  etsTrapTip?: string;
  mastered?: boolean;
  reviewCount?: number;
  level?: 'A1' | 'A2' | 'B1' | 'B2';
}

export interface LearnedWord {
  id: string;
  term: string;
  ipa: string;
  vietnamesePhonetic?: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  wordFamily?: string;
  wordFamilyDetails?: WordFamilyDetails;
  synonyms?: (string | SynonymItem)[];
  wordFormExercise?: WordFormExercise;
  exampleSentence?: string;
  exampleTranslation?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  learnedAt: string;
  reviewCount: number;
  mastered: boolean;
}

export interface LearnedGrammar {
  id: string;
  ruleName: string;
  formula: string;
  vietnameseMeaning: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  learnedAt: string;
  reviewCount: number;
  mastered: boolean;
}

export interface GrammarLessonResult {
  ruleName: string;
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  formula: string;
  vietnameseMeaning: string;
  explanation: string;
  examples: {
    en: string;
    vi: string;
    note?: string;
  }[];
  vietnameseTrap: string;
  practiceSentence: {
    prompt: string;
    hint: string;
  };
}

export interface ReflexChallengeResult {
  sourceType: 'memory_review' | 'general';
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  reviewedTerms: string[];
  situationContext: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  memoryTip: string;
}

export interface LearnedReading {
  id: string;
  title: string;
  passage: string;
  translationVi: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  learnedAt: string;
  reviewCount: number;
  mastered: boolean;
  keyWords?: {
    term: string;
    meaning: string;
  }[];
  questions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ReadingLessonResult {
  title: string;
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | string;
  topic: string;
  genre: 'email' | 'announcement' | 'memo' | 'chat' | 'notice' | 'article' | 'story' | 'guide' | 'review' | string;
  passage: string;
  translationVi: string;
  targetWordCount?: number;
  actualWordCount?: number;
  keyVocabulary: {
    term: string;
    ipa?: string;
    meaning: string;
    contextHint?: string;
  }[];
  comprehensionQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LearnedListening {
  id: string;
  title: string;
  dialogue: {
    speaker: string;
    text: string;
    translationVi: string;
  }[];
  level: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  learnedAt: string;
  reviewCount: number;
  mastered: boolean;
  questions?: {
    audioPrompt: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ListeningLessonResult {
  title: string;
  userLevel?: 'A1' | 'A2' | 'B1' | 'B2';
  topic: string;
  situation: string;
  dialogue: {
    speaker: string;
    text: string;
    translationVi: string;
  }[];
  fullAudioScript: string;
  keyPhrases: {
    phrase: string;
    ipa?: string;
    meaning: string;
  }[];
  listeningQuiz: {
    audioPrompt: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface VocabGuessItem {
  word: string;
  contextSentence?: string;
  userGuess: string;
}

export interface VocabGuessEvaluation {
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  contextSentence: string;
  userGuess: string;
  actualMeaningInContext: string;
  generalMeaning: string;
  score: number;
  accuracyGrade: 'exact' | 'close' | 'incorrect';
  feedback: string;
  nuanceExplanation: string;
  collocations?: string[];
  exampleSentence?: string;
}

export interface SentenceTranslationFeedback {
  sentenceIndex: number;
  originalSentence: string;
  userTranslatedSentence?: string;
  suggestedSentence: string;
  status: 'good' | 'acceptable' | 'needs_improvement';
  critique: string;
}

export interface TranslationVocabResult {
  title?: string;
  passage: string;
  topic?: string;
  difficulty?: string;
  evaluatedBy?: string;
  evaluatedProvider?: ChatbotProvider;
  overallScore: number;
  cefrLevel: string;
  translationScore: number;
  vocabScore: number;
  performanceBadge: string;
  executiveSummary: string;
  translationEvaluation: {
    referenceTranslation: string;
    strengths: string[];
    weaknesses: string[];
    sentenceBySentenceFeedback: SentenceTranslationFeedback[];
  };
  vocabEvaluations: VocabGuessEvaluation[];
  objectiveAdvice: {
    translationTips: string[];
    contextDeductionTips: string[];
    nextAction: string;
  };
}

export type TaskResult =
  | { type: 'translation_vocab'; data: TranslationVocabResult }
  | { type: 'writing'; data: WritingResult }
  | { type: 'vocab'; data: VocabResult }
  | { type: 'roleplay'; data: RoleplayResult }
  | { type: 'quiz'; data: QuizResult }
  | { type: 'toeic_lesson'; data: ToeicLessonResult }
  | { type: 'grammar_lesson'; data: GrammarLessonResult }
  | { type: 'reading_lesson'; data: ReadingLessonResult }
  | { type: 'listening_lesson'; data: ListeningLessonResult }
  | { type: 'reflex_challenge'; data: ReflexChallengeResult };

export interface AutomationStreamPayload {
  type: 'step' | 'log' | 'raw_chunk' | 'result' | 'error' | 'done';
  stepId?: PipelineStepId;
  stepStatus?: StepState;
  log?: AutomationLog;
  rawChunk?: string;
  result?: TaskResult;
  error?: string;
  durationMs?: number;
}
