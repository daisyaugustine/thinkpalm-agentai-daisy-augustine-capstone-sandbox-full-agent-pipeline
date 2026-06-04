"use client";

import { useMemo } from "react";
import { SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";

function buildSandpackFiles(files: Record<string, string>): Record<string, string> {
  const dashboard = (files["Dashboard.tsx"] ?? "").replace(
    /from "\.\/components\//g,
    'from "./components/',
  );

  const sandpackFiles: Record<string, string> = {
    "/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BridgeView Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
    "/index.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}`,
    "/styles.css": `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #020617;
}`,
    "/App.tsx": files["App.tsx"],
    "/Dashboard.tsx": dashboard,
  };

  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith("components/")) {
      sandpackFiles[`/${path}`] = content;
    }
  }

  return sandpackFiles;
}

export function SandpackLivePreview({ files }: { files: Record<string, string> }) {
  const hasApp = Boolean(files["App.tsx"]);
  const filesKey = useMemo(() => Object.keys(files).sort().join("|"), [files]);

  const sandpackFiles = useMemo(() => buildSandpackFiles(files), [files]);

  if (!hasApp) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-500">
        Live preview available after code generation
      </div>
    );
  }

  return (
    <div className="sandpack-preview-root min-h-[320px] [&_.sp-preview-container]:min-h-[320px] [&_.sp-preview-iframe]:min-h-[320px]">
      <SandpackProvider
        key={filesKey}
        template="vite-react-ts"
        theme="dark"
        files={sandpackFiles}
        options={{
          recompileMode: "immediate",
          recompileDelay: 300,
        }}
      >
        <SandpackLayout style={{ borderRadius: "0.75rem", border: "1px solid rgb(51 65 85)" }}>
          <SandpackPreview
            style={{ height: 320, minHeight: 320 }}
            showOpenInCodeSandbox={false}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
