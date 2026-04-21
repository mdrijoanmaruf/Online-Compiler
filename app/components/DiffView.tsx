'use client'

import { useMemo } from 'react'

interface DiffViewProps {
  expected: string
  actual: string
  isDark: boolean
}

function splitLines(text: string): string[] {
  return text.trimEnd().split('\n')
}

export default function DiffView({ expected, actual, isDark }: DiffViewProps) {
  const { expLines, actLines, diffLine } = useMemo(() => {
    const expLines = splitLines(expected)
    const actLines = splitLines(actual)
    let diffLine = -1
    const maxLen = Math.max(expLines.length, actLines.length)
    for (let i = 0; i < maxLen; i++) {
      if ((expLines[i] ?? '') !== (actLines[i] ?? '')) { diffLine = i + 1; break }
    }
    return { expLines, actLines, diffLine }
  }, [expected, actual])

  const border = isDark ? 'border-white/10' : 'border-gray-200'
  const bg = isDark ? 'bg-slate-900/40' : 'bg-gray-50'
  const text = isDark ? 'text-slate-300' : 'text-gray-700'
  const label = isDark ? 'text-slate-400' : 'text-gray-500'
  const diffBgExp = isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
  const diffBgAct = isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'

  function renderLines(lines: string[], otherLines: string[], highlight: 'exp' | 'act') {
    const maxLen = Math.max(lines.length, otherLines.length)
    return Array.from({ length: maxLen }, (_, i) => {
      const line = lines[i] ?? ''
      const isDiff = (lines[i] ?? '') !== (otherLines[i] ?? '')
      const cls = isDiff ? (highlight === 'exp' ? diffBgExp : diffBgAct) : ''
      return (
        <div key={i} className={`font-mono text-xs px-2 py-0.5 whitespace-pre-wrap break-all ${cls}`}>
          {line || <span className="opacity-30">&nbsp;</span>}
        </div>
      )
    })
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className={`grid grid-cols-2 gap-1.5`}>
        <div>
          <p className={`text-xs font-medium mb-1 ${label}`}>Expected</p>
          <div className={`border ${border} ${bg} rounded overflow-auto max-h-32`}>
            {renderLines(expLines, actLines, 'exp')}
          </div>
        </div>
        <div>
          <p className={`text-xs font-medium mb-1 ${label}`}>Actual</p>
          <div className={`border ${border} ${bg} rounded overflow-auto max-h-32`}>
            {renderLines(actLines, expLines, 'act')}
          </div>
        </div>
      </div>
      {diffLine > 0 && (
        <p className={`text-xs ${text}`}>
          <span className="text-yellow-500">⚠</span> Outputs differ starting at line {diffLine}
        </p>
      )}
    </div>
  )
}
