# 08 — Tasks

## Convenções
- Cada tarefa começa com verbo.
- Formato: `T{fase}{número} — {título}`
- Status: `[ ]` pendente, `[/]` em progresso, `[x]` concluída.

---

## Fase 0 — Setup

### T01 — Inicializar projeto Next.js com TypeScript e Tailwind
- **Descrição**: Criar projeto Next.js 14 com App Router, TypeScript strict e Tailwind CSS. Configurar estrutura de pastas conforme `03-architecture.md`.
- **Arquivos impactados**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- **Dependências**: Nenhuma
- **Critério de conclusão**: `npm run dev` roda sem erros e exibe página em branco estilizada.
- `[ ]`

### T02 — Criar Dockerfile e docker-compose.yml
- **Descrição**: Criar Dockerfile multi-stage e docker-compose.yml para build e execução da aplicação na porta 3000.
- **Arquivos impactados**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- **Dependências**: T01
- **Critério de conclusão**: `docker-compose up --build` sobe a aplicação na porta 3000.
- `[ ]`

### T03 — Criar .env.example e validação de variáveis
- **Descrição**: Criar `.env.example` com todas as variáveis documentadas. Criar utilitário de validação que verifica variáveis no startup e exibe mensagens claras.
- **Arquivos impactados**: `.env.example`, `.gitignore`, `src/lib/utils/config.ts`
- **Dependências**: T01
- **Critério de conclusão**: Aplicação inicia sem erro mesmo sem variáveis (modo degradado). Mensagens claras aparecem no log.
- `[ ]`

