# 07 — Implementation Plan

## Visão geral das fases

```
Fase 0: Setup           → Projeto, Docker, variáveis de ambiente
Fase 1: Provider Layer  → Abstração de providers, adapters, seleção, fallback
Fase 2: Ingestão        → Upload, parsing, chunking
Fase 3: Spec Engine     → Geração de spec de prompt
Fase 4: Persona Engine  → Designer de persona, sugestão, edição
Fase 5: Prompt Builder  → Geração de prompt final
Fase 6: Validação       → Checklist de consistência, score
Fase 7: Export          → Exportação em Markdown e JSON
Fase 8: Polish          → UX, loading states, animações, responsividade
```

---

## Fase 0 — Setup do projeto

**Objetivo**: Projeto funcional com Next.js, Docker e variáveis de ambiente.

**Dependências**: Nenhuma  

**Entregáveis**:
- Projeto Next.js 14 inicializado com TypeScript e Tailwind
- Dockerfile e docker-compose.yml funcionais
- `.env.example` com todas as variáveis documentadas
- Layout global com header, provider badge (placeholder) e step indicator
- Página principal com estrutura de seções (vazias)

**Definição de pronto**:
- `docker-compose up` inicia a aplicação na porta 3000.
- Página principal carrega com layout visual.
- Variáveis de ambiente são validadas no startup.

---

## Fase 1 — Provider Layer

**Objetivo**: Camada de abstração de providers funcional com pelo menos 1 adapter.

**Dependências**: Fase 0  

**Entregáveis**:
- Interface `ProviderAdapter` definida
- Adapter OpenRouter implementado
- Adapter Anthropic implementado
- Adapter MiniMax implementado (estrutura)
- Adapter claude-subscription implementado (estrutura, opcional)
- Provider registry e selector com fallback
- API route `/api/provider/config` para salvar/ler configuração
- API route `/api/provider/test` para testar conexão
- Componente `ProviderPanel` funcional no frontend
- Badge de provider ativo no header

**Definição de pronto**:
- Pelo menos 1 provider pode ser configurado e testado.
- Fallback funciona entre providers configurados.
- Provider ativo é exibido na interface.
- Secrets nunca aparecem no frontend.

---

## Fase 2 — Ingestão de arquivos

**Objetivo**: Upload, extração e chunking de PDF, TXT e MD.

**Dependências**: Fase 0  

**Entregáveis**:
- Componente `FileDropZone` com drag & drop
- Componente `FileCard` com metadata
- API route `/api/upload` para receber e processar arquivos
- Parser de PDF (`pdf-parse`)
- Parser de TXT e MD (leitura direta)
- Chunker de texto
- Componente `ChunkPreview` para exibir trechos
- Validação de tipo e tamanho

**Definição de pronto**:
- Upload de PDF, TXT e MD funciona.
- Texto é extraído e chunks são exibidos.
- Erros de arquivo são tratados com mensagem clara.

---

## Fase 3 — Spec Engine

**Objetivo**: Gerar spec de prompt a partir do conhecimento.

**Dependências**: Fase 1 + Fase 2  

**Entregáveis**:
- Meta-prompt `spec-generator` implementado
- API route `/api/generate/spec`
- Componente `ObjectiveInput`
- Componente `SpecCard` com visualização da spec gerada
- Componente `SpecEditor` para edição
- Loading state com skeleton

**Definição de pronto**:
- Spec é gerada a partir de conhecimento + objetivo.
- Spec é editável.
- Provider ativo é indicado durante geração.
- Fallback funciona se provider primário falhar.

---

## Fase 4 — Persona Engine

**Objetivo**: Feature completa de criação e edição de persona.

**Dependências**: Fase 3  

