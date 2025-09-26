import { ChatOpenAI } from "@langchain/openai";
import { AgentLogger, AgentLogDetail } from "../lib/agent-logger";
import { LMStudioUtils } from "../lib/lmstudio-utils";
import { config } from "../lib/config";
import { DatabaseTool } from "../tools/database";
import { BlogTool } from "../tools/blog";
import { OrdersTool } from "../tools/orders";
import { TicketsTool } from "../tools/tickets";
import { SiteControlTool } from "../tools/site-control";

export interface AgentResult {
  response: string;
  details: AgentLogDetail[];
}

export class MainAgent {
  private llm: ChatOpenAI;
  private logger: AgentLogger;
  private tools: {
    database: DatabaseTool;
    blog: BlogTool;
    orders: OrdersTool;
    tickets: TicketsTool;
    siteControl: SiteControlTool;
  };

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
  }

  async processCommand(command: string, logId: number): Promise<AgentResult> {
    const details: AgentLogDetail[] = [];

    try {
      // Parse the command to determine intent
      const intent = await this.parseIntent(command);
      details.push({
        action: `Parsed intent: ${intent.type}`,
        status: "success",
        timestamp: new Date(),
        details: JSON.stringify(intent),
      });

      // Execute the appropriate tool based on intent
      let result: string;

      switch (intent.type) {
        case "order_management":
          result = await this.handleOrderManagement(intent, details);
          break;
        case "blog_management":
          result = await this.handleBlogManagement(intent, details);
          break;
        case "ticket_management":
          result = await this.handleTicketManagement(intent, details);
          break;
        case "site_management":
          result = await this.handleSiteManagement(intent, details);
          break;
        case "data_query":
          result = await this.handleDataQuery(intent, details);
          break;
        default:
          result = await this.handleGeneralQuery(command, details);
      }

      return {
        response: result,
        details,
      };
    } catch (error) {
      details.push({
        action: "Error processing command",
        status: "failed",
        timestamp: new Date(),
        details: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        response: `I encountered an error while processing your request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details,
      };
    }
  }

  private async parseIntent(command: string): Promise<any> {
    const prompt = `
    Analyze the following command and determine the intent. Return a JSON object with:
    - type: one of "order_management", "blog_management", "ticket_management", "site_management", "data_query", "general"
    - action: the specific action (e.g., "refund", "create_post", "close_ticket")
    - parameters: extracted parameters (e.g., order_id, ticket_id, etc.)
    
    Command: "${command}"
    
    Examples:
    - "Refund order #123" -> {"type": "order_management", "action": "refund", "parameters": {"order_id": "123"}}
    - "Create blog post about AI trends" -> {"type": "blog_management", "action": "create_post", "parameters": {"topic": "AI trends"}}
    - "Close ticket #456" -> {"type": "ticket_management", "action": "close_ticket", "parameters": {"ticket_id": "456"}}
    - "Enable maintenance mode" -> {"type": "site_management", "action": "maintenance_mode", "parameters": {"enabled": true}}
    `;

    const response = await this.llm.invoke(prompt);
    return JSON.parse(response.content as string);
  }

  private async handleOrderManagement(
    intent: any,
    details: AgentLogDetail[]
  ): Promise<string> {
    const { action, parameters } = intent;

    switch (action) {
      case "refund":
        details.push({
          action: "Processing order refund",
          status: "pending",
          timestamp: new Date(),
          details: `Order ID: ${parameters.order_id}`,
        });

        const refundResult = await this.tools.orders.refundOrder(
          parameters.order_id
        );
        details.push({
          action: "Order refund completed",
          status: "success",
          timestamp: new Date(),
          details: refundResult,
        });

        return `Successfully processed refund for order #${parameters.order_id}. ${refundResult}`;

      case "update_status":
        details.push({
          action: "Updating order status",
          status: "pending",
          timestamp: new Date(),
          details: `Order ID: ${parameters.order_id}, Status: ${parameters.status}`,
        });

        const statusResult = await this.tools.orders.updateOrderStatus(
          parameters.order_id,
          parameters.status
        );
        details.push({
          action: "Order status updated",
          status: "success",
          timestamp: new Date(),
          details: statusResult,
        });

        return `Order #${parameters.order_id} status updated to ${parameters.status}. ${statusResult}`;

      case "list_orders":
        details.push({
          action: "Fetching orders list",
          status: "pending",
          timestamp: new Date(),
        });

        const orders = await this.tools.orders.getOrders(parameters.status);
        details.push({
          action: "Orders list retrieved",
          status: "success",
          timestamp: new Date(),
          details: `Found ${orders.length} orders`,
        });

        return `Found ${orders.length} orders${
          parameters.status ? ` with status: ${parameters.status}` : ""
        }. ${orders
          .slice(0, 5)
          .map((o) => `Order #${o.orderId}: ${o.status} - $${o.total}`)
          .join(", ")}${orders.length > 5 ? "..." : ""}`;

      default:
        return `I can help you with order management. Available actions: refund, update_status, list_orders.`;
    }
  }

  private async handleBlogManagement(
    intent: any,
    details: AgentLogDetail[]
  ): Promise<string> {
    const { action, parameters } = intent;

    switch (action) {
      case "create_post":
        details.push({
          action: "Creating blog post",
          status: "pending",
          timestamp: new Date(),
          details: `Topic: ${parameters.topic}`,
        });

        const postResult = await this.tools.blog.createPost(
          parameters.topic,
          parameters.content
        );
        details.push({
          action: "Blog post created",
          status: "success",
          timestamp: new Date(),
          details: `Post ID: ${postResult.id}`,
        });

        return `Successfully created blog post "${postResult.title}". Post ID: ${postResult.id}`;

      case "list_posts":
        details.push({
          action: "Fetching blog posts",
          status: "pending",
          timestamp: new Date(),
        });

        const posts = await this.tools.blog.getPosts(parameters.status);
        details.push({
          action: "Blog posts retrieved",
          status: "success",
          timestamp: new Date(),
          details: `Found ${posts.length} posts`,
        });

        return `Found ${posts.length} blog posts${
          parameters.status ? ` with status: ${parameters.status}` : ""
        }. ${posts
          .slice(0, 3)
          .map((p) => `"${p.title}" (${p.status})`)
          .join(", ")}${posts.length > 3 ? "..." : ""}`;

      default:
        return `I can help you with blog management. Available actions: create_post, list_posts.`;
    }
  }

  private async handleTicketManagement(
    intent: any,
    details: AgentLogDetail[]
  ): Promise<string> {
    const { action, parameters } = intent;

    switch (action) {
      case "close_ticket":
        details.push({
          action: "Closing support ticket",
          status: "pending",
          timestamp: new Date(),
          details: `Ticket ID: ${parameters.ticket_id}`,
        });

        const closeResult = await this.tools.tickets.closeTicket(
          parameters.ticket_id
        );
        details.push({
          action: "Support ticket closed",
          status: "success",
          timestamp: new Date(),
          details: closeResult,
        });

        return `Successfully closed ticket #${parameters.ticket_id}. ${closeResult}`;

      case "list_tickets":
        details.push({
          action: "Fetching support tickets",
          status: "pending",
          timestamp: new Date(),
        });

        const tickets = await this.tools.tickets.getTickets(parameters.status);
        details.push({
          action: "Support tickets retrieved",
          status: "success",
          timestamp: new Date(),
          details: `Found ${tickets.length} tickets`,
        });

        return `Found ${tickets.length} support tickets${
          parameters.status ? ` with status: ${parameters.status}` : ""
        }. ${tickets
          .slice(0, 3)
          .map((t) => `Ticket #${t.ticketId}: ${t.subject} (${t.status})`)
          .join(", ")}${tickets.length > 3 ? "..." : ""}`;

      default:
        return `I can help you with ticket management. Available actions: close_ticket, list_tickets.`;
    }
  }

  private async handleSiteManagement(
    intent: any,
    details: AgentLogDetail[]
  ): Promise<string> {
    const { action, parameters } = intent;

    switch (action) {
      case "maintenance_mode":
        details.push({
          action: "Toggling maintenance mode",
          status: "pending",
          timestamp: new Date(),
          details: `Enabled: ${parameters.enabled}`,
        });

        const maintenanceResult =
          await this.tools.siteControl.toggleMaintenanceMode(
            parameters.enabled
          );
        details.push({
          action: "Maintenance mode updated",
          status: "success",
          timestamp: new Date(),
          details: maintenanceResult,
        });

        return `Maintenance mode ${
          parameters.enabled ? "enabled" : "disabled"
        }. ${maintenanceResult}`;

      case "clear_cache":
        details.push({
          action: "Clearing site cache",
          status: "pending",
          timestamp: new Date(),
        });

        const cacheResult = await this.tools.siteControl.clearCache();
        details.push({
          action: "Site cache cleared",
          status: "success",
          timestamp: new Date(),
          details: cacheResult,
        });

        return `Site cache cleared successfully. ${cacheResult}`;

      default:
        return `I can help you with site management. Available actions: maintenance_mode, clear_cache.`;
    }
  }

  private async handleDataQuery(
    intent: any,
    details: AgentLogDetail[]
  ): Promise<string> {
    details.push({
      action: "Executing data query",
      status: "pending",
      timestamp: new Date(),
      details: `Query type: ${intent.action}`,
    });

    const queryResult = await this.tools.database.query(
      intent.action,
      intent.parameters
    );
    details.push({
      action: "Data query completed",
      status: "success",
      timestamp: new Date(),
      details: `Results: ${queryResult.length} records`,
    });

    return `Query executed successfully. Found ${
      queryResult.length
    } records. ${JSON.stringify(queryResult.slice(0, 3))}${
      queryResult.length > 3 ? "..." : ""
    }`;
  }

  private async handleGeneralQuery(
    command: string,
    details: AgentLogDetail[]
  ): Promise<string> {
    details.push({
      action: "Processing general query",
      status: "pending",
      timestamp: new Date(),
      details: `Command: ${command}`,
    });

    const response = await this.llm.invoke(`
    You are an AI assistant for an e-commerce platform. The user has asked: "${command}"
    
    Please provide a helpful response. If this seems like a command that should be executed (like managing orders, creating content, etc.), 
    suggest the specific command format they should use.
    
    Available commands:
    - Order management: "Refund order #123", "Update order #456 status to delivered", "List all pending orders"
    - Blog management: "Create blog post about [topic]", "List all published posts"
    - Ticket management: "Close ticket #789", "List all open tickets"
    - Site management: "Enable maintenance mode", "Clear site cache"
    `);

    details.push({
      action: "General query processed",
      status: "success",
      timestamp: new Date(),
    });

    return response.content as string;
  }
}
