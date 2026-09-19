import assert from 'node:assert/strict';
import test from 'node:test';

// 1. Mock localStorage for Node.js environment
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const k of Object.keys(storage)) delete storage[k];
  },
};

import {
  getLearnedWords,
  saveLearnedWords,
  addLearnedWords,
  toggleWordMastery,
  recordWordReview,
  getLearnedGrammar,
  saveLearnedGrammar,
  addLearnedGrammar,
  toggleGrammarMastery,
  getLearnedReadings,
  saveLearnedReadings,
  addLearnedReading,
  toggleReadingMastery,
  getLearnedListenings,
  saveLearnedListenings,
  addLearnedListening,
  toggleListeningMastery,
  getExcludeWordsList,
  getExcludeGrammarList,
  getTargetItemsForReflex,
  clearAllLearningMemory,
  resetAllAppData,
} from '../src/utils/learningMemory';

import {
  shuffleOptionsWithCorrectIndex,
  generateVocabTestQuestions,
  generateGrammarTestQuestions,
  generateReadingTestQuestions,
  generateListeningTestQuestions,
  generateCombinedQuizQuestions,
  SAMPLE_VOCAB_FOR_TEST,
} from '../src/utils/quizUtils';

import { buildChatbotPrompt } from '../server/promptBuilders';
import { generateRealisticFallback } from '../server/fallbackGenerator';
import {
  evaluatePronunciationLocally,
  getUserAudioSettings,
  splitTextIntoSentences,
  createSequentialAudioPlayer,
  createDialoguePlayer,
} from '../src/utils/speechUtils';
import {
  generateContextualReply,
  getChatQuickReplies,
  detectGrammarFeedback,
  getOpeningChatMessage,
  POPULAR_CHAT_SCENARIOS,
} from '../src/utils/chatUtils';
import { chunkTextForTTS } from '../server/ttsService';

test('learningMemory: Word storage and anti-repetition', () => {
  localStorage.clear();
  assert.equal(getLearnedWords().length, 0);

  // Add initial words
  addLearnedWords([
    {
      term: 'Accommodate',
      ipa: '/əˈkɑː.mə.deɪt/',
      vietnamesePhonetic: 'Ơ-côm-mờ-đây-t',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Đáp ứng, thu xếp thỏa đáng',
      level: 'B2',
    },
    {
      term: 'Stipulation',
      ipa: '/ˌstɪp.jəˈleɪ.ʃən/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'Điều khoản bắt buộc',
      level: 'B2',
    },
  ]);

  const words = getLearnedWords();
  assert.equal(words.length, 2);
  assert.equal(words[0].term, 'Accommodate');
  assert.equal(words[0].mastered, false);

  // Test anti-repetition: adding duplicate (different case) should NOT duplicate
  addLearnedWords([
    {
      term: 'accommodate',
      ipa: '/əˈkɑː.mə.deɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Đáp ứng',
      level: 'B2',
    },
  ]);
  assert.equal(getLearnedWords().length, 2);

  // Exclude list
  const excludeList = getExcludeWordsList();
  assert.deepEqual(excludeList, ['Accommodate', 'Stipulation']);

  // Toggle mastery
  const wordId = words[0].id;
  toggleWordMastery(wordId);
  const updatedWords = getLearnedWords();
  assert.equal(updatedWords[0].mastered, true);
});

test('learningMemory: Grammar storage and active recall feeder', () => {
  localStorage.clear();

  addLearnedGrammar({
    ruleName: 'Mẫu câu nhờ vả lịch sự với Please',
    formula: 'Please + Bare Verb',
    vietnameseMeaning: 'Nhờ vả lịch sự',
    level: 'A1',
  });

  const grammarList = getLearnedGrammar();
  assert.equal(grammarList.length, 1);
  assert.equal(grammarList[0].ruleName, 'Mẫu câu nhờ vả lịch sự với Please');
  assert.equal(grammarList[0].mastered, false);

  // Duplicate check
  addLearnedGrammar({
    ruleName: 'mẫu câu nhờ vả lịch sự với please',
    formula: 'Please + Bare Verb',
    vietnameseMeaning: 'Nhờ vả',
    level: 'A1',
  });
  assert.equal(getLearnedGrammar().length, 1);

  // Exclude grammar list
  assert.deepEqual(getExcludeGrammarList(), ['Mẫu câu nhờ vả lịch sự với Please']);

  // Reflex active recall generator feeder
  addLearnedWords([
    {
      term: 'Colleague',
      ipa: '/ˈkɑː.liːɡ/',
      vietnamesePhonetic: 'CÓ-li-gừ',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'Đồng nghiệp',
      level: 'A1',
    },
  ]);

  const reflexTarget = getTargetItemsForReflex();
  assert.equal(reflexTarget.words.length, 1);
  assert.equal(reflexTarget.words[0].term, 'Colleague');
  assert.equal(reflexTarget.grammar.length, 1);
  assert.equal(reflexTarget.grammar[0].ruleName, 'Mẫu câu nhờ vả lịch sự với Please');
});

test('promptBuilders: Prompt generation with anti-repetition & active recall', () => {
  // Grammar lesson with excluded rules
  const grammarPrompt = buildChatbotPrompt('grammar_lesson', {
    userLevel: 'A1',
    excludeRules: ['Please + Bare Verb', 'Can I have + Noun'],
  });
  assert.ok(grammarPrompt.userPrompt.includes('ANTI-REPETITION'));
  assert.ok(grammarPrompt.userPrompt.includes('Please + Bare Verb'));
  assert.ok(grammarPrompt.userPrompt.includes('Level A1'));

  // Reflex challenge with reviewed terms
  const reflexPrompt = buildChatbotPrompt('reflex_challenge', {
    userLevel: 'A1',
    reviewTerms: ['Colleague', 'Accommodate'],
    reviewGrammar: ['Please + Bare Verb'],
  });
  assert.ok(reflexPrompt.userPrompt.includes('ACTIVE RECALL RETRIEVAL'));
  assert.ok(reflexPrompt.userPrompt.includes('Colleague'));
  assert.ok(reflexPrompt.userPrompt.includes('Accommodate'));
  assert.ok(reflexPrompt.userPrompt.includes('Please + Bare Verb'));

  // TOEIC lesson with anti-repetition
  const toeicPrompt = buildChatbotPrompt('toeic_lesson', {
    userLevel: 'A1',
    topic: 'Daily Conversation',
    excludeTerms: ['Colleague', 'Report'],
  });
  assert.ok(toeicPrompt.userPrompt.includes('ANTI-REPETITION'));
  assert.ok(toeicPrompt.userPrompt.includes('Colleague'));
});

