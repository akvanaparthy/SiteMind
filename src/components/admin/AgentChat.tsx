"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { wsClient } from "@/lib/websocket-client";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
  actions?: Array<{
    action: string;
    status: "pending" | "success" | "failed";
    details?: string;
  }>;
}

interface AgentChatProps {
  className?: string;
}

export function AgentChat({ className }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "agent",
      content:
        "Hello! I'm your AI assistant. I can help you manage orders, create blog posts, handle support tickets, and more. What would you like me to do?",
      timestamp: new Date(),
      status: "sent",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    wsClient.connect();

    // Set up event listeners
    wsClient.on("connected", () => {
      setIsConnected(true);
    });

    wsClient.on("disconnected", () => {
      setIsConnected(false);
    });

    wsClient.on("agent-response", (data: unknown) => {
      setIsTyping(false);
      const responseData = data as {
        response: string;
        actions?: Array<{
          action: string;
          status: "pending" | "success" | "failed";
          details?: string;
        }>;
      };
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "agent",
          content: responseData.response,
          timestamp: new Date(),
          status: "sent",
          actions: responseData.actions,
        },
      ]);
    });

    wsClient.on("agent-action", (data: unknown) => {
      // Update the last message with action details
      const actionData = data as {
        actions: Array<{
          action: string;
          status: "pending" | "success" | "failed";
          details?: string;
        }>;
      };
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.type === "agent") {
          lastMessage.actions = actionData.actions;
        }
        return newMessages;
      });
    });

    return () => {
      wsClient.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Send command to agent
    wsClient.sendCommand(inputValue);

    // Update message status
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg
        )
      );
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin text-slate-400" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-rose-500" />;
      case "sent":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getActionStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <Card variant="glass" className={className}>
      <CardContent className="p-0 h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  AI Agent Console
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className="text-xs text-slate-600">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
            {isTyping && (
              <div className="flex items-center space-x-1 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Agent is typing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? "bg-indigo-600"
                        : "bg-gradient-to-br from-indigo-600 to-purple-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs ${
                          message.type === "user"
                            ? "text-indigo-200"
                            : "text-slate-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.status && (
                        <div className="ml-2">
                          {getStatusIcon(message.status)}
                        </div>
                      )}
                    </div>

                    {/* Action Details */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="space-y-2">
                          {message.actions.map((action, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-xs"
                            >
                              {getActionStatusIcon(action.status)}
                              <span
                                className={
                                  message.type === "user"
                                    ? "text-indigo-200"
                                    : "text-slate-600"
                                }
                              >
                                {action.action}
                              </span>
                              {action.details && (
                                <span
                                  className={`text-xs ${
                                    message.type === "user"
                                      ? "text-indigo-300"
                                      : "text-slate-500"
                                  }`}
                                >
                                  - {action.details}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your command here... (e.g., 'Refund order #123', 'Create blog post about AI trends')"
                className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={2}
                disabled={!isConnected}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected}
              className="px-4 py-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