**Entregáveis**:
- Meta-prompt `persona-generator` implementado
- API route `/api/generate/persona`
- Componente `PersonaDesigner` com todos os campos
- Componente `ToneSlider` (sliders de formalidade, empatia, objetividade)
- Componente `VocabularyChips` (vocabulário preferido e proibido)
- Componente `ExamplePreview` (exemplos bons e ruins)
- Sugestão automática de persona
- Edição manual de todos os campos

**Definição de pronto**:
- Persona é sugerida automaticamente com base no conhecimento e spec.
- Todos os campos são editáveis.
- Exemplos e anti-exemplos são gerados.
- Interface é visualmente impactante (sliders, chips, preview).

---

## Fase 5 — Prompt Builder

**Objetivo**: Gerar prompt final combinando spec + persona + conhecimento.

**Dependências**: Fase 3 + Fase 4  

**Entregáveis**:
- Meta-prompt `prompt-builder` implementado
- API route `/api/generate/prompt`
- Componente `PromptOutput` com syntax highlighting
- Componente `PromptActions` (copiar, regenerar, editar)
- Referências ao conhecimento-fonte
- Loading state

**Definição de pronto**:
- Prompt final é gerado e exibido com formatação profissional.
- Prompt reflete spec e persona.
- Ações de copiar e regenerar funcionam.

---

## Fase 6 — Validação

**Objetivo**: Validar consistência entre spec, persona e prompt.

**Dependências**: Fase 5  

**Entregáveis**:
- Meta-prompt `consistency-validator` implementado
- API route `/api/generate/validate`
- Componente `ValidationCard` com checklist visual
- Componente `ScoreIndicator`
- Sugestões de melhoria

**Definição de pronto**:
- Validação é executada automaticamente após geração do prompt.
- Checklist exibe ✅/❌ para cada critério.
- Score geral é calculado e exibido.
- Sugestões de melhoria são apresentadas.

---

## Fase 7 — Export

**Objetivo**: Exportar todos os artefatos em Markdown e JSON.

**Dependências**: Fase 5 + Fase 6  

**Entregáveis**:
- API route `/api/export`
- Componente `ExportButtons`
- Geração de arquivo Markdown consolidado
- Geração de arquivo JSON estruturado
- Download automático

**Definição de pronto**:
- Export em MD funciona e gera arquivo legível.
- Export em JSON funciona e gera estrutura completa.
- Todos os artefatos são incluídos (spec, persona, prompt, validação).

---

## Fase 8 — Polish

**Objetivo**: Polir UX, animações, responsividade e experiência geral.

**Dependências**: Todas as fases anteriores  

**Entregáveis**:
- Loading states com skeleton e animações em todas as etapas
- Transições suaves entre estados
- Empty states com orientação
- Error states com ações sugeridas
- Responsividade básica (desktop-first, tablet aceitável)
- Dark mode ou tema visual refinado
- Micro-animações em interações

**Definição de pronto**:
- A demo parece produto real.
- Nenhum estado de loading/erro/vazio está sem tratamento.
- A experiência é fluida e gravável em vídeo.

---

## Ordem de execução

```
Fase 0 ────→ Fase 1 ────→ Fase 3 ────→ Fase 5 ────→ Fase 7
                ↓              ↓              ↓
             Fase 2        Fase 4        Fase 6 ────→ Fase 8
```

Fases 1 e 2 podem ser parcialmente paralelas (provider layer e ingestão são independentes).
Fases 3 depende de 1+2. Fase 4 depende de 3. Fase 5 depende de 3+4.
Fase 8 é transversal, mas só faz sentido no final.

---

## Estimativa de esforço

| Fase | Esforço estimado |
|---|---|
| Fase 0 — Setup | Pequeno |
| Fase 1 — Provider Layer | Médio |
| Fase 2 — Ingestão | Médio |
| Fase 3 — Spec Engine | Médio |
| Fase 4 — Persona Engine | Grande (feature principal) |
| Fase 5 — Prompt Builder | Médio |
| Fase 6 — Validação | Médio |
| Fase 7 — Export | Pequeno |
| Fase 8 — Polish | Médio |