test('fallbackGenerator: Realistic fallbacks for new task types', () => {
  const grammarResult = generateRealisticFallback('grammar_lesson', { userLevel: 'A1' });
  assert.equal(grammarResult.type, 'grammar_lesson');
  assert.ok(grammarResult.data.formula);
  assert.ok(grammarResult.data.examples.length > 0);
  assert.ok(grammarResult.data.vietnameseTrap);

  const reflexResult = generateRealisticFallback('reflex_challenge', {
    userLevel: 'B2',
    reviewTerms: ['Accommodate', 'Stipulation'],
  });
  assert.equal(reflexResult.type, 'reflex_challenge');
  assert.equal(reflexResult.data.sourceType, 'memory_review');
  assert.deepEqual(reflexResult.data.reviewedTerms, ['Accommodate', 'Stipulation']);
  assert.equal(reflexResult.data.options.length, 4);
  assert.equal(typeof reflexResult.data.correctIndex, 'number');
});

test('quizUtils: shuffleOptionsWithCorrectIndex scrambles options and maps correct index', () => {
  const options = ['Correct Option A', 'Distractor B', 'Distractor C', 'Distractor D'];
  const originalCorrectIndex = 0;

  // Run multiple times to verify index changes and mapping correctness
  const observedIndices = new Set<number>();
  for (let i = 0; i < 50; i++) {
    const { shuffledOptions, newCorrectIndex, cleanedExplanation } = shuffleOptionsWithCorrectIndex(
      options,
      originalCorrectIndex,
      'Đáp án 1 là chính xác nhất theo quy tắc ngữ pháp.'
    );

    assert.equal(shuffledOptions.length, 4);
    assert.equal(shuffledOptions[newCorrectIndex], 'Correct Option A');
    assert.ok(!cleanedExplanation.includes('Đáp án 1'));
    observedIndices.add(newCorrectIndex);
  }

  // Over 50 runs, options should land in more than 1 distinct slot
  assert.ok(observedIndices.size > 1, 'Correct option must be distributed across multiple positions');
});

test('quizUtils: generateVocabTestQuestions generates active recall tests from memory', () => {
  localStorage.clear();
  addLearnedWords(SAMPLE_VOCAB_FOR_TEST as any);

  const words = getLearnedWords();
  assert.equal(words.length, 6);

  const questions = generateVocabTestQuestions(words, 5);
  assert.equal(questions.length, 5);

  for (const q of questions) {
    assert.ok(q.prompt);
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.explanation);

    // Verify correct option corresponds to word
    const correctOpt = q.options[q.correctIndex];
    if (q.questionType === 'en_to_vi') {
      assert.equal(correctOpt, q.vietnameseMeaning);
    } else if (q.questionType === 'vi_to_en') {
      assert.equal(correctOpt, q.term);
    } else if (q.questionType === 'fill_in_blank') {
      assert.equal(correctOpt, q.term);
    }
  }
});

test('learningMemory: recordWordReview increments reviewCount and tracks mastery', () => {
  localStorage.clear();
  addLearnedWords([
    {
      term: 'Schedule',
      ipa: '/ˈskedʒ.uːl/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'Lịch trình',
      level: 'A1',
    },
  ]);

  const [word] = getLearnedWords();
  assert.equal(word.reviewCount, 0);
  assert.equal(word.mastered, false);

  // First correct review
  recordWordReview(word.id, true);
  let updated = getLearnedWords()[0];
  assert.equal(updated.reviewCount, 1);
  assert.equal(updated.mastered, false);

  // Second correct review -> triggers mastery
  recordWordReview(word.id, true);
  updated = getLearnedWords()[0];
  assert.equal(updated.reviewCount, 2);
  assert.equal(updated.mastered, true);
});

test('promptBuilders: Custom vocab count and flexible topics', () => {
  const prompt = buildChatbotPrompt('toeic_lesson', {
    topic: 'Du Lịch, Sân Bay & Đặt Phòng (Travel)',
    userLevel: 'A1',
    wordCount: 5,
    excludeTerms: ['Flight', 'Ticket'],
  });

  assert.ok(prompt.userPrompt.includes('Number of Target Words: 5'));
  assert.ok(prompt.userPrompt.includes('Du Lịch, Sân Bay & Đặt Phòng'));
  assert.ok(prompt.userPrompt.includes('Flight, Ticket'));
});

test('promptBuilders: TOEIC signature grammar focus matrix by level', () => {
  // Test A1 Foundation
  const promptA1 = buildChatbotPrompt('grammar_lesson', {
    userLevel: 'A1',
    grammarFocus: 'toeic_all',
  });
  assert.ok(promptA1.userPrompt.includes('LEVEL A1'));
  assert.ok(promptA1.userPrompt.includes('Please + Bare Verb'));

  // Test B1 Word Forms / S-V Agreement
  const promptB1 = buildChatbotPrompt('grammar_lesson', {
    userLevel: 'B1',
    grammarFocus: 'word_forms',
  });
  assert.ok(promptB1.userPrompt.includes('LEVEL B1'));
  assert.ok(promptB1.userPrompt.includes('Focus Category: word_forms'));

  // Test B2 Reduced Relative Clauses / Subjunctive
  const promptB2 = buildChatbotPrompt('grammar_lesson', {
    userLevel: 'B2',
    grammarFocus: 'participles',
  });
  assert.ok(promptB2.userPrompt.includes('LEVEL B2'));
  assert.ok(promptB2.userPrompt.includes('Focus Category: participles'));
  assert.ok(promptB2.userPrompt.includes('Rút gọn Mệnh đề quan hệ dạng Phân từ'));
});

test('speechUtils: evaluatePronunciationLocally accuracy scoring and phonetic tips', () => {
  // Test 1: Perfect pronunciation
  const perfect = evaluatePronunciationLocally(
    'Accommodate',
    'accommodate',
    '/əˈkɑː.mə.deɪt/',
    'Ơ-côm-mờ-đây-t'
  );
  assert.equal(perfect.score, 100);
  assert.equal(perfect.verdict, 'perfect');
  assert.ok(perfect.words[0].status === 'correct');
  assert.ok(perfect.phoneticTips.some((t) => t.includes('Ơ-côm-mờ-đây-t')));

  // Test 2: Sentence pronunciation with high accuracy
  const sentence = evaluatePronunciationLocally(
    'We need to reschedule the meeting',
    'we need to reschedule the meeting'
  );
  assert.equal(sentence.score, 100);
  assert.equal(sentence.verdict, 'perfect');
  assert.equal(sentence.words.length, 6);

  // Test 3: Sentence with minor word distortion
  const partial = evaluatePronunciationLocally(
    'We must submit the deadline',
    'we must submit deadline'
  );
  assert.ok(partial.score > 60 && partial.score < 100);
  assert.ok(partial.words.some((w) => w.word === 'the' && w.status !== 'correct'));

  // Test 4: Vietnamese phonetic tips for ending sounds
  const endingTips = evaluatePronunciationLocally('Request', 'request');
  assert.ok(endingTips.phoneticTips.some((t) => t.includes('Ending Sound') || t.includes('âm đuôi')));
});

