import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { MainAgent } from "./agents/main-agent";
import { AgentLogger } from "./lib/agent-logger";
import { config } from "./lib/config";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({
  server,
  path: config.server.websocket.path,
});

app.use(
  cors({
    origin: config.security.cors.origin,
    credentials: config.security.cors.credentials,
  })
);
app.use(express.json());

// Initialize agent
const agent = new MainAgent();
const logger = new AgentLogger();

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "agent-command") {
        const { command } = data;

        // Log the incoming command
        const logEntry = await logger.logTask(
          `command_${Date.now()}`,
          `Received command: ${command}`,
          "PENDING"
        );

        // Send acknowledgment
        ws.send(
          JSON.stringify({
            type: "agent-response",
            response: `Processing command: "${command}"`,
            logId: logEntry.id,
          })
        );

        try {
          // Process command with agent
          const result = await agent.processCommand(command, logEntry.id);

          // Update log with success
          await logger.updateTaskStatus(logEntry.id, "SUCCESS", result.details);

          // Send result
          ws.send(
            JSON.stringify({
              type: "agent-response",
              response: result.response,
              actions: result.details,
              logId: logEntry.id,
            })
          );
        } catch (error) {
          // Update log with failure
          await logger.updateTaskStatus(logEntry.id, "FAILED");

          // Send error response
          ws.send(
            JSON.stringify({
              type: "agent-response",
              response: `Error processing command: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
              logId: logEntry.id,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });

  // Send initial connection message
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to AI Agent service",
    })
  );
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Get agent logs endpoint
app.get("/logs", async (req, res) => {
  try {
    const logs = await logger.getTaskLogs(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

server.listen(config.server.port, config.server.host, () => {
  console.log(
    `AI Agent service running on ${config.server.host}:${config.server.port}`
  );
  console.log(
    `WebSocket server available at ws://${config.server.host}:${config.server.port}${config.server.websocket.path}`
  );
});
