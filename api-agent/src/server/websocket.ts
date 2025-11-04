/**
 * WebSocket Server for real-time agent communication
 */

import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { WSMessage, AgentStatusData, ApprovalRequest, ApprovalResponse } from '../types/agent';
import { executeCommand } from '../agents/agent-factory';

export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private httpServer: any = null;
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();
  private approvalCallbacks: Map<string, (response: ApprovalResponse) => void> = new Map();

  /**
   * Initialize WebSocket server
   */
  async start(): Promise<void> {
    const config = getConfig();

    // Create HTTP server
    this.httpServer = createServer((req, res) => {
      // Handle HTTP requests
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      if (req.url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'online',
          provider: config.llmProvider,
          model: config.claude.modelName,
          timestamp: new Date().toISOString(),
        }));
        return;
      }

      if (req.url === '/execute' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { command, prompt, history } = JSON.parse(body);
            const commandText = command || prompt;

            if (!commandText) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Missing command' }));
              return;
            }

            logger.info(`Executing command via HTTP: ${commandText}`);
            if (history && history.length > 0) {
              logger.info(`With conversation history: ${history.length} messages`);
            }
            
            const result = await executeCommand(commandText, history || []);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              output: result.output,
              timestamp: new Date().toISOString(),
            }));
          } catch (error: any) {
            logger.error('Command execution failed:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: error.message || 'Command execution failed',
            }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    // Create Socket.IO server
    this.io = new SocketIOServer(this.httpServer, {
      path: config.wsPath,
      cors: {
        origin: config.wsCorsOrigin,
        credentials: true,
      },
    });

    // Setup event handlers
    this.setupEventHandlers();

    // Start listening
    return new Promise((resolve) => {
      this.httpServer.listen(config.port, config.host, () => {
        logger.info(`✅ WebSocket server running`, {
          url: `http://${config.host}:${config.port}${config.wsPath}`,
          cors: config.wsCorsOrigin,
        });
        resolve();
      });
    });
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join admin room (all admin users)
      socket.join('admin');

      // Send current agent status
      this.sendMessage(socket.id, {
        type: 'agent_status',
        data: { status: 'idle' } as AgentStatusData,
        timestamp: new Date(),
      });

      // Handle approval responses
      socket.on('approval_response', (response: ApprovalResponse) => {
        logger.info(`Received approval response`, response);
        this.handleApprovalResponse(response);
      });

      // Handle ping
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Send message to specific client
   */
  sendMessage(clientId: string, message: WSMessage): void {
    if (!this.io) {
      logger.warn('Cannot send message: WebSocket server not initialized');
      return;
    }

    this.io.to(clientId).emit(message.type, message);
  }

  /**
   * Broadcast message to all admin users
   */
  broadcast(message: WSMessage): void {
    if (!this.io) {
      logger.warn('Cannot broadcast: WebSocket server not initialized');
      return;
    }

    logger.debug(`Broadcasting message: ${message.type}`, message.data);
    this.io.to('admin').emit(message.type, message);
  }

  /**
   * Send agent status update
   */
  sendStatus(status: AgentStatusData): void {
    this.broadcast({
      type: 'agent_status',
      data: status,
      timestamp: new Date(),
    });
  }

  /**
   * Send agent log entry
   */
  sendLog(logData: any): void {
    this.broadcast({
      type: 'agent_log',
      data: logData,
      timestamp: new Date(),
    });
  }

  /**
   * Send agent response
   */
  sendResponse(responseData: any): void {
    this.broadcast({
      type: 'agent_response',
      data: responseData,
      timestamp: new Date(),
    });
  }

  /**
   * Request approval from admin
   * Returns a promise that resolves when admin responds
   */
  async requestApproval(approval: ApprovalRequest): Promise<ApprovalResponse> {
    logger.info(`Requesting approval: ${approval.action}`, approval);

    // Store pending approval
    this.pendingApprovals.set(approval.id, approval);

    // Broadcast approval request to all admins
    this.broadcast({
      type: 'approval_required',
      data: approval,
      timestamp: new Date(),
    });

    // Wait for approval response with timeout
    return new Promise((resolve) => {
      // Setup timeout
      const timeoutId = setTimeout(() => {
        logger.warn(`Approval timeout: ${approval.id}`);
        this.approvalCallbacks.delete(approval.id);
        this.pendingApprovals.delete(approval.id);
        resolve({
          id: approval.id,
          approved: false,
          reason: 'Approval request timed out',
          timestamp: new Date(),
        });
      }, approval.timeout);

      // Setup callback for approval response
      this.approvalCallbacks.set(approval.id, (response: ApprovalResponse) => {
        clearTimeout(timeoutId);
        this.approvalCallbacks.delete(approval.id);
        this.pendingApprovals.delete(approval.id);
        resolve(response);
      });
    });
  }

  /**
   * Handle approval response from admin
   */
  private handleApprovalResponse(response: ApprovalResponse): void {
    const callback = this.approvalCallbacks.get(response.id);
    
    if (callback) {
      logger.info(`Approval ${response.approved ? 'approved' : 'rejected'}: ${response.id}`);
      callback(response);
    } else {
      logger.warn(`No callback found for approval: ${response.id}`);
    }
  }

  /**
   * Get all pending approvals
   */
  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values());
  }

  /**
   * Stop WebSocket server
   */
  async stop(): Promise<void> {
    if (this.io) {
      await new Promise<void>((resolve) => {
        this.io!.close(() => {
          logger.info('WebSocket server stopped');
          resolve();
        });
      });
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => {
          logger.info('HTTP server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Get connected clients count
   */
  getConnectedClients(): number {
    return this.io?.sockets.sockets.size || 0;
  }
}

// Export singleton instance
export const wsServer = new WebSocketServer();