test('speechUtils: getUserAudioSettings defaults and local storage integration', () => {
  localStorage.clear();
  const defaultSettings = getUserAudioSettings();
  assert.equal(defaultSettings.speechRate, 1.0);
  assert.equal(defaultSettings.speechVoice, 'en-US');

  localStorage.setItem(
    'playeng_settings',
    JSON.stringify({ speechRate: 0.8, speechVoice: 'en-GB' })
  );
  const customSettings = getUserAudioSettings();
  assert.equal(customSettings.speechRate, 0.8);
  assert.equal(customSettings.speechVoice, 'en-GB');
});

test('learningMemory: toggleWordMastery and toggleGrammarMastery support ID, term, and ruleName', () => {
  localStorage.clear();

  // Test 1: toggle by term string (case insensitive)
  addLearnedWords([
    {
      term: 'Negotiate',
      ipa: '/nəˈɡoʊ.ʃi.eɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Đàm phán',
      level: 'B1',
    },
  ]);
  assert.equal(getLearnedWords()[0].mastered, false);

  toggleWordMastery('negotiate');
  assert.equal(getLearnedWords()[0].mastered, true);

  toggleWordMastery('NEGOTIATE');
  assert.equal(getLearnedWords()[0].mastered, false);

  // Test 2: toggle for un-indexed word automatically registers and masters it
  toggleWordMastery('deadline');
  const words = getLearnedWords();
  const deadlineWord = words.find((w) => w.term === 'deadline');
  assert.ok(deadlineWord);
  assert.equal(deadlineWord.mastered, true);

  // Test 3: toggleGrammarMastery by ruleName
  addLearnedGrammar({
    ruleName: 'Mệnh đề quan hệ rút gọn',
    formula: 'V-ing / V-ed',
    vietnameseMeaning: 'Rút gọn mệnh đề quan hệ',
    level: 'B2',
  });
  assert.equal(getLearnedGrammar()[0].mastered, false);

  toggleGrammarMastery('Mệnh đề quan hệ rút gọn');
  assert.equal(getLearnedGrammar()[0].mastered, true);
});

test('learningMemory: Reading and Listening storage, deduplication & mastery toggling', () => {
  localStorage.clear();

  // Test Reading memory
  assert.equal(getLearnedReadings().length, 0);
  addLearnedReading({
    title: 'Project Timeline Update',
    passage: 'Dear team, the release deadline has been moved to Friday.',
    translationVi: 'Thân gửi toàn đội, hạn chót phát hành đã chuyển sang thứ Sáu.',
    level: 'A2',
    topic: 'Workplace',
  });
  assert.equal(getLearnedReadings().length, 1);
  assert.equal(getLearnedReadings()[0].mastered, false);

  // Duplicate check (case insensitive)
  addLearnedReading({
    title: 'project timeline update',
    passage: 'Duplicate',
    translationVi: 'Trùng',
    level: 'A2',
    topic: 'Workplace',
  });
  assert.equal(getLearnedReadings().length, 1);

  // Toggle mastery by title
  toggleReadingMastery('Project Timeline Update');
  assert.equal(getLearnedReadings()[0].mastered, true);

  // Test Listening memory
  assert.equal(getLearnedListenings().length, 0);
  addLearnedListening({
    title: 'Airport Check-in',
    dialogue: [
      { speaker: 'Agent', text: 'May I see your passport?', translationVi: 'Tôi có thể xem hộ chiếu không?' },
      { speaker: 'Passenger', text: 'Here it is.', translationVi: 'Của tôi đây ạ.' },
    ],
    level: 'A1',
    topic: 'Travel',
  });
  assert.equal(getLearnedListenings().length, 1);
  assert.equal(getLearnedListenings()[0].mastered, false);

  // Toggle mastery
  toggleListeningMastery('airport check-in');
  assert.equal(getLearnedListenings()[0].mastered, true);
});

test('quizUtils: generateGrammarTestQuestions produces valid 4-option MCQs from memory', () => {
  const grammarItems = [
    {
      id: 'g1',
      ruleName: 'Could you please + V',
      formula: 'Could you please + Verb (bare)?',
      vietnameseMeaning: 'Nhờ vả lịch sự',
      level: 'A2' as const,
      learnedAt: new Date().toISOString(),
      reviewCount: 1,
      mastered: true,
      exampleSentence: 'Could you please forward me the quarterly report?',
    },
  ];

  const questions = generateGrammarTestQuestions(grammarItems, 3);
  assert.ok(questions.length > 0);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.explanation.length > 0);
  }
});

test('quizUtils: generateReadingTestQuestions produces valid reading comprehension MCQs', () => {
  const readings = [
    {
      id: 'r1',
      title: 'Office Relocation Notice',
      passage: 'Starting next Monday, our branch will operate from the 5th floor.',
      translationVi: 'Từ thứ Hai tuần tới, chi nhánh sẽ hoạt động tại tầng 5.',
      level: 'A2' as const,
      topic: 'Notice',
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: true,
      questions: [
        {
          question: 'When will the new office start operating?',
          options: ['Next Monday', 'Next month', 'Immediately', 'Friday'],
          correctIndex: 0,
          explanation: 'Passage mentions starting next Monday.',
        },
      ],
    },
  ];

  const questions = generateReadingTestQuestions(readings, 2);
  assert.ok(questions.length > 0);
  assert.equal(questions[0].options.length, 4);
  assert.ok(questions[0].correctIndex >= 0 && questions[0].correctIndex < 4);
});

test('quizUtils: generateListeningTestQuestions produces valid listening comprehension MCQs', () => {
  const listenings = [
    {
      id: 'l1',
      title: 'Meeting Schedule',
      dialogue: [
        { speaker: 'Mark', text: 'Can we reschedule our briefing?', translationVi: 'Chúng ta đổi lịch họp được không?' },
        { speaker: 'Sarah', text: 'Sure, how about 3 PM tomorrow?', translationVi: 'Được chứ, 3 giờ chiều mai nhé?' },
      ],
      level: 'A2' as const,
      topic: 'Meeting',
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: true,
    },
  ];

  const questions = generateListeningTestQuestions(listenings, 2);
  assert.ok(questions.length > 0);
  assert.equal(questions[0].options.length, 4);
  assert.ok(questions[0].correctIndex >= 0 && questions[0].correctIndex < 4);
  assert.ok(questions[0].audioPrompt.length > 0);
});

test('fallbackGenerator & promptBuilders: reading_lesson and listening_lesson coverage', () => {
  // Test prompt builder
  const readingPrompt = buildChatbotPrompt('reading_lesson', { userLevel: 'A2', topic: 'Job Interview' });
  assert.ok(readingPrompt.userPrompt.includes('reading passage'));
  assert.ok(readingPrompt.userPrompt.includes('Job Interview'));

  const listeningPrompt = buildChatbotPrompt('listening_lesson', { userLevel: 'B1', topic: 'Customer Call' });
  assert.ok(listeningPrompt.userPrompt.includes('listening comprehension'));
  assert.ok(listeningPrompt.userPrompt.includes('Customer Call'));

  // Test fallback generator
  const readingFallback = generateRealisticFallback('reading_lesson', { userLevel: 'A2', topic: 'Business Email' });
  assert.equal(readingFallback.type, 'reading_lesson');
  assert.ok(readingFallback.data.title);
  assert.ok(readingFallback.data.passage);
  assert.ok(readingFallback.data.translationVi);
  assert.ok(readingFallback.data.comprehensionQuiz);

  const listeningFallback = generateRealisticFallback('listening_lesson', { userLevel: 'A1', topic: 'Office Dialogue' });
  assert.equal(listeningFallback.type, 'listening_lesson');
  assert.ok(listeningFallback.data.title);
  assert.ok(listeningFallback.data.dialogue.length > 0);
  assert.ok(listeningFallback.data.listeningQuiz);
});

