A browser-based playground where users write React/TS code in a CodeMirror 6 editor, get real language intelligence from an in-browser LSP/language-service layer, and see the result rendered live in a sandboxed iframe — with multi-file support, npm package imports, and shareable URLs. Think CodeSandbox, but yours.
Tech stack
Vite + React + TypeScript, pnpm workspaces if you want to split editor/runtime/shared types. CodeMirror 6 for the editor, a Web Worker-backed TypeScript/LSP service for diagnostics, hover, completions, and cross-file awareness, esbuild-wasm for in-browser bundling, an iframe with sandbox attribute for execution, Zustand for state, and Tailwind or vanilla CSS — your call. Deploy on Vercel or Cloudflare Pages.
Week 1 — Foundations & editor
Get CodeMirror 6 rendering inside React with proper TypeScript syntax highlighting and an editor extension structure that can receive diagnostics, hover tooltips, and completions from the language-service worker. Build a virtual file system in memory: Map<string, { content, language }>. Add a file tree sidebar with create/rename/delete. Make the language-service layer understand all files in the VFS so cross-file imports, diagnostics, and completions are platform features from the start.
Wow moment to nail: Cmd+P fuzzy file finder, like VS Code.
Week 2 — Bundling & live preview
Wire up esbuild-wasm to bundle your virtual filesystem into a single JS blob whenever files change (debounced, ~300ms). Render the bundle inside an iframe with sandbox="allow-scripts" — this is the security story you'll want to articulate in interviews. Resolve npm imports by rewriting them to https://esm.sh/{package} or unpkg before bundling. Add an error overlay when bundling fails.
Wow moment: Type import { motion } from "framer-motion" and have it Just Work without configuration.
Week 3 — Polish that signals seniority
Console panel that captures console.log from the iframe via postMessage. Resizable split panes (use react-resizable-panels). A network panel showing fetched modules. Persist state to IndexedDB so refresh doesn't wipe work. Shareable URLs — gzip the filesystem, base64 it, stuff it in the URL hash. Dark mode that actually looks good (this matters more than you think for interview demos). Keyboard shortcuts everywhere.
Wow moment: Share a URL with a coworker and have them open the exact same playground state.
Week 4 — The differentiators
Pick 2 of these — they're what separate your project from every bootcamp clone:
A prettier-on-save integration via prettier's web build. Multi-cursor collaborative editing using Yjs + a free WebSocket relay (huge interview talking point). A template gallery — React, Vue, Svelte, vanilla — showing your editor isn't React-locked. Type errors inline by running the TS compiler in a Web Worker. A "download as zip" feature using JSZip. AI completion via the Anthropic API with a bring-your-own-key field.
Then: write a README that's actually good (architecture diagram, the hard problems you solved, tradeoffs), record a 60-second demo GIF for the top of the README, and deploy.
How to talk about it in interviews
Lead with the hard parts: "I had to solve module resolution in the browser without a Node.js runtime", "I sandboxed user code with iframe sandboxing and postMessage for the console bridge", "I wired CodeMirror to a worker-backed TypeScript/LSP layer so diagnostics, hover, completions, and cross-file awareness work without blocking the UI." These sentences make interviewers lean forward.
