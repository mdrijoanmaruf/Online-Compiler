'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { FiX, FiExternalLink, FiSend, FiClock, FiCpu, FiStar, FiTag } from 'react-icons/fi'
import type { ProblemPayload } from '../types/problem'

interface ProblemPanelProps {
  problem: ProblemPayload
  isDark: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function ProblemPanel({ problem, isDark, onClose, onSubmit }: ProblemPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!contentRef.current || !problem.statementHtml) return
    const sanitized = DOMPurify.sanitize(problem.statementHtml, {
      FORCE_BODY: true,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
    })
    contentRef.current.innerHTML = sanitized
  }, [problem.statementHtml])

  const d = {
    overlay:  isDark ? 'bg-black/75'                        : 'bg-black/50',
    modal:    isDark ? 'bg-slate-950 border-blue-500/20'        : 'bg-blue-50 border-blue-200',
    header:   isDark ? 'bg-linear-to-r from-blue-900/90 to-indigo-900/90 border-blue-500/30'     : 'bg-linear-to-r from-blue-100 to-indigo-100 border-blue-300',
    footer:   isDark ? 'bg-slate-900/60 border-blue-500/20'     : 'bg-blue-50 border-blue-200',
    title:    isDark ? 'text-white'                          : 'text-blue-950',
    muted:    isDark ? 'text-blue-300'                      : 'text-blue-700',
    body:     isDark ? 'text-slate-100'                      : 'text-slate-900',
    pill:     isDark ? 'bg-blue-800/60 text-blue-200 border-blue-600/50'
                     : 'bg-blue-100 text-blue-800 border-blue-300',
    metaPill: isDark ? 'bg-blue-700/60 text-blue-200 border-blue-600/40'
                     : 'bg-blue-100 text-blue-800 border-blue-300',
    closeBtn: isDark ? 'text-blue-300 hover:text-white hover:bg-blue-500/20'
                     : 'text-blue-600 hover:text-blue-900 hover:bg-blue-200/50',
    cfBtn:    isDark ? 'border-blue-600 text-blue-300 hover:bg-blue-500/20 hover:text-white'
                     : 'border-blue-300 text-blue-700 hover:bg-blue-100/70 hover:text-blue-900',
    submitBtn:'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
    divider:  isDark ? 'border-blue-500/20'                     : 'border-blue-300',
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
      className={`fixed inset-0 z-200 flex items-center justify-center p-4 ${d.overlay} backdrop-blur-sm`}
    >
      <div
        className={`relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border shadow-2xl ${d.modal} overflow-hidden`}
      >
        <div className={`shrink-0 px-6 py-5 border-b ${d.header} ${d.divider}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${d.metaPill}`}>
                  Codeforces
                </span>
                {problem.contestId && (
                  <span className={`text-xs ${d.muted}`}>
                    Contest {problem.contestId} · Problem {problem.problemIndex}
                  </span>
                )}
              </div>
              <h2 className={`text-lg font-bold leading-tight ${d.title} truncate`}>
                {problem.problemName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {problem.timeLimit && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${d.metaPill}`}>
                    <FiClock className="w-3 h-3" /> {problem.timeLimit}
                  </span>
                )}
                {problem.memoryLimit && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${d.metaPill}`}>
                    <FiCpu className="w-3 h-3" /> {problem.memoryLimit}
                  </span>
                )}
                {problem.rating && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${d.metaPill} ${ratingColor}`}>
                    <FiStar className="w-3 h-3" /> {problem.rating}
                  </span>
                )}
              </div>
              {problem.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <FiTag className={`w-3 h-3 ${d.muted} shrink-0`} />
                  {problem.tags.map(tag => (
                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-md border ${d.pill}`}>
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

        <div className={`flex-1 overflow-y-auto px-6 py-5 ${d.scrollbar}`}>
          <div
            ref={contentRef}
            className={`text-xl ${d.body} problem-statement-render leading-relaxed`}
          />
        </div>

        <div className={`shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t ${d.footer} ${d.divider}`}>
          <a
            href={problem.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${d.cfBtn}`}
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            View on Codeforces
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${d.cfBtn}`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className={`inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors ${d.submitBtn}`}
              title="Open Codeforces submit page with your code pre-filled"
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
