'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={this.handleReset} variant="primary">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="secondary">
                    Reload Page
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                      Error details (development only)
                    </summary>
                    <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-48">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