test('openTopics: reading and listening generators support completely decoupled custom topics (life, tech, travel, nature)', () => {
  // Custom non-workplace topic 1: Nature & Animals
  const customPromptReading = buildChatbotPrompt('reading_lesson', {
    userLevel: 'A1',
    topic: 'Vũ Trụ & Những Hành Tinh Kỳ Thú (Astronomy & Space)',
  });
  assert.ok(customPromptReading.userPrompt.includes('Vũ Trụ & Những Hành Tinh Kỳ Thú'));
  assert.ok(customPromptReading.userPrompt.includes('Open theme'));

  // Custom non-workplace topic 2: Culinary & Cafe
  const customPromptListening = buildChatbotPrompt('listening_lesson', {
    userLevel: 'B1',
    topic: 'Bí quyết pha chế cà phê Cold Brew tại nhà',
  });
  assert.ok(customPromptListening.userPrompt.includes('Bí quyết pha chế cà phê Cold Brew tại nhà'));
  assert.ok(customPromptListening.userPrompt.includes('Open theme'));

  // Fallback generates non-workplace content for travel/life topics
  const travelFallback = generateRealisticFallback('reading_lesson', {
    userLevel: 'A1',
    topic: 'Du lịch & Cà phê sáng',
  });
  assert.equal(travelFallback.type, 'reading_lesson');
  assert.ok(travelFallback.data.title.includes('Coffee') || travelFallback.data.title.includes('Morning'));

  const travelListening = generateRealisticFallback('listening_lesson', {
    userLevel: 'A1',
    topic: 'Du lịch & Khám phá thành phố',
  });
  assert.equal(travelListening.type, 'listening_lesson');
  assert.ok(travelListening.data.dialogue.length >= 3);

  // Persistence supports custom non-workplace topics
  addLearnedReading({
    title: 'A Beautiful Night in Kyoto',
    passage: 'Kyoto was quiet at night. Lanterns cast a soft golden glow along the river.',
    translationVi: 'Kyoto thật yên bình về đêm. Những chiếc lồng đèn tỏa ánh sáng vàng êm dịu dọc bờ sông.',
    level: 'A2',
    topic: 'Du lịch khám phá Nhật Bản (Custom Topic)',
    keyWords: [{ term: 'Lantern', meaning: 'Lồng đèn' }],
    questions: [
      {
        question: 'What cast a soft glow along the river?',
        options: ['Lanterns', 'Cars', 'Moonlight', 'Neon signs'],
        correctIndex: 0,
        explanation: 'The passage explicitly says lanterns cast a soft golden glow.',
      },
    ],
  });

  const readings = getLearnedReadings();
  const saved = readings.find((r) => r.title === 'A Beautiful Night in Kyoto');
  assert.ok(saved);
  assert.equal(saved?.topic, 'Du lịch khám phá Nhật Bản (Custom Topic)');
});

test('wordForm: Word family and word form exercise persistence in learningMemory', () => {
  localStorage.clear();

  // Add word with rich word family and word form exercise
  addLearnedWords([
    {
      term: 'Innovate',
      ipa: '/ˈɪn.ə.veɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Đổi mới, sáng tạo',
      level: 'B2',
      wordFamily: 'innovate (v) - innovation (n) - innovative (adj)',
      wordFamilyDetails: {
        noun: 'innovation',
        verb: 'innovate',
        adjective: 'innovative',
        adverb: 'innovatively',
      },
      wordFormExercise: {
        sentence: 'The tech company is famous for its _______ marketing approaches.',
        options: ['innovate', 'innovation', 'innovative', 'innovatively'],
        correctIndex: 2,
        targetForm: 'adjective',
        explanation: "Trước danh từ 'marketing approaches' cần tính từ 'innovative'.",
      },
    },
  ]);

  const words = getLearnedWords();
  assert.equal(words.length, 1);
  assert.equal(words[0].term, 'Innovate');
  assert.equal(words[0].wordFamilyDetails?.noun, 'innovation');
  assert.equal(words[0].wordFamilyDetails?.adjective, 'innovative');
  assert.ok(words[0].wordFormExercise);
  assert.equal(words[0].wordFormExercise?.targetForm, 'adjective');
  assert.equal(words[0].wordFormExercise?.correctIndex, 2);
});

test('quizUtils: generateVocabTestQuestions with mode word_form generates TOEIC Part 5 questions', () => {
  localStorage.clear();
  addLearnedWords(SAMPLE_VOCAB_FOR_TEST as any);
  const words = getLearnedWords();
  assert.ok(words.length >= 5);

  // 1. Test dedicated word_form mode
  const wfQuestions = generateVocabTestQuestions(words, 5, 'word_form');
  assert.equal(wfQuestions.length, 5);
  for (const q of wfQuestions) {
    assert.equal(q.questionType, 'word_form');
    assert.ok(q.prompt.includes('[ TOEIC PART 5 - LUYỆN BIẾN ĐỔI TỪ LOẠI (WORD FORM) ]'));
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.explanation.length > 5);
  }

  // 2. Test meaning mode
  const meaningQuestions = generateVocabTestQuestions(words, 4, 'meaning');
  assert.equal(meaningQuestions.length, 4);
  for (const q of meaningQuestions) {
    assert.ok(q.questionType === 'en_to_vi' || q.questionType === 'vi_to_en');
  }

  // 3. Test dynamic algorithmic fallback for arbitrary word
  const customWord = [
    {
      id: 'custom_1',
      term: 'Collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Hợp tác',
      level: 'B1' as const,
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: false,
    },
  ];
  const dynamicWf = generateVocabTestQuestions(customWord, 1, 'word_form');
  assert.equal(dynamicWf.length, 1);
  assert.equal(dynamicWf[0].questionType, 'word_form');
  assert.equal(dynamicWf[0].options.length, 4);
  assert.ok(dynamicWf[0].correctIndex >= 0 && dynamicWf[0].correctIndex < 4);
});

