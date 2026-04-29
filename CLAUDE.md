# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role
You are the lead architect, product engineer, and prompt engineer of this project.
Your job is to transform an idea into a small, visually impressive, and technically convincing application, following Spec-Driven Development (SDD).
You must act with high autonomy, mastering contexts ranging from the Next.js frontend to the structured RAG extraction pipeline in local Supabase.
Always respond in English, objectively, technically, and execution-oriented.

---

## Project Mission
**PromptForge** — a prompt engineering demo that shows how AI orchestrates real work via RAG (Retrieval-Augmented Generation), transforming documents into production prompts.

6-stage pipeline:
`Upload` → `Chunking + Embeddings` → `Spec` → `Persona` → `Final Prompt` → `Validation + Export`

---

## Main Rule
NEVER start implementing directly without analyzing and aligning your task with the already approved and mature project specifications.

---

## Development Commands

```bash
# Full startup — Supabase + next build + next start (production, instant page loads)
npm run all

# Full shutdown — kills Next.js process and Supabase containers
npm run stop:all

# Dev mode with HMR — Supabase + Turbopack dev server
# WARNING: first page load takes ~60s cold compile; subsequent loads are instant
npm run all:dev

# Next.js Turbopack dev only (Supabase must already be running)
npm run dev

# Lint
npm run lint
```

Always prefer `npm run all` / `npm run stop:all` — they build and serve production, so pages load instantly. Use `npm run all:dev` only when you need HMR during active development.

### Supabase CLI (when needed)
```bash
npx supabase start          # Starts containers (API port: 54321, DB: 54322, Studio: 54323)
npx supabase db reset       # Re-applies migrations from scratch
npx supabase stop --no-backup
```

---

## Architecture

### Stack
- **Frontend**: Next.js 16 App Router, TypeScript, Tailwind v4 (CSS Vars + Glassmorphism dark mode)
- **Vector DB**: Local Supabase (Docker), pgvector with cosine HNSW index
- **Parsers**: `pdf-parse` (PDF), `officeparser` (DOCX/PPTX/XLSX), native UTF-8 (TXT/MD)
- **LLM Providers**: OpenRouter, Anthropic, MiniMax — with cascading fallback

### Relevant Folder Structure
```
src/
├── app/
│   ├── page.tsx                     # Main UI with full pipeline state
│   └── api/
│       ├── upload/route.ts          # Parse → chunk → embed → pgvector
│       ├── generate/
│       │   ├── spec/route.ts        # RAG + Spec JSON generation
│       │   ├── persona/route.ts     # Agent persona
│       │   ├── prompt/route.ts      # Final prompt in Markdown
│       │   └── validate/route.ts    # Consistency score 0–100
│       ├── export/route.ts          # Exports MD or JSON
│       ├── project/delete/route.ts  # Cascade delete project + chunks
│       └── provider/
│           ├── config/route.ts      # Provider status
│           └── test/route.ts        # Connectivity test
├── lib/
│   ├── db/supabase.ts               # Abstraction: saveProject, insertKnowledgeChunks, matchKnowledge, deleteProject
│   ├── embeddings/index.ts          # Batch embedding with exponential retry (batch size = 2, max 5 retries)
│   ├── parser/
│   │   ├── index.ts                 # Router by file extension
│   │   └── chunker.ts               # ~800 tokens/chunk, 50 token overlap
│   ├── prompts/                     # Meta-prompts for each pipeline stage
│   └── providers/
│       ├── types.ts                 # ProviderAdapter interface
│       ├── registry.ts              # Available provider discovery
│       ├── selector.ts              # Fallback: DEFAULT → FALLBACK → first available
│       ├── openrouter.ts
│       ├── anthropic.ts
│       ├── minimax.ts
│       └── claude-subscription.ts
supabase/
├── config.toml                      # Project: tool-prompt-maciel-v2
└── migrations/
    └── 20260329000000_init_promptforge.sql  # Schema: projects, knowledge_chunks, RPC match_knowledge_chunks
```

### Database Schema
- **`projects`**: id, name, objective, spec (jsonb), persona (jsonb), final_prompt, validation_score (jsonb)
- **`knowledge_chunks`**: id, project_id (FK cascade), content, embedding (vector 1536), metadata (jsonb)
- **RPC `match_knowledge_chunks(query_embedding, match_count, p_project_id)`**: returns top-K chunks by cosine similarity

---

## RAG Flow (inviolable rule)
Never pass files directly to the generation API. All knowledge follows the vector route:

1. **Upload**: parse → chunk (~800 tokens) → embed (batch of 2, exponential delay) → `knowledge_chunks`
2. **Retrieve**: embed the `objective` → `match_knowledge_chunks` → top 5 relevant chunks
3. **Clean**: `DELETE /api/project/delete` with cascade

---

## Provider Abstraction
Providers have **incompatible** embedding responses:
- **MiniMax**: `{ vectors: [] }`
- **OpenAI/OpenRouter/Anthropic**: `{ data[].embedding }`

`src/lib/embeddings/index.ts` normalizes both to `number[][]`. **Do not break this barrier.**

Rate limit: batch size = 2, inter-batch delay = 1.5s, exponential backoff `2^n × 1000ms + jitter`, max 5 retries. Keep these values.

---

## Secrets and Env

Never expose keys on the frontend. API keys are server-only; the client only receives `Active/Inactive` status via `/api/provider/config`.

Required variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — local Supabase port 54321
- At least one of: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `MINIMAX_API_KEY`
- `DEFAULT_PROVIDER` / `FALLBACK_PROVIDER`

---

## Product Rules (UX)
- Dark mode is mandatory. Glassmorphism via Tailwind v4 CSS Vars.
- Micro-interactions with contextual messages: `Generating embeddings...`, `Applying RAG via pgvector...` — never blind loading states.
- Export available in MD (human-readable) and JSON (structured), including spec + persona + prompt + score.
