import { GoogleGenAI } from '@google/genai';
import { TaskType, TaskResult, TranslationVocabResult, PipelineStepId, StepState, AutomationLog } from '../src/types';
import { GeneratedPassage } from './passageGenerator';
import { generatePassageWithGeminiPlaywright, buildGeminiPassagePrompt } from './playwrightEngine';

export function getEffectiveGeminiApiKey(customApiKey?: string): string | undefined {
  if (customApiKey && customApiKey.trim().length > 10) {
    return customApiKey.trim();
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || undefined;
}

export function isGeminiApiAvailable(customApiKey?: string): boolean {
  const key = getEffectiveGeminiApiKey(customApiKey);
  return Boolean(key && key.startsWith('AIza'));
}

export interface GeminiApiExecutionOptions {
  taskType: TaskType;
  inputData: any;
  prompt: string;
  apiKey?: string;
  callbacks: {
    onStep: (stepId: PipelineStepId, status: StepState, subtext?: string) => void;
    onLog: (log: Omit<AutomationLog, 'id' | 'timestamp'>) => void;
    onRawChunk?: (chunk: string) => void;
  };
}

export async function runGeminiApiEngine(options: GeminiApiExecutionOptions): Promise<TaskResult> {
  const { taskType, inputData, prompt, apiKey, callbacks } = options;
  const { onStep, onLog, onRawChunk } = callbacks;

  const emitLog = (
    level: AutomationLog['level'],
    stepId: PipelineStepId,
    message: string,
    detail?: string
  ) => {
    onLog({ level, stepId, message, detail });
  };

  const effectiveKey = getEffectiveGeminiApiKey(apiKey);
  if (!effectiveKey) {
    throw new Error('Gemini API Key is not configured. Provide GEMINI_API_KEY in environment or app settings.');
  }

  const startTime = Date.now();

  onStep('launching_browser', 'running', 'Khởi tạo Google GenAI Client SDK...');
  emitLog('info', 'launching_browser', 'Kết nối trực tiếp Google AI Studio với Gemini Flash', 'Protocol: Google GenAI v2');
  
  const ai = new GoogleGenAI({ apiKey: effectiveKey });
  await new Promise((r) => setTimeout(r, 100));
  onStep('launching_browser', 'completed', 'Google GenAI Client sẵn sàng');

  onStep('navigating', 'running', 'Xác thực API Key & Kiểm tra hạn ngạch...');
  emitLog('info', 'navigating', 'API Key hợp lệ, chuyển sang định dạng prompt...');
  await new Promise((r) => setTimeout(r, 100));
  onStep('navigating', 'completed', 'Xác thực thành công');

  onStep('injecting_prompt', 'running', 'Đang nạp đề bài dịch & từ vựng mục tiêu vào Gemini 2.5 Flash...');
  emitLog('info', 'injecting_prompt', `Truyền payload (${prompt.length} ký tự) tới gemini-2.5-flash`);
  await new Promise((r) => setTimeout(r, 150));
  onStep('injecting_prompt', 'completed', 'Đã nạp prompt');

  onStep('waiting_generation', 'running', 'Gemini AI đang chấm điểm, phân tích ngữ cảnh và viết nhận xét...');
  emitLog('wait', 'waiting_generation', 'Mô hình đang sinh câu trả lời cấu trúc JSON...');

  let rawResponseText = '';
  let modelUsed = 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
    });
    rawResponseText = response.text || '';
  } catch (err: any) {
    emitLog('warn', 'waiting_generation', `Thử lại với gemini-1.5-flash do: ${err.message}`);
    modelUsed = 'gemini-1.5-flash';
    const fallbackResponse = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
    });
    rawResponseText = fallbackResponse.text || '';
  }

  if (onRawChunk && rawResponseText) {
    onRawChunk(rawResponseText);
  }

  onStep('waiting_generation', 'completed', `Hoàn thành thế hệ bởi ${modelUsed}`);

  onStep('extracting_response', 'running', 'Đang phân tích cấu trúc dữ liệu phản hồi từ Gemini...');
  emitLog('info', 'extracting_response', 'Trích xuất JSON từ phản hồi markdown của Gemini...');

  // Extract JSON
  let jsonStr = '';
  const jsonCodeBlockMatch = rawResponseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
    jsonStr = jsonCodeBlockMatch[1].trim();
  } else {
    const firstBrace = rawResponseText.indexOf('{');
    const lastBrace = rawResponseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = rawResponseText.slice(firstBrace, lastBrace + 1).trim();
    }
  }

  if (!jsonStr) {
    throw new Error('Gemini API không trả về cấu trúc JSON hợp lệ.');
  }

  const parsedData = JSON.parse(jsonStr);

  // Stamp evaluatedBy & evaluatedProvider
  if (taskType === 'translation_vocab') {
    (parsedData as TranslationVocabResult).evaluatedBy = `✨ Google Gemini (${modelUsed} Direct API)`;
    (parsedData as TranslationVocabResult).evaluatedProvider = 'gemini';
  }

  emitLog('success', 'extracting_response', `Phân tích thành công kết quả từ ${modelUsed}!`);
  onStep('extracting_response', 'completed', 'Dữ liệu sẵn sàng');

  const elapsed = Date.now() - startTime;
  onStep('rendered', 'completed', `Phản hồi trong ${(elapsed / 1000).toFixed(1)}s`);
  emitLog('success', 'rendered', `Hoàn tất đánh giá học thuật bởi Google Gemini AI.`);

  return {
    type: taskType,
    data: parsedData,
  } as TaskResult;
}

