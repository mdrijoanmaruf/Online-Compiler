'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TestCaseState } from '../types/problem'
import DiffView from './DiffView'

interface TestCasePanelProps {
  testCases: TestCaseState[]
  activeIndex: number
  isRunningAll: boolean
  isDark: boolean
  onSetActive: (i: number) => void
  onUpdateTestCase: (i: number, patch: Partial<TestCaseState>) => void
  onAddTestCase: () => void
  onDeleteTestCase: (i: number) => void
  onRunOne: (i: number) => void
  onRunAll: () => void
}

const STATUS_ICON: Record<TestCaseState['status'], string> = {
  idle: '·', running: '◌', passed: '✓', failed: '✗', error: '⚠',
}
const STATUS_COLOR: Record<TestCaseState['status'], string> = {
  idle: 'text-slate-500', running: 'text-blue-400',
  passed: 'text-emerald-500', failed: 'text-red-500', error: 'text-amber-500',
}
const STATUS_LABEL: Record<TestCaseState['status'], string> = {
  idle: '', running: 'Running…', passed: 'Passed', failed: 'Wrong Answer', error: 'Error',
}

const OUTPUT_THEME = {
  idle:    { border: '', header: '', label: '', body: '' },
  running: {
    border: 'border-blue-500/30',
    header: 'bg-blue-500/10 border-blue-500/30',
    label:  'text-blue-400',
    body:   '',
  },
  passed: {
    border: 'border-emerald-500/30',
    header: 'bg-emerald-500/10 border-emerald-500/30',
    label:  'text-emerald-400',
    body:   '',
  },
  failed: {
    border: 'border-red-500/30',
    header: 'bg-red-500/10 border-red-500/30',
    label:  'text-red-400',
    body:   '',
  },
  error: {
    border: 'border-amber-500/30',
    header: 'bg-amber-500/10 border-amber-500/30',
    label:  'text-amber-400',
    body:   '',
  },
}

const OUTPUT_THEME_LIGHT = {
  idle:    { border: '', header: '', label: '', body: '' },
  running: { border: 'border-blue-200',   header: 'bg-blue-50 border-blue-200',    label: 'text-blue-600',    body: '' },
  passed:  { border: 'border-emerald-200',header: 'bg-emerald-50 border-emerald-200', label: 'text-emerald-600', body: '' },
  failed:  { border: 'border-red-200',    header: 'bg-red-50 border-red-200',      label: 'text-red-600',     body: '' },
  error:   { border: 'border-amber-200',  header: 'bg-amber-50 border-amber-200',  label: 'text-amber-600',   body: '' },
}

