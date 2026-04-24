'use client'

import { useEffect, useRef } from 'react'
import { FiX, FiExternalLink, FiSend, FiClock, FiCpu, FiStar, FiTag } from 'react-icons/fi'
import type { ProblemPayload } from '../types/problem'

interface ProblemPanelProps {
  problem: ProblemPayload
  isDark: boolean
  onClose: () => void
}

export default function ProblemPanel({ problem, isDark, onClose }: ProblemPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Sanitize and inject problem HTML
  useEffect(() => {
    if (!contentRef.current || !problem.statementHtml) return
    let sanitized = problem.statementHtml
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '')
    sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '')
    sanitized = sanitized.replace(/\s*on\w+='[^']*'/gi, '')
    contentRef.current.innerHTML = sanitized
  }, [problem.statementHtml])

  const d = {
    overlay:  isDark ? 'bg-black/70'                        : 'bg-black/40',
    modal:    isDark ? 'bg-slate-900 border-white/10'        : 'bg-white border-gray-200',
    header:   isDark ? 'bg-slate-800/80 border-white/10'     : 'bg-gray-50 border-gray-200',
    footer:   isDark ? 'bg-slate-800/60 border-white/10'     : 'bg-gray-50 border-gray-200',
    title:    isDark ? 'text-white'                          : 'text-gray-900',
    muted:    isDark ? 'text-slate-400'                      : 'text-gray-500',
    body:     isDark ? 'text-slate-200'                      : 'text-gray-800',
    pill:     isDark ? 'bg-slate-700/80 text-slate-300 border-slate-600/50'
                     : 'bg-gray-100 text-gray-600 border-gray-200',
    metaPill: isDark ? 'bg-slate-700/60 text-slate-300 border-slate-600/40'
                     : 'bg-blue-50 text-blue-700 border-blue-200',
    closeBtn: isDark ? 'text-slate-400 hover:text-white hover:bg-white/10'
                     : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
    cfBtn:    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
                     : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    submitBtn:'bg-blue-600 hover:bg-blue-700 text-white',
    divider:  isDark ? 'border-white/10'                     : 'border-gray-200',
    scrollbar:'custom-scrollbar',
  }

  const ratingColor = problem.rating
    ? parseInt(problem.rating) >= 2400 ? 'text-red-400'
    : parseInt(problem.rating) >= 2100 ? 'text-orange-400'
    : parseInt(problem.rating) >= 1900 ? 'text-violet-400'
    : parseInt(problem.rating) >= 1600 ? 'text-blue-400'
    : parseInt(problem.rating) >= 1400 ? 'text-cyan-400'
    : parseInt(problem.rating) >= 1200 ? 'text-green-400'
    : 'text-slate-400'
    : 'text-slate-400'

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${d.overlay} backdrop-blur-sm`}
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl border shadow-2xl ${d.modal} overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`shrink-0 px-5 py-4 border-b ${d.header} ${d.divider}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${d.metaPill}`}>
                  Codeforces
                </span>
                {problem.contestId && (
                  <span className={`text-[10px] ${d.muted}`}>
                    Contest {problem.contestId} · Problem {problem.problemIndex}
                  </span>
                )}
              </div>
              <h2 className={`text-base font-bold leading-tight ${d.title} truncate`}>
                {problem.problemName}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {problem.timeLimit && (
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${d.metaPill}`}>
                    <FiClock className="w-3 h-3" /> {problem.timeLimit}
                  </span>
                )}
                {problem.memoryLimit && (
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${d.metaPill}`}>
                    <FiCpu className="w-3 h-3" /> {problem.memoryLimit}
                  </span>
                )}
                {problem.rating && (
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${d.metaPill} ${ratingColor}`}>
                    <FiStar className="w-3 h-3" /> {problem.rating}
                  </span>
                )}
              </div>

              {/* Tags */}
              {problem.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <FiTag className={`w-3 h-3 ${d.muted} shrink-0`} />
                  {problem.tags.map(tag => (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-md border ${d.pill}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${d.closeBtn}`}
              title="Close (Esc)"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body — scrollable problem statement ── */}
        <div className={`flex-1 overflow-y-auto px-5 py-4 ${d.scrollbar}`}>
          <div
            ref={contentRef}
            className={`text-sm ${d.body} problem-statement-render`}
          />
        </div>

        {/* ── Footer ── */}
        <div className={`shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t ${d.footer} ${d.divider}`}>
          <a
            href={problem.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${d.cfBtn}`}
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            View on Codeforces
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${d.cfBtn}`}
            >
              Close
            </button>
            <button
              type="button"
              disabled
              title="Submit functionality coming soon"
              className={`inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${d.submitBtn} opacity-50 cursor-not-allowed`}
            >
              <FiSend className="w-3.5 h-3.5" />
              Submit on Codeforces
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
