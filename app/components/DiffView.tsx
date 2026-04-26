'use client'

import { useMemo } from 'react'
import { diff_match_patch } from 'diff-match-patch'

interface DiffViewProps {
  expected: string
  actual: string
  isDark: boolean
}

const dmp = new diff_match_patch()

function splitLines(text: string): string[] {
  return text.trimEnd().split('\n')
}

// Returns character-level diffs as [op, text] tuples.
// op: -1 = chars only in `from`, 0 = equal, 1 = chars only in `to`
function charDiff(from: string, to: string) {
  const diffs = dmp.diff_main(from, to)
  dmp.diff_cleanupSemantic(diffs)
  return diffs
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

  const border   = isDark ? 'border-white/10'        : 'border-gray-200'
  const bg       = isDark ? 'bg-slate-900/40'         : 'bg-gray-50'
  const text     = isDark ? 'text-slate-300'          : 'text-gray-700'
  const label    = isDark ? 'text-slate-400'          : 'text-gray-500'
  const rowExp   = isDark ? 'bg-red-500/15'           : 'bg-red-50'
  const rowAct   = isDark ? 'bg-green-500/15'         : 'bg-green-50'
  const charExp  = isDark ? 'bg-red-500/50 text-red-200 rounded-sm'   : 'bg-red-200 text-red-800 rounded-sm'
  const charAct  = isDark ? 'bg-green-500/50 text-green-200 rounded-sm' : 'bg-green-200 text-green-800 rounded-sm'

  // Renders one line. When the line differs from its counterpart, highlights
  // characters that are unique to this side using diff-match-patch.
  function renderLine(line: string, other: string, isDiff: boolean, charCls: string) {
    if (!isDiff) return line || <span className="opacity-30">&nbsp;</span>
    // charDiff(line, other): op -1 = chars in `line` not in `other` → highlight on this side
    const diffs = charDiff(line, other)
    return (
      <>
        {diffs.map(([op, chunk], i) => {
          if (op === 0)  return <span key={i}>{chunk}</span>
          if (op === -1) return <span key={i} className={charCls}>{chunk}</span>
          return null  // op 1 = chars only in other side, not shown here
        })}
      </>
    )
  }

  function renderLines(lines: string[], others: string[], rowCls: string, charCls: string) {
    const maxLen = Math.max(lines.length, others.length)
    return Array.from({ length: maxLen }, (_, i) => {
      const line  = lines[i]  ?? ''
      const other = others[i] ?? ''
      const isDiff = line !== other
      return (
        <div key={i} className={`font-mono text-xs px-2 py-0.5 whitespace-pre-wrap break-all ${isDiff ? rowCls : ''}`}>
          {renderLine(line, other, isDiff, charCls)}
        </div>
      )
    })
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <p className={`text-xs font-medium mb-1 ${label}`}>Expected</p>
          <div className={`border ${border} ${bg} rounded overflow-auto max-h-48`}>
            {renderLines(expLines, actLines, rowExp, charExp)}
          </div>
        </div>
        <div>
          <p className={`text-xs font-medium mb-1 ${label}`}>Actual</p>
          <div className={`border ${border} ${bg} rounded overflow-auto max-h-48`}>
            {renderLines(actLines, expLines, rowAct, charAct)}
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
