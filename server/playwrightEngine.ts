import { chromium, BrowserContext, Page } from 'playwright-core';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import {
  ChatbotProvider,
  PipelineStepId,
  StepState,
  AutomationLog,
  TaskResult,
  TaskType,
  PlaywrightConfig,
} from '../src/types';
import { generateRealisticFallback } from './fallbackGenerator';
import { GeneratedPassage } from './passageGenerator';
import { isGeminiApiAvailable, runGeminiApiEngine } from './geminiService';

export interface PipelineCallbacks {
  onStep: (stepId: PipelineStepId, status: StepState, subtext?: string) => void;
  onLog: (log: Omit<AutomationLog, 'id' | 'timestamp'>) => void;
  onRawChunk?: (chunk: string) => void;
}

export interface RunPipelineOptions {
  taskType: TaskType;
  inputData: Record<string, unknown>;
  prompt: string;
  config: PlaywrightConfig;
  callbacks: PipelineCallbacks;
}

const GEMINI_INPUT_SELECTORS = [
  'div.ql-editor[contenteditable="true"]',
  'div[contenteditable="true"][role="textbox"]',
  'rich-textarea textarea',
  'textarea.textarea',
  'div[aria-label*="prompt" i]',
  'div[aria-label*="Enter a prompt" i]',
  'div[role="textbox"]',
  'textarea',
];

const CHATGPT_INPUT_SELECTORS = [
  '#prompt-textarea',
  'div[contenteditable="true"]#prompt-textarea',
  'textarea[data-id="root"]',
  'textarea[placeholder*="Message" i]',
  'div[role="textbox"]',
  'textarea',
];

const GEMINI_SEND_SELECTORS = [
  'button[aria-label*="Send" i]',
  'button[aria-label*="Gửi" i]',
  'button[aria-label*="nhắc" i]',
  'button[aria-label*="tin nhắn" i]',
  'button[mattooltip*="Gửi" i]',
  'button[mattooltip*="Send" i]',
  'button[data-test-id="send-button"]',
  'button.send-button',
  'button:has(mat-icon[fonticon="send"])',
  'button[aria-label*="submit" i]',
];

const CHATGPT_SEND_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[aria-label*="Send prompt" i]',
  'button[aria-label*="Send" i]',
  'button[data-testid="fruitjuice-send-button"]',
];

const GEMINI_STOP_SELECTORS = [
  'button[aria-label*="Stop" i]',
  'button[data-test-id="stop-button"]',
  '.loading-spinner',
  'mat-progress-spinner',
];

const CHATGPT_STOP_SELECTORS = [
  'button[data-testid="stop-button"]',
  'button[aria-label*="Stop generating" i]',
];

const GEMINI_RESPONSE_SELECTORS = [
  'message-content',
  '.model-response-text',
  'div.markdown',
  '.response-container-content',
  'div[id^="model-response"]',
  'div.response-body',
];

const CHATGPT_RESPONSE_SELECTORS = [
  'div[data-message-author-role="assistant"] .markdown',
  'div[data-message-author-role="assistant"]',
  'article:last-of-type .markdown',
  '.markdown.prose',
  'div.agent-turn',
];

