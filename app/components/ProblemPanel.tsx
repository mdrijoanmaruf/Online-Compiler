'use client'

import { useEffect, useRef } from 'react'
import type { ProblemPayload } from '../types/problem'

interface ProblemPanelProps {
  problem: ProblemPayload
  isDark: boolean
  onClose: () => void
}

export default function ProblemPanel({ problem, isDark, onClose }: ProblemPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const border = isDark ? 'border-white/10' : 'border-gray-200'
  const bg = isDark ? 'bg-slate-900/80' : 'bg-white'
  const text = isDark ? 'text-slate-200' : 'text-gray-800'
  const muted = isDark ? 'text-slate-400' : 'text-gray-500'
  const tagBg = isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
  const headerBg = isDark ? 'bg-slate-800/60' : 'bg-gray-50'

  // Sanitize and inject HTML
  useEffect(() => {
    if (!contentRef.current || !problem.statementHtml) return

    let sanitized = problem.statementHtml
    // Strip script tags and event handlers — lightweight sanitization
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '')
    sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '')
    sanitized = sanitized.replace(/\s*on\w+='[^']*'/gi, '')

    contentRef.current.innerHTML = sanitized
  }, [problem.statementHtml])

  return (
    <div
      className={`flex flex-col h-full ${bg} border-r ${border} overflow-hidden`}
      style={{ width: '300px', minWidth: '240px', maxWidth: '360px' }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 ${headerBg} border-b ${border} shrink-0`}>
        <div className="flex-1 min-w-0">
          <h2 className={`text-xs font-bold ${text} truncate`}>{problem.problemName}</h2>
          <div className={`flex items-center gap-2 text-[10px] ${muted} mt-0.5 flex-wrap`}>
            {problem.timeLimit && <span>⏱ {problem.timeLimit}</span>}
            {problem.memoryLimit && <span>💾 {problem.memoryLimit}</span>}
            {problem.rating && <span>★ {problem.rating}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <a
            href={problem.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs ${muted} hover:text-blue-400 transition-colors px-1`}
            title="View on Codeforces"
          >
            ↗ CF
          </a>
          <button
            type="button"
            onClick={onClose}
            className={`text-xs ${muted} hover:text-red-400 transition-colors px-1`}
            title="Close problem panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tags */}
      {problem.tags.length > 0 && (
        <div className={`px-3 py-2 flex flex-wrap gap-1 border-b ${border} shrink-0`}>
          {problem.tags.map(tag => (
            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${tagBg}`}>{tag}</span>
          ))}
        </div>
      )}

      {/* Problem statement */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          ref={contentRef}
          className={`px-3 py-2 text-xs ${text} problem-statement-render`}
        />
      </div>
    </div>
  )
}
