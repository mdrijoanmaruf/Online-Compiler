'use client'

import type { ProblemPayload } from '../types/problem'

interface ProblemMetaBarProps {
  problem: ProblemPayload
  isDark: boolean
  onClear: () => void
}

export default function ProblemMetaBar({ problem, isDark, onClear }: ProblemMetaBarProps) {
  const border = isDark ? 'border-white/10' : 'border-blue-200/60'
  const bg = isDark ? 'bg-blue-500/10' : 'bg-blue-50'
  const text = isDark ? 'text-blue-200' : 'text-blue-900'
  const muted = isDark ? 'text-blue-300/70' : 'text-blue-600'

  return (
    <div className={`flex items-center gap-2 px-2 py-1 ${bg} border ${border} rounded-lg text-xs overflow-hidden`}>
      {/* CF badge */}
      <span className="shrink-0 font-bold text-orange-500 bg-orange-500/10 border border-orange-500/30 px-1.5 py-0.5 rounded text-[10px]">
        CF
      </span>

      {/* Problem name */}
      <span className={`font-semibold ${text} truncate max-w-[160px]`}>{problem.problemName}</span>

      {/* Separator */}
      <span className={`${muted} hidden sm:inline`}>•</span>

      {/* Rating */}
      {problem.rating && (
        <span className={`${muted} hidden sm:inline shrink-0`}>{problem.rating} ★</span>
      )}

      {/* Limits */}
      {(problem.timeLimit || problem.memoryLimit) && (
        <>
          <span className={`${muted} hidden sm:inline`}>•</span>
          <span className={`${muted} hidden sm:inline shrink-0`}>
            {problem.timeLimit && `${problem.timeLimit}`}
            {problem.timeLimit && problem.memoryLimit && ' / '}
            {problem.memoryLimit && `${problem.memoryLimit}`}
          </span>
        </>
      )}

      <div className="flex items-center gap-1 ml-auto shrink-0">
        {/* View on CF */}
        <a
          href={problem.problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${muted} hover:text-blue-400 transition-colors`}
          title="View on Codeforces"
        >
          ↗
        </a>

        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          className={`${muted} hover:text-red-400 transition-colors ml-1`}
          title="Clear problem"
        >
          ×
        </button>
      </div>
    </div>
  )
}