test('fallbackGenerator & promptBuilders: wordFamilyDetails and wordFormExercise in toeic_lesson', () => {
  // 1. Fallback generator for A1
  const a1Lesson = generateRealisticFallback('toeic_lesson', { userLevel: 'A1' });
  assert.equal(a1Lesson.type, 'toeic_lesson');
  assert.ok(a1Lesson.data.targetWords.length > 0);
  for (const w of a1Lesson.data.targetWords) {
    assert.ok(w.wordFamilyDetails, `Missing wordFamilyDetails for word ${w.term}`);
    assert.ok(w.wordFormExercise, `Missing wordFormExercise for word ${w.term}`);
    assert.equal(w.wordFormExercise?.options.length, 4);
    assert.ok(w.wordFormExercise?.correctIndex >= 0 && w.wordFormExercise?.correctIndex < 4);
  }

  // 2. Fallback generator for B2
  const b2Lesson = generateRealisticFallback('toeic_lesson', { userLevel: 'B2' });
  assert.equal(b2Lesson.type, 'toeic_lesson');
  for (const w of b2Lesson.data.targetWords) {
    assert.ok(w.wordFamilyDetails, `Missing wordFamilyDetails for word ${w.term}`);
    assert.ok(w.wordFormExercise, `Missing wordFormExercise for word ${w.term}`);
    assert.equal(w.wordFormExercise?.options.length, 4);
  }

  // 3. Prompt builder instructions
  const prompt = buildChatbotPrompt('toeic_lesson', { userLevel: 'B2', topic: 'Negotiations' });
  assert.ok(prompt.userPrompt.includes('wordFamilyDetails'));
  assert.ok(prompt.userPrompt.includes('wordFormExercise'));
  assert.ok(prompt.userPrompt.includes('CRITICAL RULES FOR WORD FORM'));
});

test('chatUtils: generateContextualReply generates in-character messenger responses', () => {
  // 1. Airport scenario test
  const airportReply = generateContextualReply({
    scenario: 'Airport check-in with 2.5kg overweight baggage',
    userRole: 'Passenger',
    aiRole: 'SkyWings Check-in Agent',
    lastUserMessage: 'Can I repack some items into my carry-on bag?',
    difficulty: 'B2',
  });

  assert.equal(airportReply.speaker, 'SkyWings Check-in Agent');
  assert.ok(airportReply.text.length > 20);
  assert.ok(airportReply.translationVi.length > 10);
  assert.ok(airportReply.audioTip);
  assert.ok(airportReply.usefulExpression);
  assert.equal(airportReply.isUser, false);
  assert.ok(airportReply.timestamp);

  // 2. Tech interview scenario test
  const interviewReply = generateContextualReply({
    scenario: 'Tech Job Interview regarding system architecture',
    userRole: 'Candidate',
    aiRole: 'Engineering Director',
    lastUserMessage: 'We migrated our monolith to microservices and used Redis for caching.',
    difficulty: 'B2',
  });

  assert.equal(interviewReply.speaker, 'Engineering Director');
  assert.ok(interviewReply.text.toLowerCase().includes('caching') || interviewReply.text.toLowerCase().includes('nodes') || interviewReply.text.length > 30);
  assert.ok(interviewReply.translationVi);

  // 3. Quick replies helper
  const quickAirport = getChatQuickReplies('Airport Check-in', 'SkyWings Agent');
  assert.ok(quickAirport.length >= 3);
  assert.ok(quickAirport.some((q) => q.toLowerCase().includes('carry-on') || q.toLowerCase().includes('fee')));
});

test('speechUtils: splitTextIntoSentences preserves abbreviations and breaks sentences cleanly', () => {
  const passage = "Good morning, Dr. Watson and Mr. Holmes! The meeting starts at 9:00 a.m. sharp. E.g., we must review the quarterly reports. Are you ready? Let's proceed!";
  const sentences = splitTextIntoSentences(passage);

  assert.equal(sentences.length, 5);
  assert.ok(sentences[0].includes('Dr. Watson and Mr. Holmes!'));
  assert.ok(sentences[1].includes('9:00 a.m. sharp.'));
  assert.ok(sentences[2].includes('E.g., we must review'));
  assert.equal(sentences[3], 'Are you ready?');
  assert.equal(sentences[4], "Let's proceed!");
});

test('ttsService: chunkTextForTTS splits long texts <= 130 characters without truncation', () => {
  const longPassage =
    "Artificial intelligence is rapidly transforming global industry and modern software architecture. From healthcare systems to automated high-frequency trading platforms, machine learning models are continuously processing massive datasets to deliver actionable insights in real-time.";

  const chunks = chunkTextForTTS(longPassage, 130);
  assert.ok(chunks.length >= 2, `Expected at least 2 chunks, got ${chunks.length}`);

  for (const chunk of chunks) {
    assert.ok(chunk.length <= 130, `Chunk length ${chunk.length} exceeds 130 limit: "${chunk}"`);
    assert.ok(chunk.trim().length > 0);
  }

  // Re-assembled text should contain words from original
  const joined = chunks.join(' ');
  assert.ok(joined.includes('Artificial intelligence'));
  assert.ok(joined.includes('actionable insights in real-time'));
});

test('chatUtils: detectGrammarFeedback identifies ESL slips and provides friendly tips', () => {
  // 1. "I am agree"
  const feedbackAgree = detectGrammarFeedback('I am agree with your proposal.');
  assert.ok(feedbackAgree && feedbackAgree.includes('I agree'));

  // 2. "I have 25 years old"
  const feedbackAge = detectGrammarFeedback('I have 25 years old and work as a developer.');
  assert.ok(feedbackAge && feedbackAge.includes('I am'));

  // 3. "look forward to hear"
  const feedbackHearing = detectGrammarFeedback('I look forward to hear from you soon.');
  assert.ok(feedbackHearing && feedbackHearing.includes('hearing'));

  // 4. "discuss about"
  const feedbackDiscuss = detectGrammarFeedback('Let us discuss about the problem.');
  assert.ok(feedbackDiscuss && feedbackDiscuss.includes('discuss'));

  // 5. Clean sentence without slips returns undefined
  const feedbackClean = detectGrammarFeedback('I agree that we should prioritize latency optimization.');
  assert.equal(feedbackClean, undefined);

  // 6. Subject-Verb agreement: "he don't"
  const feedbackSubj = detectGrammarFeedback("He don't know the answer to this question.");
  assert.ok(feedbackSubj && feedbackSubj.includes("doesn't"));

  // 7. Double past: "didn't went"
  const feedbackDoublePast = detectGrammarFeedback("I didn't went to the office yesterday.");
  assert.ok(feedbackDoublePast && feedbackDoublePast.includes("didn't go"));

  // 8. "He told that"
  const feedbackTold = detectGrammarFeedback("The manager told that the meeting was postponed.");
  assert.ok(feedbackTold && (feedbackTold.includes("told me") || feedbackTold.includes("said that")));
});

