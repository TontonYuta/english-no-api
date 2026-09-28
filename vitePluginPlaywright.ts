import type { Plugin, ViteDevServer } from 'vite';
import path from 'path';
import { chromium } from 'playwright-core';
import { runChatbotPipeline, ensurePlaywrightProfileClean, getDefaultProfileDir } from './server/playwrightEngine';
import { buildChatbotPrompt } from './server/promptBuilders';
import { evaluateSpeechLocally } from './server/speechEvaluator';
import { generateContextualReply } from './src/utils/chatUtils';
import { getTTSAudioBuffer } from './server/ttsService';
import { generateFreshPassage, sanitizePassageDirection } from './server/passageGenerator';
import { generatePassageWithGeminiUnified } from './server/geminiService';
import {
  TaskType,
  ChatbotProvider,
  PlaywrightConfig,
  AutomationStreamPayload,
  PipelineStepId,
  StepState,
} from './src/types';

let activeLoginContext: any = null;

/**
 * Vite Dev Server Plugin to handle Playwright automation & speech evaluation
 */
export function vitePluginPlaywright(): Plugin {
  return {
    name: 'vite-plugin-playwright-english',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /api/evaluate-speech
        if (req.url === '/api/evaluate-speech' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const result = evaluateSpeechLocally({
                speechText: data.speechText || '',
                scenario: data.scenario || '',
                userRole: data.userRole || '',
                aiRole: data.aiRole || '',
                targetDifficulty: data.targetDifficulty || 'B2',
                lang: data.lang || 'vi',
              });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Handle /api/chat-reply
        if (req.url === '/api/chat-reply' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const reply = generateContextualReply({
                scenario: data.scenario || '',
                userRole: data.userRole || 'Speaker',
                aiRole: data.aiRole || 'Partner',
                history: data.history || [],
                lastUserMessage: data.lastUserMessage || '',
                difficulty: data.difficulty || 'B2',
              });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(reply));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Handle /api/tts
        if (req.url?.startsWith('/api/tts')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const text = (urlObj.searchParams.get('text') || '').trim();
            const requestedVoice = urlObj.searchParams.get('voice') || urlObj.searchParams.get('lang') || 'en-US';

            if (!text) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Text query parameter is required' }));
              return;
            }

            const buffer = await getTTSAudioBuffer(text, requestedVoice);
            if (!buffer) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to synthesize speech audio' }));
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
            });
            res.end(buffer);
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Handle /api/passage/generate (POST and GET)
        if (req.url?.startsWith('/api/passage/generate')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const {
                  level = 'B2',
                  topic = 'tech',
                  customTopic,
                  provider = 'fast',
                  geminiApiKey,
                  direction = 'en_vi',
                } = data;

                if (provider === 'gemini') {
                  try {
                    const rawPassage = await generatePassageWithGeminiUnified({
                      level,
                      topic,
                      customTopic,
                      direction,
                      geminiApiKey,
                    });
                    const passage = sanitizePassageDirection(rawPassage, direction, level, topic, customTopic);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, passage, source: passage.generatedBy || 'gemini' }));
                    return;
                  } catch (geminiErr: any) {
                    const rawFallback = generateFreshPassage(level, topic, customTopic, direction);
                    const fallbackPassage = sanitizePassageDirection(rawFallback, direction, level, topic, customTopic);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(
                      JSON.stringify({
                        success: true,
                        passage: {
                          ...fallbackPassage,
                          generatedBy: '⚡ AI Siêu Tốc (Offline Fallback)',
                        },
                        source: 'fallback',
                        fallbackReason: geminiErr.message,
                      })
                    );
                    return;
                  }
                }

                const rawPassage = generateFreshPassage(level, topic, customTopic, direction);
                const passage = sanitizePassageDirection(rawPassage, direction, level, topic, customTopic);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, passage, source: 'fast' }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          } else if (req.method === 'GET') {
            try {
              const urlObj = new URL(req.url, 'http://localhost:3000');
              const level = urlObj.searchParams.get('level') || 'B2';
              const topic = urlObj.searchParams.get('topic') || undefined;
              const customTopic = urlObj.searchParams.get('customTopic') || undefined;
              const provider = urlObj.searchParams.get('provider') || 'fast';
              const direction = (urlObj.searchParams.get('direction') as any) || 'en_vi';
              const geminiApiKey = urlObj.searchParams.get('geminiApiKey') || undefined;

              if (provider === 'gemini') {
                try {
                  const rawPassage = await generatePassageWithGeminiUnified({
                    level,
                    topic,
                    customTopic,
                    direction,
                    geminiApiKey,
                  });
                  const passage = sanitizePassageDirection(rawPassage, direction, level, topic, customTopic);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, passage, source: passage.generatedBy || 'gemini' }));
                  return;
                } catch (geminiErr: any) {
                  const rawFallback = generateFreshPassage(level, topic, customTopic, direction);
                  const fallbackPassage = sanitizePassageDirection(rawFallback, direction, level, topic, customTopic);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      success: true,
                      passage: {
                        ...fallbackPassage,
                        generatedBy: '⚡ AI Siêu Tốc (Offline Fallback)',
                      },
                      source: 'fallback',
                    })
                  );
                  return;
                }
              }

              const rawPassage = generateFreshPassage(level, topic, customTopic, direction);
              const passage = sanitizePassageDirection(rawPassage, direction, level, topic, customTopic);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, passage, source: 'fast' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
            return;
          }
        }

        // Handle /api/playwright/status
        if (req.url === '/api/playwright/status') {
          const profileDir = getDefaultProfileDir();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ready: true,
              supportedProviders: ['gemini', 'chatgpt'],
              defaultProvider: 'gemini',
              userDataDir: profileDir,
              headlessDefault: true,
            })
          );
          return;
        }

        // Handle /api/playwright/open-login
        if (req.url === '/api/playwright/open-login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const provider = data.provider || 'gemini';
              const targetUrl = provider === 'chatgpt' ? 'https://chatgpt.com' : 'https://gemini.google.com/app';
              const profileDir = data.userDataDir ? path.resolve(data.userDataDir) : getDefaultProfileDir();

              if (activeLoginContext) {
                try {
                  const pages = activeLoginContext.pages();
                  if (pages.length > 0) {
                    await pages[0].bringToFront().catch(() => {});
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      success: true,
                      message: `Cửa sổ trình duyệt đăng nhập ${provider === 'gemini' ? 'Google Gemini' : 'ChatGPT'} đang mở. Vui lòng đăng nhập và đóng cửa sổ khi hoàn tất.`,
                    }));
                    return;
                  }
                } catch {
                  activeLoginContext = null;
                }
              }

              await ensurePlaywrightProfileClean(profileDir);

              const context = await chromium.launchPersistentContext(profileDir, {
                headless: false,
                args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
              });

              activeLoginContext = context;
              context.on('close', () => { activeLoginContext = null; });

              const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
              page.goto(targetUrl).catch(() => {});

              page.on('close', async () => {
                if (activeLoginContext && activeLoginContext.pages().length === 0) {
                  await activeLoginContext.close().catch(() => {});
                  activeLoginContext = null;
                }
              });

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                message: `Đã mở cửa sổ trình duyệt đăng nhập ${provider === 'gemini' ? 'Google Gemini' : 'ChatGPT'}. Đăng nhập xong bạn có thể đóng cửa sổ lại, phiên đăng nhập sẽ được lưu trữ tự động.`,
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Handle /api/playwright/close-login
        if (req.url === '/api/playwright/close-login' && req.method === 'POST') {
          try {
            if (activeLoginContext) {
              await activeLoginContext.close().catch(() => {});
              activeLoginContext = null;
            }
            const profileDir = getDefaultProfileDir();
            await ensurePlaywrightProfileClean(profileDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Đã đóng cửa sổ trình duyệt đăng nhập và giải phóng tài nguyên.' }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // Handle /api/playwright/stream
        if (!req.url?.startsWith('/api/playwright/stream')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost:3000');
        const rawPayload = urlObj.searchParams.get('payload');
        let params: any = {};

        if (rawPayload) {
          try {
            params = JSON.parse(decodeURIComponent(rawPayload));
          } catch {
            params = {};
          }
        }

        const taskType: TaskType = params.taskType || 'writing';
        const provider: ChatbotProvider = params.provider || 'fast';
        const headless = params.headless !== false;
        const userDataDir = params.userDataDir || '.playwright-profile';
        const simulateIfBlocked = params.simulateIfBlocked !== false;

        const config: PlaywrightConfig = {
          provider,
          headless,
          userDataDir,
          timeoutMs: 6000,
          simulateIfBlocked,
        };

        const inputData = params.inputData || {};

        // Setup SSE Headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        });

        const sendSSE = (payload: AutomationStreamPayload) => {
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        };

        try {
          const { userPrompt } = buildChatbotPrompt(taskType, inputData);

          sendSSE({
            type: 'log',
            log: {
              id: `log-vite-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              stepId: 'launching_browser',
              message: `Vite Plugin dispatched [${taskType.toUpperCase()}] targeting ${provider.toUpperCase()} Web`,
              detail: `Headless: ${headless}`,
            },
          });

          const result = await runChatbotPipeline({
            taskType,
            inputData,
            prompt: userPrompt,
            config,
            callbacks: {
              onStep: (stepId: PipelineStepId, status: StepState, subtext?: string) => {
                sendSSE({
                  type: 'step',
                  stepId,
                  stepStatus: status,
                });
              },
              onLog: (log) => {
                sendSSE({
                  type: 'log',
                  log: {
                    ...log,
                    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                });
              },
              onRawChunk: (chunk: string) => {
                sendSSE({
                  type: 'raw_chunk',
                  rawChunk: chunk,
                });
              },
            },
          });

          sendSSE({
            type: 'result',
            result,
          });

          sendSSE({
            type: 'done',
          });
        } catch (err: any) {
          sendSSE({
            type: 'error',
            error: err.message || 'Pipeline encountered error',
          });
        } finally {
          res.end();
        }
      });
    },
  };
}