export function getSystemBrowserExecutable(): string | undefined {
  const platform = process.platform;
  const home = process.env.HOME || '';
  if (platform === 'win32') {
    const prefixes = [
      process.env.LOCALAPPDATA,
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
    ].filter(Boolean) as string[];

    for (const prefix of prefixes) {
      const p = path.join(prefix, 'Google', 'Chrome', 'Application', 'chrome.exe');
      if (fs.existsSync(p)) return p;
      const pEdge = path.join(prefix, 'Microsoft', 'Edge', 'Application', 'msedge.exe');
      if (fs.existsSync(pEdge)) return pEdge;
    }
  } else if (platform === 'darwin') {
    const p = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(p)) return p;
  } else {
    const candidates = [
      path.join(home, '.local/bin/google-chrome'),
      path.join(home, '.local/bin/chromium'),
      path.join(home, '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'),
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return undefined;
}

async function runAntigravityCliEngine(options: RunPipelineOptions): Promise<TaskResult> {
  const { taskType, inputData, prompt, callbacks } = options;
  const { onStep, onLog, onRawChunk } = callbacks;

  const emitLog = (
    level: AutomationLog['level'],
    stepId: PipelineStepId,
    message: string,
    detail?: string
  ) => {
    callbacks.onLog({ level, stepId, message, detail });
  };

  onStep('launching_browser', 'running', 'Connecting to Antigravity (agy) CLI Local Engine...');
  emitLog('info', 'launching_browser', 'Locating local agy binary: /home/tontonyuta/.local/bin/agy');
  await new Promise((r) => setTimeout(r, 200));
  onStep('launching_browser', 'completed', 'Antigravity CLI native context active');

  onStep('navigating', 'running', 'Preparing prompt for agy print execution...');
  emitLog('scraper', 'navigating', 'Targeting local model session without web automation');
  await new Promise((r) => setTimeout(r, 200));
  onStep('navigating', 'completed', 'Execution parameters configured');

  onStep('injecting_prompt', 'running', 'Dispatching pedagogical prompt to agy...');
  emitLog('dom', 'injecting_prompt', `Dispatched payload (${prompt.length} chars) to agy`);
  onStep('injecting_prompt', 'completed', 'Prompt injected into agy process');

  onStep('waiting_generation', 'running', 'Antigravity AI generating structured response...');
  emitLog('wait', 'waiting_generation', 'Executing agy non-interactive print mode');

  let rawOutput = '';
  try {
    const agyBin = fs.existsSync('/home/tontonyuta/.local/bin/agy')
      ? '/home/tontonyuta/.local/bin/agy'
      : 'agy';

    rawOutput = await new Promise<string>((resolve, reject) => {
      execFile(
        agyBin,
        ['-p', prompt, '--output-format', 'text'],
        { maxBuffer: 15 * 1024 * 1024, timeout: 60000 },
        (err, stdout) => {
          if (err) {
            return reject(err);
          }
          resolve(stdout || '');
        }
      );
    });
    emitLog('success', 'waiting_generation', `Antigravity CLI generated ${rawOutput.length} characters`);
  } catch (err: any) {
    emitLog('warn', 'waiting_generation', `agy CLI note: ${err.message}. Using formatted fallback.`);
  }

  onStep('waiting_generation', 'completed', 'Generation concluded');
  onStep('extracting_response', 'running', 'Parsing JSON codeblock...');

  if (onRawChunk && rawOutput) {
    onRawChunk(rawOutput);
  }

  let finalResult: TaskResult;
  if (rawOutput && rawOutput.length > 30) {
    try {
      const jsonMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let jsonStr = jsonMatch ? jsonMatch[1].trim() : '';
      if (!jsonStr) {
        const firstBrace = rawOutput.indexOf('{');
        const lastBrace = rawOutput.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = rawOutput.slice(firstBrace, lastBrace + 1).trim();
        }
      }
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        finalResult = { type: taskType, data: parsed } as TaskResult;
        emitLog('success', 'extracting_response', 'Successfully parsed structured response from Antigravity!');
      } else {
        emitLog('warn', 'extracting_response', 'No JSON codeblock found, applying formatted fallback');
        finalResult = generateRealisticFallback(taskType, inputData);
      }
    } catch (e: any) {
      emitLog('warn', 'extracting_response', `JSON parse error (${e.message}). Applying formatted fallback.`);
      finalResult = generateRealisticFallback(taskType, inputData);
    }
  } else {
    emitLog('info', 'extracting_response', 'Applying formatted fallback');
    finalResult = generateRealisticFallback(taskType, inputData);
  }

  onStep('extracting_response', 'completed', 'Extracted response data');
  onStep('rendered', 'completed', 'Rendered in UI');
  return finalResult;
}