export default function TestCasePanel({
  testCases, activeIndex, isRunningAll, isDark,
  onSetActive, onUpdateTestCase, onAddTestCase, onDeleteTestCase, onRunOne, onRunAll,
}: TestCasePanelProps) {
  const tc = testCases[activeIndex]
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const [showRightFade, setShowRightFade] = useState(false)

  const checkOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setShowRightFade(el.scrollWidth > el.clientWidth + 2)
  }, [])

  useEffect(() => { checkOverflow() }, [testCases, checkOverflow])

  const passedCount = testCases.filter(t => t.status === 'passed').length
  const totalRan    = testCases.filter(t => t.status !== 'idle' && t.status !== 'running').length

  const handleInput    = useCallback((v: string) => onUpdateTestCase(activeIndex, { input: v }),          [activeIndex, onUpdateTestCase])
  const handleExpected = useCallback((v: string) => onUpdateTestCase(activeIndex, { expectedOutput: v }), [activeIndex, onUpdateTestCase])

  const border   = isDark ? 'border-white/10'        : 'border-gray-200'
  const bgBase   = isDark ? 'bg-slate-900/20'        : 'bg-white'
  const bgSec    = isDark ? 'bg-white/[0.04]'        : 'bg-gray-50'
  const muted    = isDark ? 'text-slate-500'         : 'text-gray-400'
  const bodyText = isDark ? 'text-slate-100'         : 'text-gray-900'

  const ot = isDark
    ? OUTPUT_THEME[tc?.status ?? 'idle']
    : OUTPUT_THEME_LIGHT[tc?.status ?? 'idle']

  const monoInput = `w-full font-mono text-xs p-3 resize-none overflow-hidden [field-sizing:content] min-h-10 focus:outline-none bg-transparent ${bodyText} placeholder:opacity-30 placeholder:italic`

  if (!tc) return null

  return (
    <div className={`flex flex-col h-full ${bgBase}`}>
      <div className="relative shrink-0">
      <div ref={tabScrollRef} onScroll={checkOverflow} className={`flex items-center gap-1 px-2 py-1.5 border-b ${border} ${bgSec} overflow-x-auto custom-scrollbar`}>
        {testCases.map((t, i) => {
          const active = i === activeIndex
          return (
            <div
              key={t.id}
              onClick={() => onSetActive(i)}
              className={`group flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs cursor-pointer select-none transition-all duration-150 shrink-0 border
                ${active
                  ? isDark
                    ? 'bg-white/15 border-white/20 text-white'
                    : 'bg-white border-gray-300 text-gray-900 shadow-sm'
                  : isDark
                    ? 'border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              <span className={`text-[10px] font-bold leading-none ${STATUS_COLOR[t.status]}`}>
                {STATUS_ICON[t.status]}
              </span>
              <span className="font-medium">{t.label}</span>
              {!t.label.startsWith('Sample') && (
                <span className="text-[8px] px-1 py-0 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30 font-bold leading-tight">
                  custom
                </span>
              )}
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onDeleteTestCase(i) }}
                  title="Remove"
                  className={`-mr-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[11px] opacity-0 group-hover:opacity-100 transition-opacity
                    ${isDark ? 'hover:bg-red-500/30 text-red-400' : 'hover:bg-red-100 text-red-500'}`}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
        <button
          type="button"
          onClick={onAddTestCase}
          title="Add test case (Ctrl+T)"
          className={`shrink-0 ml-1 w-5 h-5 flex items-center justify-center rounded-full text-base leading-none transition-colors
            ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'}`}
        >
          +
        </button>
      </div>
      {showRightFade && (
        <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none rounded-tr
          ${isDark ? 'bg-linear-to-l from-slate-900/80 to-transparent' : 'bg-linear-to-l from-gray-50/90 to-transparent'}`}
        />
      )}
      </div>
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
        <div className={`rounded-lg border ${border} overflow-hidden`}>
          <div className={`px-3 py-1 border-b ${border} ${bgSec}`}>
            <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${muted}`}>Input</span>
          </div>
          <textarea
            className={monoInput}
            value={tc.input}
            onChange={e => handleInput(e.target.value)}
            placeholder="stdin…"
            spellCheck={false}
          />
        </div>

        <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-indigo-500/25' : 'border-indigo-200'}`}>
          <div className={`px-3 py-1 border-b ${isDark ? 'border-indigo-500/25 bg-indigo-500/10' : 'border-indigo-100 bg-indigo-50'}`}>
            <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
              Expected
            </span>
          </div>
          <textarea
            className={monoInput}
            value={tc.expectedOutput}
            onChange={e => handleExpected(e.target.value)}
            placeholder="expected output…"
            spellCheck={false}
          />
        </div>
        {tc.status !== 'idle' && (
          <div className={`rounded-lg overflow-hidden border ${ot.border || border}`}>
            <div className={`flex items-center justify-between px-3 py-1 border-b ${ot.header || `${bgSec} ${border}`}`}>
              <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${ot.label || muted}`}>
                Output
              </span>
              <span className={`text-[9px] font-bold ${ot.label || muted}`}>
                {STATUS_LABEL[tc.status]}
                {tc.executionTime ? <span className="opacity-70"> · {tc.executionTime}ms</span> : null}
              </span>
            </div>
            <div className={`font-mono text-xs p-3 whitespace-pre-wrap break-all min-h-8 ${bodyText}`}>
              {tc.status === 'running'
                ? <span className="animate-pulse text-blue-400">Running…</span>
                : tc.actualOutput || <span className={`${muted} italic`}>No output</span>
              }
            </div>
          </div>
        )}
        {tc.status === 'failed' && (
          <DiffView expected={tc.expectedOutput} actual={tc.actualOutput} isDark={isDark} />
        )}
      </div>
      <div className={`shrink-0 border-t ${border} px-2.5 py-2 space-y-2`}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onRunOne(activeIndex)}
            disabled={tc.status === 'running' || isRunningAll}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              ${isDark
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/25'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}
          >
            ▶ Run
          </button>
          <button
            type="button"
            onClick={onRunAll}
            disabled={isRunningAll}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              ${isDark
                ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border-blue-500/25'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'}`}
          >
            {isRunningAll ? '⏳ Running…' : '▶▶ Run All'}
          </button>
        </div>

        {totalRan > 0 && (
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div
                className={`progress-fill h-full rounded-full transition-all duration-500 ${
                  passedCount === totalRan ? 'bg-emerald-500'
                  : passedCount === 0 ? 'bg-red-500'
                  : 'bg-amber-500'
                }`}
                style={{ '--progress': `${Math.round((passedCount / totalRan) * 100)}%` } as React.CSSProperties}
              />
            </div>
            <span className={`text-[10px] font-bold shrink-0 tabular-nums ${
              passedCount === totalRan ? 'text-emerald-500'
              : passedCount === 0 ? 'text-red-500'
              : 'text-amber-500'
            }`}>
              {passedCount}/{totalRan}
            </span>
          </div>
        )}
      </div>

    </div>
  )
}
