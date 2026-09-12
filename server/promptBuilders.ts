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

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}