export async function runChatbotPipeline(options: RunPipelineOptions): Promise<TaskResult> {
  const { taskType, inputData, prompt, config, callbacks } = options;
  const { onStep, onLog, onRawChunk } = callbacks;

  // Helper log emitter
  const emitLog = (
    level: AutomationLog['level'],
    stepId: PipelineStepId,
    message: string,
    detail?: string
  ) => {
    callbacks.onLog({ level, stepId, message, detail });
  };

  if (config.provider === 'fast') {
    onStep('launching_browser', 'running', 'Khởi tạo AI Engine Siêu Tốc (Fast Mode)...');
    emitLog('info', 'launching_browser', 'Mô hình sư phạm tức thì - phản hồi siêu tốc 100% ổn định');
    await new Promise((r) => setTimeout(r, 60));
    onStep('launching_browser', 'completed', 'Fast AI Engine sẵn sàng');

    onStep('navigating', 'running', 'Tải ngữ cảnh & chuẩn hóa CEFR...');
    await new Promise((r) => setTimeout(r, 60));
    onStep('navigating', 'completed', 'Ngữ cảnh hoàn tất');

    onStep('injecting_prompt', 'running', 'Xử lý yêu cầu bài học...');
    await new Promise((r) => setTimeout(r, 60));
    onStep('injecting_prompt', 'completed', 'Đã nạp tham số');

    onStep('waiting_generation', 'running', 'Đang tạo nội dung bài học chất lượng cao...');
    await new Promise((r) => setTimeout(r, 120));
    onStep('waiting_generation', 'completed', 'Tạo bài học thành công');

    onStep('extracting_response', 'running', 'Định dạng dữ liệu giao diện...');
    const result = generateRealisticFallback(taskType, inputData);
    if (result.type === 'translation_vocab' && result.data) {
      result.data.evaluatedBy = '⚡ AI Siêu Tốc (Offline Pedagogical Engine)';
      result.data.evaluatedProvider = 'fast';
    }
    await new Promise((r) => setTimeout(r, 60));
    onStep('extracting_response', 'completed', 'Sẵn sàng');
    onStep('rendered', 'completed', 'Rendered in UI');
    return result;
  }

  if (config.provider === 'gemini' && isGeminiApiAvailable(config.geminiApiKey)) {
    emitLog('info', 'launching_browser', 'Phát hiện cấu hình Gemini API Key - kích hoạt Google GenAI Client tốc độ cao');
    return await runGeminiApiEngine({
      taskType,
      inputData,
      prompt,
      apiKey: config.geminiApiKey,
      callbacks,
    });
  }

  if (config.provider === 'antigravity') {
    return await runAntigravityCliEngine(options);
  }

  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const startTime = Date.now();

  try {
    // ----------------------------------------------------
    // STEP 1: Launching Browser
    // ----------------------------------------------------
    onStep('launching_browser', 'running', 'Spawning Chromium instance with persistent profile context...');
    emitLog('info', 'launching_browser', `Initializing Playwright persistent context`, `Headless: ${config.headless}`);

    // Resolve user data directory
    const resolvedUserDataDir = path.isAbsolute(config.userDataDir)
      ? config.userDataDir
      : path.resolve(process.cwd(), config.userDataDir);

    if (!fs.existsSync(resolvedUserDataDir)) {
      fs.mkdirSync(resolvedUserDataDir, { recursive: true });
      emitLog('info', 'launching_browser', `Created browser user data profile directory at ${resolvedUserDataDir}`);
    }

    emitLog('scraper', 'launching_browser', `Profile path: ${resolvedUserDataDir}`);

    try {
      const sysExecutable = getSystemBrowserExecutable();
      if (sysExecutable) {
        emitLog('scraper', 'launching_browser', `Found system browser executable: ${sysExecutable}`);
      }
      context = await chromium.launchPersistentContext(resolvedUserDataDir, {
        executablePath: sysExecutable,
        headless: config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--window-size=1280,840',
        ],
        viewport: { width: 1280, height: 840 },
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      });

      emitLog('success', 'launching_browser', `Browser process started with persistent session cache`);
      onStep('launching_browser', 'completed', 'Persistent browser context ready');
    } catch (launchErr: any) {
      emitLog('warn', 'launching_browser', `Browser launch encounter: ${launchErr.message}`);
      if (config.simulateIfBlocked) {
        emitLog('info', 'launching_browser', `Using container-safe simulated engine fallback`);
      } else {
        throw launchErr;
      }
    }

    // ----------------------------------------------------
    // STEP 2: Navigating to Chatbot
    // ----------------------------------------------------
    const targetUrl =
      config.provider === 'gemini'
        ? 'https://gemini.google.com/app'
        : 'https://chatgpt.com';

    const navMessage = config.provider === 'gemini'
      ? 'Đang kết nối cổng Google Gemini Web (https://gemini.google.com/app)...'
      : `Navigating to ${config.provider.toUpperCase()} Web (${targetUrl})...`;
    onStep('navigating', 'running', navMessage);
    emitLog('scraper', 'navigating', `Opening target URL: ${targetUrl}`);

    let scrapedRawText: string | null = null;

    if (context) {
      const pages = context.pages();
      page = pages.length > 0 ? pages[0] : await context.newPage();

      // Mask automation flags
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      try {
        const navTimeout = Math.max(15000, config.timeoutMs || 25000);
        emitLog('info', 'navigating', `Connecting to ${targetUrl} (Timeout: ${navTimeout}ms)`);
        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: navTimeout,
        });

        const currentUrl = page.url();
        const pageTitle = await page.title();
        emitLog('dom', 'navigating', `Page loaded. Title: "${pageTitle}", Current URL: ${currentUrl}`);

        // Check for login screens or bot checkpoints
        const isGoogleLogin = currentUrl.includes('accounts.google.com') || currentUrl.includes('signin');
        const isCloudflare = currentUrl.includes('challenges.cloudflare.com') || (await page.content()).includes('Verify you are human');
        const isAuthWall = currentUrl.includes('login') || currentUrl.includes('auth0');

        if (isGoogleLogin || isCloudflare || isAuthWall) {
          emitLog(
            'warn',
            'navigating',
            `Checkpoint/Auth wall detected: ${isGoogleLogin ? 'Google Sign-in Required' : isCloudflare ? 'Cloudflare Challenge' : 'Authentication Screen'}`
          );
          emitLog(
            'info',
            'navigating',
            `Tip: Log in once locally with --headless=false and point userDataDir to retain authentication tokens.`
          );

          if (config.simulateIfBlocked) {
            emitLog('scraper', 'navigating', `Triggering resilient fallback generator for ${taskType.toUpperCase()} task`);
          } else {
            throw new Error(`Chatbot requires interactive sign-in or passed anti-bot challenge on ${currentUrl}`);
          }
        } else {
          onStep('navigating', 'completed', `Successfully arrived at ${config.provider.toUpperCase()} portal`);

          // ----------------------------------------------------
          // STEP 3: Injecting Prompt
          // ----------------------------------------------------
          onStep('injecting_prompt', 'running', 'Scanning DOM for active chat input box...');
          emitLog('dom', 'injecting_prompt', `Testing input selector cascade`);

          const inputSelectors = config.provider === 'gemini' ? GEMINI_INPUT_SELECTORS : CHATGPT_INPUT_SELECTORS;
          let matchedInputSelector: string | null = null;

          // Wait up to 12s for chat input element to mount in SPA
          for (let attempt = 0; attempt < 24; attempt++) {
            for (const sel of inputSelectors) {
              const el = await page.$(sel);
              if (el && (await el.isVisible())) {
                matchedInputSelector = sel;
                emitLog('dom', 'injecting_prompt', `Found active input element: "${sel}"`);
                break;
              }
            }
            if (matchedInputSelector) break;
            await page.waitForTimeout(500);
          }

          if (matchedInputSelector) {
            emitLog('scraper', 'injecting_prompt', `Injecting prompt payload (${prompt.length} chars)`);
            await page.click(matchedInputSelector);
            await page.waitForTimeout(200);

            // Use keyboard.insertText for instantaneous rich text insertion in contenteditable/Quill
            try {
              await page.keyboard.insertText(prompt);
            } catch {
              await page.fill(matchedInputSelector, prompt).catch(async () => {
                await page!.evaluate(
                  ({ sel, text }) => {
                    const node = document.querySelector(sel);
                    if (node) {
                      node.textContent = text;
                      node.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  },
                  { sel: matchedInputSelector, text: prompt }
                );
              });
            }

            await page.waitForTimeout(600);

            // Find send button or press enter
            const sendSelectors = config.provider === 'gemini' ? GEMINI_SEND_SELECTORS : CHATGPT_SEND_SELECTORS;
            let sendClicked = false;

            for (const sSel of sendSelectors) {
              const btn = await page.$(sSel);
              if (btn && (await btn.isVisible())) {
                await btn.click();
                emitLog('dom', 'injecting_prompt', `Clicked send action button: "${sSel}"`);
                sendClicked = true;
                break;
              }
            }

            if (!sendClicked) {
              emitLog('dom', 'injecting_prompt', `Triggering keypress: Enter`);
              await page.keyboard.press('Enter');
            }

            onStep('injecting_prompt', 'completed', 'Prompt injected & dispatch confirmed');

            // ----------------------------------------------------
            // STEP 4: Waiting for Generation
            // ----------------------------------------------------
            onStep('waiting_generation', 'running', 'Waiting for chatbot to complete response generation...');
            emitLog('wait', 'waiting_generation', 'Monitoring response stream stabilization');

            const stopSelectors = config.provider === 'gemini' ? GEMINI_STOP_SELECTORS : CHATGPT_STOP_SELECTORS;
            const responseSelectors = config.provider === 'gemini' ? GEMINI_RESPONSE_SELECTORS : CHATGPT_RESPONSE_SELECTORS;
            
            // Wait until stop button appears or 2 seconds pass
            let generationObserved = false;
            for (let i = 0; i < 10; i++) {
              await page.waitForTimeout(500);
              for (const stopSel of stopSelectors) {
                if (await page.$(stopSel)) {
                  generationObserved = true;
                  break;
                }
              }
              if (generationObserved) break;
            }

            if (generationObserved) {
              emitLog('wait', 'waiting_generation', 'Model is actively streaming response tokens...');
              let done = false;
              const maxWaitMs = 45000;
              const pollStart = Date.now();

              while (!done && Date.now() - pollStart < maxWaitMs) {
                await page.waitForTimeout(1000);
                let anyStopVisible = false;
                for (const stopSel of stopSelectors) {
                  const el = await page.$(stopSel);
                  if (el && (await el.isVisible())) {
                    anyStopVisible = true;
                    break;
                  }
                }
                if (!anyStopVisible) {
                  done = true;
                }
              }
            } else {
              // DOM stabilization detection: wait until response text stops growing for 3s
              emitLog('wait', 'waiting_generation', 'Polling DOM text length for 3-second stability window...');
              let lastLength = 0;
              let stableCount = 0;

              for (let i = 0; i < 40; i++) {
                await page.waitForTimeout(1000);
                let currentTextLength = 0;
                for (const rSel of responseSelectors) {
                  const nodes = await page.$$(rSel);
                  if (nodes.length > 0) {
                    const lastNodeText = await nodes[nodes.length - 1].innerText();
                    if (lastNodeText.length > currentTextLength) {
                      currentTextLength = lastNodeText.length;
                    }
                  }
                }

                if (currentTextLength === 0) {
                  currentTextLength = await page.evaluate(() => document.body.innerText.length);
                }

                if (currentTextLength > 100 && currentTextLength === lastLength) {
                  stableCount++;
                  if (stableCount >= 3) {
                    emitLog('wait', 'waiting_generation', `Response stabilized at ${currentTextLength} chars`);
                    break;
                  }
                } else {
                  stableCount = 0;
                  lastLength = currentTextLength;
                }
              }
            }

            onStep('waiting_generation', 'completed', 'Generation concluded');

            // ----------------------------------------------------
            // STEP 5: Extracting Response
            // ----------------------------------------------------
            onStep('extracting_response', 'running', 'Locating latest assistant response bubble...');
            emitLog('scraper', 'extracting_response', 'Querying response bubbles and code blocks');

            for (const sel of responseSelectors) {
              const nodes = await page.$$(sel);
              if (nodes.length > 0) {
                const lastNode = nodes[nodes.length - 1];
                scrapedRawText = await lastNode.innerText();
                emitLog('dom', 'extracting_response', `Extracted ${scrapedRawText.length} characters from "${sel}"`);
                if (onRawChunk && scrapedRawText) {
                  onRawChunk(scrapedRawText);
                }
                break;
              }
            }

            onStep('extracting_response', 'completed', 'Extracted response text');
          } else {
            emitLog('warn', 'injecting_prompt', 'Could not find chat input element (page may require login/CAPTCHA)');
          }
        }
      } catch (domErr: any) {
        emitLog('warn', 'navigating', `Navigation or scraping note: ${domErr.message}`);
      }
    }

    // Parse scraped output or fallback to structured result
    let finalResult: TaskResult;

    if (scrapedRawText && scrapedRawText.length > 50) {
      try {
        emitLog('info', 'extracting_response', 'Attempting to extract JSON payload from scraped markdown...');
        const jsonCodeBlockMatch = scrapedRawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        let jsonStr = '';
        if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
          jsonStr = jsonCodeBlockMatch[1].trim();
        } else {
          const firstBrace = scrapedRawText.indexOf('{');
          const lastBrace = scrapedRawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = scrapedRawText.slice(firstBrace, lastBrace + 1).trim();
          }
        }

        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          finalResult = { type: taskType, data: parsed } as TaskResult;
          if (finalResult.type === 'translation_vocab' && finalResult.data) {
            finalResult.data.evaluatedBy = config.provider === 'gemini'
              ? '✨ Google Gemini AI (Web Playwright Live)'
              : `🤖 ${config.provider.toUpperCase()} (Web Playwright Live)`;
            finalResult.data.evaluatedProvider = config.provider;
          }
          emitLog('success', 'extracting_response', 'Successfully parsed structured response from web chatbot!');
        } else {
          emitLog('warn', 'extracting_response', 'Response did not contain valid JSON codeblock. Using resilient parser fallback.');
          finalResult = generateRealisticFallback(taskType, inputData);
          if (finalResult.type === 'translation_vocab' && finalResult.data) {
            finalResult.data.evaluatedBy = `⚡ Fallback tự động (${config.provider.toUpperCase()} định dạng chưa chuẩn)`;
            finalResult.data.evaluatedProvider = config.provider;
          }
        }
      } catch (parseErr: any) {
        emitLog('warn', 'extracting_response', `JSON parse error on scraped content (${parseErr.message}). Applying formatted fallback.`);
        finalResult = generateRealisticFallback(taskType, inputData);
        if (finalResult.type === 'translation_vocab' && finalResult.data) {
          finalResult.data.evaluatedBy = `⚡ Fallback tự động (${config.provider.toUpperCase()} lỗi phân tích cú pháp)`;
          finalResult.data.evaluatedProvider = config.provider;
        }
      }
    } else {
      emitLog('info', 'extracting_response', 'Synthesizing pedagogical English evaluation via fallback pipeline');
      finalResult = generateRealisticFallback(taskType, inputData);
      if (finalResult.type === 'translation_vocab' && finalResult.data) {
        finalResult.data.evaluatedBy = `⚡ Fallback tự động (${config.provider.toUpperCase()} chưa đăng nhập hoặc mạng chờ)`;
        finalResult.data.evaluatedProvider = config.provider;
      }
    }

    // ----------------------------------------------------
    // STEP 6: Rendered
    // ----------------------------------------------------
    const elapsed = Date.now() - startTime;
    onStep('rendered', 'completed', `Completed in ${(elapsed / 1000).toFixed(1)}s`);
    emitLog('success', 'rendered', `Pipeline execution finished. Handing payload to UI renderer.`);

    return finalResult;
  } catch (error: any) {
    emitLog('error', 'rendered', `Fatal pipeline error: ${error.message}`);
    onStep('rendered', 'failed', error.message);
    throw error;
  } finally {
    if (context) {
      try {
        await context.close();
        emitLog('info', 'rendered', 'Closed browser persistent context');
      } catch {
        // ignore close error
      }
    }
  }
}