### T04 — Criar layout global com Header e StepIndicator
- **Descrição**: Implementar layout global com header (logo, provider badge placeholder), step indicator visual mostrando as etapas do fluxo, e estrutura da página principal com seções vazias.
- **Arquivos impactados**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/StepIndicator.tsx`, `src/components/layout/ProviderBadge.tsx`
- **Dependências**: T01
- **Critério de conclusão**: Página principal exibe header com step indicator visual. Tema dark ou profissional aplicado.
- `[ ]`

---

## Fase 1 — Provider Layer

### T05 — Definir tipos e interface de ProviderAdapter
- **Descrição**: Criar tipos TypeScript para a interface comum de providers: `ProviderAdapter`, `GenerateParams`, `GenerateResult`, `ProviderConfig`.
- **Arquivos impactados**: `src/lib/providers/types.ts`
- **Dependências**: T01
- **Critério de conclusão**: Tipos compilam sem erro. Interface é autoexplicativa.
- `[ ]`

### T06 — Implementar adapter OpenRouter
- **Descrição**: Criar adapter para OpenRouter seguindo a interface `ProviderAdapter`. Implementar `generate()`, `isAvailable()`, `listModels()`, `getDefaultModel()`.
- **Arquivos impactados**: `src/lib/providers/openrouter.ts`
- **Dependências**: T05
- **Critério de conclusão**: Adapter funciona com API key válida. Retorna texto gerado.
- `[ ]`

### T07 — Implementar adapter Anthropic
- **Descrição**: Criar adapter para Anthropic Messages API seguindo a interface `ProviderAdapter`.
- **Arquivos impactados**: `src/lib/providers/anthropic.ts`
- **Dependências**: T05
- **Critério de conclusão**: Adapter funciona com API key válida.
- `[ ]`

### T08 — Implementar adapter MiniMax (estrutura)
- **Descrição**: Criar adapter para MiniMax seguindo a interface `ProviderAdapter`. Implementar estrutura base.
- **Arquivos impactados**: `src/lib/providers/minimax.ts`
- **Dependências**: T05
- **Critério de conclusão**: Adapter compila e tem estrutura funcional.
- `[ ]`

### T09 — Implementar adapter claude-subscription (estrutura)
- **Descrição**: Criar adapter para modo claude-subscription. Implementar como opcional com detecção de disponibilidade.
- **Arquivos impactados**: `src/lib/providers/claude-subscription.ts`
- **Dependências**: T05
- **Critério de conclusão**: Adapter retorna "indisponível" quando ambiente não suporta. Compila sem erro.
- `[ ]`

### T10 — Implementar registry e selector com fallback
- **Descrição**: Criar registry de providers, selector que respeita preferência do usuário, e lógica de fallback automático.
- **Arquivos impactados**: `src/lib/providers/registry.ts`, `src/lib/providers/selector.ts`
- **Dependências**: T06, T07, T08, T09
- **Critério de conclusão**: Selector tenta provider preferido, faz fallback se falhar, retorna erro claro se nenhum disponível.
- `[ ]`

### T11 — Criar API routes de provider (config e test)
- **Descrição**: Criar `/api/provider/config` (GET/POST) e `/api/provider/test` (POST) para configuração e teste de providers.
- **Arquivos impactados**: `src/app/api/provider/config/route.ts`, `src/app/api/provider/test/route.ts`
- **Dependências**: T10
- **Critério de conclusão**: API aceita configuração, testa conexão e retorna resultado.
- `[ ]`

### T12 — Criar componente ProviderPanel
- **Descrição**: Implementar painel lateral/modal de configuração de providers com cards por provider, campo de API key (mascarado), botão de teste e indicador de status.
- **Arquivos impactados**: `src/components/provider/ProviderPanel.tsx`, `src/components/provider/ProviderCard.tsx`, `src/components/provider/ApiKeyInput.tsx`
- **Dependências**: T11, T04
- **Critério de conclusão**: Painel abre via ícone no header. Providers são listados com status. API key pode ser inserida e testada.
- `[ ]`

### T13 — Implementar ProviderBadge funcional
- **Descrição**: Conectar `ProviderBadge` no header ao estado real do provider ativo. Exibir nome do provider, indicador visual de fallback.
- **Arquivos impactados**: `src/components/layout/ProviderBadge.tsx`, `src/hooks/useProvider.ts`
- **Dependências**: T12
- **Critério de conclusão**: Badge mostra provider ativo em tempo real. Muda quando provider é alterado.
- `[ ]`

---

## Fase 2 — Ingestão de arquivos

### T14 — Criar parsers de PDF, TXT e MD
- **Descrição**: Implementar funções de extração de texto para cada formato. PDF via `pdf-parse`, TXT e MD via leitura direta. Incluir limpeza de texto.
- **Arquivos impactados**: `src/lib/parser/pdf.ts`, `src/lib/parser/text.ts`, `src/lib/parser/markdown.ts`
- **Dependências**: T01
- **Critério de conclusão**: Cada parser extrai texto corretamente de arquivo de teste.
- `[ ]`

### T15 — Implementar chunker de texto
- **Descrição**: Criar função de chunking por parágrafos com tamanho alvo de 500-1000 tokens e overlap mínimo. Retornar array de chunks com metadados (posição, tamanho).
- **Arquivos impactados**: `src/lib/parser/chunker.ts`
- **Dependências**: T14
- **Critério de conclusão**: Texto longo é segmentado em chunks dentro da faixa de tamanho.
- `[ ]`

### T16 — Criar API route de upload
- **Descrição**: Implementar `/api/upload` que recebe FormData com arquivos, valida tipo e tamanho, extrai texto e retorna chunks.
- **Arquivos impactados**: `src/app/api/upload/route.ts`
- **Dependências**: T14, T15
- **Critério de conclusão**: API aceita PDF/TXT/MD, rejeita outros formatos, retorna chunks.
- `[ ]`

### T17 — Criar componente FileDropZone
- **Descrição**: Implementar área de drag & drop com botão de seleção de arquivo. Visual atraente, estados hover/active, validação de tipo.
- **Arquivos impactados**: `src/components/upload/FileDropZone.tsx`
- **Dependências**: T04
- **Critério de conclusão**: Drag & drop funciona. Arquivos são enviados ao backend.
- `[ ]`

### T18 — Criar componentes FileCard e ChunkPreview
- **Descrição**: Implementar card de arquivo (nome, tipo, tamanho, status) e preview scrollável de chunks extraídos.
- **Arquivos impactados**: `src/components/upload/FileCard.tsx`, `src/components/upload/ChunkPreview.tsx`
- **Dependências**: T16, T17
- **Critério de conclusão**: Após upload, card mostra info do arquivo e chunks são visualizáveis.
- `[ ]`

---

## Fase 3 — Spec Engine

### T19 — Implementar meta-prompt spec-generator
- **Descrição**: Criar o prompt template para geração de spec de prompt. Definir instruções, formato de saída (JSON), guardrails.
- **Arquivos impactados**: `src/lib/prompts/spec-generator.ts`
- **Dependências**: T05
- **Critério de conclusão**: Template produz spec estruturada quando alimentado com conhecimento e objetivo.
- `[ ]`

### T20 — Criar API route /api/generate/spec
- **Descrição**: Implementar endpoint que recebe chunks + objetivo, chama provider via selector, retorna spec gerada.
- **Arquivos impactados**: `src/app/api/generate/spec/route.ts`
- **Dependências**: T10, T19
- **Critério de conclusão**: API retorna spec em JSON. Fallback funciona.
- `[ ]`

### T21 — Criar componentes ObjectiveInput e SpecCard
- **Descrição**: Implementar campo de objetivo com sugestão automática. Implementar card de spec com visualização estruturada e botão de edição.
- **Arquivos impactados**: `src/components/objective/ObjectiveInput.tsx`, `src/components/spec/SpecCard.tsx`, `src/components/spec/SpecEditor.tsx`
- **Dependências**: T18, T20
- **Critério de conclusão**: Objetivo pode ser definido. Spec é gerada e exibida com loading state.
- `[ ]`

---

## Fase 4 — Persona Engine

### T22 — Definir tipos de persona
- **Descrição**: Criar tipos TypeScript para PersonaSpec com todos os campos definidos em `04-agent-persona-spec.md`.
- **Arquivos impactados**: `src/lib/types/persona.ts`
- **Dependências**: T01
- **Critério de conclusão**: Tipos compilam e cobrem todos os campos da spec.
- `[ ]`

### T23 — Implementar meta-prompt persona-generator
- **Descrição**: Criar o prompt template para sugestão de persona. Instrui o modelo a gerar persona concreta, não genérica, com exemplos e anti-exemplos.
- **Arquivos impactados**: `src/lib/prompts/persona-generator.ts`
- **Dependências**: T19, T22
- **Critério de conclusão**: Template produz persona estruturada coerente com domínio.
- `[ ]`

### T24 — Criar API route /api/generate/persona
- **Descrição**: Implementar endpoint que recebe spec + chunks, chama provider, retorna persona sugerida.
- **Arquivos impactados**: `src/app/api/generate/persona/route.ts`
- **Dependências**: T10, T23
- **Critério de conclusão**: API retorna persona em JSON. Persona é coerente com spec.
- `[ ]`

### T25 — Criar componente PersonaDesigner
- **Descrição**: Implementar painel visual de criação de persona com todos os campos interativos: sliders (formalidade, empatia, objetividade), chips (vocabulário), selects (tom principal, postura), textarea (limites), preview de exemplos.
- **Arquivos impactados**: `src/components/persona/PersonaDesigner.tsx`, `src/components/persona/ToneSlider.tsx`, `src/components/persona/VocabularyChips.tsx`, `src/components/persona/ExamplePreview.tsx`
- **Dependências**: T22, T24
- **Critério de conclusão**: Todos os campos são editáveis. Persona sugerida preenche campos automaticamente. Interface é visualmente impactante.
- `[ ]`

---

## Fase 5 — Prompt Builder

### T26 — Implementar meta-prompt prompt-builder
- **Descrição**: Criar prompt template que combina spec + persona + conhecimento para gerar prompt final operacional.
- **Arquivos impactados**: `src/lib/prompts/prompt-builder.ts`
- **Dependências**: T19, T23
- **Critério de conclusão**: Template produz prompt final estruturado com todas as seções.
- `[ ]`

### T27 — Criar API route /api/generate/prompt
- **Descrição**: Implementar endpoint que recebe spec + persona + chunks, chama provider, retorna prompt final.
- **Arquivos impactados**: `src/app/api/generate/prompt/route.ts`
- **Dependências**: T10, T26
- **Critério de conclusão**: API retorna prompt final em Markdown.
- `[ ]`

### T28 — Criar componentes PromptOutput e PromptActions
- **Descrição**: Implementar visualização do prompt final com syntax highlighting (Markdown). Botões de copiar, regenerar e editar.
- **Arquivos impactados**: `src/components/prompt/PromptOutput.tsx`, `src/components/prompt/PromptActions.tsx`
- **Dependências**: T27
- **Critério de conclusão**: Prompt final é exibido com formatação profissional. Copiar funciona.
- `[ ]`

---

## Fase 6 — Validação

### T29 — Implementar meta-prompt consistency-validator
- **Descrição**: Criar prompt template que valida consistência entre spec, persona e prompt final. Retorna checklist e score.
- **Arquivos impactados**: `src/lib/prompts/validator.ts`
- **Dependências**: T26
- **Critério de conclusão**: Template identifica inconsistências e sugere melhorias.
- `[ ]`

### T30 — Criar API route /api/generate/validate
- **Descrição**: Implementar endpoint que recebe spec + persona + prompt final, chama provider, retorna validação.
- **Arquivos impactados**: `src/app/api/generate/validate/route.ts`
- **Dependências**: T10, T29
- **Critério de conclusão**: API retorna checklist com ✅/❌ e score.
- `[ ]`

### T31 — Criar componentes ValidationCard e ScoreIndicator
- **Descrição**: Implementar card de validação com checklist visual, score circular e sugestões de melhoria.
- **Arquivos impactados**: `src/components/validation/ValidationCard.tsx`, `src/components/validation/ScoreIndicator.tsx`
- **Dependências**: T30
- **Critério de conclusão**: Validação é exibida com indicadores visuais claros.
- `[ ]`

---

## Fase 7 — Export

### T32 — Implementar lógica de export
- **Descrição**: Criar funções que consolidam spec, persona, prompt e validação em Markdown e JSON para download.
- **Arquivos impactados**: `src/lib/utils/export.ts`, `src/app/api/export/route.ts`
- **Dependências**: T28, T31
- **Critério de conclusão**: Markdown e JSON são gerados corretamente com todos os artefatos.
- `[ ]`

### T33 — Criar componente ExportButtons
- **Descrição**: Implementar botões de exportação com ícones, download automático, feedback de sucesso.
- **Arquivos impactados**: `src/components/export/ExportButtons.tsx`
- **Dependências**: T32
- **Critério de conclusão**: Download funciona em MD e JSON.
- `[ ]`

---

## Fase 8 — Polish

### T34 — Implementar loading states e skeletons
- **Descrição**: Adicionar skeleton loading em todas as etapas de geração. Animações pulse. Mensagens de progresso.
- **Arquivos impactados**: Todos os componentes de geração
- **Dependências**: Fases 3-7
- **Critério de conclusão**: Nenhuma geração ocorre sem feedback visual.
- `[ ]`

### T35 — Implementar empty states e error states
- **Descrição**: Adicionar mensagens orientadoras em empty states e ações sugeridas em error states em toda a aplicação.
- **Arquivos impactados**: Todos os componentes
- **Dependências**: Fases 3-7
- **Critério de conclusão**: Nenhum estado vazio ou de erro está sem tratamento visual.
- `[ ]`

### T36 — Implementar tema visual e micro-animações
- **Descrição**: Refinar tema dark/profissional. Adicionar transições suaves, hover effects, micro-animações em interações.
- **Arquivos impactados**: `src/app/globals.css`, componentes diversos
- **Dependências**: T34, T35
- **Critério de conclusão**: Interface parece produto real. Interações são fluidas.
- `[ ]`

### T37 — Testar fluxo completo end-to-end
- **Descrição**: Executar fluxo completo com arquivo real: upload → spec → persona → prompt → validação → export. Verificar cada etapa.
- **Arquivos impactados**: Nenhum (teste)
- **Dependências**: Todas as tarefas anteriores
- **Critério de conclusão**: Fluxo completo funciona sem erro não tratado. Demo é gravável.
- `[ ]`

---

## Ordem ideal de execução

```
T01 → T02, T03, T04 (paralelos) → T05 → T06, T07, T08, T09 (paralelos)
→ T10 → T11 → T12 → T13 → T14, T15 (paralelos) → T16 → T17 → T18
→ T19 → T20 → T21 → T22 → T23 → T24 → T25 → T26 → T27 → T28
→ T29 → T30 → T31 → T32 → T33 → T34 → T35 → T36 → T37
```
