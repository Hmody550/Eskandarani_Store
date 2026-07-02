/**
 * ErrorBoundary — catch client-side errors and show friendly message with details.
 */
'use client'

import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-x section-y text-center">
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-destructive/30 bg-destructive/5">
            <h2 className="text-xl font-bold mb-2 text-destructive">حدث خطأ</h2>
            <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message ?? 'خطأ غير معروف'}</p>
            <pre className="text-xs text-left bg-card p-3 rounded-lg overflow-auto max-h-40 mb-4" dir="ltr">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