test('chatUtils: POPULAR_CHAT_SCENARIOS has 9+ diverse and fully defined conversation scenarios', () => {
  assert.ok(POPULAR_CHAT_SCENARIOS.length >= 9, `Expected at least 9 scenarios, got ${POPULAR_CHAT_SCENARIOS.length}`);
  for (const scen of POPULAR_CHAT_SCENARIOS) {
    assert.ok(scen.name.trim().length > 0, `Scenario missing name: ${JSON.stringify(scen)}`);
    assert.ok(scen.nameVi.trim().length > 0, `Scenario missing nameVi: ${scen.name}`);
    assert.ok(scen.scenario.trim().length > 0, `Scenario missing scenario text: ${scen.name}`);
    assert.ok(scen.icon.trim().length > 0, `Scenario missing icon: ${scen.name}`);
    assert.ok(scen.userRole.trim().length > 0, `Scenario missing userRole: ${scen.name}`);
    assert.ok(scen.aiRole.trim().length > 0, `Scenario missing aiRole: ${scen.name}`);
    assert.ok(scen.sampleOpening.trim().length > 0, `Scenario missing sampleOpening: ${scen.name}`);
  }
});

test('chatUtils: getOpeningChatMessage starts live roleplay conversation in character', () => {
  // 1. Airport scenario opening
  const airportOpening = getOpeningChatMessage({
    scenario: 'Airport check-in counter',
    userRole: 'Passenger',
    aiRole: 'Gate Agent',
  });
  assert.equal(airportOpening.isUser, false);
  assert.ok(airportOpening.text.toLowerCase().includes('passport') || airportOpening.text.toLowerCase().includes('skywings') || airportOpening.text.toLowerCase().includes('ticket'));
  assert.ok(airportOpening.translationVi);
  assert.ok(airportOpening.usefulExpression);

  // 2. Non-airport Cafe scenario opening does NOT leak airport lines
  const cafeOpening = getOpeningChatMessage({
    scenario: 'Cafe Order & Casual Chat',
    userRole: 'Customer',
    aiRole: 'Barista',
  });
  assert.equal(cafeOpening.isUser, false);
  assert.ok(!cafeOpening.text.toLowerCase().includes('skywings'), 'Cafe scenario should not leak SkyWings airport line');
  assert.ok(cafeOpening.text.toLowerCase().includes('coffee') || cafeOpening.text.toLowerCase().includes('order') || cafeOpening.text.toLowerCase().includes('welcome'));

  // 3. Interview scenario opening
  const interviewOpening = getOpeningChatMessage({
    scenario: 'Software engineering interview',
    userRole: 'Candidate',
    aiRole: 'Interviewer',
  });
  assert.equal(interviewOpening.isUser, false);
  assert.ok(interviewOpening.text.toLowerCase().includes('interview') || interviewOpening.text.toLowerCase().includes('background'));

  // 4. Dialogue with pre-scripted turns reuses turn 1 if partner speaks first
  const customOpening = getOpeningChatMessage({
    scenario: 'Custom Cafe',
    userRole: 'Customer',
    aiRole: 'Barista',
    dialogue: [
      { speaker: 'Barista', text: 'Welcome to Artisan Coffee! What can I brew for you today?', translationVi: 'Chào mừng...' },
      { speaker: 'Customer', text: 'A flat white please.', translationVi: '...' }
    ]
  });
  assert.equal(customOpening.text, 'Welcome to Artisan Coffee! What can I brew for you today?');
  assert.equal(customOpening.isUser, false);
});

test('speechUtils: createSequentialAudioPlayer and createDialoguePlayer provide full playback controls', () => {
  // 1. Sequential Audio Player controller
  const sentences = ['First sentence to play.', 'Second sentence to follow.', 'Final concluding sentence.'];
  let lastIndex = -1;
  const seqPlayer = createSequentialAudioPlayer(sentences, {
    rate: 1.0,
    pauseBetweenMs: 200,
    onIndexChange: (idx) => {
      lastIndex = idx;
    },
  });

  assert.equal(typeof seqPlayer.play, 'function');
  assert.equal(typeof seqPlayer.pause, 'function');
  assert.equal(typeof seqPlayer.resume, 'function');
  assert.equal(typeof seqPlayer.stop, 'function');
  assert.equal(typeof seqPlayer.setRate, 'function');
  assert.equal(seqPlayer.getCurrentIndex(), 0);

  // 2. Dialogue Player controller with 2-speaker voice differentiation
  const dialogue = [
    { speaker: 'Interviewer', text: 'Tell me about your architectural decisions.' },
    { speaker: 'Candidate', text: 'I built microservices communicating via gRPC.' },
  ];

  const dialoguePlayer = createDialoguePlayer(dialogue, { rate: 1.1 });
  assert.equal(typeof dialoguePlayer.play, 'function');
  assert.equal(typeof dialoguePlayer.stop, 'function');
});

test('focusMode: settings support and localStorage persistence', () => {
  // Test localStorage storage key and defaults
  const FOCUS_KEY = 'playeng_focus_mode';
  localStorage.removeItem(FOCUS_KEY);
  
  // Default is false
  const defaultFocus = localStorage.getItem(FOCUS_KEY) === 'true';
  assert.equal(defaultFocus, false);

  // Toggle ON
  localStorage.setItem(FOCUS_KEY, 'true');
  assert.equal(localStorage.getItem(FOCUS_KEY), 'true');

  // Toggle OFF
  localStorage.setItem(FOCUS_KEY, 'false');
  assert.equal(localStorage.getItem(FOCUS_KEY), 'false');
  localStorage.removeItem(FOCUS_KEY);
});

test('flashcard: item mapping and Leitner Spaced Repetition mechanics', () => {
  // 1. ToeicWord to FlashcardItem mapping
  const sampleToeicWord: import('../src/types').ToeicWord = {
    term: 'Collaborate',
    ipa: '/kəˈlæb.ə.reɪt/',
    vietnamesePhonetic: 'cơ-la-bơ-rây-t',
    partOfSpeech: 'v',
    vietnameseMeaning: 'Hợp tác, cộng tác',
    exampleSentence: 'Our team collaborates with international partners.',
    exampleTranslation: 'Đội ngũ của chúng tôi hợp tác với các đối tác quốc tế.',
    wordFamilyDetails: {
      noun: 'collaboration',
      verb: 'collaborate',
      adjective: 'collaborative',
      adverb: 'collaboratively',
    },
  };

  const flashcardItem: import('../src/types').FlashcardItem = {
    term: sampleToeicWord.term,
    ipa: sampleToeicWord.ipa,
    vietnamesePhonetic: sampleToeicWord.vietnamesePhonetic,
    partOfSpeech: sampleToeicWord.partOfSpeech,
    vietnameseMeaning: sampleToeicWord.vietnameseMeaning,
    wordFamilyDetails: sampleToeicWord.wordFamilyDetails,
    exampleSentence: sampleToeicWord.exampleSentence,
    exampleTranslation: sampleToeicWord.exampleTranslation,
    mastered: false,
  };

  assert.equal(flashcardItem.term, 'Collaborate');
  assert.equal(flashcardItem.ipa, '/kəˈlæb.ə.reɪt/');
  assert.equal(flashcardItem.vietnamesePhonetic, 'cơ-la-bơ-rây-t');
  assert.equal(flashcardItem.wordFamilyDetails?.noun, 'collaboration');

  // 2. Add word to memory bank and verify Leitner review mechanics
  addLearnedWords([sampleToeicWord]);
  const initialWord = getLearnedWords().find((w) => w.term.toLowerCase() === 'collaborate');
  assert.ok(initialWord, 'Word should be persisted in memory bank');

  // Rate 'again' (failure)
  recordWordReview('Collaborate', false);
  const reviewedOnce = getLearnedWords().find((w) => w.term.toLowerCase() === 'collaborate');
  assert.equal(reviewedOnce?.reviewCount, 1);
  assert.equal(reviewedOnce?.mastered, false);

  // Rate 'easy' (mastery)
  toggleWordMastery('Collaborate');
  const masteredWord = getLearnedWords().find((w) => w.term.toLowerCase() === 'collaborate');
  assert.equal(masteredWord?.mastered, true);

  // 3. Flashcard autoplay audio preference
  const AUTOPLAY_KEY = 'playeng_flashcard_autoplay';
  localStorage.setItem(AUTOPLAY_KEY, 'true');
  assert.equal(localStorage.getItem(AUTOPLAY_KEY), 'true');
  localStorage.setItem(AUTOPLAY_KEY, 'false');
  assert.equal(localStorage.getItem(AUTOPLAY_KEY), 'false');
  localStorage.removeItem(AUTOPLAY_KEY);
});