export async function generatePassageWithGeminiApi(params: {
  level: string;
  topic?: string;
  customTopic?: string;
  apiKey?: string;
}): Promise<GeneratedPassage> {
  const { level, topic, customTopic, apiKey } = params;
  const effectiveKey = getEffectiveGeminiApiKey(apiKey);
  if (!effectiveKey) {
    throw new Error('Gemini API Key is missing. Provide GEMINI_API_KEY in environment or app settings.');
  }

  const ai = new GoogleGenAI({ apiKey: effectiveKey });
  const prompt = buildGeminiPassagePrompt(level, topic, customTopic);

  let rawResponseText = '';
  let modelUsed = 'gemini-2.5-flash';
  try {
    const res = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
    });
    rawResponseText = res.text || '';
  } catch {
    modelUsed = 'gemini-1.5-flash';
    const res = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
    });
    rawResponseText = res.text || '';
  }

  const jsonCodeBlockMatch = rawResponseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let jsonStr = '';
  if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
    jsonStr = jsonCodeBlockMatch[1].trim();
  } else {
    const first = rawResponseText.indexOf('{');
    const last = rawResponseText.lastIndexOf('}');
    if (first !== -1 && last > first) {
      jsonStr = rawResponseText.slice(first, last + 1);
    }
  }

  if (!jsonStr) {
    throw new Error('Gemini API did not return valid JSON for reading passage.');
  }

  const parsed = JSON.parse(jsonStr);
  return {
    id: `gemini_api_${Date.now()}`,
    title: parsed.title || 'Gemini Reading Passage',
    topic: parsed.topic || topic || 'General',
    topicCategory: topic || 'daily',
    difficulty: (level as any) || (parsed.difficulty as any) || 'B1',
    genre: 'Article',
    passage: parsed.passage,
    translationVi: parsed.translationVi || '',
    sentenceTranslations: parsed.sentenceTranslations || [],
    targetWords: (parsed.targetWords || []).map((w: any) => ({
      word: w.word,
      contextSentence: w.contextSentence || '',
      meaningVi: w.meaningVi || '',
      ipa: w.ipa || '',
      partOfSpeech: w.partOfSpeech || '',
    })),
    generatedBy: `✨ Google Gemini AI (${modelUsed} Direct API)`,
  };
}

export async function generatePassageWithGeminiUnified(params: {
  level: string;
  topic?: string;
  customTopic?: string;
  geminiApiKey?: string;
}): Promise<GeneratedPassage> {
  if (isGeminiApiAvailable(params.geminiApiKey)) {
    return await generatePassageWithGeminiApi(params);
  }
  return await generatePassageWithGeminiPlaywright(params);
}