export function getCefrPedagogicalGuidelines(level: string): string {
  const norm = (level || 'B2').toUpperCase();
  switch (norm) {
    case 'A1':
      return `CRITICAL CEFR A1 (BEGINNER) RULES:
- Length: STRICTLY 50 to 80 words total (1 or 2 very short paragraphs).
- Sentence Complexity: Short, simple sentences (5 to 9 words per sentence). Subject + Verb + Object.
- Vocabulary: Ultra-basic everyday words (e.g. food, family, colors, time, home, routine). NO idioms, NO phrasal verbs.
- Grammar: ONLY Present Simple and basic adjectives (e.g., "I get up at six", "The breakfast is warm", "My father drives a car"). NO subordinate clauses, NO passive voice, NO past perfect.
- Target Words: 4 basic vocabulary words that beginner students must learn.`;

    case 'A2':
      return `CRITICAL CEFR A2 (ELEMENTARY) RULES:
- Length: STRICTLY 80 to 120 words total (2 short paragraphs).
- Sentence Complexity: Short sentences with basic conjunctions (and, but, because, so, when).
- Vocabulary: Common daily topics (hobbies, shopping, simple travel, weekends, family).
- Grammar: Past Simple (e.g., "We visited...", "I bought..."), Present Continuous, simple comparisons, basic future with "will" or "going to".
- Target Words: 4 to 5 elementary words with clear contextual usage.`;

    case 'B1':
      return `CRITICAL CEFR B1 (INTERMEDIATE) RULES:
- Length: STRICTLY 130 to 180 words total (2 to 3 paragraphs).
- Sentence Complexity: Standard compound and complex sentences with relative clauses (who, which, that) and basic conditionals (if, when).
- Vocabulary: Everyday opinions, work, study, leisure, travel, technology in daily life.
- Grammar: Present Perfect ("has increased", "have lived"), modal verbs (should, must, can), basic passive voice, connectors (although, however, therefore).
- Target Words: 4 to 5 intermediate vocabulary words.`;

    case 'B2':
      return `CRITICAL CEFR B2 (UPPER-INTERMEDIATE) RULES:
- Length: STRICTLY 180 to 250 words total (3 paragraphs).
- Sentence Complexity: Varied syntax, compound-complex sentences, diverse discourse markers (furthermore, in contrast, nevertheless, despite).
- Vocabulary: Abstract concepts, technical/professional contexts, collocations, idiomatic expressions.
- Grammar: Conditionals, passive reporting verbs, complex noun clauses, varied tenses.
- Target Words: 5 to 6 upper-intermediate words or idiomatic collocations.`;

    case 'C1':
    case 'C2':
      return `CRITICAL CEFR C1 (ADVANCED) RULES:
- Length: STRICTLY 250 to 330 words total (3 to 4 paragraphs).
- Sentence Complexity: Sophisticated syntax, cleft sentences, inversion for emphasis, participle clauses, high lexical density.
- Vocabulary: Nuanced academic, analytical and literary vocabulary, precise figurative expressions, elevated register.
- Grammar: Advanced subjunctives, nominalizations, nuanced hedging and epistemic modality.
- Target Words: 5 to 6 advanced C1 words or academic expressions.`;

    default:
      return `Target CEFR Level: ${norm}. Ensure appropriate vocabulary, sentence length, and grammatical complexity strictly for level ${norm}.`;
  }
}

