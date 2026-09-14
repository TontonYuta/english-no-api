import {
  LearnedWord,
  LearnedGrammar,
  LearnedReading,
  LearnedListening,
  WordFamilyDetails,
  WordFormExercise,
} from '../types';

export interface ShuffledChallenge {
  options: string[];
  correctIndex: number;
  explanation: string;
  shuffledOptions: string[];
  newCorrectIndex: number;
  cleanedExplanation: string;
}

/**
 * Shuffles multiple-choice options randomly using Fisher-Yates algorithm
 * and updates the correctIndex so the right answer is NEVER stuck at index 0.
 */
export function shuffleOptionsWithCorrectIndex(
  options: string[],
  correctIndex: number,
  explanation = ''
): ShuffledChallenge {
  if (!options || options.length <= 1) {
    const safeOpts = options || [];
    const safeIdx = 0;
    return {
      options: safeOpts,
      correctIndex: safeIdx,
      explanation,
      shuffledOptions: safeOpts,
      newCorrectIndex: safeIdx,
      cleanedExplanation: explanation,
    };
  }

  // Ensure valid bounds
  const safeCorrectIndex = Math.max(0, Math.min(correctIndex, options.length - 1));
  const items = options.map((opt, idx) => ({
    opt,
    isCorrect: idx === safeCorrectIndex,
  }));

  // Fisher-Yates shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  const foundIndex = items.findIndex((it) => it.isCorrect);
  const finalCorrectIndex = foundIndex >= 0 ? foundIndex : 0;

  // Clean up any hardcoded "Đáp án 1" / "Option A" references in the explanation
  const cleanedExplanation = explanation
    .replace(/(?:Đáp án|Lựa chọn)\s+[1-4A-D]/gi, 'Đáp án đúng')
    .replace(/Option\s+[1-4A-D]/gi, 'The correct option');

  const resultOptions = items.map((it) => it.opt);

  return {
    options: resultOptions,
    correctIndex: finalCorrectIndex,
    explanation: cleanedExplanation,
    shuffledOptions: resultOptions,
    newCorrectIndex: finalCorrectIndex,
    cleanedExplanation,
  };
}

export interface VocabTestQuestion {
  id: string;
  wordId: string;
  term: string;
  ipa: string;
  vietnamesePhonetic?: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  questionType: 'en_to_vi' | 'vi_to_en' | 'fill_in_blank' | 'word_form';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  targetForm?: 'noun' | 'verb' | 'adjective' | 'adverb';
  wordFamilyDetails?: WordFamilyDetails;
}

const COMMON_DISTRACTORS_VI = [
  'Đàm phán thỏa thuận thương mại',
  'Gia hạn thời hạn nộp báo cáo',
  'Ủy quyền cho người đại diện pháp lý',
  'Chiết khấu theo khối lượng đơn hàng',
  'Tạm dừng quy trình tuyển dụng nhân sự',
  'Đánh giá hiệu suất làm việc định kỳ',
  'Tuân thủ quy chuẩn an toàn lao động',
  'Hủy bỏ cuộc họp đột xuất',
  'Phân bổ ngân sách dự án quý 3',
  'Xác nhận thông tin đặt phòng khách sạn',
  'Phản hồi khiếu nại của khách hàng',
  'Kiểm tra chứng từ vận chuyển hàng hải',
];

const COMMON_DISTRACTORS_EN = [
  'Collaborate',
  'Negotiate',
  'Postpone',
  'Allocate',
  'Facilitate',
  'Implement',
  'Compensate',
  'Authorize',
  'Reconcile',
  'Streamline',
  'Consolidate',
  'Prioritize',
];

