import { config } from "./config";

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data?: unknown) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts =
    config.server.agent.websocket.reconnectAttempts;
  private reconnectDelay = config.server.agent.websocket.reconnectDelay;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || config.server.agent.url;
    const wsEndpoint =
      wsUrl.replace(/^http/, "ws") + config.server.agent.websocket.path;

    this.socket = new WebSocket(wsEndpoint);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");
      this.reconnectAttempts = 0;
      this.emit("connected");
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      this.emit("disconnected");
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(
        () => this.connect(),
        this.reconnectDelay * this.reconnectAttempts
      );
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendCommand(command: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "agent-command",
          command: command,
        })
      );
    }
  }

  on(event: string, callback: (data?: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data?: unknown) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
