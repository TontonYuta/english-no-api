import { DialogueDifficulty, UserSpeechEvaluation } from '../src/types';

interface EvaluateSpeechParams {
  speechText: string;
  scenario: string;
  userRole: string;
  aiRole: string;
  targetDifficulty: DialogueDifficulty;
  lang?: 'en' | 'vi';
}

export function evaluateSpeechLocally(params: EvaluateSpeechParams): UserSpeechEvaluation {
  const { speechText, scenario, userRole, aiRole, targetDifficulty, lang = 'vi' } = params;
  const clean = speechText.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const textLower = clean.toLowerCase();

  // Advanced lexical and syntactic markers
  const c1c2Markers = [
    'furthermore',
    'nevertheless',
    'consequently',
    'subsequently',
    'prioritize',
    'leeway',
    'redistribute',
    'circumstances',
    'allowance',
    'contingency',
    'compromise',
    'discretionary',
    'imperative',
    'substantial',
    'counterproductive',
    'facilitate',
    'exceed',
    'threshold',
    'inconvenience',
    'rectify',
  ];

  const b2Markers = [
    'wondering if',
    'would it be possible',
    'could you please',
    'in order to',
    'appreciate it',
    'regarding',
    'alternative',
    'recommendation',
    'convenient',
    'experience',
    'opportunity',
    'solution',
    'apologize for',
    'take into account',
    'look into',
  ];

  const c1Count = c1c2Markers.filter((m) => textLower.includes(m)).length;
  const b2Count = b2Markers.filter((m) => textLower.includes(m)).length;

  let assessedLevel: DialogueDifficulty = 'B1';
  let fluency = 6.5;
  let vocabulary = 6.0;
  let grammar = 6.5;

  if (c1Count >= 1 || (wordCount >= 14 && b2Count >= 2)) {
    assessedLevel = 'C1';
    fluency = 8.5;
    vocabulary = 8.5;
    grammar = 8.5;
  } else if (b2Count >= 1 || wordCount >= 10) {
    assessedLevel = 'B2';
    fluency = 7.5;
    vocabulary = 7.5;
    grammar = 7.5;
  } else if (wordCount >= 5) {
    assessedLevel = 'B1';
    fluency = 6.5;
    vocabulary = 6.0;
    grammar = 6.5;
  } else {
    assessedLevel = 'A2';
    fluency = 5.0;
    vocabulary = 5.0;
    grammar = 6.0;
  }

  const isVi = lang === 'vi';

  const levelDescriptions: Record<DialogueDifficulty, string> = {
    A1: isVi
      ? 'Cấp độ A1 (Khởi đầu): Câu nói rất ngắn, sử dụng từ ngữ cơ bản nhất để chào hỏi hoặc biểu đạt nhu cầu đơn giản.'
      : 'CEFR A1 (Beginner): Very simple sentences, using basic words for greetings and simple immediate needs.',
    A2: isVi
      ? 'Cấp độ A2 (Cơ bản): Câu nói ngắn gọn, truyền đạt được ý chính nhưng cấu trúc còn đơn giản và phụ thuộc vào từ đơn lẻ.'
      : 'CEFR A2 (Elementary): Concise utterance that conveys basic meaning but relies on simple word sequences.',
    B1: isVi
      ? 'Cấp độ B1 (Trung cấp): Giao tiếp trôi chảy trong tình huống quen thuộc, truyền đạt thông điệp rõ ràng, ngữ pháp tương đối chuẩn.'
      : 'CEFR B1 (Intermediate): Communicates comfortably in everyday situations with predictable sentence patterns.',
    B2: isVi
      ? 'Cấp độ B2 (Trung cao cấp): Sử dụng khéo léo câu ghép, cách diễn đạt lịch sự gián tiếp (indirect questions) và từ vựng tự nhiên.'
      : 'CEFR B2 (Upper-Intermediate): Demonstrates nuanced sentence structures, polite indirect phrasing, and spontaneous flow.',
    C1: isVi
      ? 'Cấp độ C1 (Cao cấp): Ngôn ngữ giàu sắc thái, sử dụng collocation công sở/học thuật chuẩn xác, đàm phán linh hoạt và tự tin.'
      : 'CEFR C1 (Advanced): Highly articulated with sophisticated collocations, flexible pragmatic diplomacy, and natural intonation.',
    C2: isVi
      ? 'Cấp độ C2 (Thành thạo bản xứ): Diễn đạt tinh tế bậc thầy, làm chủ hoàn toàn ngữ điệu và các sắc thái ẩn dụ ngữ cảnh.'
      : 'CEFR C2 (Mastery): Flawless native mastery with subtle idiomatic pragmatics and effortless elegance.',
  };

  return {
    userSpeech: clean,
    assessedLevel,
    levelDescription: levelDescriptions[assessedLevel],
    scoreBreakdown: {
      fluency,
      vocabulary,
      grammar,
      naturalness: fluency,
    },
    upgradedPhrasings: [
      {
        level: 'B2',
        sentence: `I was wondering if there might be any flexibility regarding this situation?`,
      },
      {
        level: 'C1',
        sentence: `Would there be any leeway in this circumstance, or is this policy strictly mandatory?`,
      },
      {
        level: 'C2',
        sentence: `Could discretionary leeway be granted on this occasion, or does protocol strictly dictate adherence?`,
      },
    ],
    culturalTips: [
      isVi
        ? 'Khi đàm phán trong môi trường quốc tế, hãy mở đầu bằng các câu hỏi gián tiếp (như "I was wondering if...", "Would it be possible...") để tạo ấn tượng lịch sự, hòa nhã và tôn trọng đối phương.'
        : 'In professional intercultural dialogues, indirect framing (e.g. "I was wondering if...") softens negotiation and elicits a far more cooperative response.',
    ],
    followUpChallenge: isVi
      ? `Thử bấm vào biểu tượng loa để nghe câu C1 và đọc to lại để rèn luyện ngữ điệu trọng âm.`
      : `Click the speaker icon to listen to the C1 upgrade and recite it aloud to polish your cadence.`,
  };
}