export const SAMPLE_VOCAB_FOR_TEST: Array<{
  term: string;
  ipa: string;
  vietnamesePhonetic?: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  exampleSentence?: string;
  exampleTranslation?: string;
  wordFamily?: string;
  wordFamilyDetails?: WordFamilyDetails;
  wordFormExercise?: WordFormExercise;
}> = [
  {
    term: 'Schedule',
    ipa: '/ˈskedʒ.uːl/',
    vietnamesePhonetic: 'x-két-giu-ồ',
    partOfSpeech: 'noun / verb',
    vietnameseMeaning: 'Lịch trình, thời gian biểu / Sắp xếp lịch hẹn',
    level: 'A1',
    exampleSentence: 'Can you please check the meeting schedule for tomorrow?',
    exampleTranslation: 'Bạn có thể vui lòng kiểm tra lịch họp ngày mai không?',
    wordFamily: 'schedule (n) / scheduled (adj)',
    wordFamilyDetails: {
      noun: 'schedule',
      verb: 'schedule',
      adjective: 'scheduled',
    },
    wordFormExercise: {
      sentence: 'The project manager asked the team to _______ the weekly status meeting for Thursday.',
      options: ['schedule', 'scheduled', 'scheduling', 'scheduler'],
      correctIndex: 0,
      targetForm: 'verb',
      explanation: "Sau cấu trúc 'ask someone to + V (bare infinitive)', vị trí này cần động từ nguyên mẫu 'schedule'.",
    },
  },
  {
    term: 'Colleague',
    ipa: '/ˈkɑː.liːɡ/',
    vietnamesePhonetic: 'CÓ-li-gừ',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Đồng nghiệp cùng cơ quan / công ty',
    level: 'A1',
    exampleSentence: 'My colleague will send you the document shortly.',
    exampleTranslation: 'Đồng nghiệp của tôi sẽ gửi tài liệu cho bạn ngay.',
    wordFamily: 'colleague (n) - collegial (adj)',
    wordFamilyDetails: {
      noun: 'colleague',
      adjective: 'collegial',
      adverb: 'collegially',
    },
    wordFormExercise: {
      sentence: 'Mr. David works exceptionally well with all of his _______ in the regional office.',
      options: ['colleague', 'colleagues', 'collegial', 'collegially'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Sau lượng từ 'all of his', ta cần một danh từ đếm được số nhiều 'colleagues' chỉ người.",
    },
  },
  {
    term: 'Deadline',
    ipa: '/ˈded.laɪn/',
    vietnamesePhonetic: 'ĐÉT-lai',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Hạn chót hoàn thành công việc',
    level: 'A2',
    exampleSentence: 'We must submit the financial report before the strict deadline.',
    exampleTranslation: 'Chúng ta phải nộp báo cáo tài chính trước hạn chót.',
    wordFamily: 'deadline (n)',
    wordFamilyDetails: {
      noun: 'deadline',
    },
    wordFormExercise: {
      sentence: 'All department heads must submit their budget proposals before the final _______.',
      options: ['deadlines', 'deadline', 'deadly', 'deadening'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Sau mạo từ 'the' và tính từ 'final', ta cần danh từ 'deadline' (hạn chót) làm danh từ chính.",
    },
  },
  {
    term: 'Accommodate',
    ipa: '/əˈkɑː.mə.deɪt/',
    vietnamesePhonetic: 'Ơ-côm-mờ-đây-t',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Đáp ứng, thu xếp thỏa đáng (yêu cầu, lịch trình)',
    level: 'B2',
    exampleSentence: 'The hotel was happy to accommodate our request for late check-out.',
    exampleTranslation: 'Khách sạn rất sẵn lòng đáp ứng yêu cầu trả phòng trễ của chúng tôi.',
    wordFamily: 'accommodate (v) - accommodation (n) - accommodating (adj)',
    wordFamilyDetails: {
      noun: 'accommodation',
      verb: 'accommodate',
      adjective: 'accommodating',
      adverb: 'accommodatingly',
    },
    wordFormExercise: {
      sentence: 'The hotel staff were remarkably _______ to the travelers during the flight delay.',
      options: ['accommodate', 'accommodation', 'accommodating', 'accommodatingly'],
      correctIndex: 2,
      targetForm: 'adjective',
      explanation: "Sau trạng từ 'remarkably' và to be 'were', ta cần một tính từ 'accommodating' (chu đáo, tận tình).",
    },
  },
  {
    term: 'Contingent upon',
    ipa: '/kənˈtɪn.dʒənt əˈpɑːn/',
    vietnamesePhonetic: 'Cân-tin-dần ơ-pon',
    partOfSpeech: 'adjective phrase',
    vietnameseMeaning: 'Phụ thuộc vào, tùy thuộc vào điều kiện nào đó',
    level: 'B2',
    exampleSentence: 'The bonus is strictly contingent upon your team hitting the sales target.',
    exampleTranslation: 'Tiền thưởng hoàn toàn phụ thuộc vào việc đội ngũ của bạn đạt chỉ tiêu doanh số.',
    wordFamily: 'contingency (n) - contingent (adj)',
    wordFamilyDetails: {
      noun: 'contingency',
      adjective: 'contingent',
      adverb: 'contingently',
    },
    wordFormExercise: {
      sentence: 'Signing the merger agreement is strictly _______ upon approval from the antitrust commission.',
      options: ['contingence', 'contingent', 'contingently', 'contingency'],
      correctIndex: 1,
      targetForm: 'adjective',
      explanation: "Cụm tính từ cố định 'contingent upon' (phụ thuộc vào) theo sau động từ to be 'is strictly'.",
    },
  },
  {
    term: 'Stipulation',
    ipa: '/ˌstɪp.jəˈleɪ.ʃən/',
    vietnamesePhonetic: 'X-típ-piu-lây-sừn',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Điều khoản quy định bắt buộc trong hợp đồng',
    level: 'B2',
    exampleSentence: 'Please review all the contractual stipulations before signing.',
    exampleTranslation: 'Vui lòng xem xét mọi điều khoản hợp đồng trước khi ký.',
    wordFamily: 'stipulation (n) - stipulate (v)',
    wordFamilyDetails: {
      noun: 'stipulation',
      verb: 'stipulate',
      adjective: 'stipulated',
    },
    wordFormExercise: {
      sentence: 'The partnership contract clearly _______ that all financial audits must be conducted quarterly.',
      options: ['stipulation', 'stipulates', 'stipulatedly', 'stipulating'],
      correctIndex: 1,
      targetForm: 'verb',
      explanation: "Chủ ngữ 'The partnership contract' (ngôi thứ 3 số ít) cần một động từ chính 'stipulates' chia thì hiện tại đơn.",
    },
  },
];

export const BUILTIN_WORD_FORMS: Record<
  string,
  {
    family: WordFamilyDetails;
    exercise: WordFormExercise;
  }
> = {
  schedule: {
    family: {
      noun: 'schedule',
      verb: 'schedule',
      adjective: 'scheduled',
    },
    exercise: {
      sentence: 'The project manager asked the team to _______ the weekly status meeting for Thursday.',
      options: ['schedule', 'scheduled', 'scheduling', 'scheduler'],
      correctIndex: 0,
      targetForm: 'verb',
      explanation: "Sau cấu trúc 'ask someone to + V (bare infinitive)', vị trí này cần động từ nguyên mẫu 'schedule'.",
    },
  },
  colleague: {
    family: {
      noun: 'colleague',
      adjective: 'collegial',
      adverb: 'collegially',
    },
    exercise: {
      sentence: 'Mr. David works exceptionally well with all of his _______ in the regional office.',
      options: ['colleague', 'colleagues', 'collegial', 'collegially'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Sau lượng từ 'all of his', ta cần một danh từ đếm được số nhiều 'colleagues' chỉ người.",
    },
  },
  deadline: {
    family: {
      noun: 'deadline',
    },
    exercise: {
      sentence: 'All department heads must submit their budget proposals before the final _______.',
      options: ['deadlines', 'deadline', 'deadly', 'deadening'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Sau mạo từ 'the' và tính từ 'final', ta cần danh từ 'deadline' (hạn chót) làm danh từ chính.",
    },
  },
  accommodate: {
    family: {
      noun: 'accommodation',
      verb: 'accommodate',
      adjective: 'accommodating',
      adverb: 'accommodatingly',
    },
    exercise: {
      sentence: 'The hotel staff were remarkably _______ to the travelers during the flight delay.',
      options: ['accommodate', 'accommodation', 'accommodating', 'accommodatingly'],
      correctIndex: 2,
      targetForm: 'adjective',
      explanation: "Sau trạng từ 'remarkably' và to be 'were', ta cần một tính từ 'accommodating' (chu đáo, tận tình).",
    },
  },
  'contingent upon': {
    family: {
      noun: 'contingency',
      adjective: 'contingent',
      adverb: 'contingently',
    },
    exercise: {
      sentence: 'Signing the merger agreement is strictly _______ upon approval from the antitrust commission.',
      options: ['contingence', 'contingent', 'contingently', 'contingency'],
      correctIndex: 1,
      targetForm: 'adjective',
      explanation: "Cụm tính từ cố định 'contingent upon' (phụ thuộc vào) theo sau động từ to be 'is strictly'.",
    },
  },
  stipulation: {
    family: {
      noun: 'stipulation',
      verb: 'stipulate',
      adjective: 'stipulated',
    },
    exercise: {
      sentence: 'The partnership contract clearly _______ that all financial audits must be conducted quarterly.',
      options: ['stipulation', 'stipulates', 'stipulatedly', 'stipulating'],
      correctIndex: 1,
      targetForm: 'verb',
      explanation: "Chủ ngữ 'The partnership contract' (ngôi thứ 3 số ít) cần một động từ chính 'stipulates' chia thì hiện tại đơn.",
    },
  },
  confirm: {
    family: {
      noun: 'confirmation',
      verb: 'confirm',
      adjective: 'confirmed',
    },
    exercise: {
      sentence: 'Please send an email _______ of your flight booking as soon as possible.',
      options: ['confirm', 'confirmation', 'confirmed', 'confirming'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Cụm danh từ 'email confirmation' (sự xác nhận qua email) cần danh từ 'confirmation' làm danh từ chính.",
    },
  },
  efficient: {
    family: {
      noun: 'efficiency',
      adjective: 'efficient',
      adverb: 'efficiently',
    },
    exercise: {
      sentence: 'Our automated billing system processes client invoices much more _______ than manual entry.',
      options: ['efficient', 'efficiently', 'efficiency', 'efficacious'],
      correctIndex: 1,
      targetForm: 'adverb',
      explanation: "Cần một trạng từ 'efficiently' (đi kèm 'much more') để bổ nghĩa cho động từ hành động 'processes invoices'.",
    },
  },
  innovative: {
    family: {
      noun: 'innovation',
      verb: 'innovate',
      adjective: 'innovative',
      adverb: 'innovatively',
    },
    exercise: {
      sentence: 'The technology firm won the prestigious award due to its highly _______ marketing strategy.',
      options: ['innovate', 'innovation', 'innovative', 'innovatively'],
      correctIndex: 2,
      targetForm: 'adjective',
      explanation: "Trước cụm danh từ 'marketing strategy' và sau trạng từ 'highly' cần một tính từ 'innovative' (đổi mới sáng tạo).",
    },
  },
  produce: {
    family: {
      noun: 'production / productivity',
      verb: 'produce',
      adjective: 'productive',
      adverb: 'productively',
    },
    exercise: {
      sentence: 'The ergonomic office chairs have significantly improved employee _______.',
      options: ['produce', 'productivity', 'productive', 'productively'],
      correctIndex: 1,
      targetForm: 'noun',
      explanation: "Sau động từ 'improved' và danh từ đóng vai trò bổ ngữ 'employee', ta cần danh từ 'productivity' tạo thành cụm danh từ ghép 'employee productivity'.",
    },
  },
};

export function createDynamicWordFormQuestion(
  target: LearnedWord,
  idx = 0
): VocabTestQuestion {
  // 1. If wordFormExercise already stored
  if (target.wordFormExercise) {
    const wf = target.wordFormExercise;
    const shuffled = shuffleOptionsWithCorrectIndex(
      wf.options,
      wf.correctIndex,
      wf.explanation
    );
    return {
      id: `q_wf_${target.id}_${idx}_${Date.now()}`,
      wordId: target.id,
      term: target.term,
      ipa: target.ipa,
      vietnamesePhonetic: target.vietnamesePhonetic,
      partOfSpeech: target.partOfSpeech,
      vietnameseMeaning: target.vietnameseMeaning,
      questionType: 'word_form',
      targetForm: wf.targetForm,
      wordFamilyDetails: target.wordFamilyDetails,
      prompt: `[ TOEIC PART 5 - LUYỆN BIẾN ĐỔI TỪ LOẠI (WORD FORM) ]\nChọn dạng đúng của từ "${target.term}" để điền vào chỗ trống:\n\n"${wf.sentence}"`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: shuffled.explanation,
      exampleSentence: wf.sentence,
      exampleTranslation: target.exampleTranslation,
    };
  }

  // 2. Check BUILTIN_WORD_FORMS
  const key = target.term.toLowerCase().trim();
  const matched = BUILTIN_WORD_FORMS[key];
  if (matched) {
    const wf = matched.exercise;
    const shuffled = shuffleOptionsWithCorrectIndex(
      wf.options,
      wf.correctIndex,
      wf.explanation
    );
    return {
      id: `q_wf_${target.id}_${idx}_${Date.now()}`,
      wordId: target.id,
      term: target.term,
      ipa: target.ipa,
      vietnamesePhonetic: target.vietnamesePhonetic,
      partOfSpeech: target.partOfSpeech,
      vietnameseMeaning: target.vietnameseMeaning,
      questionType: 'word_form',
      targetForm: wf.targetForm,
      wordFamilyDetails: matched.family,
      prompt: `[ TOEIC PART 5 - LUYỆN BIẾN ĐỔI TỪ LOẠI (WORD FORM) ]\nChọn dạng đúng của từ "${target.term}" để điền vào chỗ trống:\n\n"${wf.sentence}"`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: shuffled.explanation,
      exampleSentence: wf.sentence,
      exampleTranslation: target.exampleTranslation,
    };
  }

  // 3. Fallback algorithmic suffix generation
  const cleanTerm = target.term.trim();
  const stem = cleanTerm.replace(/(ing|ed|ly|tion|ment|able|ive|al|ity)$/i, '') || cleanTerm;
  const optVerb = stem;
  const optNoun = stem.endsWith('e') ? stem + 'tion' : stem + 'ment';
  const optAdj = stem.endsWith('e') ? stem + 'd' : stem + 'able';
  const optAdv = stem + 'ly';
  const rawOpts = [optNoun, optVerb, optAdj, optAdv];

  const sentence = `The department director decided to _______ the recommended guidelines to optimize team workflow.`;
  const correctIdx = 1; // optVerb
  const explanation = `Sau cấu trúc 'decided to + V (bare infinitive)', vị trí chỗ trống đòi hỏi một động từ nguyên thể '${optVerb}'.`;

  const shuffled = shuffleOptionsWithCorrectIndex(rawOpts, correctIdx, explanation);
  return {
    id: `q_wf_${target.id}_${idx}_${Date.now()}`,
    wordId: target.id,
    term: target.term,
    ipa: target.ipa,
    vietnamesePhonetic: target.vietnamesePhonetic,
    partOfSpeech: target.partOfSpeech,
    vietnameseMeaning: target.vietnameseMeaning,
    questionType: 'word_form',
    targetForm: 'verb',
    wordFamilyDetails: {
      noun: optNoun,
      verb: optVerb,
      adjective: optAdj,
      adverb: optAdv,
    },
    prompt: `[ TOEIC PART 5 - LUYỆN BIẾN ĐỔI TỪ LOẠI (WORD FORM) ]\nChọn dạng đúng của từ "${target.term}" để điền vào chỗ trống:\n\n"${sentence}"`,
    options: shuffled.options,
    correctIndex: shuffled.correctIndex,
    explanation: shuffled.explanation,
    exampleSentence: sentence,
    exampleTranslation: `Giám đốc bộ phận đã quyết định áp dụng các hướng dẫn được đề xuất để tối ưu hóa quy trình làm việc.`,
  };
}

/**
 * Generates an interactive Vocab Mastery Quiz based on the user's learned words.
 * Guarantees that correctIndex is randomized and not defaulted to 0.
 * Supports test mode: 'all' | 'meaning' | 'word_form'.
 */
export function generateVocabTestQuestions(
  learnedWords: LearnedWord[],
  questionCount = 5,
  mode: 'all' | 'meaning' | 'word_form' = 'all'
): VocabTestQuestion[] {
  if (!learnedWords || learnedWords.length === 0) return [];

  // Prioritize unmastered words, then shuffle
  const unmastered = learnedWords.filter((w) => !w.mastered);
  const pool = unmastered.length >= questionCount ? unmastered : learnedWords;
  const targetWords = [...pool].sort(() => 0.5 - Math.random()).slice(0, questionCount);

  if (mode === 'word_form') {
    return targetWords.map((target, idx) => createDynamicWordFormQuestion(target, idx));
  }

  const allWordsMap = new Map(learnedWords.map((w) => [w.term.toLowerCase(), w]));

  return targetWords.map((target, idx) => {
    // Choose question format
    const sampleMatch = SAMPLE_VOCAB_FOR_TEST.find(
      (s) => s.term.toLowerCase() === target.term.toLowerCase()
    );
    const exampleSentence = target.exampleSentence || sampleMatch?.exampleSentence;
    const exampleTranslation = target.exampleTranslation || sampleMatch?.exampleTranslation;

    let availableTypes: ('en_to_vi' | 'vi_to_en' | 'fill_in_blank' | 'word_form')[] = [];
    if (mode === 'meaning') {
      availableTypes = ['en_to_vi', 'vi_to_en'];
    } else {
      availableTypes = ['en_to_vi', 'vi_to_en', 'word_form'];
      if (exampleSentence) {
        availableTypes.push('fill_in_blank');
      }
    }

    const chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    if (chosenType === 'word_form') {
      return createDynamicWordFormQuestion(target, idx);
    }

    if (chosenType === 'en_to_vi') {
      // Prompt: Word -> Meaning
      const otherMeanings = learnedWords
        .filter((w) => w.term.toLowerCase() !== target.term.toLowerCase())
        .map((w) => w.vietnameseMeaning);

      const distractorPool = [...otherMeanings, ...COMMON_DISTRACTORS_VI];
      const uniqueDistractors = Array.from(
        new Set(distractorPool.filter((m) => m !== target.vietnameseMeaning))
      ).sort(() => 0.5 - Math.random()).slice(0, 3);

      const rawOptions = [target.vietnameseMeaning, ...uniqueDistractors];
      const shuffled = shuffleOptionsWithCorrectIndex(
        rawOptions,
        0,
        `Từ "${target.term}" (${target.ipa}) mang nghĩa chuẩn: "${target.vietnameseMeaning}".`
      );

      return {
        id: `q_${target.id}_${idx}_${Date.now()}`,
        wordId: target.id,
        term: target.term,
        ipa: target.ipa,
        vietnamesePhonetic: target.vietnamesePhonetic,
        partOfSpeech: target.partOfSpeech,
        vietnameseMeaning: target.vietnameseMeaning,
        questionType: 'en_to_vi',
        prompt: `Từ vựng [ ${target.term} ] (${target.partOfSpeech}) có ý nghĩa chính xác là gì?`,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        exampleSentence,
        exampleTranslation,
      };
    } else if (chosenType === 'vi_to_en') {
      // Prompt: Meaning -> Word
      const otherTerms = learnedWords
        .filter((w) => w.term.toLowerCase() !== target.term.toLowerCase())
        .map((w) => w.term);

      const distractorPool = [...otherTerms, ...COMMON_DISTRACTORS_EN];
      const uniqueDistractors = Array.from(
        new Set(distractorPool.filter((t) => t.toLowerCase() !== target.term.toLowerCase()))
      ).sort(() => 0.5 - Math.random()).slice(0, 3);

      const rawOptions = [target.term, ...uniqueDistractors];
      const shuffled = shuffleOptionsWithCorrectIndex(
        rawOptions,
        0,
        `Nghĩa "${target.vietnameseMeaning}" trong tiếng Anh tương ứng với từ vựng "${target.term}" (${target.ipa}).`
      );

      return {
        id: `q_${target.id}_${idx}_${Date.now()}`,
        wordId: target.id,
        term: target.term,
        ipa: target.ipa,
        vietnamesePhonetic: target.vietnamesePhonetic,
        partOfSpeech: target.partOfSpeech,
        vietnameseMeaning: target.vietnameseMeaning,
        questionType: 'vi_to_en',
        prompt: `Từ tiếng Anh nào mang ý nghĩa: "${target.vietnameseMeaning}"?`,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        exampleSentence,
        exampleTranslation,
      };
    } else {
      // fill_in_blank
      const otherTerms = learnedWords
        .filter((w) => w.term.toLowerCase() !== target.term.toLowerCase())
        .map((w) => w.term);
      const distractorPool = [...otherTerms, ...COMMON_DISTRACTORS_EN];
      const uniqueDistractors = Array.from(
        new Set(distractorPool.filter((t) => t.toLowerCase() !== target.term.toLowerCase()))
      ).sort(() => 0.5 - Math.random()).slice(0, 3);

      const rawOptions = [target.term, ...uniqueDistractors];
      const regex = new RegExp(`\\b${target.term}\\b`, 'gi');
      const blankSentence = (exampleSentence || `We need to ${target.term} immediately.`).replace(
        regex,
        '________'
      );

      const shuffled = shuffleOptionsWithCorrectIndex(
        rawOptions,
        0,
        `Chỗ trống cần điền từ "${target.term}" (${target.ipa}): ${target.vietnameseMeaning}.`
      );

      return {
        id: `q_${target.id}_${idx}_${Date.now()}`,
        wordId: target.id,
        term: target.term,
        ipa: target.ipa,
        vietnamesePhonetic: target.vietnamesePhonetic,
        partOfSpeech: target.partOfSpeech,
        vietnameseMeaning: target.vietnameseMeaning,
        questionType: 'fill_in_blank',
        prompt: `Điền từ thích hợp vào chỗ trống:\n"${blankSentence}"`,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        exampleSentence,
        exampleTranslation,
      };
    }
  });
}

// ==========================================
// 2. GRAMMAR ACTIVE TEST GENERATOR
// ==========================================
export interface GrammarTestQuestion {
  id: string;
  ruleId: string;
  ruleName: string;
  formula: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mastered?: boolean;
}

export const SAMPLE_GRAMMAR_FOR_TEST: {
  ruleName: string;
  formula: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
}[] = [
  {
    ruleName: 'Mẫu câu nhờ vả lịch sự với Please',
    formula: 'Please + Bare Verb',
    level: 'A1',
    prompt: 'Chọn dạng động từ đúng điền vào câu: "Please ________ the quarterly report before leaving today."',
    correctAnswer: 'submit',
    distractors: ['submitting', 'submitted', 'submits'],
    explanation: 'Theo cấu trúc mệnh lệnh/nhờ vả lịch sự "Please + Bare Verb", sau Please là động từ nguyên mẫu không chia: "submit".',
  },
  {
    ruleName: 'Phân biệt Liên từ Although và Giới từ Despite',
    formula: 'Although + Clause vs Despite + Noun Phrase / V-ing',
    level: 'B1',
    prompt: 'Chọn từ thích hợp điền vào câu: "________ the severe traffic congestion, all board members arrived on time."',
    correctAnswer: 'Despite',
    distractors: ['Although', 'Because', 'While'],
    explanation: '"the severe traffic congestion" là một cụm danh từ (Noun Phrase), do đó phải dùng giới từ "Despite". "Although" chỉ đi với mệnh đề (S + V).',
  },
  {
    ruleName: 'Thì Hiện Tại Hoàn Thành với Since và For',
    formula: 'S + have/has + V3/ed + since (mốc) / for (khoảng)',
    level: 'A2',
    prompt: 'Chọn giới từ đúng: "Mr. Henderson has been the head of human resources ________ October 2021."',
    correctAnswer: 'since',
    distractors: ['for', 'in', 'during'],
    explanation: '"October 2021" là mốc thời gian cụ thể trong quá khứ, nên ta dùng "since" với thì Hiện Tại Hoàn Thành.',
  },
  {
    ruleName: 'Rút gọn Mệnh đề quan hệ dạng Phân từ',
    formula: 'Chủ động: V-ing / Bị động: V-ed (V3)',
    level: 'B2',
    prompt: 'Chọn dạng phân từ đúng: "The proposals ________ by the external consulting firm will be reviewed tomorrow."',
    correctAnswer: 'prepared',
    distractors: ['preparing', 'prepares', 'prepare'],
    explanation: 'Rút gọn mệnh đề quan hệ dạng bị động: "The proposals (which were) prepared by..." -> dùng quá khứ phân từ "prepared".',
  },
  {
    ruleName: 'Sự hòa hợp Chủ ngữ - Động từ với Each of',
    formula: 'Each of + Plural Noun + Singular Verb',
    level: 'B1',
    prompt: 'Chọn động từ đúng: "Each of the new marketing team members ________ required to submit a weekly summary."',
    correctAnswer: 'is',
    distractors: ['are', 'were', 'have been'],
    explanation: 'Chủ ngữ bắt đầu bằng "Each of + Danh từ số nhiều" luôn đi với động từ số ít: "is".',
  },
];

export function generateGrammarTestQuestions(
  learnedGrammar: LearnedGrammar[],
  count = 5
): GrammarTestQuestion[] {
  // If user has learned grammar, use their rules. Otherwise use sample pool.
  const pool = (learnedGrammar && learnedGrammar.length > 0)
    ? learnedGrammar
    : SAMPLE_GRAMMAR_FOR_TEST.map((s, idx) => ({
        id: `sample_g_${idx}`,
        ruleName: s.ruleName,
        formula: s.formula,
        vietnameseMeaning: s.ruleName,
        level: s.level,
        learnedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
      }));

  const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);

  return selected.map((item, idx) => {
    // Check if there is a curated question for this rule
    const sample = SAMPLE_GRAMMAR_FOR_TEST.find(
      (s) => s.ruleName.toLowerCase() === item.ruleName.toLowerCase()
    );

    if (sample) {
      const rawOptions = [sample.correctAnswer, ...sample.distractors];
      const shuffled = shuffleOptionsWithCorrectIndex(
        rawOptions,
        0,
        sample.explanation
      );
      return {
        id: `q_gram_${item.id}_${idx}_${Date.now()}`,
        ruleId: item.id,
        ruleName: item.ruleName,
        formula: item.formula,
        prompt: sample.prompt,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        mastered: item.mastered,
      };
    }

    // Dynamic question synthesis from formula
    const rawOptions = [
      `Áp dụng công thức chuẩn: ${item.formula}`,
      'Không cần chia động từ theo công thức',
      'Đảo trật tự chủ ngữ và tân ngữ',
      'Thay thế bằng thể phủ định tuyệt đối',
    ];
    const shuffled = shuffleOptionsWithCorrectIndex(
      rawOptions,
      0,
      `Quy tắc chuẩn cho "${item.ruleName}": ${item.formula}.`
    );

    return {
      id: `q_gram_${item.id}_${idx}_${Date.now()}`,
      ruleId: item.id,
      ruleName: item.ruleName,
      formula: item.formula,
      prompt: `Cấu trúc chuẩn của mẫu câu/ngữ pháp "${item.ruleName}" là gì?`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: shuffled.explanation,
      mastered: item.mastered,
    };
  });
}

// ==========================================
// 3. READING COMPREHENSION TEST GENERATOR
// ==========================================
export interface ReadingTestQuestion {
  id: string;
  readingId: string;
  title: string;
  passageSnippet: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mastered?: boolean;
}

export const SAMPLE_READING_FOR_TEST: {
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  passage: string;
  translationVi: string;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
}[] = [
  {
    title: 'Thông Báo Bảo Trì Tòa Nhà Văn Phòng',
    level: 'A1',
    passage: 'NOTICE: The office air conditioning system will undergo scheduled maintenance on Saturday, September 20. All staff members must shut down desktop computers before 6:00 PM on Friday.',
    translationVi: 'THÔNG BÁO: Hệ thống điều hòa văn phòng sẽ bảo trì theo lịch vào Thứ Bảy, 20/9. Toàn bộ nhân viên phải tắt máy tính bàn trước 6:00 chiều Thứ Sáu.',
    prompt: 'Nhân viên bắt buộc phải làm gì trước 6:00 chiều Thứ Sáu?',
    correctAnswer: 'Tắt toàn bộ máy tính bàn',
    distractors: ['Đến văn phòng làm thêm', 'Gặp đội kỹ thuật bảo dưỡng', 'Gửi báo cáo công việc'],
    explanation: 'Theo thông báo: "All staff members must shut down desktop computers before 6:00 PM on Friday."',
  },
  {
    title: 'Email Xác Nhận Lịch Đặt Phòng Họp',
    level: 'A2',
    passage: 'Dear Mr. Tanaka, your reservation for Conference Room B on October 5 has been confirmed from 2:00 PM to 4:00 PM. Please inform IT support if you require a video projector.',
    translationVi: 'Kính gửi ông Tanaka, đặt phòng của ông cho Phòng họp B ngày 5/10 đã được xác nhận từ 2:00 đến 4:00 chiều. Vui lòng báo đội IT nếu ông cần máy chiếu video.',
    prompt: 'Ông Tanaka cần làm gì nếu muốn sử dụng máy chiếu?',
    correctAnswer: 'Báo cho bộ phận hỗ trợ kỹ thuật (IT support)',
    distractors: ['Tự mang máy chiếu từ nhà', 'Gửi email cho toàn công ty', 'Hủy buổi họp trước 2:00 chiều'],
    explanation: 'Đoạn email ghi rõ: "Please inform IT support if you require a video projector."',
  },
  {
    title: 'Chính Sách Làm Việc Từ Xa (Remote Work Policy)',
    level: 'B1',
    passage: 'Under the revised hybrid policy, team members may work remotely up to two days per week, provided they maintain regular communication and achieve key project milestones.',
    translationVi: 'Theo chính sách làm việc kết hợp sửa đổi, các thành viên có thể làm việc từ xa tối đa 2 ngày mỗi tuần, với điều kiện duy trì liên lạc thường xuyên và hoàn thành chỉ tiêu dự án.',
    prompt: 'Điều kiện để nhân viên được làm việc từ xa là gì?',
    correctAnswer: 'Duy trì liên lạc thường xuyên và đạt chỉ tiêu dự án',
    distractors: ['Làm việc tối thiểu 10 giờ mỗi ngày', 'Đến văn phòng vào cuối tuần', 'Không được nhận dự án mới'],
    explanation: 'Văn bản nêu điều kiện: "provided they maintain regular communication and achieve key project milestones."',
  },
];

export function generateReadingTestQuestions(
  learnedReadings: LearnedReading[],
  count = 3
): ReadingTestQuestion[] {
  const pool = (learnedReadings && learnedReadings.length > 0)
    ? learnedReadings
    : SAMPLE_READING_FOR_TEST.map((s, idx) => ({
        id: `sample_read_${idx}`,
        title: s.title,
        passage: s.passage,
        translationVi: s.translationVi,
        level: s.level,
        topic: 'Office Communication',
        learnedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
        questions: [
          {
            question: s.prompt,
            options: [s.correctAnswer, ...s.distractors],
            correctIndex: 0,
            explanation: s.explanation,
          },
        ],
      }));

  const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);

  return selected.map((item, idx) => {
    // If item has pre-saved questions
    if (item.questions && item.questions.length > 0) {
      const q = item.questions[0];
      const shuffled = shuffleOptionsWithCorrectIndex(q.options, q.correctIndex, q.explanation);
      return {
        id: `q_read_${item.id}_${idx}_${Date.now()}`,
        readingId: item.id,
        title: item.title,
        passageSnippet: item.passage,
        prompt: q.question,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        mastered: item.mastered,
      };
    }

    // Default reading comprehension question
    const sample = SAMPLE_READING_FOR_TEST.find(
      (s) => s.title.toLowerCase() === item.title.toLowerCase()
    );
    if (sample) {
      const shuffled = shuffleOptionsWithCorrectIndex(
        [sample.correctAnswer, ...sample.distractors],
        0,
        sample.explanation
      );
      return {
        id: `q_read_${item.id}_${idx}_${Date.now()}`,
        readingId: item.id,
        title: item.title,
        passageSnippet: item.passage,
        prompt: sample.prompt,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        mastered: item.mastered,
      };
    }

    const shuffled = shuffleOptionsWithCorrectIndex(
      [
        'Nắm bắt thông tin chính xác theo văn bản',
        'Văn bản đưa ra thông báo hủy bỏ',
        'Văn bản yêu cầu nộp phạt vi phạm',
        'Văn bản không liên quan đến công việc',
      ],
      0,
      `Văn bản "${item.title}" truyền tải thông điệp: ${item.passage.slice(0, 80)}...`
    );

    return {
      id: `q_read_${item.id}_${idx}_${Date.now()}`,
      readingId: item.id,
      title: item.title,
      passageSnippet: item.passage,
      prompt: `Ý chính hoặc thông điệp cốt lõi của đoạn văn "${item.title}" là gì?`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: shuffled.explanation,
      mastered: item.mastered,
    };
  });
}

// ==========================================
// 4. LISTENING COMPREHENSION TEST GENERATOR
// ==========================================
export interface ListeningTestQuestion {
  id: string;
  listeningId: string;
  title: string;
  audioPrompt: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  transcript?: string;
  mastered?: boolean;
}

export const SAMPLE_LISTENING_FOR_TEST: {
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  audioPrompt: string;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
}[] = [
  {
    title: 'Hỏi Địa Điểm Nộp Báo Cáo',
    level: 'A1',
    audioPrompt: 'Where should I submit the monthly expense report?',
    prompt: 'Nghe audio và chọn câu phản hồi phù hợp nhất trong giao tiếp công sở:',
    correctAnswer: 'Please send it directly to Ms. Karen in Accounting.',
    distractors: [
      'Yes, the flight was delayed by two hours.',
      'About fifteen dollars per person.',
      'In the elevator on the second floor.',
    ],
    explanation: 'Câu hỏi bắt đầu bằng "Where" (Ở đâu), câu trả lời thích hợp nhất là gửi trực tiếp cho chị Karen ở phòng kế toán.',
  },
  {
    title: 'Thảo Luận Lịch Thuyết Trình',
    level: 'A2',
    audioPrompt: 'Would you like to review the slides together or work individually?',
    prompt: 'Nghe audio và chọn câu phản hồi tự nhiên nhất:',
    correctAnswer: "Let's look over them together right after lunch.",
    distractors: [
      'Yes, the projector is in conference room A.',
      'She already signed the contract yesterday.',
      "No, I don't drink coffee.",
    ],
    explanation: 'Câu hỏi lựa chọn "A or B" (xem cùng nhau hay làm riêng), phản hồi hợp lý là cùng xem sau giờ ăn trưa.',
  },
  {
    title: 'Thông Báo Giờ Bắt Đầu Hội Thảo',
    level: 'B1',
    audioPrompt: 'Could you please remind all participants that tomorrow workshop starts at nine sharp?',
    prompt: 'Người nói trong đoạn audio đang yêu cầu điều gì?',
    correctAnswer: 'Nhắc nhở người tham gia về thời gian bắt đầu chính xác',
    distractors: [
      'Hủy bỏ buổi hội thảo ngày mai',
      'Đổi phòng họp sang tầng 9',
      'Mời thêm 9 khách mời đặc biệt',
    ],
    explanation: '"starts at nine sharp" nghĩa là bắt đầu đúng 9 giờ, người nói nhờ nhắc nhở tất cả người tham gia.',
  },
];

export function generateListeningTestQuestions(
  learnedListenings: LearnedListening[],
  count = 3
): ListeningTestQuestion[] {
  const pool = (learnedListenings && learnedListenings.length > 0)
    ? learnedListenings
    : SAMPLE_LISTENING_FOR_TEST.map((s, idx) => ({
        id: `sample_listen_${idx}`,
        title: s.title,
        dialogue: [{ speaker: 'Speaker', text: s.audioPrompt, translationVi: '' }],
        level: s.level,
        topic: 'Workplace Listening',
        learnedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false,
        questions: [
          {
            audioPrompt: s.audioPrompt,
            question: s.prompt,
            options: [s.correctAnswer, ...s.distractors],
            correctIndex: 0,
            explanation: s.explanation,
          },
        ],
      }));

  const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);

  return selected.map((item, idx) => {
    if (item.questions && item.questions.length > 0) {
      const q = item.questions[0];
      const shuffled = shuffleOptionsWithCorrectIndex(q.options, q.correctIndex, q.explanation);
      return {
        id: `q_listen_${item.id}_${idx}_${Date.now()}`,
        listeningId: item.id,
        title: item.title,
        audioPrompt: q.audioPrompt,
        prompt: q.question,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        transcript: item.dialogue?.map((d) => `${d.speaker}: ${d.text}`).join('\n') || q.audioPrompt,
        mastered: item.mastered,
      };
    }

    const sample = SAMPLE_LISTENING_FOR_TEST.find(
      (s) => s.title.toLowerCase() === item.title.toLowerCase()
    );
    if (sample) {
      const shuffled = shuffleOptionsWithCorrectIndex(
        [sample.correctAnswer, ...sample.distractors],
        0,
        sample.explanation
      );
      return {
        id: `q_listen_${item.id}_${idx}_${Date.now()}`,
        listeningId: item.id,
        title: item.title,
        audioPrompt: sample.audioPrompt,
        prompt: sample.prompt,
        options: shuffled.options,
        correctIndex: shuffled.correctIndex,
        explanation: shuffled.explanation,
        transcript: sample.audioPrompt,
        mastered: item.mastered,
      };
    }

    const firstLine = item.dialogue?.[0]?.text || 'Hello, how can I assist you today?';
    const shuffled = shuffleOptionsWithCorrectIndex(
      [
        'Xác nhận thông tin theo đúng ý người nói',
        'Người nói từ chối cung cấp thông tin',
        'Người nói yêu cầu hoàn lại tiền',
        'Người nói thông báo chuyển văn phòng',
      ],
      0,
      `Đoạn nghe "${item.title}": "${firstLine}".`
    );

    return {
      id: `q_listen_${item.id}_${idx}_${Date.now()}`,
      listeningId: item.id,
      title: item.title,
      audioPrompt: firstLine,
      prompt: 'Nghe đoạn thoại và xác định thông điệp chính:',
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: shuffled.explanation,
      transcript: item.dialogue?.map((d) => `${d.speaker}: ${d.text}`).join('\n'),
      mastered: item.mastered,
    };
  });
}

