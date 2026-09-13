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

Format your entire answer as a valid JSON object enclosed in \`\`\`json and \`\`\`.

JSON Structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Contextual stem with a blank (e.g., 'Had the weather conditions _______ worse, the flight would have been diverted.')",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
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
      const topic = (inputData.topic as string) || 'Random Authentic Workplace Scenario';

      let levelGuidance = '';
      if (userLevel === 'A1') {
        levelGuidance = `
TARGET LEARNER LEVEL: A1 (ABSOLUTE BEGINNER / MỚI BẮT ĐẦU)
- The learner has basic English knowledge (A1). You MUST adapt the pace to be gentle, crystal-clear, and encouraging. Do NOT overwhelm with complex C1/C2 vocabulary.
- Keep the workplace scenario very simple, friendly, and practical (2-3 short sentences, 5-8 words per sentence). Topics like: asking for meeting time, saying hello to a colleague, asking to send an email, confirming office location.
- Select 3 high-yield foundational words/phrases that every beginner must know for basic workplace communication (e.g., "schedule", "colleague", "send", "confirm", "meeting", "busy", "available", "report").
- Provide "vietnamesePhonetic": a friendly Vietnamese-approximated pronunciation guide (e.g., /ˈskedʒ.uːl/ -> "x-két-giu-ồ") so the learner can speak immediately.
- Provide "simpleBreakdown": a 1-sentence breakdown explaining the simple grammatical structure (Subject + Verb + Object) in Vietnamese.
- The reflex challenge must be very friendly and easy to understand, encouraging the learner.`;
      } else if (userLevel === 'A2') {
        levelGuidance = `
TARGET LEARNER LEVEL: A2 (ELEMENTARY WORKPLACE)
- Practical workplace sentences with slightly richer vocabulary (e.g., "receive", "cancel", "appointment", "inquire", "request").
- Focus on common prepositions and basic business email phrasings.`;
      } else if (userLevel === 'B1') {
        levelGuidance = `
TARGET LEARNER LEVEL: B1 (INTERMEDIATE / PRE-TOEIC 500-600)
- Moderate complexity scenario (3-4 sentences).
- Focus on workplace collocations, phrasal verbs ("attend a meeting", "meet a deadline", "responsible for").`;
      } else {
        levelGuidance = `
TARGET LEARNER LEVEL: B2 (UPPER-INTERMEDIATE / TOEIC 700+)
- Authentic corporate context (contracts, negotiations, memos).
- Focus on Word Families, TOEIC Paraphrase pairs, and ETS exam trap alerts.`;
      }

      const userPrompt = `You are a Patient, Oxford/ETS Certified Master English Educator specializing in Vietnamese learners.
Create a bespoke, engaging, zero-stress daily micro-lesson with precise pedagogical scaffolding.

Current Learner Level: ${userLevel}
Theme / Focus: "${topic}"
${levelGuidance}

Format your response strictly as valid JSON enclosed in \`\`\`json and \`\`\`.

JSON Structure:
{
  "topic": "${topic}",
  "userLevel": "${userLevel}",
  "situationType": "email | memo | meeting | chat | announcement",
  "situationTitle": "Engaging, concise title of the scenario",
  "scenarioText": "Short, natural, level-appropriate business English text",
  "scenarioTranslationVi": "Natural, clear Vietnamese translation of the scenario",
  "targetWords": [
    {
      "term": "Target word or phrase",
      "ipa": "/.../",
      "vietnamesePhonetic": "Friendly Vietnamese phonetic guide e.g. x-két-giu-ồ",
      "partOfSpeech": "verb / noun / adjective",
      "vietnameseMeaning": "Rõ ràng, súc tích, dễ hiểu cho người học",
      "wordFamily": "e.g. schedule (v) - scheduled (adj) or N/A",
      "toeicParaphrase": "Equivalent simple word or synonym",
      "exampleSentence": "Level-appropriate sentence",
      "exampleTranslation": "Vietnamese translation",
      "simpleBreakdown": "Phân tích ngữ pháp/cấu trúc câu ngắn gọn, dễ hiểu",
      "etsTrapTip": "Mẹo tránh lỗi sai phổ biến của người Việt"
    }
  ],
  "interactiveChallenge": {
    "prompt": "Practical situational reflex question appropriate for level ${userLevel}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Friendly, encouraging pedagogical explanation in Vietnamese",
    "takeawayTip": "1-sentence golden takeaway rule"
  }
}`;

      return {
        systemInstruction: `You are an elite, patient English educator helping a Vietnamese student progress systematically from level ${userLevel} to TOEIC 700+. Output strictly valid JSON enclosed in \`\`\`json \`\`\`.`,
        userPrompt,
      };
    }

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
