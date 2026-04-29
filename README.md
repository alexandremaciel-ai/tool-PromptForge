# ⚡ PromptForge

**Spec-Driven Prompt Engineering**

PromptForge is a demo application that transforms raw knowledge (structured and unstructured documents) into final operational artifacts, automating the complete *Prompt Engineering* pipeline.

Built on **Next.js 16**, the application demonstrates in practice how to go from loose text to a testable final prompt through a rigorous spec-oriented approach, leveraging professional local RAG architectures.

---

## ✨ Key Features

- **Professional Knowledge Ingestion:** Local upload of **PDFs, DOCX, PPTX, XLSX, TXT, and Markdown**. Uses continuous parsing and automatic chunking.
- **Intelligent RAG (Supabase pgvector):** Embedded vector architecture based on `pgvector`. Avoids injecting a "wall of context" into the LLM by processing Embeddings and retrieving via *Semantic Search* only the 5 most relevant chunks to the user's objective.
- **Resilient Embeddings:** Polymorphic batch generation for MiniMax and OpenRouter providers, guaranteed by an *Exponential Backoff* control that supports and mitigates bottlenecks or Rate Limit (RPM) ceilings during interactions.
- **Spec-Driven Pipeline:** A 6-step workflow that doesn't skip planning:
  1. Knowledge (Upload & Vector Storage)
  2. Semantic Objective
  3. Formal Specification (JSON)
  4. Agent Persona (JSON)
  5. Final Prompt (Markdown)
  6. Consistency Validation
- **Abstracted Provider Layer:** Adapters for multiple APIs (OpenRouter, Anthropic, MiniMax) with active **Fallback** and transparent JSON response abstractions.
- **Full State Control:** Cascade deletion integrated with Supabase to purge unwanted files and reset flows, preventing orphaned knowledge vectors and chunks.
- **Universal Export:** Export the validated final prompt "package" in Markdown or JSON for production deployment.

---

## 🚀 Quickstart

### Prerequisites

- **Node.js** v22+
- **Docker** (required for local Supabase)
- At least one AI provider key: OpenRouter, Anthropic, or MiniMax

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in at minimum:

```env
# Local Supabase — copy these values from the output of `npx supabase start`
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key printed by supabase start>

# At least one provider key
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
MINIMAX_API_KEY=

# Provider selection
DEFAULT_PROVIDER=openrouter
FALLBACK_PROVIDER=anthropic
```

### 3. Start the full stack

```bash
npm run all
```

This single command:
1. Starts Supabase Docker containers (PostgreSQL + pgvector + Studio)
2. Runs `next build` — compiles the app (~10s)
3. Starts the production server at **http://localhost:3000**

The app opens instantly because all routes are pre-built. `Ctrl+C` or `npm run stop:all` shuts everything down cleanly.

### 4. Tear down

```bash
npm run stop:all
```

Stops the Next.js process and Supabase containers, freeing Docker memory.

---

## 🛠️ All Commands

| Command | Description |
|---------|-------------|
| `npm run all` | **Recommended.** Supabase + production build + production server. Pages load instantly. |
| `npm run all:dev` | Supabase + Turbopack dev server with HMR. See note below. |
| `npm run dev` | Turbopack dev server only (Supabase must already be running separately). |
| `npm run build` | Production build only. |
| `npm start` | Production server only (requires a prior `npm run build`). |
| `npm run stop:all` | Stops Next.js and Supabase containers. |

> **A note on `npm run all:dev`:**
> Turbopack compiles routes lazily on first request. On a cold start, the initial page load takes ~60 seconds while the compiler runs. Subsequent requests are instant (cached). Use `npm run all` for demos and presentations — it pre-compiles everything so the browser never waits.

---

## 🗄️ Supabase manual control

```bash
npx supabase start          # Start containers (API: 54321, DB: 54322, Studio: 54323)
npx supabase db reset       # Re-apply all migrations from scratch
npx supabase stop --no-backup
```

After `npx supabase start`, copy the printed `API URL` and `anon key` into `.env.local`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS custom properties (glassmorphism dark mode) |
| Vector DB | Supabase local (PostgreSQL 15 + pgvector HNSW index) |
| File Parsers | `pdf-parse` (PDF), `officeparser` (DOCX/PPTX/XLSX) |
| AI Providers | OpenRouter, Anthropic, MiniMax — cascading fallback |

---

## 📂 Architecture Overview

```
src/
├── app/
│   ├── page.tsx                     # Main UI — full pipeline state machine
│   └── api/
│       ├── upload/route.ts          # Parse → chunk → embed → pgvector
│       ├── generate/
│       │   ├── spec/route.ts        # RAG + Spec JSON generation
│       │   ├── persona/route.ts     # Agent persona
│       │   ├── prompt/route.ts      # Final prompt (Markdown)
│       │   └── validate/route.ts    # Consistency score 0–100
│       ├── export/route.ts          # MD or JSON export
│       ├── project/[id]/route.ts    # Project restore by ID
│       ├── project/delete/route.ts  # Cascade delete project + chunks
│       ├── saved-prompts/route.ts   # Prompt library CRUD
│       └── provider/
│           ├── config/route.ts      # Provider status (safe for client)
│           └── test/route.ts        # Connectivity test
└── lib/
    ├── db/supabase.ts               # Typed Supabase client + helpers
    ├── embeddings/index.ts          # Batch embedding, exponential retry
    ├── parser/
    │   ├── index.ts                 # Router by file extension
    │   └── chunker.ts               # ~800 tokens/chunk, 50 token overlap
    ├── prompts/                     # Meta-prompts for each pipeline stage
    └── providers/
        ├── types.ts                 # ProviderAdapter interface
        ├── registry.ts              # Adapter registry
        ├── selector.ts              # Fallback: DEFAULT → FALLBACK → first available
        ├── openrouter.ts
        ├── anthropic.ts
        ├── minimax.ts
        └── claude-subscription.ts

supabase/
├── config.toml
└── migrations/
    └── 20260329000000_init_promptforge.sql
```

---

## 📋 Contributing

All core conceptualization follows **Spec-Driven Development**. Read `CLAUDE.md` before making changes — it defines the architectural constraints, RAG flow rules, and provider abstraction invariants that must not be broken.
