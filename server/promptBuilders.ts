import { TaskType } from '../src/types';

export function buildChatbotPrompt(
  taskType: TaskType,
  inputData: Record<string, unknown>
): { systemInstruction: string; userPrompt: string } {
  switch (taskType) {
    case 'writing': {
      const essay = (inputData.essay as string) || '';
      const topic = (inputData.topic as string) || 'General English Writing';
      const targetBand = (inputData.targetBand as string) || 'C1';

      const userPrompt = `You are a certified Cambridge/IELTS Senior English Writing Examiner.
Evaluate the following text written by an English learner.
Topic/Prompt: "${topic}"
Target CEFR Goal: ${targetBand}

Student's Essay:
"""
${essay}
"""

Please thoroughly evaluate this essay. You MUST return your response as a valid JSON object wrapped in \`\`\`json and \`\`\`.
Do not include any conversational filler outside the JSON code block.

JSON Structure required:
{
  "cefrBand": "e.g., B2 (Vantage) or C1 (Effective Operational Proficiency)",
  "summary": "2-3 sentences concise executive summary of strengths and primary weaknesses",
  "scoreBreakdown": {
    "taskAchievement": 7.0,
    "coherenceCohesion": 6.5,
    "lexicalResource": 7.0,
    "grammaticalRange": 6.5,
    "overallBand": 7.0
  },
  "corrections": [
    {
      "original": "exact problematic sentence or phrase",
      "suggested": "corrected native phrasing",
      "type": "grammar | collocation | spelling | punctuation | style",
      "explanation": "Clear grammatical explanation of why this was changed and the underlying rule"
    }
  ],
  "vocabularyUpgrades": [
    {
      "originalWord": "simple word used by student",
      "upgradedWord": "sophisticated C1/C2 synonym or collocation",
      "context": "how to apply it in this specific context",
      "level": "C1 or C2"
    }
  ],
  "improvedRewrite": "A complete, cohesive, natural native-level rewrite of the entire text retaining the student's core message but elevating tone, flow, and vocabulary"
}`;

      return {
        systemInstruction: 'You are an expert Cambridge/IELTS English Writing Assessor. Always output strict JSON in ```json ``` markdown code blocks.',
        userPrompt,
      };
    }

    case 'vocab': {
      const term = (inputData.term as string) || '';
      const context = (inputData.context as string) || 'general communication';

      const userPrompt = `You are a Master English Lexicographer and Bilingual English-Vietnamese Language Educator.
Deep-dive into the English word or idiom: "${term}"
Usage Context: "${context}"

Provide an in-depth linguistic analysis formatted strictly as a JSON object enclosed within \`\`\`json and \`\`\`.
Do not output text before or after the code block.

JSON Structure:
{
  "term": "${term}",
  "ipa": "Accurate IPA phonetic transcription e.g. /ˈkʌt ˈkɔːrnərz/",
  "partOfSpeech": "idiom / phrasal verb / noun / adjective / adverb",
  "vietnameseMeaning": "Deep, natural Vietnamese translation capturing the true spirit and nuance",
  "nuances": "Explanation of subtle connotations, emotional tone, and when native speakers do/don't use it",
  "register": "formal | informal | slang | neutral | idiomatic",
  "examples": [
    {
      "en": "Natural, contemporary native sentence showcasing realistic usage",
      "vi": "Natural Vietnamese translation",
      "contextNote": "Why this specific usage works here"
    },
    {
      "en": "Second contrasting native sentence (e.g. workplace or casual setting)",
      "vi": "Natural Vietnamese translation",
      "contextNote": "Contextual usage insight"
    },
    {
      "en": "Third advanced native sentence",
      "vi": "Natural Vietnamese translation",
      "contextNote": "Contextual usage insight"
    }
  ],
  "commonTraps": [
    "Common learner mistake 1 (e.g., misusing preposition, literal translation from Vietnamese)",
    "Common learner mistake 2 (e.g., incorrect grammatical pattern)",
    "False friend or confusion with similar terms"
  ],
  "collocations": [
    "Strong collocation 1",
    "Strong collocation 2",
    "Strong collocation 3",
    "Strong collocation 4"
  ]
}`;

      return {
        systemInstruction: 'You are an Oxford-trained English-Vietnamese lexicographer. Return strict JSON wrapped in ```json ```.',
        userPrompt,
      };
    }

    case 'roleplay': {
      const scenario = (inputData.scenario as string) || 'Airport check-in with excess baggage';
      const userRole = (inputData.userRole as string) || 'Passenger';
      const aiRole = (inputData.aiRole as string) || 'Airline Counter Agent';

      const userPrompt = `You are an expert English Roleplay Coach specializing in situational communicative competence.
Generate a realistic 2-way conversation dialogue for the following situation:
Scenario: "${scenario}"
Speaker 1 (Student): ${userRole}
Speaker 2 (AI Partner): ${aiRole}

Craft a natural, authentic 6 to 8 turn conversation with high-value conversational phrases, natural hesitations, polite negotiation, and idiomatic speech.
Output must be strictly valid JSON inside \`\`\`json and \`\`\`.

JSON Structure:
{
  "scenario": "${scenario}",
  "userRole": "${userRole}",
  "aiRole": "${aiRole}",
  "dialogue": [
    {
      "speaker": "${userRole}",
      "text": "Natural spoken English sentence",
      "translationVi": "Natural Vietnamese translation",
      "audioTip": "Intonation or liaison tip (e.g., rising intonation on polite query)",
      "usefulExpression": "Key functional chunk highlighted"
    },
    {
      "speaker": "${aiRole}",
      "text": "Natural response from the partner",
      "translationVi": "Natural Vietnamese translation",
      "audioTip": "Stress on keywords",
      "usefulExpression": "Key functional chunk highlighted"
    }
  ],
  "keyVocabulary": [
    {
      "term": "Key phrase from dialogue",
      "meaning": "Vietnamese explanation",
      "usage": "Grammar or pragmatic guideline"
    }
  ],
  "culturalTips": [
    "Cultural pragmatics note (e.g. how British/American speakers handle this gracefully)",
    "Politeness strategy note"
  ],
  "followUpChallenge": "A challenging follow-up question or alternative branch scenario the student can practice saying out loud"
}`;

      return {
        systemInstruction: 'You are an English roleplay scriptwriter. Return strict JSON inside ```json ```.',
        userPrompt,
      };
    }

    case 'quiz': {
      const topic = (inputData.topic as string) || 'Conditionals & Hypothetical Situations';
      const difficulty = (inputData.difficulty as string) || 'Upper-Intermediate (B2)';

      const userPrompt = `You are a Senior Item Writer for the Cambridge English and ETS exams.
Create a smart 5-question multiple choice English quiz focused on:
Topic: "${topic}"
Target Level: ${difficulty}

Create 5 high-quality, authentic questions testing subtle nuances, grammar rules, or idiomatic accuracy.
Include 4 realistic options per question with clever distractors that target common student confusions.

CRITICAL MULTIPLE CHOICE REQUIREMENT:
- You MUST randomly distribute the correct answer across option indices 0, 1, 2, and 3 (Options A, B, C, D) across the questions!
- NEVER put the correct answer at index 0 (Option A) for all questions! Ensure varied distribution (e.g., Q1 at 2, Q2 at 0, Q3 at 3, Q4 at 1, Q5 at 2).
- Set "correctAnswerIndex" to the actual index (0, 1, 2, or 3) of the correct answer.
- In "explanation", explain why the correct choice is linguistically sound and why the distractors are invalid, without writing static references like "Option A" or "Đáp án 1".

Format your entire answer as a valid JSON object enclosed in \`\`\`json and \`\`\`.

JSON Structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Contextual stem with a blank (e.g., 'Had the weather conditions _______ worse, the flight would have been diverted.')",
      "options": ["Distractor A", "Correct Answer B", "Distractor C", "Distractor D"],
      "correctAnswerIndex": 1,
      "explanation": "Detailed pedagogical explanation of why this answer is correct and why the distractors are grammatically invalid",
      "grammarRule": "Rule name (e.g. Inversion in Third Conditional)"
    }
  ]
}`;

      return {
        systemInstruction: 'You are an official Cambridge exam question creator. Return strictly valid JSON enclosed in ```json ```.',
        userPrompt,
      };
    }

    case 'toeic_lesson': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const topic = (inputData.topic as string) || 'Everyday Communication & Practical Life';
      const wordCount = Math.min(10, Math.max(3, (inputData.wordCount as number) || 3));

      let levelGuidance = '';
      if (userLevel === 'A1') {
        levelGuidance = `
TARGET LEARNER LEVEL: A1 (ABSOLUTE BEGINNER / MỚI BẮT ĐẦU)
- The learner has basic English knowledge (A1). You MUST adapt the pace to be gentle, crystal-clear, and encouraging. Do NOT overwhelm with complex C1/C2 vocabulary.
- Keep the scenario very simple, friendly, and practical (2-3 short sentences, 5-8 words per sentence). Themes can be daily life (greeting, shopping, asking directions, dining) or basic workplace.
- Select EXACTLY ${wordCount} high-yield foundational words/phrases that every beginner must know for daily/workplace communication.
- Provide "vietnamesePhonetic": a friendly Vietnamese-approximated pronunciation guide (e.g., /ˈskedʒ.uːl/ -> "x-két-giu-ồ") so the learner can speak immediately.
- Provide "simpleBreakdown": a 1-sentence breakdown explaining the simple grammatical structure (Subject + Verb + Object) in Vietnamese.
- The reflex challenge must be very friendly and easy to understand, encouraging the learner.`;
      } else if (userLevel === 'A2') {
        levelGuidance = `
TARGET LEARNER LEVEL: A2 (ELEMENTARY / TOEIC 350-500)
- Practical conversational or workplace sentences with slightly richer vocabulary.
- Select EXACTLY ${wordCount} words/phrases focusing on common daily/workplace verbs, prepositions, and natural collocations.`;
      } else if (userLevel === 'B1') {
        levelGuidance = `
TARGET LEARNER LEVEL: B1 (INTERMEDIATE / TOEIC 500-650)
- Moderate complexity scenario (3-4 sentences) across modern lifestyle, travel, or workplace.
- Select EXACTLY ${wordCount} words/phrases focusing on high-frequency TOEIC collocations and phrasal verbs.`;
      } else {
        levelGuidance = `
TARGET LEARNER LEVEL: B2 (UPPER-INTERMEDIATE / TOEIC 700+)
- Authentic corporate, negotiation, international trade, or advanced lifestyle context.
- Select EXACTLY ${wordCount} words/phrases focusing on Word Families, TOEIC Paraphrase pairs, and ETS exam trap alerts.`;
      }

      const excludeTerms = (inputData.excludeTerms as string[]) || [];
      const antiRepetitionRule = excludeTerms.length > 0
        ? `\nCRITICAL ANTI-REPETITION: The student has ALREADY learned these words: [${excludeTerms.slice(-30).join(', ')}]. DO NOT pick any of these words! Pick completely fresh words for level ${userLevel}.`
        : '';

      const userPrompt = `You are a Patient, Oxford/ETS Certified Master English Educator specializing in Vietnamese learners.
Create a bespoke, engaging, zero-stress daily micro-lesson with precise pedagogical scaffolding.

Current Learner Level: ${userLevel}
Theme / Topic: "${topic}" (Can be daily life, travel, dining, tech, or workplace)
Number of Target Words: ${wordCount}
${levelGuidance}
${antiRepetitionRule}

Format your response strictly as valid JSON enclosed in \`\`\`json and \`\`\`.

JSON Structure:
{
  "topic": "${topic}",
  "userLevel": "${userLevel}",
  "situationType": "email | memo | conversation | chat | announcement",
  "situationTitle": "Engaging, concise title of the scenario",
  "scenarioText": "Short, natural, level-appropriate English text",
  "scenarioTranslationVi": "Natural, clear Vietnamese translation of the scenario",
  "targetWords": [
    {
      "term": "Target word or phrase",
      "ipa": "/.../",
      "vietnamesePhonetic": "Friendly Vietnamese phonetic guide e.g. x-két-giu-ồ",
      "partOfSpeech": "verb / noun / adjective",
      "vietnameseMeaning": "Rõ ràng, súc tích, dễ hiểu cho người học",
      "wordFamily": "e.g. schedule (v) - scheduled (adj) or N/A",
      "wordFamilyDetails": {
        "noun": "Noun form (e.g. confirmation, schedule)",
        "verb": "Verb form (e.g. confirm, schedule)",
        "adjective": "Adjective form (e.g. confirmed, scheduled)",
        "adverb": "Adverb form if applicable or N/A"
      },
      "wordFormExercise": {
        "sentence": "A TOEIC Part 5 sentence with blank '_______' testing word forms of this root word",
        "options": ["NounForm", "VerbForm", "AdjForm", "AdvForm"],
        "correctIndex": 2,
        "targetForm": "noun | verb | adjective | adverb",
        "explanation": "Giải thích chi tiết vị trí ngữ pháp trong câu (vd: Sau mạo từ 'the' và trước danh từ cần tính từ...)"
      },
      "toeicParaphrase": "Equivalent simple word or synonym",
      "exampleSentence": "Level-appropriate sentence",
      "exampleTranslation": "Vietnamese translation",
      "simpleBreakdown": "Phân tích ngữ pháp/cấu trúc câu ngắn gọn, dễ hiểu",
      "etsTrapTip": "Mẹo tránh lỗi sai phổ biến của người Việt"
    }
  ],
  "interactiveChallenge": {
    "prompt": "Practical situational reflex question appropriate for level ${userLevel}",
    "options": ["Realistic option 1", "Realistic option 2", "Realistic option 3", "Realistic option 4"],
    "correctIndex": 1,
    "explanation": "Friendly, encouraging pedagogical explanation in Vietnamese explaining why this response is appropriate",
    "takeawayTip": "1-sentence golden takeaway rule"
  }
}

CRITICAL RULES FOR WORD FORM & CHALLENGE:
- For EVERY word in targetWords, include 'wordFamilyDetails' and 'wordFormExercise' so the learner can master TOEIC Part 5 word forms!
- In 'wordFormExercise', supply 4 distinct forms derived from the root (Noun, Verb, Adjective, Adverb). Randomize 'correctIndex' (0, 1, 2, or 3).
- Randomly place the correct answer for interactiveChallenge at index 0, 1, 2, or 3. DO NOT always make Option A (index 0) the correct answer!
- Set 'correctIndex' to the actual index of the correct option.
- In 'explanation', do not write fixed labels like 'Đáp án 1' or 'Option A'; explain the phrasing directly.`;

      return {
        systemInstruction: `You are an elite, patient English educator helping a Vietnamese student progress systematically from level ${userLevel} to TOEIC 700+. Output strictly valid JSON enclosed in \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    case 'grammar_lesson': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const grammarFocus = (inputData.grammarFocus as string) || 'toeic_all';
      const excludeRules = (inputData.excludeRules as string[]) || [];
      const excludeText = excludeRules.length > 0
        ? `\nANTI-REPETITION: Student already knows: [${excludeRules.slice(-20).join(', ')}]. Teach a DIFFERENT rule.`
        : '';

      let levelSyllabus = '';
      if (userLevel === 'A1') {
        levelSyllabus = `LEVEL A1 SIGNATURE TOEIC/COMMUNICATION PATTERNS:
- Foundation 1: "Please + Bare Verb" (Mệnh lệnh / đề nghị lịch sự: Please check, Please send)
- Foundation 2: "Can I have / Could I get + Noun" (Giao tiếp đời thường: mua sắm, gọi món, nhờ vả)
- Foundation 3: "There is / There are" (Miêu tả sự tồn tại số ít/số nhiều)
- Foundation 4: "Subject + Be + Adjective" vs "Adjective + Noun" (Trật tự tính từ căn bản trong TOEIC)
- Foundation 5: Giới từ chỉ nơi chốn/thời gian căn bản (In, On, At)`;
      } else if (userLevel === 'A2') {
        levelSyllabus = `LEVEL A2 SIGNATURE TOEIC PATTERNS (Part 5 Basics - Target 450+):
- Pattern 1: Nhận diện Từ loại cơ bản (Word Form: Xác định vị trí Danh từ đứng sau Tính từ sở hữu / Mạo từ)
- Pattern 2: Thì Hiện Tại Hoàn Thành với "Since" và "For" (Cực kỳ hay gặp trong TOEIC Part 5)
- Pattern 3: Câu Bị động đơn giản ("S + be + V3/ed + by O")
- Pattern 4: Câu So sánh hơn và So sánh nhất (Comparative & Superlative: more... than, the most...)
- Pattern 5: Động từ đi kèm V-ing hoặc To-V (enjoy, avoid + V-ing vs want, decide, plan + to V)`;
      } else if (userLevel === 'B1') {
        levelSyllabus = `LEVEL B1 SIGNATURE TOEIC PATTERNS (Part 5 Core Traps - Target 650):
- Trap 1: Phân biệt Liên Từ vs Giới Từ (Conjunctions vs Prepositions: "Although / Even though" + Mệnh đề vs "Despite / In spite of" + Cụm danh từ; "Because" vs "Because of / Due to")
- Trap 2: Sự hòa hợp Chủ ngữ - Động từ phức tạp (Subject-Verb Agreement với Each of, Neither/Either, Together with, As well as)
- Trap 3: Mệnh đề quan hệ cơ bản (Who, Which, That) và bẫy chọn Đại từ làm chủ ngữ/tân ngữ
- Trap 4: Thể Sai khiến (Causative verbs: have/get someone to do / do something; have something done)
- Trap 5: Vị trí Trạng từ chỉ tần suất & bổ nghĩa (Adverb placement: đứng giữa trợ động từ và động từ chính e.g. "have recently confirmed")`;
      } else {
        levelSyllabus = `LEVEL B2 SIGNATURE TOEIC PATTERNS (Part 5 & 6 Mastery - Target 700-850+):
- Advanced Trap 1: Rút gọn Mệnh đề quan hệ dạng Phân từ (Reduced Relative Clauses: Chủ động dùng V-ing, Bị động dùng V-ed/V3 - Bẫy điểm 800+ TOEIC)
- Advanced Trap 2: Đảo ngữ Câu điều kiện (Inverted Conditionals: "Had S + V3", "Should S + V-bare", "Were S + to V")
- Advanced Trap 3: Thể Giả định trong TOEIC (Subjunctive Mood: Các động từ mang tính yêu cầu/đề xuất "recommend / suggest / insist / require that S + (should) + Bare Verb")
- Advanced Trap 4: Cặp Liên từ tương quan (Correlative Conjunctions: "Not only... but also...", "Either... or...", "Whether... or not...")
- Advanced Trap 5: Phân từ hoàn thành (Having + V3) và Giới từ phức hợp ("Prior to", "Pertaining to", "Regardless of")`;
      }

      const userPrompt = `You are a Master English Grammar Educator and TOEIC Part 5/6 Specialist for Vietnamese learners.
Teach ONE high-yield, signature grammatical pattern for Level ${userLevel}.
Focus Category: ${grammarFocus}

${levelSyllabus}
${excludeText}

Format strictly as JSON inside \`\`\`json and \`\`\`.

JSON Structure:
{
  "ruleName": "Tên mẫu câu / bẫy TOEIC (e.g., Phân biệt Liên từ Although và Giới từ Despite)",
  "userLevel": "${userLevel}",
  "formula": "Công thức ghép câu chuẩn (e.g., Although + S + V, ... vs Despite + Noun/V-ing)",
  "vietnameseMeaning": "Ý nghĩa và ngữ cảnh áp dụng thực tế",
  "explanation": "Giải thích chi tiết, minh bạch bằng tiếng Việt, vạch trần bẫy đề thi TOEIC và cách nhớ nhanh",
  "examples": [
    {
      "en": "Ví dụ tiếng Anh 1 chuẩn format đề thi hoặc giao tiếp",
      "vi": "Bản dịch tiếng Việt chuẩn",
      "note": "Phân tích vì sao chọn từ này"
    },
    {
      "en": "Ví dụ tiếng Anh 2",
      "vi": "Bản dịch tiếng Việt 2",
      "note": "Phân tích vì sao chọn từ này"
    }
  ],
  "vietnameseTrap": "Bẫy đề thi TOEIC kinh điển mà người Việt hay mắc phải với cấu trúc này",
  "practiceSentence": {
    "prompt": "Câu đố thực hành ghép câu hoặc chọn từ theo format Part 5 cho học viên",
    "hint": "Gợi ý mẹo giải nhanh không cần dịch cả câu"
  }
}

CRITICAL: Return strictly valid JSON.`;

      return {
        systemInstruction: `You are a patient English grammar teacher and TOEIC specialist for Vietnamese learners at level ${userLevel}. Return strict JSON wrapped in \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    case 'reflex_challenge': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const reviewTerms = (inputData.reviewTerms as string[]) || [];
      const reviewGrammar = (inputData.reviewGrammar as string[]) || [];

      const reviewFocus = reviewTerms.length > 0 || reviewGrammar.length > 0
        ? `ACTIVE RECALL RETRIEVAL: The student has previously learned these words: [${reviewTerms.join(', ')}] and grammar: [${reviewGrammar.join(', ')}].
You MUST construct a realistic situational workplace reflex question that directly activates and tests their practical understanding of these EXACT words/rules!`
        : `Construct a practical situational reflex question appropriate for level ${userLevel}.`;

      const userPrompt = `You are a Communicative Reflex Coach for English learners.
Target Level: ${userLevel}
${reviewFocus}

Create 1 engaging, practical workplace communication situation (NOT a dry test question).
The student faces a real-life situation where they must choose the best, most polite and natural response applying what they learned.

CRITICAL RANDOMIZATION REQUIREMENT:
- Randomly shuffle the order of the 4 options! DO NOT place the correct answer as the first option (Option A).
- Place the correct answer randomly at index 0, 1, 2, or 3 (e.g., at index 1, 2, or 3).
- Set "correctIndex" to match the actual position of the correct answer (0, 1, 2, or 3).
- In "explanation", explain why that specific phrasing is polite and correct without referencing labels like "Đáp án 1" or "Option A".

Format strictly as JSON inside \`\`\`json and \`\`\`.

JSON Structure:
{
  "sourceType": "${reviewTerms.length > 0 ? 'memory_review' : 'general'}",
  "userLevel": "${userLevel}",
  "reviewedTerms": ${JSON.stringify(reviewTerms)},
  "situationContext": "Mô tả tình huống công sở thực tế (ví dụ: Đồng nghiệp hỏi bạn về lịch trình hôm nay)",
  "question": "Câu hỏi tình huống: Bạn nên phản hồi như thế nào để vừa lịch sự vừa dùng đúng từ đã học?",
  "options": [
    "Distractor A (with learner mistake)",
    "Distractor B (with unnatural tone)",
    "Natural and correct answer C",
    "Distractor D (with wrong grammar)"
  ],
  "correctIndex": 2,
  "explanation": "Giải thích chi tiết vì sao đáp án này là chuẩn nhất, phân tích cách dùng từ vựng/ngữ pháp đã học",
  "memoryTip": "Mẹo ghi nhớ cốt lõi cho các từ/mẫu câu này"
}`;

      return {
        systemInstruction: `You are a Communication Reflex Coach for English learners. Return strict JSON wrapped in \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    case 'reading_lesson': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const topic = (inputData.topic as string) || 'Daily Life, Culture & Discovery';

      let wordLimit = '50-80 words (clear, engaging, short sentences, friendly)';
      if (userLevel === 'A2') wordLimit = '80-120 words (common real-life vocabulary and natural expressions)';
      if (userLevel === 'B1') wordLimit = '120-160 words (intermediate story, article, guide, blog post, or message exchange)';
      if (userLevel === 'B2') wordLimit = '160-200 words (advanced article, analysis, commentary, or formal document)';

      const userPrompt = `You are a Master English Reading Comprehension Instructor for Vietnamese students.
Create an authentic, level-appropriate reading passage for Level ${userLevel}.
Topic: "${topic}" (Open theme: daily life, science, technology, travel, food, hobbies, culture, human stories, or practical communication).
Target Length: ${wordLimit}

Requirements:
1. Genre can be: article, story, blog post, review, guide, email, announcement, memo, chat, or notice.
2. Provide an engaging, creative title.
3. Keep sentences natural, modern, and well-structured.
4. Provide a faithful, natural Vietnamese translation.
5. Extract 3-4 key vocabulary words in context with IPA, Vietnamese meaning, and context hints.
6. Create 1 multiple-choice comprehension check question with 4 options (randomize correctIndex 0-3) and a detailed pedagogical explanation in Vietnamese.

Format strictly as JSON inside \`\`\`json and \`\`\`.

JSON Structure:
{
  "title": "Title of the passage",
  "userLevel": "${userLevel}",
  "topic": "${topic}",
  "genre": "article | story | blog | review | guide | email | announcement | memo | chat | notice",
  "passage": "Full English passage text",
  "translationVi": "Natural Vietnamese translation",
  "keyVocabulary": [
    {
      "term": "Key term 1",
      "ipa": "/.../",
      "meaning": "Nghĩa trong bài",
      "contextHint": "Gợi ý cách dùng trong câu"
    }
  ],
  "comprehensionQuiz": {
    "question": "Comprehension question in Vietnamese or English",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1,
    "explanation": "Chi tiết vì sao đáp án này đúng dựa trên thông tin trong bài"
  }
}`;

      return {
        systemInstruction: `You are an elite English reading teacher for Vietnamese learners at level ${userLevel}. Return strictly valid JSON inside \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    case 'listening_lesson': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const topic = (inputData.topic as string) || 'Everyday Conversations & Life Dilemmas';

      let linesCount = '3-4 dialogue lines (short, natural, high-frequency spoken expressions)';
      if (userLevel === 'A2') linesCount = '4-6 dialogue lines (practical conversations, requests, sharing opinions)';
      if (userLevel === 'B1') linesCount = '6-8 dialogue lines (storytelling, discussions, travel scenarios, life situations)';
      if (userLevel === 'B2') linesCount = '8-10 dialogue lines (complex multi-speaker discussion, nuanced expressions)';

      const userPrompt = `You are an Audio English Listening Coach for Vietnamese students.
Create an authentic, realistic dialogue for listening practice for Level ${userLevel}.
Topic: "${topic}" (Open theme: friends chatting, travel, cafe, hobbies, tech, life advice, entertainment, or practical communication).
Dialogue scope: ${linesCount}

Requirements:
1. Clear, friendly speakers (e.g. "Emma", "Liam", "Sophie", "Alex", "Barista", "Traveler", etc.).
2. Natural spoken English with everyday spoken reductions appropriate for level ${userLevel}.
3. Faithful Vietnamese translation for each dialogue line.
4. "fullAudioScript": A continuous English script suitable for speech synthesis.
5. Extract 2-3 key listening phrases / auditory keywords with IPA and Vietnamese meaning.
6. Create 1 listening comprehension question (audioPrompt, question, 4 options with randomized correctIndex 0-3, explanation in Vietnamese).

Format strictly as JSON inside \`\`\`json and \`\`\`.

JSON Structure:
{
  "title": "Title of listening module",
  "userLevel": "${userLevel}",
  "topic": "${topic}",
  "situation": "Brief description of the context (e.g. Planning a weekend road trip)",
  "dialogue": [
    {
      "speaker": "Speaker 1",
      "text": "Spoken line in English",
      "translationVi": "Bản dịch tiếng Việt"
    }
  ],
  "fullAudioScript": "Continuous text of all spoken lines",
  "keyPhrases": [
    {
      "phrase": "Key phrase",
      "ipa": "/.../",
      "meaning": "Ý nghĩa giao tiếp"
    }
  ],
  "listeningQuiz": {
    "audioPrompt": "Short key audio sentence from dialogue",
    "question": "Câu hỏi kiểm tra tai nghe",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Giải thích chi tiết vì sao đáp án này đúng"
  }
}`;

      return {
        systemInstruction: `You are an expert spoken English and listening educator for Vietnamese learners at level ${userLevel}. Return strictly valid JSON inside \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
