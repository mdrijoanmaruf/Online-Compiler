'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import {
  FiPlay, FiDownload, FiRefreshCw,
  FiCode, FiTerminal, FiClock, FiZap,
  FiCopy, FiSun, FiMoon, FiFile, FiFolder,
  FiChevronRight, FiChevronDown,
  FiTrash2, FiEdit2, FiFolderPlus, FiFilePlus,
  FiX, FiSidebar
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import JSZip from 'jszip'

// ─── Types ───────────────────────────────────────────────────────────────────
interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  children?: FileNode[]
}

// ─── Language configurations ─────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', version: '20.17.0', extension: 'js', color: '#f7df1e', monacoLanguage: 'javascript', wandboxCompiler: 'nodejs-20.17.0', template: 'console.log("Hello, World!");' },
  { id: 'python', name: 'Python', version: '3.12.7', extension: 'py', color: '#3776ab', monacoLanguage: 'python', wandboxCompiler: 'cpython-3.12.7', template: 'print("Hello, World!")' },
  { id: 'java', name: 'Java', version: '22', extension: 'java', color: '#ed8b00', monacoLanguage: 'java', wandboxCompiler: 'openjdk-jdk-22+36', template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { id: 'cpp', name: 'C++', version: 'GCC Head', extension: 'cpp', color: '#00599c', monacoLanguage: 'cpp', wandboxCompiler: 'gcc-head', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { id: 'c', name: 'C', version: 'GCC Head', extension: 'c', color: '#a8b9cc', monacoLanguage: 'c', wandboxCompiler: 'gcc-head-c', template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { id: 'csharp', name: 'C#', version: '6.12.0', extension: 'cs', color: '#239120', monacoLanguage: 'csharp', wandboxCompiler: 'mono-6.12.0.199', template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { id: 'php', name: 'PHP', version: '8.3.12', extension: 'php', color: '#777bb4', monacoLanguage: 'php', wandboxCompiler: 'php-8.3.12', template: '<?php\necho "Hello, World!";\n?>' },
  { id: 'ruby', name: 'Ruby', version: '3.4.1', extension: 'rb', color: '#cc342d', monacoLanguage: 'ruby', wandboxCompiler: 'ruby-3.4.1', template: 'puts "Hello, World!"' },
  { id: 'go', name: 'Go', version: '1.23.2', extension: 'go', color: '#00add8', monacoLanguage: 'go', wandboxCompiler: 'go-1.23.2', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { id: 'rust', name: 'Rust', version: '1.82.0', extension: 'rs', color: '#000000', monacoLanguage: 'rust', wandboxCompiler: 'rust-1.82.0', template: 'fn main() {\n    println!("Hello, World!");\n}' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _idCounter = 0
const uid = () => `f${++_idCounter}_${Date.now()}`

const extToMonaco: Record<string, string> = {
  js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
  py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
  php: 'php', rb: 'ruby', go: 'go', rs: 'rust', html: 'html',
  css: 'css', json: 'json', md: 'markdown', txt: 'plaintext',
  xml: 'xml', yaml: 'yaml', yml: 'yaml', sh: 'shell', sql: 'sql',
}

function getMonacoLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return extToMonaco[ext] || 'plaintext'
}

function getLanguageByExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return LANGUAGES.find(l => l.extension === ext) || null
}

function getFileIconColor(filename: string, isDark: boolean): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const colors: Record<string, [string, string]> = {
    js: ['text-yellow-400', 'text-yellow-600'],
    py: ['text-blue-400', 'text-blue-600'],
    java: ['text-orange-400', 'text-orange-600'],
    cpp: ['text-sky-400', 'text-sky-600'],
    c: ['text-sky-400', 'text-sky-600'],
    cs: ['text-green-400', 'text-green-600'],
    php: ['text-purple-400', 'text-purple-600'],
    rb: ['text-red-400', 'text-red-600'],
    go: ['text-cyan-400', 'text-cyan-600'],
    rs: ['text-orange-300', 'text-orange-700'],
    ts: ['text-blue-400', 'text-blue-600'],
    html: ['text-orange-400', 'text-orange-600'],
    css: ['text-pink-400', 'text-pink-600'],
    json: ['text-yellow-300', 'text-yellow-700'],
    md: ['text-slate-300', 'text-slate-600'],
  }
  const c = colors[ext]
  return c ? (isDark ? c[0] : c[1]) : (isDark ? 'text-slate-400' : 'text-gray-500')
}

function makeDefaultTree(lang: typeof LANGUAGES[number]): FileNode[] {
  return [{
    id: uid(),
    name: `main.${lang.extension}`,
    type: 'file',
    content: lang.template,
  }]
}

function findNode(tree: FileNode[], id: string): FileNode | null {
  for (const n of tree) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

function findParent(tree: FileNode[], id: string): FileNode[] | null {
  for (const n of tree) {
    if (n.id === id) return tree
    if (n.children) {
      const found = findParent(n.children, id)
      if (found) return found
    }
  }
  return null
}

function cloneTree(tree: FileNode[]): FileNode[] {
  return JSON.parse(JSON.stringify(tree))
}

function collectFiles(tree: FileNode[], prefix = ''): { path: string; content: string }[] {
  const result: { path: string; content: string }[] = []
  for (const n of tree) {
    const p = prefix ? `${prefix}/${n.name}` : n.name
    if (n.type === 'file') {
      result.push({ path: p, content: n.content || '' })
    } else if (n.children) {
      result.push(...collectFiles(n.children, p))
    }
  }
  return result
}

function findFirstFile(tree: FileNode[]): FileNode | null {
  for (const n of tree) {
    if (n.type === 'file') return n
    if (n.children) {
      const f = findFirstFile(n.children)
      if (f) return f
    }
  }
  return null
}

function sortTree(tree: FileNode[]): FileNode[] {
  return [...tree].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  }).map(n => n.children ? { ...n, children: sortTree(n.children) } : n)
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════
const OnlineCompiler = () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0])
  const [fileTree, setFileTree] = useState<FileNode[]>(() => makeDefaultTree(LANGUAGES[0]))
  const [activeFileId, setActiveFileId] = useState<string>('')
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [editorWidth, setEditorWidth] = useState(55)
  const [outputHeight, setOutputHeight] = useState(60)
  const [isResizing, setIsResizing] = useState(false)
  const [isVerticalResizing, setIsVerticalResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileEditorHeight, setMobileEditorHeight] = useState(40)
  const [mobileOutputHeight, setMobileOutputHeight] = useState(60)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const editorRef = useRef<{ editor: any; monaco: any } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // ─── Derived ─────────────────────────────────────────────────────────────
  const activeFile = activeFileId ? findNode(fileTree, activeFileId) : null
  const code = activeFile?.content || ''

  // ─── Auto-select language from file extension ──────────────────────────
  useEffect(() => {
    if (!activeFile) return
    const lang = getLanguageByExtension(activeFile.name)
    if (lang && lang.id !== selectedLanguage.id) setSelectedLanguage(lang)
  }, [activeFileId, activeFile?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  const setCode = useCallback((value: string) => {
    if (!activeFileId) return
    setFileTree(prev => {
      const next = cloneTree(prev)
      const node = findNode(next, activeFileId)
      if (node && node.type === 'file') node.content = value
      return next
    })
  }, [activeFileId])

  // ─── Initialise first file ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeFileId && fileTree.length > 0) {
      const first = findFirstFile(fileTree)
      if (first) {
        setActiveFileId(first.id)
        setOpenTabs([first.id])
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load theme from localStorage (client only) ────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('compiler-theme')
    if (saved === 'light') setIsDarkMode(false)
  }, [])

  // ─── Mobile check ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 1024
      setIsMobile(m)
      if (m) setSidebarOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ─── Close context menu on click outside ───────────────────────────────
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

  // ─── Focus rename input ────────────────────────────────────────────────
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // ─── Save preferences ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('compiler-language', selectedLanguage.id)
      localStorage.setItem('compiler-editor-width', editorWidth.toString())
      localStorage.setItem('compiler-output-height', outputHeight.toString())
      localStorage.setItem('compiler-mobile-editor-height', mobileEditorHeight.toString())
      localStorage.setItem('compiler-mobile-output-height', mobileOutputHeight.toString())
      localStorage.setItem('compiler-theme', isDarkMode ? 'dark' : 'light')
      localStorage.setItem('compiler-sidebar', sidebarOpen ? 'open' : 'closed')
      try { localStorage.setItem('compiler-file-tree', JSON.stringify(fileTree)) } catch { /* ignore */ }
      localStorage.setItem('compiler-active-file', activeFileId)
      localStorage.setItem('compiler-open-tabs', JSON.stringify(openTabs))
    }, 500)
    return () => clearTimeout(t)
  }, [selectedLanguage, editorWidth, outputHeight, mobileEditorHeight, mobileOutputHeight, isDarkMode, sidebarOpen, fileTree, activeFileId, openTabs])

  // ─── Load preferences ─────────────────────────────────────────────────
  useEffect(() => {
    const savedLang = localStorage.getItem('compiler-language')
    const savedTree = localStorage.getItem('compiler-file-tree')
    const savedActive = localStorage.getItem('compiler-active-file')
    const savedTabs = localStorage.getItem('compiler-open-tabs')
    const savedSidebar = localStorage.getItem('compiler-sidebar')
    const savedEditorWidth = localStorage.getItem('compiler-editor-width')
    const savedOutputHeight = localStorage.getItem('compiler-output-height')
    const savedMobileEditorHeight = localStorage.getItem('compiler-mobile-editor-height')
    const savedMobileOutputHeight = localStorage.getItem('compiler-mobile-output-height')

    if (savedLang) {
      const lang = LANGUAGES.find(l => l.id === savedLang)
      if (lang) setSelectedLanguage(lang)
    }

    if (savedTree) {
      try {
        const parsed = JSON.parse(savedTree) as FileNode[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFileTree(parsed)
          if (savedTabs) {
            try { setOpenTabs(JSON.parse(savedTabs)) } catch { /* ignore */ }
          }
          if (savedActive) {
            const node = findNode(parsed, savedActive)
            if (node) setActiveFileId(savedActive)
            else {
              const first = findFirstFile(parsed)
              if (first) { setActiveFileId(first.id); setOpenTabs([first.id]) }
            }
          }
        }
      } catch { /* ignore */ }
    }

    if (savedSidebar === 'closed') setSidebarOpen(false)
    if (savedEditorWidth) { const v = parseFloat(savedEditorWidth); if (v >= 20 && v <= 80) setEditorWidth(v) }
    if (savedOutputHeight) { const v = parseFloat(savedOutputHeight); if (v >= 30 && v <= 85) setOutputHeight(v) }
    if (savedMobileEditorHeight) { const v = parseFloat(savedMobileEditorHeight); if (v >= 25 && v <= 75) setMobileEditorHeight(v) }
    if (savedMobileOutputHeight) { const v = parseFloat(savedMobileOutputHeight); if (v >= 30 && v <= 85) setMobileOutputHeight(v) }
  }, [])

  // ─── Monaco theme on dark mode change ──────────────────────────────────
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.monaco.editor.setTheme(isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight')
    }
  }, [isDarkMode])

  // ─── Resizing ──────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => { setIsResizing(true); e.preventDefault() }
  const handleVerticalMouseDown = (e: React.MouseEvent) => { setIsVerticalResizing(true); e.preventDefault() }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (isResizing) {
        if (isMobile) {
          const r = containerRef.current.getBoundingClientRect()
          setMobileEditorHeight(Math.min(Math.max(((e.clientY - r.top) / r.height) * 100, 25), 75))
        } else {
          const r = containerRef.current.getBoundingClientRect()
          setEditorWidth(Math.min(Math.max(((e.clientX - r.left) / r.width) * 100, 20), 80))
        }
      }
      if (isVerticalResizing && outputContainerRef.current) {
        const r = outputContainerRef.current.getBoundingClientRect()
        const h = ((e.clientY - r.top) / r.height) * 100
        if (isMobile) setMobileOutputHeight(Math.min(Math.max(h, 30), 85))
        else setOutputHeight(Math.min(Math.max(h, 30), 85))
      }
    }
    const onTouch = (e: TouchEvent) => {
      if (!containerRef.current || !isMobile) return
      const t = e.touches[0]
      if (isResizing) {
        const r = containerRef.current.getBoundingClientRect()
        setMobileEditorHeight(Math.min(Math.max(((t.clientY - r.top) / r.height) * 100, 25), 75))
        e.preventDefault()
      }
      if (isVerticalResizing && outputContainerRef.current) {
        const r = outputContainerRef.current.getBoundingClientRect()
        setMobileOutputHeight(Math.min(Math.max(((t.clientY - r.top) / r.height) * 100, 30), 85))
        e.preventDefault()
      }
    }
    const onUp = () => { setIsResizing(false); setIsVerticalResizing(false) }
    if (isResizing || isVerticalResizing) {
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      document.addEventListener('touchmove', onTouch, { passive: false })
      document.addEventListener('touchend', onUp)
    }
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onTouch)
      document.removeEventListener('touchend', onUp)
    }
  }, [isResizing, isVerticalResizing, isMobile])

  // ─── Monaco Editor mount ───────────────────────────────────────────────
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = { editor, monaco }
    monaco.editor.defineTheme('liquidGlassDark', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#0f172a40', 'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#ffffff08', 'editor.selectionBackground': '#3b82f640',
        'editor.inactiveSelectionBackground': '#3b82f620', 'editorCursor.foreground': '#3b82f6',
        'editorLineNumber.foreground': '#64748b', 'editorLineNumber.activeForeground': '#94a3b8',
        'editor.findMatchBackground': '#3b82f640', 'editor.findMatchHighlightBackground': '#3b82f620',
        'editorWidget.background': '#1e293b', 'editorWidget.border': '#334155',
        'editorSuggestWidget.background': '#1e293b', 'editorSuggestWidget.border': '#334155',
        'editorHoverWidget.background': '#1e293b', 'editorHoverWidget.border': '#334155',
      }
    })
    monaco.editor.defineTheme('liquidGlassLight', {
      base: 'vs', inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd73a49', fontStyle: 'bold' },
        { token: 'string', foreground: '032f62' },
        { token: 'number', foreground: '005cc5' },
        { token: 'operator', foreground: '24292e' },
        { token: 'identifier', foreground: '24292e' },
        { token: 'type', foreground: '6f42c1' },
        { token: 'function', foreground: '6f42c1' },
      ],
      colors: {
        'editor.background': '#ffffff', 'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#00000008', 'editor.selectionBackground': '#3b82f640',
        'editor.inactiveSelectionBackground': '#3b82f620', 'editorCursor.foreground': '#3b82f6',
        'editorLineNumber.foreground': '#6a737d', 'editorLineNumber.activeForeground': '#24292e',
        'editor.findMatchBackground': '#3b82f640', 'editor.findMatchHighlightBackground': '#3b82f620',
        'editorWidget.background': '#f6f8fa', 'editorWidget.border': '#e1e4e8',
        'editorSuggestWidget.background': '#f6f8fa', 'editorSuggestWidget.border': '#e1e4e8',
        'editorHoverWidget.background': '#f6f8fa', 'editorHoverWidget.border': '#e1e4e8',
      }
    })
    monaco.editor.setTheme(isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight')
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => executeCode())
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => editor.getAction('editor.action.copyLinesDownAction')?.run())
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU, () => editor.getAction('editor.action.copyLinesUpAction')?.run())
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => editor.getAction('editor.action.formatDocument')?.run())
  }

  // ─── Execute code ──────────────────────────────────────────────────────
  const executeCode = async () => {
    if (!code.trim()) {
      Swal.fire({ title: 'No Code', text: 'Please enter some code to execute.', icon: 'warning', background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff', color: isDarkMode ? '#f8fafc' : '#1f2937', confirmButtonColor: '#3b82f6' })
      return
    }
    setIsExecuting(true); setOutput('Executing...'); setExecutionTime(null)
    try {
      const startTime = Date.now()
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, compiler: selectedLanguage.wandboxCompiler, stdin: input }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error || `HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setExecutionTime(Date.now() - startTime)
      let out = ''
      if (result.compiler_message) out += result.compiler_message
      if (result.program_output) out += result.program_output
      if (result.program_error) out += result.program_error
      setOutput(out || 'Program executed successfully with no output.')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Execution error:', error)
      setOutput(`Error: ${message}\n\nPlease check your internet connection and try again.`)
      Swal.fire({ title: 'Execution Failed', text: 'Failed to execute code. Please try again.', icon: 'error', background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff', color: isDarkMode ? '#f8fafc' : '#1f2937', confirmButtonColor: '#ef4444' })
    } finally { setIsExecuting(false) }
  }

  // ─── Language change ───────────────────────────────────────────────────
  const handleLanguageChange = (language: typeof LANGUAGES[number]) => {
    setSelectedLanguage(language)
    const newTree = makeDefaultTree(language)
    setFileTree(newTree)
    const first = findFirstFile(newTree)!
    setActiveFileId(first.id)
    setOpenTabs([first.id])
    setExpandedFolders(new Set())
    setOutput('')
    setExecutionTime(null)
  }

  // ─── File tree operations ──────────────────────────────────────────────
  const openFile = (node: FileNode) => {
    if (node.type !== 'file') return
    setActiveFileId(node.id)
    if (!openTabs.includes(node.id)) setOpenTabs(prev => [...prev, node.id])
    if (isMobile) setSidebarOpen(false)
  }

  const closeTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const next = openTabs.filter(t => t !== id)
    setOpenTabs(next)
    if (activeFileId === id) {
      if (next.length > 0) setActiveFileId(next[next.length - 1])
      else setActiveFileId('')
    }
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const addFile = (parentId: string | null) => {
    const name = `untitled.${selectedLanguage.extension}`
    const newFile: FileNode = { id: uid(), name, type: 'file', content: '' }
    setFileTree(prev => {
      const next = cloneTree(prev)
      if (parentId) {
        const parent = findNode(next, parentId)
        if (parent && parent.type === 'folder') {
          if (!parent.children) parent.children = []
          parent.children.push(newFile)
          setExpandedFolders(p => new Set(p).add(parentId))
        }
      } else {
        next.push(newFile)
      }
      return sortTree(next)
    })
    setRenamingId(newFile.id)
    setRenameValue(name)
    openFile(newFile)
  }

  const addFolder = (parentId: string | null) => {
    const newFolder: FileNode = { id: uid(), name: 'new-folder', type: 'folder', children: [] }
    setFileTree(prev => {
      const next = cloneTree(prev)
      if (parentId) {
        const parent = findNode(next, parentId)
        if (parent && parent.type === 'folder') {
          if (!parent.children) parent.children = []
          parent.children.push(newFolder)
          setExpandedFolders(p => new Set(p).add(parentId))
        }
      } else {
        next.push(newFolder)
      }
      return sortTree(next)
    })
    setRenamingId(newFolder.id)
    setRenameValue('new-folder')
    setExpandedFolders(p => new Set(p).add(newFolder.id))
  }

  const deleteNode = (id: string) => {
    setFileTree(prev => {
      const next = cloneTree(prev)
      const parent = findParent(next, id)
      if (parent) {
        const idx = parent.findIndex(n => n.id === id)
        if (idx !== -1) parent.splice(idx, 1)
      }
      return next
    })
    if (openTabs.includes(id)) closeTab(id)
  }

  const startRename = (id: string) => {
    const node = findNode(fileTree, id)
    if (node) {
      setRenamingId(id)
      setRenameValue(node.name)
    }
  }

  const commitRename = () => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return }
    setFileTree(prev => {
      const next = cloneTree(prev)
      const node = findNode(next, renamingId)
      if (node) {
        node.name = renameValue.trim()
        // Auto-fill boilerplate when file is empty (e.g. just created)
        if (node.type === 'file' && !node.content?.trim()) {
          const lang = getLanguageByExtension(node.name)
          if (lang) node.content = lang.template
        }
      }
      return sortTree(next)
    })
    setRenamingId(null)
  }

  // ─── Context menu handler ─────────────────────────────────────────────
  const handleContextMenu = (e: React.MouseEvent, nodeId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
  }

  // ─── Download ZIP ──────────────────────────────────────────────────────
  const downloadZip = async () => {
    const files = collectFiles(fileTree)
    if (files.length === 0) return
    if (files.length === 1) {
      const f = files[0]
      const blob = new Blob([f.content], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = f.path
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
      return
    }
    const zip = new JSZip()
    for (const f of files) zip.file(f.path, f.content)
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'project.zip'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      Swal.fire({ title: 'Copied!', text: 'Code copied to clipboard.', icon: 'success', timer: 2000, showConfirmButton: false, background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff', color: isDarkMode ? '#f8fafc' : '#1f2937' })
    } catch { /* ignore */ }
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  // ─── Theme styles ──────────────────────────────────────────────────────
  const glassStyle = isDarkMode
    ? "backdrop-blur-3xl shadow-2xl shadow-black/20"
    : "backdrop-blur-3xl shadow-2xl shadow-gray-500/20"

  const ts = {
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSec: isDarkMode ? 'text-slate-300' : 'text-purple-800',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-indigo-600',
    border: isDarkMode ? 'border-white/10' : 'border-purple-200/80',
    borderLight: isDarkMode ? 'border-white/5' : 'border-pink-200/60',
    bgPrimary: isDarkMode ? 'bg-white/5' : 'bg-linear-to-r from-purple-100/60 to-pink-100/60',
    bgSec: isDarkMode ? 'bg-white/10' : 'bg-linear-to-r from-indigo-100/70 to-cyan-100/70',
    bgHover: isDarkMode ? 'hover:bg-white/20' : 'hover:bg-linear-to-r hover:from-purple-200/80 hover:to-pink-200/80',
    bgInput: isDarkMode ? 'bg-slate-900/20' : 'bg-white',
    resizer: isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-linear-to-r from-purple-300/40 to-pink-300/40 hover:from-purple-400/60 hover:to-pink-400/60',
    resizerBar: isDarkMode ? 'bg-white/20 group-hover:bg-white/40' : 'bg-linear-to-r from-purple-500/60 to-pink-500/60 group-hover:from-purple-600/80 group-hover:to-pink-600/80',
  }

  // ─── Render file tree ──────────────────────────────────────────────────
  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const isFolder = node.type === 'folder'
      const isExpanded = expandedFolders.has(node.id)
      const isActive = activeFileId === node.id
      const isRenaming = renamingId === node.id

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 cursor-pointer rounded-sm text-xs transition-colors group
              ${isActive && !isFolder ? (isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-200/60 text-purple-900') : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-gray-700 hover:bg-purple-100/40')}
            `}
            style={{ paddingLeft: `${depth * 10 + 6}px` }}
            onClick={() => isFolder ? toggleFolder(node.id) : openFile(node)}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          >
            {isFolder ? (
              isExpanded ? <FiChevronDown className="w-3 h-3 shrink-0" /> : <FiChevronRight className="w-3 h-3 shrink-0" />
            ) : <span className="w-3" />}
            {isFolder
              ? <FiFolder className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-amber-500'}`} />
              : <FiFile className={`w-3.5 h-3.5 shrink-0 ${getFileIconColor(node.name, isDarkMode)}`} />
            }
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                className={`flex-1 min-w-0 px-1 py-0 text-xs rounded ${isDarkMode ? 'bg-slate-700 text-white border-slate-500' : 'bg-white text-gray-900 border-purple-300'} border outline-none`}
                title="Rename file or folder"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="truncate flex-1 min-w-0">{node.name}</span>
            )}
            {!isRenaming && (
              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); startRename(node.id) }} className="p-0.5 rounded hover:bg-white/10" title="Rename">
                  <FiEdit2 className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }} className="p-0.5 rounded hover:bg-red-500/20 text-red-400" title="Delete">
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          {isFolder && isExpanded && node.children && (
            <div>{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      )
    })
  }

  // ═════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-linear-to-br from-purple-50 via-pink-50 to-cyan-50'}`}
      suppressHydrationWarning
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDarkMode ? 'bg-linear-to-br from-cyan-500/10 to-blue-600/10' : 'bg-linear-to-br from-pink-400/30 to-purple-500/30'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDarkMode ? 'bg-linear-to-br from-purple-500/10 to-pink-600/10' : 'bg-linear-to-br from-cyan-400/30 to-indigo-500/30'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isDarkMode ? 'bg-linear-to-br from-teal-500/5 to-cyan-600/5' : 'bg-linear-to-br from-orange-300/25 to-pink-400/25'} rounded-full blur-3xl`} />
      </div>

      <div className="h-full w-full flex flex-col overflow-hidden relative z-10">
        <div className={`${glassStyle} flex-1 flex flex-col min-h-0 overflow-hidden p-1 sm:p-2 lg:p-3`}>
          {/* ─── Header / Toolbar ──────────────────────────────────────── */}
          <div className={`flex items-center justify-between gap-2 mb-1 px-2 py-1 sm:py-1.5 ${ts.bgPrimary} rounded-lg ${ts.borderLight} border`}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setSidebarOpen(p => !p)}
                  className={`p-1 rounded ${ts.bgSec} border ${ts.border} ${ts.textSec} ${ts.bgHover} transition-all duration-150`}
                  title="Toggle file explorer"
                >
                  <FiSidebar className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selectedLanguage.color }} />
                  <select
                    value={selectedLanguage.id}
                    onChange={(e) => { const l = LANGUAGES.find(l => l.id === e.target.value); if (l) handleLanguageChange(l) }}
                    title="Select programming language"
                    className={`px-1.5 sm:px-2 py-0.5 rounded ${ts.bgSec} ${ts.border} border ${ts.text} focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 text-xs min-w-0 shrink`}
                  >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id} className={isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}>{lang.name}</option>
                  ))}
                  </select>
                </div>
                <div className={`hidden lg:block text-xs ${ts.textMuted} ${ts.bgPrimary} px-1.5 py-0.5 rounded ${ts.borderLight} border`}>Ctrl+Enter</div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button onClick={toggleTheme} className={`p-1 rounded ${ts.bgSec} border ${ts.border} ${ts.textSec} ${ts.bgHover} transition-all duration-150`} title={isDarkMode ? "Light Mode" : "Dark Mode"}>
                  {isDarkMode ? <FiSun className="h-3.5 w-3.5" /> : <FiMoon className="h-3.5 w-3.5" />}
                </button>
                <button onClick={copyCode} className={`p-1 rounded ${ts.bgSec} border ${ts.border} ${ts.textSec} ${ts.bgHover} transition-all duration-150`} title="Copy Code">
                  <FiCopy className="h-3.5 w-3.5" />
                </button>
                <button onClick={downloadZip} className={`p-1 rounded ${ts.bgSec} border ${ts.border} ${ts.textSec} ${ts.bgHover} transition-all duration-150`} title="Download (ZIP if multiple files)">
                  <FiDownload className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className={`px-2 py-1 ${isDarkMode ? 'bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : 'bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600'} text-white rounded transition-all duration-150 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-xs font-medium`}
                >
                  {isExecuting
                    ? <><FiRefreshCw className="h-3.5 w-3.5 animate-spin" /><span className="hidden sm:inline">Running...</span><span className="sm:hidden">Run</span></>
                    : <><FiPlay className="h-3.5 w-3.5" /><span className="hidden sm:inline">Run</span></>
                  }
                </button>
                {executionTime && (
                  <div className={`hidden sm:flex items-center space-x-1 text-xs ${ts.textMuted} ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-linear-to-r from-emerald-100 to-green-100 border border-emerald-300/60'} px-1.5 py-0.5 rounded`}>
                    <FiClock className="h-3 w-3" /><span>{executionTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Main Content ─────────────────────────────────────────── */}
          <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row min-h-0 relative gap-0">

            {/* ─── File Explorer Sidebar ─────────────────────────────── */}
            {sidebarOpen && (
              <div
                className={`${isMobile ? 'absolute inset-0 z-30' : 'relative shrink-0'} flex flex-col ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'} ${ts.border} border rounded-lg overflow-hidden`}
                style={isMobile ? undefined : { width: '200px' }}
              >
                <div className={`flex items-center justify-between px-2 py-1.5 ${ts.bgPrimary} ${ts.borderLight} border-b`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${ts.textMuted}`}>Explorer</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => addFile(null)} className={`p-1 rounded ${ts.bgHover} ${ts.textSec}`} title="New File"><FiFilePlus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => addFolder(null)} className={`p-1 rounded ${ts.bgHover} ${ts.textSec}`} title="New Folder"><FiFolderPlus className="w-3.5 h-3.5" /></button>
                    {isMobile && (
                      <button onClick={() => setSidebarOpen(false)} className={`p-1 rounded ${ts.bgHover} ${ts.textSec}`} title="Close"><FiX className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-0.5 custom-scrollbar" onContextMenu={(e) => handleContextMenu(e, null)}>
                  {fileTree.length === 0 ? (
                    <div className={`p-4 text-center text-xs ${ts.textMuted}`}>No files yet. Click + to add one.</div>
                  ) : (
                    renderTree(sortTree(fileTree))
                  )}
                </div>
              </div>
            )}

            {/* ─── Context Menu ──────────────────────────────────────── */}
            {contextMenu && (
              <div
                className={`fixed z-50 rounded-lg shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} py-0.5 min-w-36`}
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                <button
                  className={`w-full text-left px-2.5 py-1 text-xs flex items-center gap-2 ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => { addFile(contextMenu.nodeId && findNode(fileTree, contextMenu.nodeId)?.type === 'folder' ? contextMenu.nodeId : null); setContextMenu(null) }}
                >
                  <FiFilePlus className="w-3.5 h-3.5" /> New File
                </button>
                <button
                  className={`w-full text-left px-2.5 py-1 text-xs flex items-center gap-2 ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => { addFolder(contextMenu.nodeId && findNode(fileTree, contextMenu.nodeId)?.type === 'folder' ? contextMenu.nodeId : null); setContextMenu(null) }}
                >
                  <FiFolderPlus className="w-3.5 h-3.5" /> New Folder
                </button>
                {contextMenu.nodeId && (
                  <>
                    <div className={`border-t my-1 ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`} />
                    <button
                      className={`w-full text-left px-2.5 py-1 text-xs flex items-center gap-2 ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
                      onClick={() => { startRename(contextMenu.nodeId!); setContextMenu(null) }}
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Rename
                    </button>
                    <button
                      className={`w-full text-left px-2.5 py-1 text-xs flex items-center gap-2 text-red-400 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-red-50'}`}
                      onClick={() => { deleteNode(contextMenu.nodeId!); setContextMenu(null) }}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ─── Editor + Output Area ──────────────────────────────── */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 relative gap-0">
              {/* Code Editor Section */}
              <div className="flex flex-col min-w-0 w-full lg:w-auto" style={{
                width: isMobile ? '100%' : `${editorWidth}%`,
                height: isMobile ? `${mobileEditorHeight}%` : 'auto',
                flex: isMobile ? 'none' : undefined,
              }}>
                {/* Tabs */}
                <div className={`flex items-center overflow-x-auto ${ts.bgPrimary} rounded-t ${ts.borderLight} border-b custom-scrollbar`} style={{ minHeight: '28px' }}>
                  {openTabs.map(tabId => {
                    const node = findNode(fileTree, tabId)
                    if (!node) return null
                    const isActiveTab = activeFileId === tabId
                    return (
                      <div
                        key={tabId}
                        className={`flex items-center gap-1 px-2 py-1 text-xs cursor-pointer border-r shrink-0 transition-colors
                          ${isActiveTab
                            ? (isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-purple-200/60')
                            : (isDarkMode ? 'text-slate-400 hover:bg-white/5 border-white/5' : 'text-gray-500 hover:bg-purple-50 border-pink-200/40')
                          }`}
                        onClick={() => setActiveFileId(tabId)}
                      >
                        <FiFile className={`w-3 h-3 shrink-0 ${getFileIconColor(node.name, isDarkMode)}`} />
                        <span className="truncate max-w-25">{node.name}</span>
                        <button
                          onClick={(e) => closeTab(tabId, e)}
                          className={`p-0.5 rounded ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
                          title="Close tab"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Monaco Editor */}
                <div className={`flex-1 relative rounded-b overflow-hidden ${ts.border} border border-t-0 min-h-0`} suppressHydrationWarning>
                  <div className={`absolute inset-0 ${isDarkMode ? 'from-slate-900/30 to-slate-800/30' : 'bg-white'} pointer-events-none z-0`} />
                  <div className="relative z-10 h-full overflow-hidden" style={{ backgroundColor: isDarkMode ? 'transparent' : '#ffffff' }}>
                    {activeFile ? (
                      <Editor
                        height="100%"
                        language={getMonacoLanguage(activeFile.name)}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorDidMount}
                        theme={isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight'}
                        path={activeFile.id}
                        options={{
                          fontSize: isMobile ? 12 : 13,
                          fontFamily: 'Fira Code, Monaco, Menlo, "Ubuntu Mono", monospace',
                          fontLigatures: true, lineNumbers: 'on', roundedSelection: false,
                          scrollBeyondLastLine: false, automaticLayout: true,
                          minimap: { enabled: false }, wordWrap: 'on', tabSize: 2,
                          insertSpaces: true, renderLineHighlight: 'line', selectOnLineNumbers: true,
                          bracketPairColorization: { enabled: true },
                          padding: { top: isMobile ? 8 : 12, bottom: isMobile ? 8 : 12 },
                          suggest: { showKeywords: true, showSnippets: true, showFunctions: true, showVariables: true },
                          quickSuggestions: { other: true, comments: false, strings: false },
                          parameterHints: { enabled: true },
                          autoClosingBrackets: 'always', autoClosingQuotes: 'always', autoIndent: 'full',
                          formatOnPaste: true, formatOnType: true, renderWhitespace: 'selection',
                          cursorStyle: 'line', cursorBlinking: 'smooth', smoothScrolling: true,
                          mouseWheelZoom: true, contextmenu: true, folding: true,
                          foldingHighlight: true, unfoldOnClickAfterEndOfLine: false,
                          colorDecorators: true, codeLens: false,
                          scrollbar: { vertical: 'hidden', horizontal: 'hidden', verticalScrollbarSize: 0, horizontalScrollbarSize: 0 }
                        }}
                      />
                    ) : (
                      <div className={`flex items-center justify-center h-full ${ts.textMuted}`}>
                        <div className="text-center">
                          <FiCode className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Select a file to edit</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Horizontal Resizer */}
              {isMobile && (
                <div className={`h-1.5 ${ts.resizer} active:bg-white/30 cursor-row-resize transition-colors duration-200 rounded-full flex items-center justify-center group my-0.5 select-none`}
                  onMouseDown={handleMouseDown} onTouchStart={(e) => { setIsResizing(true); e.preventDefault() }} style={{ cursor: 'row-resize' }}>
                  <div className={`h-0.5 w-12 ${ts.resizerBar} group-active:bg-white/70 rounded-full transition-colors duration-200`} />
                </div>
              )}

              {/* Desktop Resizable Divider */}
              <div
                className={`${isMobile ? 'hidden' : 'lg:flex'} w-0.5 ${ts.resizer} cursor-col-resize transition-colors duration-200 rounded-full items-center justify-center group absolute top-0 bottom-0 z-10`}
                style={{ left: `${editorWidth}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
              >
                <div className={`w-0.5 h-8 ${ts.resizerBar} rounded-full transition-colors duration-200`} />
              </div>

              {/* Output Panel */}
              <div ref={outputContainerRef} className="flex flex-col min-w-0 w-full lg:w-auto overflow-hidden" style={{
                width: isMobile ? '100%' : `${100 - editorWidth}%`,
                height: isMobile ? `${100 - mobileEditorHeight}%` : 'auto',
                flex: isMobile ? 'none' : undefined,
              }}>
                {/* Input Section */}
                <div className="flex flex-col overflow-hidden" style={{ height: isMobile ? `${mobileOutputHeight}%` : `${outputHeight}%` }}>
                  <div className={`flex items-center justify-between mb-0.5 px-2 py-1 ${ts.bgPrimary} rounded ${ts.borderLight} border`}>
                    <div className="flex items-center space-x-1.5">
                      <FiTerminal className={`h-3.5 w-3.5 ${isDarkMode ? 'text-blue-400' : 'text-purple-600'}`} />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-purple-800'}`}>Input (stdin)</span>
                    </div>
                    <button
                      onClick={async () => {
                        try { const t = await navigator.clipboard.readText(); setInput(t) }
                        catch { Swal.fire({ title: 'Paste Failed', text: 'Unable to access clipboard.', icon: 'error', background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : '#fff', color: isDarkMode ? '#f8fafc' : '#1f2937', confirmButtonColor: '#ef4444' }) }
                      }}
                      className={`p-1 rounded ${ts.bgSec} border ${ts.border} ${ts.textSec} ${ts.bgHover} transition-all duration-150`}
                      title="Paste from Clipboard"
                    ><FiCode className="h-3.5 w-3.5" /></button>
                  </div>
                  <textarea
                    value={input} onChange={(e) => setInput(e.target.value)}
                    className={`flex-1 w-full p-2 sm:p-3 ${ts.bgInput} border ${ts.border} rounded ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-150 ${isDarkMode ? 'placeholder-slate-500' : 'placeholder-gray-500'} overflow-x-hidden min-h-0`}
                    placeholder="Program input (stdin)..." spellCheck={false}
                    style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.8)' }}
                  />
                </div>

                {/* Mobile Input/Output Resizer */}
                {isMobile && (
                  <div className={`h-1.5 ${ts.resizer} active:bg-white/30 cursor-row-resize transition-colors duration-200 rounded-full flex items-center justify-center group my-0.5 select-none`}
                    onMouseDown={handleVerticalMouseDown} onTouchStart={(e) => { setIsVerticalResizing(true); e.preventDefault() }} style={{ cursor: 'row-resize' }}>
                    <div className={`h-0.5 w-12 ${ts.resizerBar} group-active:bg-white/70 rounded-full transition-colors duration-200`} />
                  </div>
                )}

                {/* Desktop Vertical Resizer */}
                <div className={`${isMobile ? 'hidden' : 'lg:flex'} h-px ${ts.resizer} cursor-row-resize transition-colors duration-200 items-center justify-center group my-0.5`} onMouseDown={handleVerticalMouseDown}>
                  <div className={`h-0.5 w-8 ${ts.resizerBar} rounded-full transition-colors duration-200`} />
                </div>

                {/* Output Section */}
                <div className="flex flex-col overflow-hidden flex-1" style={{ height: isMobile ? `${100 - mobileOutputHeight}%` : undefined }}>
                  <div className={`flex items-center justify-between mb-0.5 px-2 py-1 ${ts.bgPrimary} rounded ${ts.borderLight} border`}>
                    <div className="flex items-center space-x-1.5">
                      <FiTerminal className={`h-3.5 w-3.5 ${isDarkMode ? 'text-green-400' : 'text-emerald-600'}`} />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-emerald-800'}`}>Output</span>
                    </div>
                    {output && (
                      <div className={`flex items-center space-x-1 text-xs ${ts.textMuted}`}>
                        <FiZap className="h-3 w-3" /><span>Ready</span>
                      </div>
                    )}
                  </div>
                  <div className={`flex-1 relative rounded overflow-hidden ${ts.border} border min-h-0`}>
                    <div className={`absolute inset-0 ${isDarkMode ? 'from-slate-900/40 to-slate-800/40' : 'bg-white'} pointer-events-none`} />
                    <div className={`relative h-full p-2 sm:p-3 ${ts.bgInput} font-mono text-xs whitespace-pre-wrap overflow-y-auto overflow-x-hidden ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} custom-scrollbar`}
                      style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.6)' }}>
                      {output || (
                        <div className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} italic flex items-center justify-center h-full`}>
                          <div className="text-center">
                            <FiTerminal className="h-8 w-8 mx-auto mb-1.5 opacity-30" />
                            <p className="text-xs">Output will appear here...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnlineCompiler
