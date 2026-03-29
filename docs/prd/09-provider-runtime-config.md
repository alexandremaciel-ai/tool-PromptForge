# 09 — Provider & Runtime Configuration

## Arquitetura de providers

A camada de provider é uma abstração central que isola a lógica de produto da lógica de vendor. Todo o sistema chama um provider genérico — nunca um vendor diretamente.

```
[Frontend] → [API Route] → [Provider Selector] → [Provider Adapter] → [API do Vendor]
                                   ↓ (fallback)
                            [Provider Adapter 2] → [API do Vendor 2]
```

---

## Providers suportados

### 1. OpenRouter

| Atributo | Valor |
|---|---|
| Nome | OpenRouter |
| Tipo de autenticação | Bearer token via header `Authorization` |
| Variável de ambiente | `OPENROUTER_API_KEY` |
| Base URL | `https://openrouter.ai/api/v1/chat/completions` |
| Modelo padrão | `anthropic/claude-3.5-sonnet` |
| Modelos alternativos | `anthropic/claude-3-haiku`, `google/gemini-pro-1.5`, `meta-llama/llama-3.1-70b-instruct` |
| Formato de request | OpenAI-compatible (`messages[]`, `model`, `temperature`, `max_tokens`) |
| Formato de response | `choices[0].message.content` |
| Capacidade de reasoning | Sim (depende do modelo selecionado) |
| Rate limiting | Depende do plano do usuário |
| Etapas permitidas | Todas (spec, persona, prompt, validação) |
| Prioridade padrão | 1 (principal) |

**Headers obrigatórios**:
```
Authorization: Bearer {OPENROUTER_API_KEY}
HTTP-Referer: {APP_URL}
X-Title: PromptForge
Content-Type: application/json
```

---

### 2. Anthropic

| Atributo | Valor |
|---|---|
| Nome | Anthropic |
| Tipo de autenticação | API key via header `x-api-key` |
| Variável de ambiente | `ANTHROPIC_API_KEY` |
| Base URL | `https://api.anthropic.com/v1/messages` |
| Modelo padrão | `claude-3-5-sonnet-20241022` |
| Modelos alternativos | `claude-3-haiku-20240307`, `claude-3-opus-20240229` |
| Formato de request | Anthropic Messages API (`messages[]`, `model`, `max_tokens`, `system`) |
| Formato de response | `content[0].text` |
| Capacidade de reasoning | Sim (extended thinking disponível em modelos selecionados) |
| Rate limiting | RPM e TPM conforme plano |
| Etapas permitidas | Todas |
| Prioridade padrão | 2 (fallback) |

**Headers obrigatórios**:
```
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01
Content-Type: application/json
```

---

### 3. MiniMax

| Atributo | Valor |
|---|---|
| Nome | MiniMax |
| Tipo de autenticação | Bearer token via header `Authorization` |
| Variável de ambiente | `MINIMAX_API_KEY` |
| Base URL | `https://api.minimax.chat/v1/text/chatcompletion_v2` |
| Modelo padrão | `abab6.5s-chat` |
| Modelos alternativos | `abab6.5-chat`, `abab5.5-chat` |
| Formato de request | MiniMax API (`messages[]`, `model`) |
| Formato de response | `choices[0].message.content` |
| Capacidade de reasoning | Limitada |
| Rate limiting | Conforme plano |
| Etapas permitidas | Todas (best effort) |
| Prioridade padrão | 3 (secundário) |

**Headers obrigatórios**:
```
Authorization: Bearer {MINIMAX_API_KEY}
Content-Type: application/json
```

---

### 4. Claude Subscription (modo opcional)

| Atributo | Valor |
|---|---|
| Nome | claude-subscription |
| Tipo de autenticação | Sessão local (sem API key explícita) |
| Variável de ambiente | `CLAUDE_SUBSCRIPTION_ENABLED` (boolean) |
| Base URL | Determinada pelo ambiente local (CLI proxy ou integração direta) |
| Modelo padrão | Modelo ativo na subscrição do usuário |
| Modelos alternativos | Nenhum (depende da subscrição) |
| Formato de request | A definir conforme disponibilidade do ambiente |
| Capacidade de reasoning | Depende do modelo na subscrição |
| Rate limiting | Depende do plano pessoal |
| Etapas permitidas | Todas |
| Prioridade padrão | Nenhuma (deve ser habilitado explicitamente) |