test('resetAllAppData: Wipes all learning memory, streak, level and resets to clean state', () => {
  // 1. Seed dummy data across storage
  localStorage.setItem('playeng_streak', '14');
  localStorage.setItem('playeng_user_level', 'B2');
  localStorage.setItem('playeng_last_progress_date', 'Mon Sep 14 2026');
  localStorage.setItem('playeng_focus_mode', 'true');
  addLearnedWords([
    {
      term: 'Negotiate',
      ipa: '/nəˈɡoʊ.ʃi.eɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'đàm phán',
    },
  ]);
  assert.ok(getLearnedWords().length >= 1);
  assert.equal(localStorage.getItem('playeng_streak'), '14');
  assert.equal(localStorage.getItem('playeng_user_level'), 'B2');

  // 2. Perform resetAllAppData
  resetAllAppData();

  // 3. Assert all storage is clean
  assert.equal(getLearnedWords().length, 0, 'Learned words must be wiped');
  assert.equal(localStorage.getItem('playeng_streak'), null, 'Streak must be reset');
  assert.equal(localStorage.getItem('playeng_user_level'), null, 'User level must be reset');
  assert.equal(localStorage.getItem('playeng_focus_mode'), null, 'Focus mode must be reset');
  assert.equal(localStorage.getItem('playeng_last_progress_date'), null, 'Progress date must be reset');
});

test('tunnelService: getLocalIpAddresses returns valid IPv4 addresses and detects cloudflared', async () => {
  const { getLocalIpAddresses, getCloudflaredPath, getTunnelStatus } = await import('../server/tunnelService');
  const ips = getLocalIpAddresses();
  assert.ok(Array.isArray(ips), 'Must return an array of IP strings');
  assert.ok(ips.length > 0, 'Must contain at least 1 IP address');
  assert.match(ips[0], /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'IP must be valid IPv4 format');

  const binaryPath = getCloudflaredPath();
  assert.ok(typeof binaryPath === 'string', 'Binary path must be string');

  const status = getTunnelStatus();
  assert.ok('active' in status, 'Status must contain active flag');
});

test('wordFamily & synonyms: Storing and retrieving word family meanings and structured synonyms', () => {
  localStorage.clear();

  addLearnedWords([
    {
      term: 'Collaborate',
      ipa: '/kəˈlæb.ə.reɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'Hợp tác, cộng tác',
      wordFamilyDetails: {
        noun: 'collaboration',
        nounMeaning: 'Sự cộng tác, hợp tác làm việc',
        verb: 'collaborate',
        verbMeaning: 'Hợp tác cùng nhau',
        adjective: 'collaborative',
        adjectiveMeaning: 'Có tính hợp tác, chung tay',
        adverb: 'collaboratively',
        adverbMeaning: 'Một cách hợp tác, đồng lòng',
      },
      synonyms: [
        { word: 'cooperate', meaning: 'Hợp tác cùng có lợi', nuance: 'Làm việc cùng nhau hướng tới mục tiêu' },
        { word: 'partner with', meaning: 'Bắt tay đối tác', nuance: 'Hợp tác mang tính chiến lược dài hạn' },
      ],
    },
  ]);

  const words = getLearnedWords();
  assert.equal(words.length, 1);
  const word = words[0];
  assert.equal(word.wordFamilyDetails?.nounMeaning, 'Sự cộng tác, hợp tác làm việc');
  assert.equal(word.wordFamilyDetails?.verbMeaning, 'Hợp tác cùng nhau');
  assert.equal(word.wordFamilyDetails?.adjectiveMeaning, 'Có tính hợp tác, chung tay');
  assert.equal(word.wordFamilyDetails?.adverbMeaning, 'Một cách hợp tác, đồng lòng');

  assert.ok(Array.isArray(word.synonyms));
  assert.equal(word.synonyms?.length, 2);
  const syn0 = word.synonyms![0] as { word: string; meaning: string; nuance?: string };
  assert.equal(syn0.word, 'cooperate');
  assert.equal(syn0.meaning, 'Hợp tác cùng có lợi');
});

test('speechUtils: evaluatePronunciationLocally returns isCorrect boolean flag and retry status when wrong', () => {
  // Case 1: High match -> isCorrect = true
  const correctEval = evaluatePronunciationLocally(
    'Good morning everyone welcome to our office',
    'good morning everyone welcome to our office'
  );
  assert.equal(correctEval.isCorrect, true);
  assert.ok(correctEval.score >= 70);
  assert.match(correctEval.verdictTextVi, /ĐÚNG/i);

  // Case 2: Near match (small filler difference) -> isCorrect = true
  const minorEval = evaluatePronunciationLocally(
    'Please confirm your schedule today',
    'please confirm your schedule'
  );
  assert.equal(minorEval.isCorrect, true);
  assert.ok(minorEval.score >= 70);

  // Case 3: Mismatched or severely flawed speech -> isCorrect = false
  const wrongEval = evaluatePronunciationLocally(
    'The partnership contract clearly stipulates quarterly audits',
    'I like eating pizza with cheese'
  );
  assert.equal(wrongEval.isCorrect, false);
  assert.ok(wrongEval.score < 70);
  assert.match(wrongEval.verdictTextVi, /CHƯA ĐÚNG|ĐỌC LẠI/i);
});

