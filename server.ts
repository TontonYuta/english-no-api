import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runChatbotPipeline } from './server/playwrightEngine';
import { buildChatbotPrompt } from './server/promptBuilders';
import { evaluateSpeechLocally } from './server/speechEvaluator';
import {
  AutomationStreamPayload,
  PipelineStepId,
  StepState,
  TaskType,
  ChatbotProvider,
  PlaywrightConfig,
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/@') && !req.originalUrl.startsWith('/src')) {
    console.log(`[${new Date().toLocaleTimeString()}] [REQ] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'PlayEng Studio',
    engine: 'playwright-core',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Playwright Engine Status endpoint
app.get('/api/playwright/status', (req: Request, res: Response) => {
  const profileDir = path.resolve(process.cwd(), '.playwright-profile');
  res.json({
    ready: true,
    supportedProviders: ['gemini', 'chatgpt'],
    defaultProvider: 'gemini',
    userDataDir: profileDir,
    headlessDefault: true,
    features: [
      'launchPersistentContext',
      'Anti-bot mitigation and stealth scripts',
      'DOM generation mutation tracker (3s stability window)',
      'Markdown and JSON extractor',
      'Pedagogical fallback generator for cloud sandboxes',
    ],
  });
});

// Evaluate user speech endpoint
app.post('/api/evaluate-speech', (req: Request, res: Response) => {
  try {
    const { speechText = '', scenario = '', userRole = '', aiRole = '', targetDifficulty = 'B2', lang = 'vi' } = req.body;
    const result = evaluateSpeechLocally({
      speechText,
      scenario,
      userRole,
      aiRole,
      targetDifficulty,
      lang,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Presets endpoint
app.get('/api/playwright/presets', (req: Request, res: Response) => {
  res.json({
    writing: {
      topic: 'The impact of artificial intelligence on future employment and societal equality',
      targetBand: 'C1',
      sampleEssay: `In today's fast changing world, artificial intelligence is developing more and more faster. Many people believe that AI will replace many human jobs and make workers to lose their careers. On the other hand, others think that it will create new opportunities and make our work more easier and productive. In my personal opinion, although technology causes some short term problems, government should to invest in education and training programs so workers can adapt on this transformation. Overall, AI is a very big benefit if we use it wisely.`,
    },
    vocab: {
      term: 'Cut corners',
      context: 'Professional engineering and corporate management ethics',
      targetLevel: 'Upper-Intermediate / Advanced',
    },
    roleplay: {
      scenario: 'Airport check-in with 2.5kg excess baggage and tight departure window',
      userRole: 'Passenger (Alex)',
      aiRole: 'SkyWings Check-in Agent (Marcus)',
      tone: 'Polite negotiation with travel urgency',
    },
    quiz: {
      topic: 'Inverted Conditionals and Mixed Hypotheticals in Formal English',
      difficulty: 'C1 (Advanced)',
    },
  });
});

// SSE Pipeline Execution Handler
async function handlePipelineExecution(
  req: Request,
  res: Response,
  taskType: TaskType,
  inputData: Record<string, unknown>,
  config: PlaywrightConfig
) {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendSSE = (payload: AutomationStreamPayload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  try {
    const { userPrompt } = buildChatbotPrompt(taskType, inputData);

    sendSSE({
      type: 'log',
      log: {
        id: `log-${Date.now()}-init`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        stepId: 'launching_browser',
        message: `Task started: [${taskType.toUpperCase()}] targeting ${config.provider.toUpperCase()} Web`,
        detail: `Headless: ${config.headless} | UserDataDir: ${config.userDataDir}`,
      },
    });

    console.log(`[PlayEng Task] Started [${taskType.toUpperCase()}] targeting ${config.provider.toUpperCase()} Web (Headless: ${config.headless})`);

    const result = await runChatbotPipeline({
      taskType,
      inputData,
      prompt: userPrompt,
      config,
      callbacks: {
        onStep: (stepId: PipelineStepId, status: StepState, subtext?: string) => {
          console.log(`[PlayEng Step] ${stepId} -> ${status}${subtext ? ` (${subtext})` : ''}`);
          sendSSE({
            type: 'step',
            stepId,
            stepStatus: status,
          });
        },
        onLog: (log) => {
          console.log(`[PlayEng Log][${log.level.toUpperCase()}] ${log.message}${log.detail ? ` | ${log.detail}` : ''}`);
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

    console.log(`[PlayEng Result] Successfully generated result for task [${taskType.toUpperCase()}]`);

    sendSSE({
      type: 'result',
      result,
    });

    sendSSE({
      type: 'done',
    });
  } catch (error: any) {
    console.error(`[PlayEng Error] ${error.message || error}`);
    sendSSE({
      type: 'error',
      error: error.message || 'Pipeline encountered a critical failure',
    });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}

// GET /api/playwright/stream (EventSource compatible)
app.get('/api/playwright/stream', async (req: Request, res: Response) => {
  try {
    const rawPayload = req.query.payload as string;
    let params: any = {};

    if (rawPayload) {
      try {
        params = JSON.parse(decodeURIComponent(rawPayload));
      } catch {
        params = req.query;
      }
    } else {
      params = req.query;
    }

    const taskType: TaskType = (params.taskType as TaskType) || 'writing';
    const provider: ChatbotProvider = (params.provider as ChatbotProvider) || 'gemini';
    const headless = params.headless !== 'false' && params.headless !== false;
    const userDataDir = (params.userDataDir as string) || '.playwright-profile';
    const simulateIfBlocked = params.simulateIfBlocked !== 'false' && params.simulateIfBlocked !== false;

    const config: PlaywrightConfig = {
      provider,
      headless,
      userDataDir,
      timeoutMs: 30000,
      simulateIfBlocked,
    };

    const inputData = params.inputData || params;

    await handlePipelineExecution(req, res, taskType, inputData, config);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/playwright/run (Alternative POST route with SSE stream)
app.post('/api/playwright/run', async (req: Request, res: Response) => {
  try {
    const { taskType = 'writing', inputData = {}, config = {} } = req.body;

    const fullConfig: PlaywrightConfig = {
      provider: config.provider || 'gemini',
      headless: config.headless !== false,
      userDataDir: config.userDataDir || '.playwright-profile',
      timeoutMs: config.timeoutMs || 30000,
      simulateIfBlocked: config.simulateIfBlocked !== false,
    };

    await handlePipelineExecution(req, res, taskType, inputData, fullConfig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PlayEng Studio] Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
