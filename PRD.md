# CodePlay — Product Requirements Doc & 4-Week Build Plan

> A browser-based code playground (mini CodeSandbox) — built solo in 4 weeks for portfolio and interview impact.

---

## 1. Project Summary

**Working name:** CodePlay (rename later)

**One-liner:** A browser-based playground where you write React/TypeScript code in a real editor, install npm packages, and see the output rendered live in a sandboxed iframe — with multiplayer collaboration and shareable URLs.

**Why this project:** Building an in-browser IDE forces you to solve real engineering problems most frontend devs never touch — module resolution without Node, sandboxing untrusted code, in-browser bundling, language server integration, real-time sync. It's the single most impressive deliverable on the "show off in interview" list because it demonstrates depth across editor architecture, build tooling, security, performance, and collaboration.

**Time budget:** ~4 weeks, evenings + weekends. Realistically 60–80 hours total.

**Success criteria:**

1. Live, deployed URL someone can open and use without sign-up.
2. Type `import { motion } from "framer-motion"` and have it just work.
3. Open the same URL in two tabs → see live cursors and synced edits.
4. Repo with a README that reads like a senior engineer wrote it (architecture diagram, hard problems, tradeoffs).
5. Demoable in 60 seconds. Three "wow moments" prepared.

---

## 2. Goals & Non-Goals

### Goals

- Demonstrate depth in editor architecture (CodeMirror 6 extensions, transactions, state model).
- Demonstrate browser-bundling (esbuild-wasm, ESM CDN module resolution).
- Demonstrate sandboxing & security thinking (iframe sandbox, postMessage bridge).
- Demonstrate realtime collaboration (Yjs CRDT + WebSocket provider).
- Ship something polished enough that visual taste is obvious in the first 5 seconds.

### Non-Goals

