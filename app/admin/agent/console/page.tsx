'use client'

// Force dynamic rendering - admin pages need auth context
export const dynamic = 'force-dynamic'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User as UserIcon, Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAgent } from '@/contexts/AgentContext'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTED_COMMANDS = [
  'Get all pending orders',
  'Show me open support tickets',
  'List all published blog posts',
  'Get site analytics',
  'Close ticket #1',
]

/**
 * Format message content for display
 */
function formatMessageContent(content: string): React.ReactNode {
  // Check if content looks like JSON
  if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content)
      // If it's an array of content blocks from Claude
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        return parsed
          .filter(block => block.type === 'text')
          .map((block, idx) => <div key={idx}>{block.text}</div>)
      }
      // Otherwise show formatted JSON
      return <pre className="font-mono text-xs overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>
    } catch {
      // Not valid JSON, treat as regular text
    }
  }
  
  // Regular text content
  return content
}

export default function AgentConsolePage() {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isConnected, isExecuting, messages, sendCommand, clearMessages, agentStatus } = useAgent()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || isExecuting) return

    sendCommand(inputValue)
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedCommand = (command: string) => {
    setInputValue(command)
    inputRef.current?.focus()
  }

  const getStatusColor = () => {
    if (!isConnected) return 'danger'
    if (isExecuting) return 'warning'
    return 'success'
  }

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected'
    if (isExecuting) return 'Processing...'
    return 'Online'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Agent Console
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Interact with the AI agent in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusColor()} dot>
            {getStatusText()}
          </Badge>
          {messages.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={clearMessages}
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Messages */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-300px)] flex flex-col" padding="none">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <EmptyState
                  icon={Bot}
                  title="Start a Conversation"
                  description="Send a command to the AI agent or try one of the suggested commands"
                />
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MessageBubble message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isConnected
                      ? 'Type a command for the agent...'
                      : 'Waiting for connection...'
                  }
                  disabled={!isConnected || isExecuting}
                  fullWidth
                />
                <Button
                  onClick={handleSend}
                  disabled={!isConnected || isExecuting || !inputValue.trim()}
                  icon={isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Suggested Commands */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold text-sm mb-4 text-slate-900 dark:text-slate-100">
              Suggested Commands
            </h3>
            <div className="space-y-2">
              {SUGGESTED_COMMANDS.map((command, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedCommand(command)}
                  disabled={!isConnected || isExecuting}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {command}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
                Agent Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status</span>
                  <Badge variant={getStatusColor()} size="sm" dot>
                    {agentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Messages</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-primary-600'
          : 'bg-slate-200 dark:bg-slate-700'
      }`}>
        {isUser ? (
          <UserIcon className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {formatMessageContent(message.content)}
          </div>
        </div>

        {/* Status & Timestamp */}
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.status && (
            <>
              <span>•</span>
              {message.status === 'success' && <CheckCircle className="w-3 h-3 text-success-500" />}
              {message.status === 'error' && <XCircle className="w-3 h-3 text-danger-500" />}
              {message.status === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
