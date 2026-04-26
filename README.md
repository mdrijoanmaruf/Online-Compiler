# Online Compiler

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A fast, modern, browser-based code editor and compiler supporting **10 programming languages** — with deep Codeforces integration via the CodeForge browser extension.

> **Live:** [compiler.rijoan.com](https://compiler.rijoan.com) &nbsp;·&nbsp; **Repo:** [github.com/mdrijoanmaruf/Online-Compiler](https://github.com/mdrijoanmaruf/Online-Compiler)

---

## Features

### Core Compiler
| Feature | Description |
|---|---|
| **10 Languages** | JavaScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust |
| **Monaco Editor** | VS Code engine — syntax highlighting, IntelliSense, bracket matching, code folding |
| **File / Folder System** | Create, rename, delete files and folders; edit multiple files in tabs |
| **Auto Language Detection** | Compiler and highlighting switch automatically on file extension change |
| **Boilerplate Templates** | New files auto-filled with Hello World for the detected language |
| **ZIP Download** | Download a single file or the full project as `project.zip` |
| **Stdin Support** | Provide program input before execution in normal mode |
| **Resizable Panels** | Drag to resize editor width, I/O split, and mobile editor height |
| **Dark / Light Theme** | Toggle themes; preference persisted to localStorage |
| **Error Boundary** | Monaco editor failure shows a graceful fallback with a Retry button |

### Codeforces Integration (via CodeForge Extension)
| Feature | Description |
|---|---|
| **Problem Auto-Load** | Extension sends full problem payload; compiler auto-switches to CF mode |
| **Test Case Panel** | Run sample test cases individually or all at once with pass/fail diff |
| **Problem Statement** | View the full sanitised problem statement in a modal overlay |
| **One-Click Submit** | Pre-fills Codeforces submit form with your code and language |
| **Problem Persistence** | Active problem restored from localStorage on page refresh (24 h TTL) |
| **Custom Test Cases** | Add your own test cases alongside samples; tabs show a `custom` badge |

---

## Modes

### Normal Mode
When you open the compiler directly (no CF problem loaded), the right panel shows a simple **stdin / stdout** interface with a draggable vertical splitter between input and output.

### CF Problem Mode
When a problem is loaded via the CodeForge extension, the right panel switches to the **Test Case Panel** showing all sample inputs, expected outputs, and actual results with colour-coded pass/fail status and a side-by-side diff on failure.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router, TypeScript |
| Editor | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| Execution | [Wandbox API](https://wandbox.org) via `/api/execute` proxy route |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [react-icons](https://react-icons.github.io/react-icons) Feather set |
| Alerts | [SweetAlert2](https://sweetalert2.github.io) |
| Zip Export | [JSZip](https://stuk.github.io/jszip) |

---

## Supported Languages

| Language | Version | Wandbox Compiler |
|---|---|---|
| JavaScript | Node.js 20.17.0 | nodejs-20.17.0 |
| Python | 3.12.7 | cpython-3.12.7 |
| Java | JDK 22 | openjdk-jdk-22+36 |
| C++ | GCC Head | gcc-head |
| C | GCC Head | gcc-head-c |
| C# | Mono 6.12.0 | mono-6.12.0.199 |
| PHP | 8.3.12 | php-8.3.12 |
| Ruby | 3.4.1 | ruby-3.4.1 |
| Go | 1.23.2 | go-1.23.2 |
| Rust | 1.82.0 | rust-1.82.0 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
git clone https://github.com/mdrijoanmaruf/Online-Compiler.git
cd Online-Compiler
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
Online-Compiler/
├── app/
│   ├── api/
│   │   └── execute/
│   │       └── route.ts          # Wandbox API proxy (hides endpoint, avoids CORS)
│   ├── components/
│   │   ├── DiffView.tsx          # Side-by-side expected vs actual diff
│   │   ├── EditorErrorBoundary.tsx  # React error boundary wrapping Monaco
│   │   ├── ProblemMetaBar.tsx    # CF problem metadata strip in toolbar
│   │   ├── ProblemPanel.tsx      # Full problem statement modal
│   │   └── TestCasePanel.tsx     # Test case tabs, run controls, pass/fail
│   ├── types/
│   │   └── problem.ts            # ProblemPayload & TestCaseState types
│   ├── globals.css               # Tailwind base + CSS variable utilities
│   ├── layout.tsx
│   └── page.tsx                  # Main compiler component (~1350 lines)
├── public/
├── next.config.ts
└── package.json
```

---

## How It Works

### Standalone Usage
1. **Write** code in the Monaco editor; optionally provide stdin in the Input panel
2. **Run** via button or `Ctrl+Enter` — code is sent to `/api/execute`
3. **Proxy** route forwards to [Wandbox](https://wandbox.org) free compilation service
4. **Output** appears in the Output panel; execution time shown below

### With CodeForge Extension
1. Navigate to any Codeforces problem page
2. Click **⚡ Solve on Rijoan Compiler** (injected button) or use the extension popup
3. Compiler opens at [compiler.rijoan.com](https://compiler.rijoan.com) with problem and sample tests loaded
4. Code, run individual/all tests, view the diff, and submit back to Codeforces in one click

> The API proxy prevents CORS issues and keeps the Wandbox endpoint hidden from the client.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Run code (routes to normal run or active test case) |
| `Ctrl+Shift+Enter` | Run all test cases (CF mode only) |
| `Ctrl+T` | Add a new test case (CF mode only) |
| `Ctrl+]` | Next test case tab |
| `Ctrl+[` | Previous test case tab |
| `Ctrl+D` | Duplicate line down |
| `Ctrl+U` | Duplicate line up |
| `Ctrl+Alt+F` | Format document |

---

## License

MIT © [Rijoan Maruf](https://rijoan.com)
