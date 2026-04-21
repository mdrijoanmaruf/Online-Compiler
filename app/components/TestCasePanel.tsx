'use client'

import { useState, useCallback } from 'react'
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
  idle: '—',
  running: '⏳',
  passed: '✓',
  failed: '✗',
  error: '⚠',
}

const STATUS_COLOR: Record<TestCaseState['status'], string> = {
  idle: 'text-gray-400',
  running: 'text-blue-400',
  passed: 'text-green-500',
  failed: 'text-red-500',
  error: 'text-yellow-500',
}

export default function TestCasePanel({
  testCases,
  activeIndex,
  isRunningAll,
  isDark,
  onSetActive,
  onUpdateTestCase,
  onAddTestCase,
  onDeleteTestCase,
  onRunOne,
  onRunAll,
}: TestCasePanelProps) {
  const [showExpected, setShowExpected] = useState(true)

  const tc = testCases[activeIndex]

  const border = isDark ? 'border-white/10' : 'border-gray-200'
  const bg = isDark ? 'bg-slate-900/20' : 'bg-white'
  const bgSec = isDark ? 'bg-white/5' : 'bg-gray-50'
  const muted = isDark ? 'text-slate-400' : 'text-gray-500'
  const inputCls = `w-full font-mono text-xs p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded border ${border} ${isDark ? 'bg-slate-900/30 text-slate-100 placeholder-slate-500' : 'bg-white text-gray-900 placeholder-gray-400'}`

  const passedCount = testCases.filter(t => t.status === 'passed').length
  const totalRan = testCases.filter(t => t.status !== 'idle' && t.status !== 'running').length

  const handleInput = useCallback((value: string) => {
    onUpdateTestCase(activeIndex, { input: value })
  }, [activeIndex, onUpdateTestCase])

  const handleExpected = useCallback((value: string) => {
    onUpdateTestCase(activeIndex, { expectedOutput: value })
  }, [activeIndex, onUpdateTestCase])

  if (!tc) return null

  return (
    <div className={`flex flex-col h-full ${bg} overflow-hidden`}>
      {/* Tabs */}
      <div className={`flex items-center border-b ${border} ${bgSec} overflow-x-auto shrink-0`} style={{ minHeight: '32px' }}>
        {testCases.map((t, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={t.id}
              className={`flex items-center gap-1 px-2 py-1 text-xs cursor-pointer border-r ${border} shrink-0 transition-colors
                ${isActive
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900')
                  : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100')
                }`}
              onClick={() => onSetActive(i)}
            >
              <span className={`${STATUS_COLOR[t.status]} font-bold`}>{STATUS_ICON[t.status]}</span>
              <span>{t.label}</span>
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteTestCase(i) }}
                  className={`ml-0.5 rounded hover:bg-red-500/20 hover:text-red-400 px-0.5`}
                  title="Delete test case"
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
          className={`px-2 py-1 text-xs ${muted} hover:text-blue-400 transition-colors shrink-0`}
          title="Add test case (Ctrl+T)"
        >
          + Add
        </button>
      </div>

      {/* I/O Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {/* Input */}
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Input</p>
          <textarea
            className={inputCls}
            rows={4}
            value={tc.input}
            onChange={e => handleInput(e.target.value)}
            placeholder="Program input…"
            spellCheck={false}
          />
        </div>

        {/* Expected output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Expected Output</p>
            <button
              type="button"
              onClick={() => setShowExpected(p => !p)}
              className={`text-[10px] ${muted} hover:text-blue-400`}
            >
              {showExpected ? 'hide' : 'show'}
            </button>
          </div>
          {showExpected && (
            <textarea
              className={`${inputCls} ${isDark ? 'bg-slate-800/40' : 'bg-gray-50'}`}
              rows={3}
              value={tc.expectedOutput}
              onChange={e => handleExpected(e.target.value)}
              placeholder="Expected output…"
              spellCheck={false}
            />
          )}
        </div>

        {/* Actual output */}
        {(tc.status !== 'idle') && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Actual Output</p>
              {tc.executionTime && (
                <span className={`text-[10px] ${muted}`}>{tc.executionTime}ms</span>
              )}
            </div>
            <div className={`relative font-mono text-xs p-2 rounded border ${border} ${isDark ? 'bg-slate-900/30 text-slate-100' : 'bg-white text-gray-900'} min-h-10 whitespace-pre-wrap`}>
              {tc.status === 'running' ? (
                <span className={`${muted} italic`}>Running…</span>
              ) : (
                <>
                  <span className={`absolute top-1.5 right-1.5 text-[10px] font-bold ${STATUS_COLOR[tc.status]}`}>
                    {STATUS_ICON[tc.status]} {tc.status === 'passed' ? 'Pass' : tc.status === 'failed' ? 'Fail' : tc.status === 'error' ? 'Error' : ''}
                  </span>
                  {tc.actualOutput || <span className={`${muted} italic`}>No output</span>}
                </>
              )}
            </div>

            {/* Diff view on failure */}
            {tc.status === 'failed' && (
              <DiffView expected={tc.expectedOutput} actual={tc.actualOutput} isDark={isDark} />
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className={`shrink-0 border-t ${border} p-2 space-y-1.5`}>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onRunOne(activeIndex)}
            disabled={tc.status === 'running' || isRunningAll}
            className={`flex-1 py-1 text-xs font-semibold rounded transition-colors
              ${isDark ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ▶ Run This
          </button>
          <button
            type="button"
            onClick={onRunAll}
            disabled={isRunningAll}
            className={`flex-1 py-1 text-xs font-semibold rounded transition-colors
              ${isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRunningAll ? '⏳ Running…' : '▶▶ Run All'}
          </button>
        </div>

        {/* Summary */}
        {totalRan > 0 && (
          <p className={`text-xs text-center font-medium ${
            passedCount === totalRan ? 'text-green-500' : passedCount === 0 ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {passedCount}/{totalRan} Passed {passedCount === totalRan ? '✓' : '✗'}
          </p>
        )}
      </div>
    </div>
  )
}
