# BridgeView AI

BridgeView AI is an end-to-end **multi-agent maritime UI generation platform**. Paste a maritime product requirements document (Vessel Monitoring System, Crew Welfare Portal, Fleet Management Dashboard, Cargo Monitoring Platform) and the system will:

1. Analyze requirements (Requirements Analyst Agent)
2. Extract features (Feature Extraction Tool)
3. Build a UI hierarchy (UI Architect Agent + Component Tree Tool)
4. Generate React + TypeScript + Tailwind code (Code Generator + React Export Tool)
5. Validate JSX (Validation Agent + JSX Validator Tool)
6. Persist to file memory and LangGraph checkpoints
7. Render a live Sandpack preview and export ZIP / JSON / code

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn-style UI |
| Agents | LangGraph, LangChain, Groq (`llama-3.3-70b-versatile` when `GROQ_API_KEY` is set) across all pipeline tools |
| Memory | JSON file store (`memory/sessions.json`) + LangGraph in-memory checkpointer |
| Validation | Zod schemas + custom JSX validator |
| Preview | Sandpack (`@codesandbox/sandpack-react`) |

## Agent Architecture

```
User Input
    ↓
Requirements Analyst Agent  →  feature-extraction tool
    ↓
UI Architect Agent          →  component-tree-generator tool
    ↓
React Code Generator Agent  →  react-export tool
    ↓
Validation Agent          →  jsx-validator tool
    ↓
Memory Save (file store + LangGraph checkpoint)
    ↓
Dashboard UI Output
```

## Folder Structure

```text
bridgeview-ai/
├── src/
│   ├── app/                    # Next.js App Router (pages + API)
│   ├── agents/                 # 4 LangGraph agent nodes
│   ├── tools/                  # 4 callable tools
│   ├── memory/                 # file-memory.ts
│   ├── lib/langgraph.ts        # LangGraph workflow
│   ├── components/             # Dashboard + shadcn UI
│   └── types/
├── memory/                     # Session JSON (runtime, gitignored)
└── README.md
```

## Quick Start

```bash
cd bridgeview-ai
npm install
```

Optional — enable Groq LLM across the full pipeline (requirements, UI tree, React codegen, validation):

```bash
# Windows PowerShell
$env:GROQ_API_KEY="gsk-..."

# macOS / Linux
export GROQ_API_KEY=gsk-...
```

Or add to `.env.local`:

```env
GROQ_API_KEY=gsk-...
# GROQ_MODEL=llama-3.3-70b-versatile  # optional override
```

Without an API key, the pipeline uses **deterministic maritime fallbacks** at each step so the demo always runs end-to-end.

With `GROQ_API_KEY` set (from [Groq Console](https://console.groq.com), typically `gsk_…`):

| Step | LLM role |
|------|----------|
| Requirements Analyst | Extract `product_name`, features, entities, widgets from the PRD |
| UI Architect | Design dashboard hierarchy and widget tree |
| Code Generator | Generate React + TypeScript + Tailwind source files |
| Validation | Review and fix JSX when the local validator finds issues |

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Run full LangGraph pipeline `{ "requirement": "..." }` |
| `/api/memory` | GET | List persisted session history |

## Export

From the dashboard:

- **ZIP** — full generated React project
- **JSON** — component hierarchy
- **Code** — concatenated `.tsx` sources

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | Enables Groq LLM for all agents via LangChain (`@langchain/groq`): feature extraction, component tree, React export, JSX validation |
| `GROQ_MODEL` | No | Groq model id (default: `llama-3.3-70b-versatile`) |

## Production Build

```bash
npm run build
npm start
```

---

Built for ThinkPalm maritime engineering workflows — PRD to production-ready dashboard UI in one pipeline.