- Beating CodeSandbox/StackBlitz on features. Not the point.
- Server-side language servers (Val Town's current setup). Out of scope for solo 4 weeks.
- Multi-language support. Stick to React + TS + CSS.
- Authentication, user accounts, persistence beyond IndexedDB + URL hash.
- Mobile-first. Desktop is the primary surface.
- WebContainers/full Node runtime. We're bundling, not running Node.

---

## 3. Target User & Use Cases

**Primary user:** Hiring managers and interviewers reviewing your portfolio. They open the link, expect to be impressed in under 60 seconds.

**Secondary user:** You, in interviews — opening it on a shared screen and walking through a feature in 5–10 minutes.

**Top 3 use cases:**

1. Open the URL, see a working React counter component, edit a number, watch it update live.
2. Click "share", paste the URL in a second tab, see live cursors and synced edits.
3. Add a new file, type `import lodash`, watch the import resolve and run.

---

## 4. Tech Stack

| Layer                | Choice                                                | Why                                                                            |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Framework            | React 18 + Vite                                       | Fast dev loop, you already know it.                                            |
| Language             | TypeScript (strict)                                   | Non-negotiable for credibility.                                                |
| Package manager      | pnpm                                                  | Your default. Workspaces if you split editor/runtime/shared.                   |
| Editor               | CodeMirror 6                                          | What Replit, Sourcegraph, Livebook, Val Town all use. ~250KB vs Monaco's 2MB+. |
| Bundler (in-browser) | esbuild-wasm                                          | Fast, well-documented, browser-ready.                                          |
| Module resolution    | esm.sh                                                | One-line npm-to-URL rewrite.                                                   |
| Sandboxing           | iframe with `sandbox` attr + postMessage              | Web platform standard, talkable in interviews.                                 |
| State                | Zustand                                               | Lightweight, no boilerplate.                                                   |
| Worker comms         | Comlink                                               | Same pattern Val Town used originally.                                         |
| Realtime             | Yjs + y-codemirror.next + y-websocket                 | Same stack Liveblocks/Livebook use.                                            |
| Persistence          | IndexedDB (via idb-keyval) + URL hash (gzip + base64) | No backend needed.                                                             |
| Styling              | Tailwind                                              | Speed. Don't bikeshed.                                                         |
| Hosting              | Vercel or Cloudflare Pages                            | Free, instant deploys.                                                         |
| WebSocket relay      | y-websocket on Render free tier (or PartyKit)         | Cheapest path to multiplayer.                                                  |

---

## 5. Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│  Main Thread (React App)                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ File Tree    │  │ CodeMirror   │  │ Preview Frame   │  │
│  │ (sidebar)    │  │ Editor       │  │ (iframe)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────▲────────┘  │
│         │                 │                   │            │
│         └─────────┬───────┘                   │            │
│                   ▼                           │            │
│         ┌──────────────────┐                  │            │
│         │ Virtual FS       │                  │            │
│         │ (Zustand store)  │                  │            │
│         └────┬─────────┬───┘                  │            │
│              │         │                      │            │
│              ▼         ▼                      │            │
│      ┌────────────┐  ┌─────────────┐         │            │
│      │ TS Worker  │  │ Bundle      │─────────┘            │
│      │ (Comlink)  │  │ Worker      │   postMessage         │
│      │ - hover    │  │ (esbuild-   │   (HTML blob URL)     │
│      │ - autocompl│  │  wasm)      │                       │
│      │ - diagnos  │  └─────────────┘                       │
│      └────────────┘                                         │
│                                                             │
│  Yjs Doc ◄──────► WebSocket Provider ◄──────► Relay        │
└────────────────────────────────────────────────────────────┘
```

**Key data flow:**

1. User types in CodeMirror → CodeMirror dispatches transaction → Yjs syncs to other clients → Zustand updates virtual FS.
2. Debounced (300ms) → bundle worker reads FS → esbuild-wasm bundles → produces blob URL → posts to iframe.
3. TS worker watches FS → provides diagnostics, hover, completion to CodeMirror via Comlink.

---

## 6. Feature List (MoSCoW prioritized)

### Must have (Week 1–2)

- CodeMirror 6 editor with TS/JS/CSS syntax highlighting
- Virtual file system (create, rename, delete, view)
- File tree sidebar
- esbuild-wasm bundling pipeline
- Sandboxed iframe preview
- npm import resolution via esm.sh
- Error overlay when bundling fails
- Persistence to IndexedDB
- Resizable split panes

### Should have (Week 3)

- Console panel capturing iframe `console.log`
- Cmd+P fuzzy file finder
- Shareable URL (gzip + base64 in hash)
- Keyboard shortcuts (save, format, run)
- Dark mode (default)
- Prettier-on-save (via prettier web build)
- Loading states + skeletons

### Could have (Week 4 — pick 2)

- Multiplayer cursors + sync (Yjs)
- TypeScript diagnostics in editor (hover tooltips, red squigglies)
- Network panel (modules fetched)
- "Download as zip" (JSZip)
- CodeMirror Interact (drag numbers to edit) — Replit's library
- Template gallery (React, Vue, Vanilla)
- AI completion (BYO Anthropic key)

### Won't have (out of scope)

- Sign-up / accounts
- Server-side LSP
- Real Node runtime / WebContainers
- Multi-language (Python, Go, etc.)
- Forking/version history
- Mobile editing UX

---

## 7. The Interview Pitch

Memorize this. Practice it out loud.

> "I built CodePlay, a browser-based code playground. Three things I'm proud of:
>
> First, the bundling pipeline. There's no Node.js in a browser, so I run esbuild-wasm in a Web Worker, rewrite npm imports to esm.sh URLs, and stream the output as a blob URL into a sandboxed iframe. The whole bundle-to-preview cycle is under 200ms.
>
> Second, the TypeScript integration. I run the TypeScript compiler in a separate Web Worker, talk to it via Comlink, and pipe diagnostics into CodeMirror as decorations. Same pattern Val Town used originally before they moved to a server-side LSP. I chose the client-side path because shipping a backend was out of scope for a 4-week project, and the worker approach taught me a lot more.
>
> Third, multiplayer. Open the URL in two tabs and you see live cursors. That's Yjs — a CRDT — synced through y-codemirror.next, with a free WebSocket relay. Same stack Livebook uses for collaborative notebooks.
>
> The whole thing is under 500KB compressed. I picked CodeMirror over Monaco specifically because of bundle size and extension composability — Sourcegraph and Replit both wrote up that decision and I wanted to internalize the same tradeoffs."

That's 90 seconds. It hits architecture, security, async/concurrency, realtime, and shows you've read the industry literature.

---

## 8. Risks & Mitigations

| Risk                                        | Likelihood | Mitigation                                                                   |
| ------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| esbuild-wasm setup is fiddly with Vite      | High       | Start week 1 day 1 with a minimal repro. Don't move on until bundling works. |
| CodeMirror 6 learning curve                 | Medium     | Read the System Guide cover-to-cover before week 1. It's short.              |
| TS-in-worker is way more work than expected | High       | Make it a week 4 stretch goal, not a must-have. Skip if needed.              |
| Multiplayer relay falls over on free tier   | Low        | y-websocket + Render free tier handles dozens of concurrent users fine.      |
| Scope creep destroys the timeline           | Very High  | The MoSCoW list above is the contract. Re-read it weekly.                    |
| Polish gets skipped, project looks janky    | High       | Reserve all of week 4 for polish + README + demo recording, no exceptions.   |

---

# Week-by-Week Plan

Each week ends with a deployed, demoable build. No exceptions. Ship every Friday/Sunday.

---

## Week 1 — Foundation (Editor + File System)

**Goal:** A CodeMirror editor with multiple files, a file tree, and persistence. No preview yet.

### Day 1–2: Project setup

- `pnpm create vite@latest codeplay --template react-ts`
- Add Tailwind, Zustand, CodeMirror 6 packages: `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-javascript`, `@codemirror/lang-css`, `@codemirror/theme-one-dark`, `codemirror`
- Set up folder structure: `src/editor/`, `src/fs/`, `src/store/`, `src/components/`
- Initialize git, commit working "hello world"
- Read CodeMirror's System Guide (https://codemirror.net/docs/guide/) — actually read it, take notes

### Day 3–4: Mount CodeMirror in React

- Create `<Editor />` component that mounts CodeMirror via a ref
- Get TypeScript syntax highlighting working with `@codemirror/lang-javascript` (`javascript({ typescript: true })`)
- Apply One Dark theme
- Verify transactions fire on edit — log them to console to internalize the data flow

### Day 5: Virtual file system + Zustand store

- Define `type VFile = { path: string, content: string, language: 'tsx' | 'ts' | 'css' | 'json' }`
- Zustand store with `Map<string, VFile>` — actions: `createFile`, `renameFile`, `deleteFile`, `updateFile`, `setActiveFile`
- Persist to IndexedDB (use `idb-keyval`), hydrate on mount
- Seed with a default React counter component on first load

### Day 6: File tree sidebar

- Render the file tree from the store
- Click to switch active file → swap CodeMirror's contents (use `view.dispatch` with a full document replacement)
- Right-click context menu: rename, delete
- "+ New file" button with inline input

### Day 7: Polish + deploy

- Resizable split pane between sidebar and editor (`react-resizable-panels`)
- Deploy to Vercel — make sure persistence works on the deployed version
- Commit, push, send the link to a friend for sanity check

**Week 1 demo:** "I have a multi-file editor with persistence. Reload the page — your files are still there."

**Wow moment to nail:** Cmd+S triggers a tiny "saved" toast. Subtle but signals polish.

---

## Week 2 — Bundling & Live Preview

**Goal:** Type in the editor, see it render. The magic moment.

### Day 8–9: esbuild-wasm in a Web Worker

- Install `esbuild-wasm`
- Create `src/workers/bundler.worker.ts`
- Initialize esbuild with `initialize({ wasmURL: '...' })`
- Write a basic bundle function that takes the virtual FS and returns a string of bundled JS
- Wire it up via Comlink so the main thread can call `bundler.bundle(files)`
- Test with a single file: `console.log("hello")` → returns valid JS

### Day 10: Module resolution plugin

- Write an esbuild plugin that intercepts imports
- Relative imports (`./Foo.tsx`) → resolve from the virtual FS
- Bare imports (`react`, `framer-motion`) → rewrite to `https://esm.sh/{name}`
- Handle CSS imports (treat as side-effect imports that inject `<style>` tags at runtime)

### Day 11: Sandboxed iframe preview

- Create `<Preview />` component with an `<iframe sandbox="allow-scripts">`
- Bundle output → wrap in a minimal HTML template → create blob URL → set as iframe `src`
- Set up postMessage channel for the iframe-parent bridge
- Verify React component renders in the iframe

### Day 12: Live updates + debouncing

- Subscribe to Zustand store changes → trigger bundle → update iframe
- Debounce by 300ms so typing isn't laggy
- Show a tiny "bundling…" indicator during builds

### Day 13: Error overlay

- Catch bundle errors, render them in a styled overlay over the preview
- Catch runtime errors in the iframe via `window.onerror` + postMessage
- Distinguish bundle errors (red header) from runtime errors (yellow header)

### Day 14: Polish + deploy

- Make the preview pane resizable
- Add a "refresh preview" button for stuck states
- Deploy. Test on a friend's machine — the cold load should feel snappy

**Week 2 demo:** "Type `import { motion } from 'framer-motion'` and watch a bouncing div appear. No config, no install."

**Wow moment to nail:** First-time bundle finishes in under 2 seconds; subsequent updates under 200ms.

---

## Week 3 — Polish That Signals Seniority

**Goal:** The project feels like a product, not a hackathon demo.

### Day 15: Console panel

- Inject a console-bridge script into the iframe HTML template
- Override `console.log/warn/error` in the iframe → postMessage to parent
- Render in a panel below the preview with collapsible objects (use `react-json-view` or similar)
- Format errors with stack traces

### Day 16: Cmd+P fuzzy file finder

- Use `fzf` (the npm package) or `fuse.js` for fuzzy matching
- Trigger on Cmd+P, render in a centered modal
- Arrow keys + Enter to navigate, Esc to close
- Make it feel exactly like VS Code's

### Day 17: Shareable URLs

- Serialize the virtual FS to JSON → gzip via `pako` → base64 → stuff in URL hash
- On load, check the hash, decompress, hydrate
- Keep IndexedDB as the "current state" but URL as the "snapshot"
- Add a "Share" button that copies the URL
- Test the URL length limit (browsers handle ~64KB hashes fine; warn if over)

### Day 18: Prettier integration

- Add Prettier's standalone web build + parsers
- Run in a Web Worker (don't block the main thread)
- Cmd+Shift+F → format active file
- Format-on-save toggle in settings

### Day 19: Keyboard shortcuts + command palette

- Cmd+S → save (visual confirmation only, since persistence is automatic)
- Cmd+B → toggle sidebar
- Cmd+J → toggle console
- Cmd+K → command palette (run any action by name)
- Document all shortcuts in a `?` help modal

### Day 20: Visual polish

- Tighten the spacing everywhere (you'll be surprised how much this matters)
- Hover states on every interactive element
- Smooth transitions on panel resize
- Loading skeleton for the editor on cold start
- Empty states for "no files" and "preview unavailable"
- Make the favicon and og:image — these matter for shared links

### Day 21: Deploy + record demo GIF

- Deploy
- Record a 30-second screen capture showing the share-URL flow
- Convert to GIF (use Gifski or CleanShot)
- Drop it in the README

**Week 3 demo:** "Watch this — I write some code, hit share, paste the URL on a fresh browser. Same state."

**Wow moments:** Cmd+P feels native. Console panel formats objects beautifully. URLs work.

---

## Week 4 — The Differentiators

**Goal:** Pick 2 stretch features. Then write the README and rehearse.

### Pick 2 from the menu:

**Option A: Multiplayer (highest interview value)**

- Day 22–23: Add Yjs + `y-codemirror.next` + `y-websocket`
- Spin up a y-websocket server on Render free tier
- Wrap CodeMirror with the `yCollab` extension
- Sync the file tree state via Yjs (separate Y.Map)
- Day 24: Cursor presence — show other users' cursors with their name + color
- Verify on two devices, not just two tabs

**Option B: TypeScript diagnostics (highest technical depth)**

- Day 22–23: TS compiler in a Web Worker via Comlink
- Use `typescript` package's `createLanguageService` with a virtual host backed by your FS
- Day 24: Wire diagnostics → CodeMirror decorations (squiggly underlines)
- Hover tooltips for types (use `hoverTooltip` from `@codemirror/view`)

**Option C: CodeMirror Interact (highest "delight" factor)**

- Day 22: Install `@replit/codemirror-interact`
- Day 23: Configure rules — drag numbers, click colors, click booleans
- Day 24: Add custom rules for your use case (e.g., drag CSS unit values)
- This is small but the demo reaction is consistently "wait, do that again"

### Day 25–26: README + architecture diagram

- README sections (in this order):
  1. Hero GIF (the share-URL flow or multiplayer)
  2. One-paragraph elevator pitch
  3. Live demo link
  4. Three "wow features" with screenshots
  5. Architecture diagram (use Excalidraw, export to PNG)
  6. The hard problems & how you solved them — one paragraph each: bundling, sandboxing, TS-in-worker, multiplayer
  7. Tradeoffs (what you didn't build and why)
  8. Stack
  9. Run it locally

### Day 27: Final polish pass

- Lighthouse audit — fix anything red
- Test on Chrome, Firefox, Safari
- Test on a slow connection (Chrome DevTools throttling)
- Fix any console errors
- Make sure the OG image is right when you paste the URL in Slack/Twitter

### Day 28: Demo rehearsal

- Record yourself doing the 60-second walkthrough
- Watch it back. Cringe. Re-record.
- Write down the 3 things you'll always demo, in order
- Practice the "what was hard?" answer until it feels natural
- Update LinkedIn + portfolio with the project link

**Week 4 demo:** the project ships. The README sells it. The 60-second walkthrough is rehearsed.

---

## Daily Habits

- **Commit every day**, even tiny commits. Green graph matters when interviewers click your GitHub.
- **Write commit messages like a senior engineer.** "fix bug" is a red flag. "fix(bundler): handle CSS imports without breaking module resolution" is not.
- **Push to deployed every weekend.** If `main` doesn't deploy, fix it immediately. Stale prod URL = dead project.
- **Keep a `notes.md`** in the repo with decisions, tradeoffs, and things you learned. This becomes your interview prep.

---

## Reference Projects (Read, Don't Copy)

- **Sandpack** (`@codesandbox/sandpack-react`) — open source, this is essentially your project as a library. Read the source.
- **Val Town's `codemirror-ts`** and original architecture — the worker pattern you're emulating.
- **Replit's CodeMirror extensions** (Interact, Indentation Markers) — pattern reference.
- **Sourcegraph's blog post on the migration** — talking-point ammo.
- **Liveblocks' Yjs + CodeMirror tutorial** — your week 4 multiplayer reference.

---

## Final Checklist Before Calling It Done

- [ ] Live URL works on a fresh browser, no cache
- [ ] First-load time under 3 seconds
- [ ] Demo flow works in under 60 seconds
- [ ] README has hero GIF, architecture diagram, "hard problems" section
- [ ] Three concrete interview talking points written down
- [ ] Repo is public, link is on your LinkedIn + portfolio
- [ ] You can explain CodeMirror's transaction model without notes
- [ ] You can explain why iframe sandbox is the right security boundary
- [ ] You've shown the project to one person who is not a developer and they got "it's like a coding sandbox in your browser"
