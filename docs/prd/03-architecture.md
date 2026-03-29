# 03 — Arquitetura

## Stack escolhida

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SPA híbrido, API routes integradas, DX madura |
| Estilo | Tailwind CSS v3 | Produtividade, consistência visual, dark mode nativo |
| Backend | Next.js API Routes + Node.js | Elimina necessidade de servidor separado para a demo |
| Parsing de PDF | `pdf-parse` (Node.js) | Extração de texto de PDF sem dependências externas pesadas |
| Parsing de MD/TXT | Nativo (fs + string processing) | Leitura direta sem bibliotecas |
| Persistência | Em memória (sessão) + filesystem local | Suficiente para demo, sem banco de dados |
| Containerização | Docker + docker-compose | Execução reproduzível e portável |
| Provider SDK | Adapters customizados (fetch-based) | Controle total, sem dependência de SDKs de vendor |

### Justificativa da stack
- **Next.js como monorepo leve**: para a demo, unificar frontend e backend em um único projeto reduz complexidade operacional. As API routes do Next.js servem como backend BFF (Backend for Frontend).
- **Tailwind CSS**: velocidade de prototipação com resultado visual profissional.
- **Sem banco vetorial no MVP**: o volume de dados da demo (poucos documentos, poucos chunks) não justifica a complexidade de configurar pgvector ou Pinecone. Retrieval será feito com busca textual simples in-memory.
- **Adapters fetch-based**: manter controle total sobre as chamadas aos providers, sem depender de SDKs que podem ter breaking changes ou overhead desnecessário.

---

## Estrutura de frontend

```
src/
├── app/
│   ├── layout.tsx           # Layout global (header, theme)
│   ├── page.tsx             # Página principal (single-page)
│   ├── api/
│   │   ├── upload/route.ts       # Upload e extração de arquivos
│   │   ├── generate/
│   │   │   ├── spec/route.ts     # Geração de spec
│   │   │   ├── persona/route.ts  # Geração/sugestão de persona
│   │   │   ├── prompt/route.ts   # Geração de prompt final
│   │   │   └── validate/route.ts # Validação de consistência
│   │   ├── provider/
│   │   │   ├── config/route.ts   # Salvar/ler configuração de provider
│   │   │   └── test/route.ts     # Teste de conexão com provider
│   │   └── export/route.ts       # Exportação de artefatos
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
│   │   ├── types.ts              # Interface comum de provider
│   │   ├── registry.ts           # Registro de providers disponíveis
│   │   ├── selector.ts           # Seleção e fallback
│   │   ├── openrouter.ts         # Adapter OpenRouter
│   │   ├── anthropic.ts          # Adapter Anthropic
│   │   ├── minimax.ts            # Adapter MiniMax
│   │   └── claude-subscription.ts # Adapter claude-subscription
│   ├── parser/
│   │   ├── pdf.ts                # Extração de PDF
│   │   ├── text.ts               # Extração de TXT
│   │   ├── markdown.ts           # Extração de MD
│   │   └── chunker.ts            # Chunking de texto
│   ├── prompts/
│   │   ├── spec-generator.ts     # Prompt para gerar spec
│   │   ├── persona-generator.ts  # Prompt para gerar persona
│   │   ├── prompt-builder.ts     # Prompt para gerar prompt final
│   │   └── validator.ts          # Prompt para validação
│   ├── types/
│   │   ├── spec.ts
│   │   ├── persona.ts
│   │   ├── prompt.ts
│   │   └── validation.ts
│   └── utils/
│       ├── export.ts             # Formatação de export
│       └── config.ts             # Gerenciamento de configuração
└── hooks/
    ├── useProvider.ts
    ├── useUpload.ts
    └── useGeneration.ts
```

---

## Pipeline de ingestão de arquivos

```
Arquivo → Validação (tipo, tamanho) → Extração de texto → Limpeza → Chunking → Armazenamento in-memory
```

### Detalhamento

1. **Validação**: tipo (PDF/TXT/MD), tamanho (≤ 10 MB), quantidade (≤ 3 por sessão).
2. **Extração**:
   - PDF: `pdf-parse` → texto plano.
   - TXT: leitura direta.
   - MD: leitura direta (preserva estrutura).
3. **Limpeza**: remoção de linhas vazias excessivas, normalização de espaços.
4. **Chunking**: segmentação por parágrafos com overlap mínimo. Tamanho alvo: 500-1000 tokens por chunk.
5. **Armazenamento**: array de chunks in-memory no contexto da sessão.

---

## Estratégia de retrieval

Para o MVP, retrieval será **simples e baseado em relevância textual**:
- Todos os chunks são enviados como contexto (até o limite do modelo).
- Se o volume exceder o contexto, seleção por keyword matching com TF-IDF básico.
- Sem banco vetorial no MVP.

**Justificativa**: para a demo, o volume de dados é pequeno o suficiente para enviar todo o contexto. Adicionar vetor seria over-engineering sem ganho de demonstração.

---

## Estratégia de armazenamento

- **Sessão**: dados vivem na memória do servidor durante a sessão do usuário.
- **Configuração de provider**: armazenada em variáveis de ambiente (server-side).
- **Sem banco de dados**: a demo não precisa de persistência entre sessões.
- **Filesystem local**: usado apenas para uploads temporários durante processamento.

---

## Camada de provider abstraction

### Interface comum

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

### Fluxo de seleção

```
Requisição de geração
  → Verificar provider selecionado pelo usuário
  → Se disponível → usar
  → Se indisponível → tentar fallback
  → Se fallback indisponível → retornar erro com mensagem clara
```

### Adapters

| Provider | Base URL | Auth | Modelo padrão |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | Bearer token (API key) | `anthropic/claude-3.5-sonnet` |
| Anthropic | `https://api.anthropic.com/v1` | `x-api-key` header | `claude-3-5-sonnet-20241022` |
| MiniMax | `https://api.minimax.chat/v1` | Bearer token (API key) | `abab6.5s-chat` |
| Claude Subscription | Local (via CLI ou proxy) | Sessão local | Modelo ativo na subscrição |

---

## Estratégia Docker

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

**Decisão**: container único. A demo não precisa de microserviços.

---

## Integrações externas

| Integração | Tipo | Propósito |
|---|---|---|
| OpenRouter API | REST | Geração de texto |
| Anthropic API | REST | Geração de texto |
| MiniMax API | REST | Geração de texto |
| Claude CLI | Local (opcional) | Runtime alternativo |

Nenhuma integração com Slack, WhatsApp ou canais externos no MVP.

---

## Trade-offs

| Decisão | Prós | Contras |
|---|---|---|
| Next.js monolítico | Simplicidade, DX, deploy único | Menos flexível para escalar backend |
| Sem banco vetorial | Menos complexidade, setup rápido | Retrieval menos sofisticado |
| Sessão em memória | Sem banco de dados | Dados perdidos ao reiniciar |
| Fetch-based adapters | Controle total | Mais código manual por provider |
| Container único | Simples | Não escala horizontalmente |

Todos os trade-offs são aceitáveis para uma demo. Se o projeto evoluir, a arquitetura pode ser refatorada.
