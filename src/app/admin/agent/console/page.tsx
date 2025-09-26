"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Brain, MessageSquare } from "lucide-react";
import { AgentChat } from "@/components/admin/AgentChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Navbar } from "@/components/admin/Navbar";

const quickCommands = [
  {
    title: "Order Management",
    commands: [
      "Refund order #123",
      "Update order #456 status to delivered",
      "List all pending orders",
    ],
  },
  {
    title: "Content Creation",
    commands: [
      "Create blog post about AI trends",
      "Generate product description for wireless headphones",
      "Write email template for order confirmation",
    ],
  },
  {
    title: "Support Tickets",
    commands: [
      "Close ticket #789",
      "List all open tickets",
      "Assign ticket #101 to support team",
    ],
  },
  {
    title: "Site Management",
    commands: [
      "Enable maintenance mode",
      "Clear site cache",
      "Generate site analytics report",
    ],
  },
];

export default function AgentConsolePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar title="AI Agent Console" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    AI Agent Console
                  </h1>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Interact with your AI agent to manage orders, create
                    content, handle support, and more.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <AgentChat />
          </motion.div>

          {/* Quick Commands & Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Agent Status */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-success-500" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Status
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-success-700">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Tasks Completed
                  </span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    1,247
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Success Rate
                  </span>
                  <span className="text-sm font-medium text-success-700 dark:text-success-300">
                    98.5%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Last Activity
                  </span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    2 min ago
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary-500" />
                  Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Order Management
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Content Creation
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Support Tickets
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Site Management
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Analytics & Reports
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Email Automation
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Commands */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary-500" />
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickCommands.map((category, index) => (
                    <div key={index}>
                      <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">
                        {category.title}
                      </h4>
                      <div className="space-y-1">
                        {category.commands.map((command, cmdIndex) => (
                          <div
                            key={cmdIndex}
                            className="text-xs text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 p-2 rounded cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                            onClick={() => {
                              // In real app, this would populate the chat input
                              console.log("Quick command:", command);
                            }}
                          >
                            {command}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
