'use client'

import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AgentProvider } from '@/contexts/AgentContext'
import { ErrorBoundary } from './ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AgentProvider>
            {children}
          </AgentProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
