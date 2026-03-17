'use client'

import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  FiPlay, FiDownload, FiRefreshCw,
  FiCode, FiTerminal, FiClock, FiZap,
  FiCopy, FiSun, FiMoon
} from 'react-icons/fi'
import Swal from 'sweetalert2'

// Language configurations for Piston API with Monaco Editor language IDs
const LANGUAGES = [
  { 
    id: 'javascript', 
    name: 'JavaScript', 
    version: '20.17.0', 
    extension: 'js', 
    color: '#f7df1e',
    monacoLanguage: 'javascript',
    wandboxCompiler: 'nodejs-20.17.0',
    template: 'console.log("Hello, World!");'
  },
  { 
    id: 'python', 
    name: 'Python', 
    version: '3.12.7', 
    extension: 'py', 
    color: '#3776ab',
    monacoLanguage: 'python',
    wandboxCompiler: 'cpython-3.12.7',
    template: 'print("Hello, World!")'
  },
  { 
    id: 'java', 
    name: 'Java', 
    version: '22', 
    extension: 'java', 
    color: '#ed8b00',
    monacoLanguage: 'java',
    wandboxCompiler: 'openjdk-jdk-22+36',
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
  },
  { 
    id: 'cpp', 
    name: 'C++', 
    version: 'GCC Head', 
    extension: 'cpp', 
    color: '#00599c',
    monacoLanguage: 'cpp',
    wandboxCompiler: 'gcc-head',
    template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
  },
  { 
    id: 'c', 
    name: 'C', 
    version: 'GCC Head', 
    extension: 'c', 
    color: '#a8b9cc',
    monacoLanguage: 'c',
    wandboxCompiler: 'gcc-head-c',
    template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
  },
  { 
    id: 'csharp', 
    name: 'C#', 
    version: '6.12.0', 
    extension: 'cs', 
    color: '#239120',
    monacoLanguage: 'csharp',
    wandboxCompiler: 'mono-6.12.0.199',
    template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}'
  },
  { 
    id: 'php', 
    name: 'PHP', 
    version: '8.3.12', 
    extension: 'php', 
    color: '#777bb4',
    monacoLanguage: 'php',
    wandboxCompiler: 'php-8.3.12',
    template: '<?php\necho "Hello, World!";\n?>'
  },
  { 
    id: 'ruby', 
    name: 'Ruby', 
    version: '3.4.1', 
    extension: 'rb', 
    color: '#cc342d',
    monacoLanguage: 'ruby',
    wandboxCompiler: 'ruby-3.4.1',
    template: 'puts "Hello, World!"'
  },
  { 
    id: 'go', 
    name: 'Go', 
    version: '1.23.2', 
    extension: 'go', 
    color: '#00add8',
    monacoLanguage: 'go',
    wandboxCompiler: 'go-1.23.2',
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'
  },
  { 
    id: 'rust', 
    name: 'Rust', 
    version: '1.82.0', 
    extension: 'rs', 
    color: '#000000',
    monacoLanguage: 'rust',
    wandboxCompiler: 'rust-1.82.0',
    template: 'fn main() {\n    println!("Hello, World!");\n}'
  }
]

