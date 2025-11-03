/**
 * HTTP Server for agent API
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { executeCommand } from '../agents/agent-factory';
import { logger } from '../utils/logger';
import { getConfig } from '../utils/config';

const app = express();
const config = getConfig();

// Middleware
app.use(cors({
  origin: config.wsCorsOrigin,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Get agent status
app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    provider: config.provider,
    model: config.model,
    timestamp: new Date().toISOString(),
  });
});

// Execute command
app.post('/execute', async (req: Request, res: Response) => {
  try {
    const { command, prompt } = req.body;

    if (!command && !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: command or prompt',
      });
    }

    const commandText = command || prompt;
    logger.info(`Executing command via HTTP: ${commandText}`);

    const result = await executeCommand(commandText);

    res.json({
      success: true,
      output: result.output,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Command execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Command execution failed',
    });
  }
});

/**
 * Start HTTP server
 */
export function startHTTPServer(port: number = config.port): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      logger.info(`✅ HTTP API server running on http://localhost:${port}`);
      resolve();
    });
  });
}

export default app;
