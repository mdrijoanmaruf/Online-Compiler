# Online Compiler

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A fast, modern, browser-based code editor and compiler supporting **10 programming languages** built with Next.js, Monaco Editor, and the Wandbox API.

>  **Live:** [compiler.rijoan.com](https://compiler.rijoan.com)   **Repo:** [github.com/mdrijoanmaruf/Online-Compiler](https://github.com/mdrijoanmaruf/Online-Compiler)

---

## Features

| Feature | Description |
|---|---|
| **10 Languages** | JavaScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust |
| **Monaco Editor** | VS Code engine with syntax highlighting, IntelliSense, bracket matching |
| **File / Folder System** | Create, rename, delete files and folders; edit in tabs |
| **Auto Language Detection** | Compiler and highlighting switch on file extension change |
| **Boilerplate Templates** | New files auto-filled with Hello World for the detected language |
| **ZIP Download** | Download one file or a full project as project.zip |
| **Stdin Support** | Provide program input before execution |
| **Resizable Panels** | Drag to resize editor, input, and output panes |
| **Dark / Light Theme** | Toggle themes; preference saved to localStorage |
| **Shortcuts** | Ctrl+Enter run, Ctrl+D/U duplicate lines, Ctrl+Alt+F format |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router, TypeScript |
| Editor | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| Execution | [Wandbox API](https://wandbox.org) via /api/execute proxy route |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [react-icons](https://react-icons.github.io/react-icons) Feather set |
| Zip Export | [JSZip](https://stuk.github.io/jszip) |
| Alerts | [SweetAlert2](https://sweetalert2.github.io) |

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
online-compiler/
├── app/
│   ├── api/execute/route.ts    # Wandbox API proxy
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main compiler component
├── public/
├── next.config.ts
└── package.json
```

---

## How It Works

1. **Write** code in the Monaco Editor and optionally provide stdin input
2. **Run** via button or Ctrl+Enter the code is sent to /api/execute
3. **Proxy** the route forwards to [Wandbox](https://wandbox.org) free compilation service
4. **Output** stdout, stderr, and compiler messages appear in the Output panel

> The API proxy prevents CORS issues and keeps the Wandbox endpoint hidden from the client.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+Enter | Run code |
| Ctrl+D | Duplicate line down |
| Ctrl+U | Duplicate line up |
| Ctrl+Alt+F | Format document |

---

## License

MIT (c) [Rijoan Maruf](https://rijoan.com)