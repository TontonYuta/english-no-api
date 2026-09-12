export type TaskType = 'writing' | 'vocab' | 'roleplay' | 'quiz' | 'toeic_lesson';
export type RoleplayLength = 'short' | 'medium' | 'long';
export type DialogueDifficulty = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Language = 'vi' | 'en';

export type ChatbotProvider = 'gemini' | 'chatgpt';

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
}

export interface RoleplayDialogueTurn {
  speaker: string;
  text: string;
  translationVi: string;
  audioTip?: string;
  usefulExpression?: string;
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
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  grammarRule: string;
}

export interface QuizResult {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface ToeicWord {
  term: string;
  ipa: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  wordFamily?: string;
  toeicParaphrase?: string;
  exampleSentence: string;
  exampleTranslation: string;
  etsTrapTip?: string;
}

export interface ToeicLessonResult {
  topic: string;
  situationType: 'email' | 'memo' | 'meeting' | 'chat' | 'announcement';
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

export type TaskResult =
  | { type: 'writing'; data: WritingResult }
  | { type: 'vocab'; data: VocabResult }
  | { type: 'roleplay'; data: RoleplayResult }
  | { type: 'quiz'; data: QuizResult }
  | { type: 'toeic_lesson'; data: ToeicLessonResult };

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
