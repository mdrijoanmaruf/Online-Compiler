'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export default class EditorErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Monaco editor failed to load:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 text-sm">
          <span className="text-2xl">⚠</span>
          <p>Editor failed to load.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="text-xs px-3 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
