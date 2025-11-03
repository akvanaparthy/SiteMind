'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useToast } from './ToastContext'

interface AgentMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  status?: 'pending' | 'success' | 'error'
  data?: any
}

interface AgentContextType {
  isConnected: boolean
  isExecuting: boolean
  messages: AgentMessage[]
  sendCommand: (command: string) => Promise<void>
  clearMessages: () => void
  agentStatus: 'online' | 'offline' | 'busy'
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'busy'>('offline')
  const { info, error } = useToast()

  // Check agent service connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/agent/command', {
          method: 'GET',
        })
        const result = await response.json()
        
        if (result.success) {
          setIsConnected(true)
          setAgentStatus('online')
          info('Agent Ready', 'AI agent service is online')
        }
      } catch (err) {
        setIsConnected(false)
        setAgentStatus('offline')
      }
    }

    checkConnection()

    // Poll every 30 seconds to check connection
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [info])

  const sendCommand = useCallback(
    async (command: string) => {
      if (isExecuting) {
        error('Busy', 'Agent is currently processing another command')
        return
      }

      // Add user message
      const userMessage: AgentMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'user',
        content: command,
        timestamp: new Date(),
        status: 'pending',
      }

      setMessages((prev) => [...prev, userMessage])
      setIsExecuting(true)
      setAgentStatus('busy')

      try {
        // Build conversation history (last 4 messages for context)
        const history = messages
          .slice(-4)
          .filter(msg => msg.role !== 'system' && msg.status === 'success')
          .map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'agent' as const,
            content: msg.content
          }))

        // Send command to Next.js API which forwards to agent service
        const response = await fetch('/api/agent/command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            command,
            history // Include conversation history for context
          }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Command failed')
        }

        // Extract and format the output
        let content: string
        const data = result.data

        if (data.output && typeof data.output === 'string') {
          content = data.output
        } else if (data.output && typeof data.output === 'object') {
          // Handle array or object output
          if (Array.isArray(data.output)) {
            content = data.output
              .filter((item: any) => item.type === 'text' || item.text)
              .map((item: any) => item.text || JSON.stringify(item))
              .join('\n\n')
          } else {
            content = JSON.stringify(data.output, null, 2)
          }
        } else {
          content = 'Command executed successfully'
        }

        // Add agent response message
        const agentMessage: AgentMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'agent',
          content: content,
          timestamp: new Date(),
          status: 'success',
          data: data.rawOutput || data.output,
        }

        setMessages((prev) => [...prev, agentMessage])
        info('Success', 'Command executed successfully')
      } catch (err: any) {
        const errorMessage: AgentMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'system',
          content: err.message || 'An error occurred',
          timestamp: new Date(),
          status: 'error',
        }

        setMessages((prev) => [...prev, errorMessage])
        error('Error', err.message || 'Failed to execute command')
      } finally {
        setIsExecuting(false)
        setAgentStatus(isConnected ? 'online' : 'offline')
      }
    },
    [isExecuting, isConnected, info, error]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <AgentContext.Provider
      value={{
        isConnected,
        isExecuting,
        messages,
        sendCommand,
        clearMessages,
        agentStatus,
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}