const OnlineCompiler = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0])
  const [code, setCode] = useState(LANGUAGES[0].template)
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('compiler-theme')
      return saved === 'dark' || !saved
    }
    return true
  })
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    const handleResize = () => checkMobile()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load saved preferences
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLanguage = urlParams.get('language')
    const urlCode = urlParams.get('code')
    
    if (urlLanguage && urlCode) {
      const lang = LANGUAGES.find(l => l.id === urlLanguage)
      if (lang) {
        setSelectedLanguage(lang)
        setCode(decodeURIComponent(urlCode))
        return
      }
    }
    
    const savedLang = localStorage.getItem('compiler-language')
    const savedCode = localStorage.getItem('compiler-code')
    const savedEditorWidth = localStorage.getItem('compiler-editor-width')
    const savedOutputHeight = localStorage.getItem('compiler-output-height')
    const savedMobileEditorHeight = localStorage.getItem('compiler-mobile-editor-height')
    const savedMobileOutputHeight = localStorage.getItem('compiler-mobile-output-height')
    
    if (savedLang) {
      const lang = LANGUAGES.find(l => l.id === savedLang)
      if (lang) {
        setSelectedLanguage(lang)
        setCode(savedCode || lang.template)
      }
    }
    
    if (savedEditorWidth) {
      const width = parseFloat(savedEditorWidth)
      if (width >= 20 && width <= 80) setEditorWidth(width)
    }
    
    if (savedOutputHeight) {
      const height = parseFloat(savedOutputHeight)
      if (height >= 30 && height <= 85) setOutputHeight(height)
    }
    
    if (savedMobileEditorHeight) {
      const height = parseFloat(savedMobileEditorHeight)
      if (height >= 25 && height <= 75) setMobileEditorHeight(height)
    }
    
    if (savedMobileOutputHeight) {
      const height = parseFloat(savedMobileOutputHeight)
      if (height >= 30 && height <= 85) setMobileOutputHeight(height)
    }
  }, [])

  // Save preferences
  useEffect(() => {
    const savePreferences = () => {
      localStorage.setItem('compiler-language', selectedLanguage.id)
      localStorage.setItem('compiler-code', code)
      localStorage.setItem('compiler-editor-width', editorWidth.toString())
      localStorage.setItem('compiler-output-height', outputHeight.toString())
      localStorage.setItem('compiler-mobile-editor-height', mobileEditorHeight.toString())
      localStorage.setItem('compiler-mobile-output-height', mobileOutputHeight.toString())
      localStorage.setItem('compiler-theme', isDarkMode ? 'dark' : 'light')
    }
    
    const timeoutId = setTimeout(savePreferences, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedLanguage, code, editorWidth, outputHeight, mobileEditorHeight, mobileOutputHeight, isDarkMode])

  // Update Monaco editor theme when isDarkMode changes
  useEffect(() => {
    if (editorRef.current) {
      const { monaco } = editorRef.current
      monaco.editor.setTheme(isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight')
    }
  }, [isDarkMode])

  // Handle horizontal resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  // Handle vertical resizing
  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    setIsVerticalResizing(true)
    e.preventDefault()
  }

  // Mouse move and up handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      if (isResizing) {
        if (isMobile) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100
          setMobileEditorHeight(Math.min(Math.max(newHeight, 25), 75))
        } else {
          const containerRect = containerRef.current.getBoundingClientRect()
          const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
          setEditorWidth(Math.min(Math.max(newWidth, 20), 80))
        }
      }

      if (isVerticalResizing && outputContainerRef.current) {
        if (isMobile) {
          const containerRect = outputContainerRef.current.getBoundingClientRect()
          const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100
          setMobileOutputHeight(Math.min(Math.max(newHeight, 30), 85))
        } else {
          const containerRect = outputContainerRef.current.getBoundingClientRect()
          const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100
          setOutputHeight(Math.min(Math.max(newHeight, 30), 85))
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !isMobile) return
      const touch = e.touches[0]

      if (isResizing) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newHeight = ((touch.clientY - containerRect.top) / containerRect.height) * 100
        setMobileEditorHeight(Math.min(Math.max(newHeight, 25), 75))
        e.preventDefault()
      }

      if (isVerticalResizing && outputContainerRef.current) {
        const containerRect = outputContainerRef.current.getBoundingClientRect()
        const newHeight = ((touch.clientY - containerRect.top) / containerRect.height) * 100
        setMobileOutputHeight(Math.min(Math.max(newHeight, 30), 85))
        e.preventDefault()
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsVerticalResizing(false)
    }

    const handleTouchEnd = () => {
      setIsResizing(false)
      setIsVerticalResizing(false)
    }

    if (isResizing || isVerticalResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isResizing, isVerticalResizing, isMobile])

  // Monaco editor configuration
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = { editor, monaco }
    
    // Define liquid glass dark theme
    monaco.editor.defineTheme('liquidGlassDark', {
      base: 'vs-dark',
      inherit: true,
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
        'editor.background': '#0f172a40',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#ffffff08',
        'editor.selectionBackground': '#3b82f640',
        'editor.inactiveSelectionBackground': '#3b82f620',
        'editorCursor.foreground': '#3b82f6',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.findMatchBackground': '#3b82f640',
        'editor.findMatchHighlightBackground': '#3b82f620',
        'editorWidget.background': '#1e293b',
        'editorWidget.border': '#334155',
        'editorSuggestWidget.background': '#1e293b',
        'editorSuggestWidget.border': '#334155',
        'editorHoverWidget.background': '#1e293b',
        'editorHoverWidget.border': '#334155',
      }
    })

    // Define liquid glass light theme
    monaco.editor.defineTheme('liquidGlassLight', {
      base: 'vs',
      inherit: true,
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
        'editor.background': '#ffffff',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#00000008',
        'editor.selectionBackground': '#3b82f640',
        'editor.inactiveSelectionBackground': '#3b82f620',
        'editorCursor.foreground': '#3b82f6',
        'editorLineNumber.foreground': '#6a737d',
        'editorLineNumber.activeForeground': '#24292e',
        'editor.findMatchBackground': '#3b82f640',
        'editor.findMatchHighlightBackground': '#3b82f620',
        'editorWidget.background': '#f6f8fa',
        'editorWidget.border': '#e1e4e8',
        'editorSuggestWidget.background': '#f6f8fa',
        'editorSuggestWidget.border': '#e1e4e8',
        'editorHoverWidget.background': '#f6f8fa',
        'editorHoverWidget.border': '#e1e4e8',
      }
    })
    
    monaco.editor.setTheme(isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight')
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeCode()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.copyLinesDownAction').run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU, () => {
      editor.getAction('editor.action.copyLinesUpAction').run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run()
    })
  }

  const executeCode = async () => {
    if (!code.trim()) {
      Swal.fire({
        title: 'No Code',
        text: 'Please enter some code to execute.',
        icon: 'warning',
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#f8fafc',
        confirmButtonColor: '#3b82f6',
      })
      return
    }

    setIsExecuting(true)
    setOutput('Executing...')
    setExecutionTime(null)

    try {
      const startTime = Date.now()
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          compiler: selectedLanguage.wandboxCompiler,
          stdin: input,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const endTime = Date.now()
      setExecutionTime(endTime - startTime)

      let outputText = ''

      if (result.compiler_message) {
        outputText += result.compiler_message
      }

      if (result.program_output) {
        outputText += result.program_output
      }

      if (result.program_error) {
        outputText += result.program_error
      }
      
      if (!outputText) {
        outputText = 'Program executed successfully with no output.'
      }

      setOutput(outputText)

    } catch (error: any) {
      console.error('Execution error:', error)
      setOutput(`Error: ${error.message}\n\nPlease check your internet connection and try again.`)
      
      Swal.fire({
        title: 'Execution Failed',
        text: 'Failed to execute code. Please try again.',
        icon: 'error',
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleLanguageChange = (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language)
    setCode(language.template)
    setOutput('')
    setExecutionTime(null)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const saveCode = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `code.${selectedLanguage.extension}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      Swal.fire({
        title: 'Copied!',
        text: 'Code copied to clipboard.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#f8fafc',
      })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Liquid glass style
  const glassStyle = isDarkMode 
    ? "backdrop-blur-3xl shadow-2xl shadow-black/20"
    : "backdrop-blur-3xl shadow-2xl shadow-gray-500/20"

  // Theme-aware styles
  const themeStyles = {
    background: isDarkMode 
      ? 'from-slate-900/30 to-slate-800/30' 
      : 'from-purple-100/80 via-pink-50/80 to-cyan-100/80',
    text: isDarkMode ? 'text-gray-900 dark:text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-600 dark:text-slate-300' : 'text-purple-800',
    textMuted: isDarkMode ? 'text-gray-500 dark:text-slate-400' : 'text-indigo-600',
    border: isDarkMode ? 'border-white/10' : 'border-purple-200/80',
    borderLight: isDarkMode ? 'border-white/5' : 'border-pink-200/60',
    bgPrimary: isDarkMode ? 'bg-white/5' : 'bg-linear-to-r from-purple-100/60 to-pink-100/60',
    bgSecondary: isDarkMode ? 'bg-white/10' : 'bg-linear-to-r from-indigo-100/70 to-cyan-100/70',
    bgHover: isDarkMode ? 'hover:bg-white/20' : 'hover:bg-linear-to-r hover:from-purple-200/80 hover:to-pink-200/80',
    bgInput: isDarkMode ? 'bg-slate-900/20' : 'bg-white',
    bgModal: isDarkMode ? 'bg-white/10' : 'bg-linear-to-br from-white/95 to-purple-50/95',
    resizer: isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-linear-to-r from-purple-300/40 to-pink-300/40 hover:from-purple-400/60 hover:to-pink-400/60',
    resizerBar: isDarkMode ? 'bg-white/20 group-hover:bg-white/40' : 'bg-linear-to-r from-purple-500/60 to-pink-500/60 group-hover:from-purple-600/80 group-hover:to-pink-600/80'
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-linear-to-br from-purple-50 via-pink-50 to-cyan-50'}`}
      suppressHydrationWarning
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDarkMode ? 'bg-linear-to-br from-cyan-500/10 to-blue-600/10' : 'bg-linear-to-br from-pink-400/30 to-purple-500/30'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDarkMode ? 'bg-linear-to-br from-purple-500/10 to-pink-600/10' : 'bg-linear-to-br from-cyan-400/30 to-indigo-500/30'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isDarkMode ? 'bg-linear-to-br from-teal-500/5 to-cyan-600/5' : 'bg-linear-to-br from-orange-300/25 to-pink-400/25'} rounded-full blur-3xl`} />
      </div>

      <div className="h-full w-full flex flex-col overflow-hidden relative z-10">
        {/* Main Editor Area - Resizable Layout */}
        <div className={`${glassStyle} flex-1 flex flex-col min-h-0 overflow-hidden p-1 sm:p-3 lg:p-4`}>
          {/* Code Editor Header with Controls */}
          <div className={`flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-3 px-2 sm:px-3 py-2 sm:py-3 ${themeStyles.bgPrimary} rounded-lg ${themeStyles.borderLight} border`}>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Left side: Language */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Language Selector */}
                <select
                  value={selectedLanguage.id}
                  onChange={(e) => {
                    const lang = LANGUAGES.find(l => l.id === e.target.value)
                    if (lang) handleLanguageChange(lang)
                  }}
                  title="Select programming language"
                  className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md ${themeStyles.bgSecondary} ${themeStyles.border} border ${themeStyles.text} focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 text-xs sm:text-sm min-w-0 shrink`}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id} className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
                      {lang.name}
                    </option>
                  ))}
                </select>

                <div className={`hidden lg:block text-sm ${themeStyles.textMuted} ${themeStyles.bgPrimary} px-3 py-1.5 rounded-md ${themeStyles.borderLight} border`}>
                  Ctrl+Enter
                </div>
              </div>

              {/* Right side: All action buttons */}
              <div className="flex items-center gap-1">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className={`p-1.5 sm:p-2 rounded-md ${themeStyles.bgSecondary} border ${themeStyles.border} ${themeStyles.textSecondary} ${themeStyles.bgHover} transition-all duration-150`}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? <FiSun className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiMoon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>

                <button
                  onClick={copyCode}
                  className={`p-1.5 sm:p-2 rounded-md ${themeStyles.bgSecondary} border ${themeStyles.border} ${themeStyles.textSecondary} ${themeStyles.bgHover} transition-all duration-150`}
                  title="Copy Code"
                >
                  <FiCopy className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <button
                  onClick={saveCode}
                  className={`p-1.5 sm:p-2 rounded-md ${themeStyles.bgSecondary} border ${themeStyles.border} ${themeStyles.textSecondary} ${themeStyles.bgHover} transition-all duration-150`}
                  title="Download Code"
                >
                  <FiDownload className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Execute Button */}
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 ${isDarkMode ? 'bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : 'bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600'} text-white rounded-md transition-all duration-150 flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-xs sm:text-sm font-medium`}
                >
                  {isExecuting ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="hidden sm:inline">Running...</span>
                      <span className="sm:hidden">Run</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Run</span>
                    </>
                  )}
                </button>

                {executionTime && (
                  <div className={`hidden sm:flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${themeStyles.textMuted} ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-linear-to-r from-emerald-100 to-green-100 border border-emerald-300/60'} px-2 sm:px-3 py-1.5 rounded-md`}>
                    <FiClock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{executionTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resizable Editor and Output Container */}
          <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row min-h-0 relative gap-1 lg:gap-0">
            {/* Code Editor Section */}
            <div className="flex flex-col min-w-0 w-full lg:w-auto mb-1 lg:mb-0" style={{ 
              width: isMobile ? '100%' : `${editorWidth}%`,
              height: isMobile ? `${mobileEditorHeight}%` : 'auto'
            }}>
              {/* Monaco Editor */}
              <div className={`flex-1 relative rounded overflow-hidden ${themeStyles.border} border min-h-0 ${isMobile ? '' : 'mr-2'}`} suppressHydrationWarning>
                <div className={`absolute inset-0 ${isDarkMode ? 'from-slate-900/30 to-slate-800/30' : 'bg-white'} pointer-events-none z-0`}></div>
                <div className="relative z-10 h-full overflow-hidden" style={{ backgroundColor: isDarkMode ? 'transparent' : '#ffffff' }}>
                  <Editor
                    height="100%"
                    language={selectedLanguage.monacoLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    theme={isDarkMode ? 'liquidGlassDark' : 'liquidGlassLight'}
                    options={{
                      fontSize: isMobile ? 12 : 13,
                      fontFamily: 'Fira Code, Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontLigatures: true,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      bracketPairColorization: { enabled: true },
                      padding: { top: isMobile ? 8 : 12, bottom: isMobile ? 8 : 12 },
                      suggest: {
                        showKeywords: true,
                        showSnippets: true,
                        showFunctions: true,
                        showVariables: true,
                      },
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false
                      },
                      parameterHints: { enabled: true },
                      autoClosingBrackets: 'always',
                      autoClosingQuotes: 'always',
                      autoIndent: 'full',
                      formatOnPaste: true,
                      formatOnType: true,
                      renderWhitespace: 'selection',
                      cursorStyle: 'line',
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      mouseWheelZoom: true,
                      contextmenu: true,
                      folding: true,
                      foldingHighlight: true,
                      unfoldOnClickAfterEndOfLine: false,
                      colorDecorators: true,
                      codeLens: false,
                      scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                        verticalScrollbarSize: 0,
                        horizontalScrollbarSize: 0,
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Horizontal Resizer */}
            {isMobile && (
              <div
                className={`h-2 ${themeStyles.resizer} active:bg-white/30 cursor-row-resize transition-colors duration-200 rounded-full flex items-center justify-center group my-1 select-none`}
                onMouseDown={handleMouseDown}
                onTouchStart={(e) => {
                  setIsResizing(true)
                  e.preventDefault()
                }}
                style={{ cursor: 'row-resize' }}
              >
                <div className={`h-0.5 w-12 ${themeStyles.resizerBar} group-active:bg-white/70 rounded-full transition-colors duration-200`}></div>
              </div>
            )}

            {/* Desktop Resizable Divider */}
            <div
              className={`${isMobile ? 'hidden' : 'lg:flex'} w-1 ${themeStyles.resizer} cursor-col-resize transition-colors duration-200 rounded-full items-center justify-center group absolute top-0 bottom-0 z-10`}
              style={{ left: `${editorWidth}%`, transform: 'translateX(-50%)' }}
              onMouseDown={handleMouseDown}
            >
              <div className={`w-0.5 h-8 ${themeStyles.resizerBar} rounded-full transition-colors duration-200`}></div>
            </div>
            
            {/* Output Panel */}
            <div ref={outputContainerRef} className="flex flex-col min-w-0 w-full lg:w-auto overflow-hidden" style={{ 
              width: isMobile ? '100%' : `${100 - editorWidth}%`,
              height: isMobile ? `${100 - mobileEditorHeight}%` : 'auto'
            }}>
              {/* Input Section */}
              <div className="flex flex-col overflow-hidden h-full lg:h-auto" style={{ height: isMobile ? `${mobileOutputHeight}%` : `${outputHeight}%` }}>
                <div className={`flex items-center justify-between mb-1 sm:mb-2 px-2 sm:px-3 py-1.5 sm:py-2 ${themeStyles.bgPrimary} rounded ${themeStyles.borderLight} border`}>
                  <div className="flex items-center space-x-2">
                    <FiTerminal className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600'}`} />
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-700 dark:text-slate-200' : 'text-purple-800'}`}>Input (stdin)</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText()
                        setInput(text)
                      } catch (error) {
                        console.error('Failed to paste:', error)
                        Swal.fire({
                          title: 'Paste Failed',
                          text: 'Unable to access clipboard.',
                          icon: 'error',
                          background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          color: isDarkMode ? '#f8fafc' : '#1f2937',
                          confirmButtonColor: '#ef4444',
                        })
                      }
                    }}
                    className={`p-1.5 sm:p-2 rounded-md ${themeStyles.bgSecondary} border ${themeStyles.border} ${themeStyles.textSecondary} ${themeStyles.bgHover} transition-all duration-150`}
                    title="Paste from Clipboard"
                  >
                    <FiCode className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`flex-1 w-full p-1.5 sm:p-4 ${themeStyles.bgInput} border ${themeStyles.border} rounded ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-150 ${isDarkMode ? 'placeholder-slate-500' : 'placeholder-gray-500'} overflow-x-hidden min-h-0`}
                  placeholder="Program input (stdin)..."
                  spellCheck={false}
                  style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>

              {/* Mobile Input/Output Resizer */}
              {isMobile && (
                <div
                  className={`h-2 ${themeStyles.resizer} active:bg-white/30 cursor-row-resize transition-colors duration-200 rounded-full flex items-center justify-center group my-1 select-none`}
                  onMouseDown={handleVerticalMouseDown}
                  onTouchStart={(e) => {
                    setIsVerticalResizing(true)
                    e.preventDefault()
                  }}
                  style={{ cursor: 'row-resize' }}
                >
                  <div className={`h-0.5 w-12 ${themeStyles.resizerBar} group-active:bg-white/70 rounded-full transition-colors duration-200`}></div>
                </div>
              )}

              {/* Desktop Vertical Resizer */}
              <div
                className={`${isMobile ? 'hidden' : 'lg:flex'} h-1 ${themeStyles.resizer} cursor-row-resize transition-colors duration-200 rounded-full items-center justify-center group my-2`}
                onMouseDown={handleVerticalMouseDown}
              >
                <div className={`h-0.5 w-8 ${themeStyles.resizerBar} rounded-full transition-colors duration-200`}></div>
              </div>

              {/* Output Section */}
              <div className="flex flex-col overflow-hidden h-full lg:h-auto" style={{ height: isMobile ? `${100 - mobileOutputHeight}%` : `${100 - outputHeight}%` }}>
                {/* Output Header */}
                <div className={`flex items-center justify-between mb-1 sm:mb-2 px-2 sm:px-3 py-1.5 sm:py-2 ${themeStyles.bgPrimary} rounded ${themeStyles.borderLight} border`}>
                  <div className="flex items-center space-x-2">
                    <FiTerminal className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-green-600 dark:text-green-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-700 dark:text-slate-200' : 'text-emerald-800'}`}>Output</span>
                  </div>
                  {output && (
                    <div className={`flex items-center space-x-2 text-xs ${themeStyles.textMuted}`}>
                      <div className="flex items-center space-x-1">
                        <FiZap className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">Ready</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Content */}
                <div className={`flex-1 relative rounded overflow-hidden ${themeStyles.border} border min-h-0`}>
                  <div className={`absolute inset-0 ${isDarkMode ? 'from-slate-900/40 to-slate-800/40' : 'bg-white'} pointer-events-none`}></div>
                  <div className={`relative h-full p-1.5 sm:p-4 ${themeStyles.bgInput} font-mono text-xs whitespace-pre-wrap overflow-y-auto overflow-x-hidden ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} custom-scrollbar`}
                       style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.6)' }}>
                    {output || (
                      <div className={`${isDarkMode ? 'text-gray-500 dark:text-slate-400' : 'text-gray-500'} italic flex items-center justify-center h-full`}>
                        <div className="text-center">
                          <FiTerminal className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-30" />
                          <p className="text-xs sm:text-sm">Output will appear here...</p>
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
  )
}

export default OnlineCompiler
