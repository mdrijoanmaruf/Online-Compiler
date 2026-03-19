# Online Compiler

A fast, modern, browser-based code editor and compiler supporting 10 programming languages. Built with Next.js, Monaco Editor, and the Wandbox API.

**Live:** [compiler.rijoan.com](https://compiler.rijoan.com)  |  **Repo:** [github.com/mdrijoanmaruf/Online-Compiler](https://github.com/mdrijoanmaruf/Online-Compiler)

---

## Features

- **10 Languages** - JavaScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust
- **Monaco Editor** - VS Code-grade editor with syntax highlighting, IntelliSense, bracket matching, and code folding
- **File / Folder System** - create, rename, delete files and folders; open multiple files in tabs
- **Auto Language Detection** - compiler switches automatically based on file extension
- **Boilerplate Templates** - new files are pre-filled with a Hello World starter for the detected language
- **ZIP Download** - download a single file or the entire project as a project.zip
- **Stdin Support** - provide program input before execution
- **Resizable Panels** - drag to resize the editor, input, and output panes (desktop and mobile)
- **Dark / Light Theme** - toggle between themes; preference saved in localStorage
- **Keyboard Shortcuts** - Ctrl+Enter to run, Ctrl+D/Ctrl+U to duplicate lines, Ctrl+Alt+F to format

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, TypeScript) |
| Editor | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| Execution | [Wandbox API](https://wandbox.org) via Next.js API route proxy |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [react-icons](https://react-icons.github.io/react-icons) (Feather) |
| Zip Download | [JSZip](https://stuk.github.io/jszip) |
| Alerts | [SweetAlert2](https://sweetalert2.github.io) |

---

## Supported Languages

| Language | Version | Compiler |
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

`ash
git clone https://github.com/mdrijoanmaruf/Online-Compiler.git
cd Online-Compiler
npm install
`

### Development

`ash
npm run dev
`

Open http://localhost:3000 in your browser.

### Production Build

`ash
npm run build
npm start
`

---

## Project Structure

`
online-compiler/
  app/
    api/execute/route.ts    # Wandbox API proxy
    globals.css
    layout.tsx
    page.tsx                # Main compiler component
  public/
  next.config.ts
  package.json
`

---

## How It Works

1. User writes code in the Monaco Editor
2. On Run (Ctrl+Enter), code is sent to /api/execute Next.js route
3. The route forwards the request to Wandbox free compilation service
4. The response (stdout, stderr, compiler messages) is displayed in the Output panel

The API proxy prevents CORS issues and keeps the Wandbox endpoint hidden from the client.

---

## License

MIT (c) [Rijoan Maruf](https://rijoan.com)