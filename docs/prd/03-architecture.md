# 03 — Architecture

## Chosen stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Hybrid SSR/SPA, integrated API routes, mature DX |
| Styling | Tailwind CSS v3 | Productivity, visual consistency, native dark mode |
| Backend | Next.js API Routes + Node.js | Eliminates need for a separate server in the demo |
| PDF parsing | `pdf-parse` (Node.js) | PDF text extraction without heavy external dependencies |
| MD/TXT parsing | Native (fs + string processing) | Direct reading without libraries |
| Persistence | In-memory (session) + local filesystem | Sufficient for demo, no database |
| Containerization | Docker + docker-compose | Reproducible and portable execution |
| Provider SDK | Custom adapters (fetch-based) | Full control, no vendor SDK dependency |

### Stack rationale
- **Next.js as a lightweight monorepo**: for the demo, unifying frontend and backend in a single project reduces operational complexity. Next.js API routes serve as a BFF (Backend for Frontend).
- **Tailwind CSS**: prototyping speed with professional visual output.
- **No vector database in MVP**: the demo data volume (few documents, few chunks) does not justify the complexity of setting up pgvector or Pinecone. Retrieval will be done with simple in-memory text search.
- **Fetch-based adapters**: maintain full control over provider calls, without depending on SDKs that may have breaking changes or unnecessary overhead.

---

## Frontend structure

```
src/
├── app/
│   ├── layout.tsx           # Global layout (header, theme)
│   ├── page.tsx             # Main page (single-page)
│   ├── api/
│   │   ├── upload/route.ts       # File upload and extraction
│   │   ├── generate/
│   │   │   ├── spec/route.ts     # Spec generation
│   │   │   ├── persona/route.ts  # Persona generation/suggestion
│   │   │   ├── prompt/route.ts   # Final prompt generation
│   │   │   └── validate/route.ts # Consistency validation
│   │   ├── provider/
│   │   │   ├── config/route.ts   # Save/read provider configuration
│   │   │   └── test/route.ts     # Provider connection test
│   │   └── export/route.ts       # Artifact export
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── ProviderBadge.tsx
│   │   └── StepIndicator.tsx
│   ├── upload/
│   │   ├── FileDropZone.tsx
│   │   ├── FileCard.tsx
│   │   └── ChunkPreview.tsx
│   ├── objective/
│   │   └── ObjectiveInput.tsx
│   ├── spec/
│   │   ├── SpecCard.tsx
│   │   └── SpecEditor.tsx
│   ├── persona/
│   │   ├── PersonaDesigner.tsx
│   │   ├── ToneSlider.tsx
│   │   ├── VocabularyChips.tsx
│   │   └── ExamplePreview.tsx
│   ├── prompt/
│   │   ├── PromptOutput.tsx
│   │   └── PromptActions.tsx
│   ├── validation/
│   │   ├── ValidationCard.tsx
│   │   └── ScoreIndicator.tsx
│   ├── provider/
│   │   ├── ProviderPanel.tsx
│   │   ├── ProviderCard.tsx
│   │   └── ApiKeyInput.tsx
│   └── export/
│       └── ExportButtons.tsx
├── lib/
│   ├── providers/
│   │   ├── types.ts              # Common provider interface
│   │   ├── registry.ts           # Registry of available providers
│   │   ├── selector.ts           # Selection and fallback
│   │   ├── openrouter.ts         # OpenRouter adapter
│   │   ├── anthropic.ts          # Anthropic adapter
│   │   ├── minimax.ts            # MiniMax adapter
│   │   └── claude-subscription.ts # claude-subscription adapter
│   ├── parser/
│   │   ├── pdf.ts                # PDF extraction
│   │   ├── text.ts               # TXT extraction
│   │   ├── markdown.ts           # MD extraction
│   │   └── chunker.ts            # Text chunking
│   ├── prompts/
│   │   ├── spec-generator.ts     # Prompt to generate spec
│   │   ├── persona-generator.ts  # Prompt to generate persona
│   │   ├── prompt-builder.ts     # Prompt to generate final prompt
│   │   └── validator.ts          # Prompt for validation
│   ├── types/
│   │   ├── spec.ts
│   │   ├── persona.ts
│   │   ├── prompt.ts
│   │   └── validation.ts
│   └── utils/
│       ├── export.ts             # Export formatting
│       └── config.ts             # Configuration management
└── hooks/
    ├── useProvider.ts
    ├── useUpload.ts
    └── useGeneration.ts
```

---

## File ingestion pipeline

```
File → Validation (type, size) → Text extraction → Cleanup → Chunking → In-memory storage
```

### Details

1. **Validation**: type (PDF/TXT/MD), size (≤ 10 MB), quantity (≤ 3 per session).
2. **Extraction**:
   - PDF: `pdf-parse` → plain text.
   - TXT: direct read.
   - MD: direct read (preserves structure).
3. **Cleanup**: removal of excessive blank lines, whitespace normalization.
4. **Chunking**: segmentation by paragraphs with minimum overlap. Target size: 500–1000 tokens per chunk.
5. **Storage**: in-memory chunk array in the session context.

---

## Retrieval strategy

For the MVP, retrieval will be **simple and text-relevance-based**:
- All chunks are sent as context (up to the model's limit).
- If volume exceeds context, selection by keyword matching with basic TF-IDF.
- No vector database in the MVP.

**Rationale**: for the demo, the data volume is small enough to send all context. Adding a vector store would be over-engineering with no demonstration gain.

---

## Storage strategy

- **Session**: data lives in server memory during the user's session.
- **Provider configuration**: stored in environment variables (server-side).
- **No database**: the demo does not need cross-session persistence.
- **Local filesystem**: used only for temporary uploads during processing.

---

## Provider abstraction layer

### Common interface

```typescript
interface ProviderAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  generate(params: GenerateParams): Promise<GenerateResult>;
  listModels(): string[];
  getDefaultModel(): string;
}

interface GenerateParams {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateResult {
  text: string;
  model: string;
  provider: string;
  tokensUsed?: number;
}
```

### Selection flow

```
Generation request
  → Check provider selected by user
  → If available → use it
  → If unavailable → try fallback
  → If fallback unavailable → return error with clear message
```

### Adapters

| Provider | Base URL | Auth | Default model |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | Bearer token (API key) | `anthropic/claude-3.5-sonnet` |
| Anthropic | `https://api.anthropic.com/v1` | `x-api-key` header | `claude-3-5-sonnet-20241022` |
| MiniMax | `https://api.minimax.chat/v1` | Bearer token (API key) | `abab6.5s-chat` |
| Claude Subscription | Local (via CLI or proxy) | Local session | Active model in subscription |

---

## Docker strategy

### docker-compose.yml

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
```

### Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Decision**: single container. The demo does not need microservices.

---

## External integrations

| Integration | Type | Purpose |
|---|---|---|
| OpenRouter API | REST | Text generation |
| Anthropic API | REST | Text generation |
| MiniMax API | REST | Text generation |
| Claude CLI | Local (optional) | Alternative runtime |

No integration with Slack, WhatsApp, or external channels in the MVP.

---

## Trade-offs

| Decision | Pros | Cons |
|---|---|---|
| Monolithic Next.js | Simplicity, DX, single deploy | Less flexible to scale backend |
| No vector database | Less complexity, fast setup | Less sophisticated retrieval |
| In-memory session | No database | Data lost on restart |
| Fetch-based adapters | Full control | More manual code per provider |
| Single container | Simple | Does not scale horizontally |

All trade-offs are acceptable for a demo. If the project evolves, the architecture can be refactored.