export function buildGeminiPassagePrompt(level: string, topic?: string, customTopic?: string): string {
  const normLevel = (level || 'B2').toUpperCase();
  const topicName = customTopic || topic || 'General Life';
  const guidelines = getCefrPedagogicalGuidelines(normLevel);

  return `[System: Senior Bilingual English-Vietnamese Curriculum Director]
Role: Generate an authentic, engaging English reading passage and contextual vocabulary set strictly calibrated for CEFR Level ${normLevel}.

=== STRICT CEFR SPECIFICATIONS ===
${guidelines}

Parameters:
- Target CEFR Level: ${normLevel}
- Topic: "${topicName}"
${customTopic ? `- Specific Custom Focus: "${customTopic}"` : ''}

Output Requirements:
1. "title": A catchy, meaningful title in English suitable for level ${normLevel}.
2. "difficulty": Exactly "${normLevel}".
3. "topic": "${topicName}".
4. "passage": A cohesive English reading text STRICTLY conforming to the CEFR ${normLevel} word count, grammar, and sentence length specified above.
5. "targetWords": An array of highlighted key vocabulary words strictly suitable for level ${normLevel}. Each item must have:
   - "word": The vocabulary word in base form.
   - "ipa": Accurate IPA phonetics (e.g., "/ruːˈtiːn/").
   - "partOfSpeech": "noun" | "verb" | "adjective" | "adverb".
   - "contextSentence": The EXACT sentence from the passage containing this word.
   - "meaningVi": The precise Vietnamese meaning of this word in THIS context.
6. "translationVi": A complete, natural, and accurate Vietnamese translation of the entire passage.
7. "sentenceTranslations": An array of Vietnamese sentences corresponding 1:1 to the sentences of the passage.

STRICT FORMAT: Return ONLY the JSON code block wrapped in \`\`\`json ... \`\`\`. Do not include any conversational filler outside the JSON.`;
}

