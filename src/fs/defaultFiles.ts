import { inferLanguageFromPath } from './language'
import { normalizeFilePath } from './path'
import type { VfsMap } from './types'

const defaultFileContents = {
  '/index.html': `<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
`,
  '/src/App.tsx': `export default function App() {
  return <h1>Hello from Mini Sandbox</h1>;
}
`,
  '/src/main.tsx': `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
  '/src/styles.css': `body {
  margin: 0;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}
`,
} satisfies Record<string, string>

export function createDefaultVfs(): VfsMap {
  return new Map(
    Object.entries(defaultFileContents).map(([path, content]) => {
      const normalizedPath = normalizeFilePath(path)

      return [
        normalizedPath,
        {
          content,
          language: inferLanguageFromPath(normalizedPath),
        },
      ]
    }),
  )
}
