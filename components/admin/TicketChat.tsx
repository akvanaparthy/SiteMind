'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Clock, Paperclip, X, File, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/contexts/ToastContext'
import useSWR, { mutate } from 'swr'

interface Attachment {
  name: string
  size: number
  type: string
  data: string // Base64 encoded data for simple storage
}

interface TicketMessage {
  id: number
  message: string
  senderId: number
  sender: {
    id: number
    name: string
    email: string
    role: string
  }
  isInternal: boolean
  attachments?: Attachment[]
  createdAt: string
}

interface TicketChatProps {
  ticketId: number
  currentUserId?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TicketChat({ ticketId, currentUserId = 1 }: TicketChatProps) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const { data, isLoading, error } = useSWR(
    `/api/tickets/${ticketId}/messages`,
    fetcher,
    { refreshInterval: 3000 } // Refresh every 3 seconds for live updates
  )

  const messages: TicketMessage[] = (data as any)?.data || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          message,
          isInternal,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      setMessage('')
      setAttachments([])
      setIsInternal(false)
      mutate(`/api/tickets/${ticketId}/messages`)
      success('Message sent successfully', 'Message Sent')
    } catch (err: any) {
      showError(err.message || 'Failed to send message', 'Send Failed')
    } finally {
      setIsSending(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 5 files
    if (attachments.length + files.length > 5) {
      showError('Maximum 5 attachments allowed', 'Attachment Limit')
      return
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        showError(`File "${file.name}" is too large. Max size is 5MB.`, 'File Too Large')
        continue
      }

      // Read file as base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Data = event.target?.result as string
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64Data,
        })

        // Update state when all files are processed
        if (newAttachments.length === files.length) {
          setAttachments((prev) => [...prev, ...newAttachments])
        }
      }
      reader.readAsDataURL(file)
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading messages..." />
  }

  if (error) {
    return (
      <div className="text-center py-8 text-danger-600">
        Error loading messages: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId
            const isAgent = msg.sender.role === 'ADMIN' || msg.sender.role === 'AI_AGENT'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isAgent
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  {isAgent ? (
                    <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-xs mb-1 opacity-75">
                      {msg.sender.name || 'User'}
                      {msg.isInternal && (
                        <Badge variant="warning" size="sm" className="ml-2">
                          Internal
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
                          >
                            <File className="w-3 h-3" />
                            <span className="flex-1 truncate">{attachment.name}</span>
                            <span className="text-slate-500">({formatFileSize(attachment.size)})</span>
                            <button
                              onClick={() => downloadAttachment(attachment)}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded"
            />
            Internal note (not visible to customer)
          </label>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-2 space-y-1">
            {attachments.map((attachment, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded"
              >
                <File className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="flex-1 truncate">{attachment.name}</span>
                <span className="text-slate-500 text-xs">({formatFileSize(attachment.size)})</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Paperclip className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || attachments.length >= 5}
            title="Attach files (max 5)"
          />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={2}
            disabled={isSending}
            fullWidth
          />
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || isSending}
            loading={isSending}
            icon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
