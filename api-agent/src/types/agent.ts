/**
 * Type definitions for the AI Agent Service
 */

// Agent State for LangGraph
export interface AgentState {
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp?: Date;
  }>;
  userPrompt: string;
  plan?: string;
  currentAction?: string;
  toolResults?: ToolResult[];
  error?: string;
  needsApproval?: boolean;
  approvalData?: ApprovalRequest;
  finalResponse?: string;
  metadata?: Record<string, any>;
}

// Tool execution result
export interface ToolResult {
  toolName: string;
  input: Record<string, any>;
  output: any;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Approval workflow
export interface ApprovalRequest {
  id: string;
  action: string;
  description: string;
  data: Record<string, any>;
  timestamp: Date;
  timeout: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
}

export interface ApprovalResponse {
  id: string;
  approved: boolean;
  reason?: string;
  timestamp: Date;
}

// WebSocket message types
export type WSMessageType =
  | 'agent_status'
  | 'agent_log'
  | 'agent_response'
  | 'approval_required'
  | 'approval_response'
  | 'error'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  data: any;
  timestamp: Date;
  sessionId?: string;
}

// Agent status
export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'waiting_approval' | 'error' | 'offline';

export interface AgentStatusData {
  status: AgentStatus;
  currentTask?: string;
  startTime?: Date;
  llmStatus?: 'connected' | 'disconnected' | 'loading';
}

// LLM Configuration
export interface LLMConfig {
  baseURL: string;
  apiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  autoLoad: boolean;
}

export type LLMProvider = 'claude';

// Claude configuration
export interface ClaudeConfig {
  apiKey: string;
  apiUrl: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
}

// Action API Response (from Next.js backend)
export interface ActionAPIResponse {
  success: boolean;
  action: string;
  timestamp: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  logId?: number;
}

// Memory store entry
export interface MemoryEntry {
  id: string;
  timestamp: Date;
  userPrompt: string;
  agentResponse: string;
  actions: string[];
  embedding?: number[];
  metadata?: Record<string, any>;
}

// Configuration
export interface AgentConfig {
  port: number;
  host: string;
  llmProvider: LLMProvider;
  claude: ClaudeConfig;
  nextjsApiUrl: string;
  nextjsApiTimeout: number;
  wsPath: string;
  wsCorsOrigin: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogsInMemory: number;
  approvalTimeout: number;
  maxRetries: number;
}
