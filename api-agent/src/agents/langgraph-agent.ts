import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AgentLogger, AgentLogDetail } from "../lib/agent-logger";
import { LMStudioUtils } from "../lib/lmstudio-utils";
import { config } from "../lib/config";
import { DatabaseTool } from "../tools/database";
import { BlogTool } from "../tools/blog";
import { OrdersTool } from "../tools/orders";
import { TicketsTool } from "../tools/tickets";
import { SiteControlTool } from "../tools/site-control";

// Define the state interface for our agent
export interface AgentState {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }>;
  currentTask: string;
  taskStatus:
    | "planning"
    | "executing"
    | "observing"
    | "reflecting"
    | "completed"
    | "failed";
  toolResults: Array<{
    tool: string;
    action: string;
    result: any;
    timestamp: Date;
    success: boolean;
  }>;
  reflection: string;
  nextAction: string;
  error?: string;
  taskId: string;
}

export interface AgentResult {
  response: string;
  details: AgentLogDetail[];
  taskId: string;
}

export class LangGraphAgent {
  private llm: ChatOpenAI;
  private logger: AgentLogger;
  private tools: {
    database: DatabaseTool;
    blog: BlogTool;
    orders: OrdersTool;
    tickets: TicketsTool;
    siteControl: SiteControlTool;
  };
  private graph: StateGraph<AgentState>;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: LMStudioUtils.getModelName(),
      temperature: config.llm.model.temperature.main,
      openAIApiKey: config.llm.lmstudio.apiKey,
      configuration: {
        baseURL: `${config.llm.lmstudio.baseUrl}/v1`,
      },
    });

    this.logger = new AgentLogger();

    this.tools = {
      database: new DatabaseTool(),
      blog: new BlogTool(),
      orders: new OrdersTool(),
      tickets: new TicketsTool(),
      siteControl: new SiteControlTool(),
    };

    // Ensure the model is loaded in LMStudio if auto-loading is enabled
    if (config.features.autoModelLoading) {
      LMStudioUtils.ensureModelLoaded();
    }

    this.graph = this.createGraph();
  }

  private createGraph(): StateGraph<AgentState> {
    const workflow = new StateGraph<AgentState>({
      channels: {
        messages: {
          value: (x: AgentState["messages"], y: AgentState["messages"]) => [
            ...x,
            ...y,
          ],
          default: () => [],
        },
        currentTask: {
          value: (x: string, y: string) => y || x,
          default: () => "",
        },
        taskStatus: {
          value: (x: AgentState["taskStatus"], y: AgentState["taskStatus"]) =>
            y || x,
          default: () => "planning",
        },
        toolResults: {
          value: (
            x: AgentState["toolResults"],
            y: AgentState["toolResults"]
          ) => [...x, ...y],
          default: () => [],
        },
        reflection: {
          value: (x: string, y: string) => y || x,
          default: () => "",
        },
        nextAction: {
          value: (x: string, y: string) => y || x,
          default: () => "",
        },
        error: {
          value: (x: string | undefined, y: string | undefined) => y || x,
          default: () => undefined,
        },
        taskId: {
          value: (x: string, y: string) => y || x,
          default: () => "",
        },
      },
    });

    // Add nodes for each step in the workflow
    workflow.addNode("plan", this.planNode.bind(this));
    workflow.addNode("execute", this.executeNode.bind(this));
    workflow.addNode("observe", this.observeNode.bind(this));
    workflow.addNode("reflect", this.reflectNode.bind(this));
    workflow.addNode("act", this.actNode.bind(this));

    // Define the workflow edges
    workflow.setEntryPoint("plan");

    workflow.addEdge("plan", "execute");
    workflow.addEdge("execute", "observe");
    workflow.addEdge("observe", "reflect");

    // Conditional edge from reflect to either act or end
    workflow.addConditionalEdges("reflect", this.shouldContinue.bind(this), {
      continue: "act",
      end: END,
    });

    workflow.addEdge("act", "execute");

    return workflow.compile();
  }

  private async planNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🤔 Planning phase...");

    const planningPrompt = `
You are an AI agent for an e-commerce platform. Your task is to: ${state.currentTask}

Analyze the task and create a detailed plan. Consider:
1. What information do you need to gather?
2. What actions need to be taken?
3. What tools should be used?
4. What is the expected outcome?

Respond with a clear, step-by-step plan.
`;

    try {
      const response = await this.llm.invoke(planningPrompt);
      const plan = response.content as string;

      return {
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Plan: ${plan}`,
            timestamp: new Date(),
          },
        ],
        taskStatus: "executing",
        nextAction: plan,
      };
    } catch (error) {
      console.error("Error in planning phase:", error);
      return {
        taskStatus: "failed",
        error: `Planning failed: ${error}`,
      };
    }
  }

  private async executeNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("⚡ Executing phase...");

    const task = state.currentTask.toLowerCase();
    const results: AgentState["toolResults"] = [];

    try {
      // Determine which tools to use based on the task
      if (
        task.includes("order") ||
        task.includes("refund") ||
        task.includes("delivery")
      ) {
        if (task.includes("refund")) {
          const orderId = this.extractOrderId(task);
          if (orderId) {
            const result = await this.tools.orders.refundOrder(orderId);
            results.push({
              tool: "orders",
              action: "refundOrder",
              result,
              timestamp: new Date(),
              success: true,
            });
          }
        } else if (task.includes("status")) {
          const orderId = this.extractOrderId(task);
          if (orderId) {
            const result = await this.tools.orders.updateOrderStatus(
              orderId,
              "DELIVERED"
            );
            results.push({
              tool: "orders",
              action: "updateOrderStatus",
              result,
              timestamp: new Date(),
              success: true,
            });
          }
        }
      } else if (task.includes("blog") || task.includes("post")) {
        if (task.includes("create")) {
          // Extract topic from the command
          const topic = task
            .replace(/create.*blog.*post.*about/i, "")
            .replace(/create.*post.*about/i, "")
            .trim();
          const finalTopic = topic || "AI trends in e-commerce";

          const result = await this.tools.blog.createPost(finalTopic);
          results.push({
            tool: "blog",
            action: "createPost",
            result,
            timestamp: new Date(),
            success: true,
          });
        }
      } else if (task.includes("ticket") || task.includes("support")) {
        if (task.includes("close")) {
          const ticketId = this.extractTicketId(task);
          if (ticketId) {
            const result = await this.tools.tickets.closeTicket(ticketId);
            results.push({
              tool: "tickets",
              action: "closeTicket",
              result,
              timestamp: new Date(),
              success: true,
            });
          }
        }
      } else if (task.includes("maintenance") || task.includes("cache")) {
        if (task.includes("maintenance")) {
          const result = await this.tools.siteControl.toggleMaintenanceMode(
            true
          );
          results.push({
            tool: "siteControl",
            action: "toggleMaintenanceMode",
            result,
            timestamp: new Date(),
            success: true,
          });
        } else if (task.includes("cache")) {
          const result = await this.tools.siteControl.clearCache();
          results.push({
            tool: "siteControl",
            action: "clearCache",
            result,
            timestamp: new Date(),
            success: true,
          });
        }
      }

      return {
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Executed actions: ${results
              .map((r) => r.action)
              .join(", ")}`,
            timestamp: new Date(),
          },
        ],
        toolResults: [...state.toolResults, ...results],
        taskStatus: "observing",
      };
    } catch (error) {
      console.error("Error in execution phase:", error);
      return {
        taskStatus: "failed",
        error: `Execution failed: ${error}`,
      };
    }
  }

  private async observeNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("👀 Observing phase...");

    const observationPrompt = `
Based on the executed actions, observe the results:

Tool Results:
${state.toolResults
  .map((r) => `- ${r.tool}.${r.action}: ${JSON.stringify(r.result)}`)
  .join("\n")}

Analyze:
1. Were the actions successful?
2. What was the outcome?
3. Are there any issues or unexpected results?
4. What should be the next steps?

Provide a clear observation of the current state.
`;

    try {
      const response = await this.llm.invoke(observationPrompt);
      const observation = response.content as string;

      return {
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Observation: ${observation}`,
            timestamp: new Date(),
          },
        ],
        taskStatus: "reflecting",
      };
    } catch (error) {
      console.error("Error in observation phase:", error);
      return {
        taskStatus: "failed",
        error: `Observation failed: ${error}`,
      };
    }
  }

  private async reflectNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🤔 Reflecting phase...");

    const reflectionPrompt = `
Reflect on the task execution so far:

Task: ${state.currentTask}
Actions Taken: ${state.toolResults.map((r) => r.action).join(", ")}
Current Status: ${state.taskStatus}

Consider:
1. Has the task been completed successfully?
2. Are there any remaining steps?
3. Should we continue with additional actions?
4. What is the final outcome?

Provide your reflection and determine if the task is complete or if more actions are needed.
`;

    try {
      const response = await this.llm.invoke(reflectionPrompt);
      const reflection = response.content as string;

      // Simple logic to determine if we should continue
      const shouldContinue =
        !reflection.toLowerCase().includes("complete") &&
        !reflection.toLowerCase().includes("finished") &&
        state.toolResults.length < 3; // Prevent infinite loops

      return {
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Reflection: ${reflection}`,
            timestamp: new Date(),
          },
        ],
        reflection,
        taskStatus: shouldContinue ? "executing" : "completed",
      };
    } catch (error) {
      console.error("Error in reflection phase:", error);
      return {
        taskStatus: "failed",
        error: `Reflection failed: ${error}`,
      };
    }
  }

  private async actNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("🎯 Acting phase...");

    // This node determines the next action based on reflection
    const actionPrompt = `
Based on your reflection, determine the next action:

Reflection: ${state.reflection}
Current Task: ${state.currentTask}

What should be the next specific action to take? Be precise and actionable.
`;

    try {
      const response = await this.llm.invoke(actionPrompt);
      const nextAction = response.content as string;

      return {
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Next Action: ${nextAction}`,
            timestamp: new Date(),
          },
        ],
        nextAction,
        taskStatus: "executing",
      };
    } catch (error) {
      console.error("Error in action phase:", error);
      return {
        taskStatus: "failed",
        error: `Action planning failed: ${error}`,
      };
    }
  }

  private shouldContinue(state: AgentState): "continue" | "end" {
    if (state.taskStatus === "completed" || state.taskStatus === "failed") {
      return "end";
    }
    return "continue";
  }

  private extractOrderId(task: string): string | null {
    const match = task.match(/order\s*#?(\d+)/i);
    return match ? match[1] : null;
  }

  private extractTicketId(task: string): string | null {
    const match = task.match(/ticket\s*#?(\d+)/i);
    return match ? match[1] : null;
  }

  async processCommand(command: string): Promise<AgentResult> {
    const taskId = `task_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log(`🚀 Processing command: ${command}`);

    // Log the task start
    const logEntry = await this.logger.logTask(
      taskId,
      `Processing command: ${command}`,
      "PENDING"
    );

    const initialState: AgentState = {
      messages: [
        {
          role: "user",
          content: command,
          timestamp: new Date(),
        },
      ],
      currentTask: command,
      taskStatus: "planning",
      toolResults: [],
      reflection: "",
      nextAction: "",
      taskId,
    };

    try {
      // Run the graph
      const finalState = await this.graph.invoke(initialState);

      // Convert tool results to AgentLogDetail format
      const details: AgentLogDetail[] = finalState.toolResults.map(
        (result) => ({
          action: `${result.tool}.${result.action}`,
          status: result.success ? "success" : "failed",
          timestamp: result.timestamp,
          details: result.result,
        })
      );

      // Update the log entry
      await this.logger.updateTaskStatus(
        logEntry.id,
        finalState.taskStatus === "completed" ? "SUCCESS" : "FAILED",
        details
      );

      // Generate final response
      const response = this.generateResponse(finalState);

      return {
        response,
        details,
        taskId,
      };
    } catch (error) {
      console.error("Error processing command:", error);

      // Update log entry with error
      await this.logger.updateTaskStatus(logEntry.id, "FAILED", [
        {
          action: "processCommand",
          status: "failed",
          timestamp: new Date(),
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      ]);

      return {
        response: `I encountered an error while processing your request: ${error}`,
        details: [
          {
            action: "processCommand",
            status: "failed",
            timestamp: new Date(),
            details: {
              error: error instanceof Error ? error.message : String(error),
            },
          },
        ],
        taskId,
      };
    }
  }

  private generateResponse(state: AgentState): string {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolResults = state.toolResults;

    if (state.taskStatus === "completed") {
      return `✅ Task completed successfully! ${lastMessage?.content || ""}`;
    } else if (state.taskStatus === "failed") {
      return `❌ Task failed: ${state.error || "Unknown error"}`;
    } else {
      return `🔄 Task in progress: ${lastMessage?.content || ""}`;
    }
  }
}
