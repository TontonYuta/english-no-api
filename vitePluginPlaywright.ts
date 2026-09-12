import type { Plugin, ViteDevServer } from 'vite';
import path from 'path';
import { runChatbotPipeline } from './server/playwrightEngine';
import { buildChatbotPrompt } from './server/promptBuilders';
import { evaluateSpeechLocally } from './server/speechEvaluator';
import {
  TaskType,
  ChatbotProvider,
  PlaywrightConfig,
  AutomationStreamPayload,
  PipelineStepId,
  StepState,
} from './src/types';

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

        // Handle /api/playwright/status
        if (req.url === '/api/playwright/status') {
          const profileDir = path.resolve(process.cwd(), '.playwright-profile');
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
        const provider: ChatbotProvider = params.provider || 'gemini';
        const headless = params.headless !== false;
        const userDataDir = params.userDataDir || '.playwright-profile';
        const simulateIfBlocked = params.simulateIfBlocked !== false;

        const config: PlaywrightConfig = {
          provider,
          headless,
          userDataDir,
          timeoutMs: 30000,
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