test('quizUtils: generateCombinedQuizQuestions generates customizable question count with vocab and grammar', () => {
  // Test with 5 questions, mixed scope
  const quiz5 = generateCombinedQuizQuestions({
    totalQuestions: 5,
    scope: 'mixed',
  });
  assert.equal(quiz5.length, 5);
  const hasVocab = quiz5.some((q) => q.category === 'vocab');
  const hasGrammar = quiz5.some((q) => q.category === 'grammar');
  assert.ok(hasVocab, 'Mixed quiz must include vocabulary questions');
  assert.ok(hasGrammar, 'Mixed quiz must include grammar questions');

  quiz5.forEach((q) => {
    assert.ok(q.question && q.question.length > 5);
    assert.ok(Array.isArray(q.options) && q.options.length === 4);
    assert.ok(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4);
    assert.ok(q.explanation);
  });

  // Test with 10 questions, vocab only
  const quiz10Vocab = generateCombinedQuizQuestions({
    totalQuestions: 10,
    scope: 'vocab',
  });
  assert.equal(quiz10Vocab.length, 10);
  assert.ok(quiz10Vocab.every((q) => q.category === 'vocab'), 'Vocab scope must be 100% vocab');

  // Test with 15 questions, grammar only
  const quiz15Grammar = generateCombinedQuizQuestions({
    totalQuestions: 15,
    scope: 'grammar',
  });
  assert.equal(quiz15Grammar.length, 15);
  assert.ok(quiz15Grammar.every((q) => q.category === 'grammar'), 'Grammar scope must be 100% grammar');

  // Test with 20 questions, mixed
  const quiz20 = generateCombinedQuizQuestions({
    totalQuestions: 20,
    scope: 'mixed',
  });
  assert.equal(quiz20.length, 20);
});

test('server: fallbackGenerator and promptBuilders support questionCount and quizType for quiz task', () => {
  // Prompt builder verification
  const prompt = buildChatbotPrompt('quiz', {
    topic: 'Conditionals and Word Forms',
    difficulty: 'Advanced (C1)',
    questionCount: 10,
    quizType: 'mixed',
  });
  assert.match(prompt.userPrompt, /10-question multiple choice/i);
  assert.match(prompt.userPrompt, /Key Vocabulary[\s\S]*Core Grammar/i);

  // Fallback generator verification
  const fallback = generateRealisticFallback('quiz', {
    topic: 'Test Topic',
    difficulty: 'B2',
    questionCount: 8,
    quizType: 'mixed',
  });
  assert.equal(fallback.type, 'quiz');
  const data = fallback.data as any;
  assert.equal(data.questions.length, 8);
  const fallbackHasVocab = data.questions.some((q: any) => q.category === 'vocab');
  const fallbackHasGrammar = data.questions.some((q: any) => q.category === 'grammar');
  assert.ok(fallbackHasVocab, 'Fallback must have vocab questions');
  assert.ok(fallbackHasGrammar, 'Fallback must have grammar questions');
});

test('vocabThroughReading: promptBuilders and fallbackGenerator generate inspiring stories for vocabulary learning', () => {
  // 1. Prompt builder with vocabMethod: 'reading'
  const storyPrompt = buildChatbotPrompt('toeic_lesson', {
    userLevel: 'A1',
    topic: 'A Small Habit That Sparked Joy',
    wordCount: 3,
    vocabMethod: 'reading',
  });
  assert.match(storyPrompt.userPrompt, /SPECIAL PEDAGOGICAL MODE: LEARN VOCABULARY THROUGH AN INSPIRING STORY/i);
  assert.match(storyPrompt.userPrompt, /"situationType": "story \| article/i);
  assert.match(storyPrompt.userPrompt, /living context/i);

  // 2. Fallback generator with vocabMethod: 'reading' (A1)
  const a1Story = generateRealisticFallback('toeic_lesson', {
    userLevel: 'A1',
    topic: 'Morning routine story',
    vocabMethod: 'reading',
  });
  assert.equal(a1Story.type, 'toeic_lesson');
  const a1Data = a1Story.data as any;
  assert.equal(a1Data.situationType, 'story');
  assert.ok(a1Data.scenarioText.length > 50, 'Story text must be substantial');
  assert.ok(a1Data.targetWords.length >= 3, 'Must have at least 3 target words');
  assert.ok(a1Data.targetWords.some((w: any) => w.term.toLowerCase() === 'routine'), 'Should have Routine word');
  assert.ok(a1Data.interactiveChallenge?.prompt, 'Must have an interactive challenge');

  // 3. Fallback generator with situationType: 'story' (B1/B2)
  const bStory = generateRealisticFallback('toeic_lesson', {
    userLevel: 'B2',
    topic: 'Overcoming challenges and stepping beyond comfort zones',
    vocabMethod: 'reading',
  });
  assert.equal(bStory.type, 'toeic_lesson');
  const bData = bStory.data as any;
  assert.equal(bData.situationType, 'story');
  assert.ok(bData.targetWords.some((w: any) => w.term.toLowerCase() === 'embrace'), 'Should have Embrace word');
  assert.ok(bData.targetWords.some((w: any) => w.term.toLowerCase() === 'resilience'), 'Should have Resilience word');

  // 4. Memory persistence of story vocabulary
  localStorage.clear();
  addLearnedWords(a1Data.targetWords);
  const learned = getLearnedWords();
  assert.equal(learned.length, a1Data.targetWords.length);
  assert.equal(learned[0].term, 'Routine');
});

test('readingConfig: setup word count, min/max limits and reading difficulty levels (A1 to C1)', () => {
  // 1. Prompt Builder with custom targetWordCount 400 and Level C1
  const c1Prompt = buildChatbotPrompt('reading_lesson', {
    userLevel: 'C1',
    topic: 'Artificial Intelligence & Future of Humanities',
    targetWordCount: 400,
  });
  assert.ok(c1Prompt.userPrompt.includes('Level C1'));
  assert.ok(c1Prompt.userPrompt.includes('~400 words'));
  assert.ok(c1Prompt.userPrompt.includes('340 and 480 words'));
  assert.ok(c1Prompt.userPrompt.includes('Advanced academic/professional prose'));

  // 2. Prompt Builder with custom targetWordCount 150 and Level A1
  const a1Prompt = buildChatbotPrompt('reading_lesson', {
    userLevel: 'A1',
    topic: 'My Favorite Weekend',
    targetWordCount: 150,
  });
  assert.ok(a1Prompt.userPrompt.includes('Level A1'));
  assert.ok(a1Prompt.userPrompt.includes('~150 words'));

  // 3. Fallback Generator with custom targetWordCount and multi-paragraph passage
  const readingFallback = generateRealisticFallback('reading_lesson', {
    userLevel: 'B2',
    topic: 'How Generative AI Is Reshaping Daily Learning Habits',
    targetWordCount: 300,
  });
  assert.equal(readingFallback.type, 'reading_lesson');
  assert.ok(readingFallback.data.passage.includes('\n\n'), 'Should have multiple paragraphs separated by double line breaks');
  assert.ok(readingFallback.data.passage.split(/\s+/).length >= 100, 'Passage should not be too short');
  assert.ok(readingFallback.data.keyVocabulary.length >= 3);
  assert.ok(readingFallback.data.comprehensionQuiz.question.length > 0);
  assert.equal(readingFallback.data.comprehensionQuiz.options.length, 4);
});








