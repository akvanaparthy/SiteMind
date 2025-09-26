import { LangGraphAgent } from "./langgraph-agent";

export interface AgentResult {
  response: string;
  details: AgentLogDetail[];
  taskId?: string;
}

export interface AgentLogDetail {
  action: string;
  status: "pending" | "success" | "failed";
  timestamp: Date;
  details?: unknown;
}

export class MainAgent {
  private langGraphAgent: LangGraphAgent;

  constructor() {
    this.langGraphAgent = new LangGraphAgent();
  }

  async processCommand(command: string, logId?: number): Promise<AgentResult> {
    return await this.langGraphAgent.processCommand(command);
  }
}