**Regras especiais**:
- Este modo é **opcional e não garantido**.
- Disponibilidade depende do ambiente local do usuário.
- Se `CLAUDE_SUBSCRIPTION_ENABLED=true` mas o ambiente não suporta, o adapter retorna `isAvailable: false` silenciosamente.
- **Nunca** deve ser o único provider configurado.
- Sempre deve existir fallback para provider por API key.
- A UX deve exibir "Modo local (subscrição)" quando ativo.

---

## Responsabilidades da camada de provider

| Responsabilidade | Descrição |
|---|---|
| Abstração | Interface comum para todos os vendors |
| Seleção | Escolher provider com base na preferência do usuário |
| Fallback | Tentar provider alternativo em caso de falha |
| Normalização | Converter request/response de cada vendor para formato interno |
| Disponibilidade | Verificar se provider está configurado e acessível |
| Identificação | Incluir nome do provider no resultado |
| Isolamento | Lógica de vendor isolada em adapters, sem condicional espalhado |

---

## Seleção de modelo por etapa

O usuário pode configurar provider por etapa ou globalmente:

| Etapa | Provider sugerido | Justificativa |
|---|---|---|
| Geração de spec | Provider padrão | Requer boa compreensão de texto |
| Geração de persona | Provider padrão | Requer criatividade e estrutura |
| Geração de prompt | Provider padrão | Tarefa mais complexa |
| Validação | Provider padrão ou fallback | Pode usar modelo mais barato |

No MVP, a configuração será **global** (mesmo provider para todas as etapas). Seleção por etapa é extensão futura.

---

## Lógica de fallback

```
1. Tentar provider preferido do usuário
2. Se falha (timeout, erro 4xx/5xx, indisponível):
   2a. Tentar próximo provider por prioridade
   2b. Se nenhum disponível: retornar erro com mensagem clara
3. Registrar qual provider foi usado no resultado
4. Se fallback foi acionado, indicar na resposta
```

**Comportamento de retry**:
- 1 retry para timeout (após 30s)
- Sem retry para erros 4xx (API key inválida, rate limit)
- 1 retry para erros 5xx
- Backoff de 2 segundos entre retries

---

## UX de configuração

### Painel de providers (modal/sidebar)

```
┌──────────────────────────────────────┐
│  ⚙️  Configuração de Providers       │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ● OpenRouter        ✅ Ativo   │  │
│  │   API Key: ••••••••k3f9       │  │
│  │   Modelo: claude-3.5-sonnet   │  │
│  │   [Testar] [Remover]          │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ Anthropic     ⚠️ Não config. │  │
│  │   API Key: [_______________]  │  │
│  │   [Adicionar]                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ MiniMax       ⚠️ Não config. │  │
│  │   API Key: [_______________]  │  │
│  │   [Adicionar]                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ Claude (Local) ⚠️ Indisponível│ │
│  │   Requer ambiente compatível  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Provider padrão: [OpenRouter ▼]     │
│  Fallback:        [Anthropic ▼]      │
│                                      │
│              [Salvar]                │
└──────────────────────────────────────┘
```

### Badge no header

```
┌──────────────────────────────────────────────┐
│  🔥 PromptForge    [Upload][Spec]...  ⚡ OpenRouter (ativo)  ⚙️ │
└──────────────────────────────────────────────┘
```

---

## Mensagens de erro por provider

| Situação | Mensagem |
|---|---|
| API key ausente | "Configure uma API key para {provider} nas configurações." |
| API key inválida | "A API key de {provider} não é válida. Verifique e tente novamente." |
| Rate limit atingido | "Limite de requisições atingido em {provider}. Aguarde ou use outro provider." |
| Provider fora do ar | "O provider {provider} está temporariamente indisponível. Usando {fallback}." |
| Nenhum provider disponível | "Nenhum provider está configurado ou disponível. Acesse as configurações para adicionar uma API key." |
| Timeout | "A requisição para {provider} excedeu o tempo limite. Tentando {fallback}..." |
| claude-subscription indisponível | "O modo de subscrição local não está disponível neste ambiente. Use um provider por API key." |

---

## Comportamento em indisponibilidade

| Cenário | Comportamento |
|---|---|
| 0 providers configurados | Banner persistente. Botões de geração desabilitados. |
| Provider primário cai | Fallback automático + badge muda + toast informativo |
| Todos os providers caem | Mensagem de erro clara. Sugestão de verificar configuração. |
| claude-subscription ligado mas indisponível | Ignorar silenciosamente, usar próximo provider |