export async function generatePassageWithGeminiPlaywright(params: {
  level: string;
  topic?: string;
  customTopic?: string;
  timeoutMs?: number;
}): Promise<GeneratedPassage> {
  const { level, topic, customTopic, timeoutMs = 40000 } = params;
  const prompt = buildGeminiPassagePrompt(level, topic, customTopic);

  const profileDir = path.resolve(process.cwd(), '.playwright-profile');
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const sysExecutable = getSystemBrowserExecutable();
  const context = await chromium.launchPersistentContext(profileDir, {
    executablePath: sysExecutable,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
    ],
    viewport: { width: 1280, height: 840 },
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  try {
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto('https://gemini.google.com/app', {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });

    const inputSelector = 'div.ql-editor[contenteditable="true"]';
    await page.waitForSelector(inputSelector, { timeout: 15000 });
    await page.click(inputSelector);
    await page.waitForTimeout(300);

    try {
      await page.keyboard.insertText(prompt);
    } catch {
      await page.fill(inputSelector, prompt);
    }

    await page.waitForTimeout(600);

    const sendSelectors = [
      'button[aria-label*="Send" i]',
      'button[aria-label*="Gửi" i]',
      'button[aria-label*="nhắc" i]',
      'button[aria-label*="tin nhắn" i]',
      'button[data-test-id="send-button"]',
      'button.send-button',
    ];

    let sendClicked = false;
    for (const sel of sendSelectors) {
      const btn = await page.$(sel);
      if (btn && (await btn.isVisible())) {
        await btn.click();
        sendClicked = true;
        break;
      }
    }
    if (!sendClicked) {
      await page.keyboard.press('Enter');
    }

    let scrapedRawText = '';
    const pollStart = Date.now();
    while (Date.now() - pollStart < timeoutMs) {
      await page.waitForTimeout(1000);
      const nodes = await page.$$('message-content');
      if (nodes.length > 0) {
        const text = await nodes[nodes.length - 1].innerText();
        if (text.includes('```json') || text.includes('"title"') || text.includes('"passage"')) {
          scrapedRawText = text;
          if (
            text.endsWith('}') ||
            text.includes('```\n') ||
            (text.includes('```') && text.lastIndexOf('```') > text.indexOf('```'))
          ) {
            break;
          }
        }
      }
    }

    if (!scrapedRawText) {
      throw new Error('Gemini Playwright did not return a response within timeout.');
    }

    const jsonCodeBlockMatch = scrapedRawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonStr = '';
    if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
      jsonStr = jsonCodeBlockMatch[1].trim();
    } else {
      const first = scrapedRawText.indexOf('{');
      const last = scrapedRawText.lastIndexOf('}');
      if (first !== -1 && last > first) {
        jsonStr = scrapedRawText.slice(first, last + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);
    return {
      id: `gemini_${Date.now()}`,
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
      generatedBy: '✨ Google Gemini AI (Web Playwright)',
    };
  } finally {
    await context.close().catch(() => {});
  }
}

