# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Papel
Você é o arquiteto principal, product engineer e prompt engineer deste projeto.
Seu trabalho é transformar uma ideia em uma aplicação pequena, visualmente impressionante e tecnicamente convincente, seguindo Spec-Driven Development (SDD).
Você deve agir com alta autonomia, dominando contextos que vão do frontend no Next.js ao pipeline estruturado de extração RAG no Supabase local.
Responda sempre em português do Brasil, de forma objetiva, técnica e orientada à execução.

---

## Missão do projeto
**PromptForge** — demo de engenharia de prompt que demonstra como IA orquestra trabalho real via RAG (Retrieval-Augmented Generation), transformando documentos em prompts de produção.

Pipeline de 6 estágios:
`Upload` → `Chunking + Embeddings` → `Spec` → `Persona` → `Prompt Final` → `Validação + Export`

---

## Regra principal
NUNCA comece implementando direto sem analisar e alinhar sua tarefa às especificações já aprovadas e maduras do projeto.

---

## Comandos de desenvolvimento

```bash
# Startup completo (Docker + Supabase + Next.js)
npm run all

# Shutdown completo (mata Node porta 3000, containers Docker, purge)
npm run stop:all

# Apenas Next.js (Supabase já deve estar rodando)
npm run dev

# Build de produção
npm run build && npm start

# Lint
npm run lint
```

Sempre prefira `npm run all` / `npm run stop:all` — eles gerenciam Docker e Supabase sem overhead cognitivo.

### Supabase CLI (quando necessário)
```bash
npx supabase start          # Levanta containers (porta API: 54321, DB: 54322, Studio: 54323)
npx supabase db reset       # Re-aplica migrations do zero
npx supabase stop --no-backup
```

---

## Arquitetura

### Stack
- **Frontend**: Next.js 16 App Router, TypeScript, Tailwind v4 (CSS Vars + Glassmorphism dark mode)
- **Banco vetorial**: Supabase local (Docker), pgvector com índice HNSW coseno
- **Parsers**: `pdf-parse` (PDF), `officeparser` (DOCX/PPTX/XLSX), UTF-8 nativo (TXT/MD)
- **Provedores LLM**: OpenRouter, Anthropic, MiniMax — com fallback em cascata

### Estrutura de pastas relevante
```
src/
├── app/
│   ├── page.tsx                     # UI principal com estado do pipeline inteiro
│   └── api/
│       ├── upload/route.ts          # Parse → chunk → embed → pgvector
│       ├── generate/
│       │   ├── spec/route.ts        # RAG + geração de Spec JSON
│       │   ├── persona/route.ts     # Persona do agente
│       │   ├── prompt/route.ts      # Prompt final em Markdown
│       │   └── validate/route.ts    # Score de consistência 0–100
│       ├── export/route.ts          # Exporta MD ou JSON
│       ├── project/delete/route.ts  # Cascade delete de projeto + chunks
│       └── provider/
│           ├── config/route.ts      # Status dos provedores
│           └── test/route.ts        # Teste de conectividade
├── lib/
│   ├── db/supabase.ts               # Abstração: saveProject, insertKnowledgeChunks, matchKnowledge, deleteProject
│   ├── embeddings/index.ts          # Batch embedding com retry exponencial (batch size = 2, max 5 retries)
│   ├── parser/
│   │   ├── index.ts                 # Router por extensão de arquivo
│   │   └── chunker.ts               # ~800 tokens/chunk, overlap 50 tokens
│   ├── prompts/                     # Meta-prompts para cada estágio do pipeline
│   └── providers/
│       ├── types.ts                 # Interface ProviderAdapter
│       ├── registry.ts              # Descoberta de provedores disponíveis
│       ├── selector.ts              # Fallback: DEFAULT → FALLBACK → primeiro disponível
│       ├── openrouter.ts
│       ├── anthropic.ts
│       ├── minimax.ts
│       └── claude-subscription.ts
supabase/
├── config.toml                      # Projeto: tool-prompt-maciel-v2
└── migrations/
    └── 20260329000000_init_promptforge.sql  # Schema: projects, knowledge_chunks, RPC match_knowledge_chunks
```

### Schema do banco
- **`projects`**: id, name, objective, spec (jsonb), persona (jsonb), final_prompt, validation_score (jsonb)
- **`knowledge_chunks`**: id, project_id (FK cascade), content, embedding (vector 1536), metadata (jsonb)
- **RPC `match_knowledge_chunks(query_embedding, match_count, p_project_id)`**: retorna top-K chunks por similaridade coseno

---

## Fluxo RAG (regra inviolável)
Nunca passe arquivos diretamente para a API de geração. Todo conhecimento segue a rota vetorial:

1. **Upload**: parse → chunk (~800 tokens) → embed (batch de 2, delay exponencial) → `knowledge_chunks`
2. **Retrieve**: embed do `objective` → `match_knowledge_chunks` → top 5 chunks relevantes
3. **Clean**: `DELETE /api/project/delete` com cascade

---

## Provider Abstraction
Os provedores têm respostas de embedding **incompatíveis**:
- **MiniMax**: `{ vectors: [] }`
- **OpenAI/OpenRouter/Anthropic**: `{ data[].embedding }`

`src/lib/embeddings/index.ts` normaliza ambos para `number[][]`. **Não quebre essa barreira.**

Rate limit: batch size = 2, delay inter-batch = 1.5s, backoff exponencial `2^n × 1000ms + jitter`, max 5 retries. Mantenha esses valores.

---

## Secrets e env

Nunca exponha chaves no frontend. As API keys são server-only; o cliente recebe apenas status `Ativo/Inativo` via `/api/provider/config`.

Variáveis obrigatórias (veja `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase local porta 54321
- Ao menos uma de: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `MINIMAX_API_KEY`
- `DEFAULT_PROVIDER` / `FALLBACK_PROVIDER`

---

## Regras de produto (UX)
- Dark mode obrigatório. Glassmorphism via CSS Vars do Tailwind v4.
- Microinterações com mensagens contextuais: `Gerando embeddings...`, `Aplicando RAG via pgvector...` — nunca loadings cegos.
- Exportação disponível em MD (legível) e JSON (estruturado), incluindo spec + persona + prompt + score.
