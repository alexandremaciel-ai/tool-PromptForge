# 09 — Provider & Runtime Configuration

## Provider architecture

The provider layer is a central abstraction that isolates product logic from vendor logic. The entire system calls a generic provider — never a vendor directly.

```
[Frontend] → [API Route] → [Provider Selector] → [Provider Adapter] → [Vendor API]
                                   ↓ (fallback)
                            [Provider Adapter 2] → [Vendor API 2]
```

---

## Supported providers

### 1. OpenRouter

| Attribute | Value |
|---|---|
| Name | OpenRouter |
| Authentication type | Bearer token via `Authorization` header |
| Environment variable | `OPENROUTER_API_KEY` |
| Base URL | `https://openrouter.ai/api/v1/chat/completions` |
| Default model | `anthropic/claude-3.5-sonnet` |
| Alternative models | `anthropic/claude-3-haiku`, `google/gemini-pro-1.5`, `meta-llama/llama-3.1-70b-instruct` |
| Request format | OpenAI-compatible (`messages[]`, `model`, `temperature`, `max_tokens`) |
| Response format | `choices[0].message.content` |
| Reasoning capability | Yes (depends on the selected model) |
| Rate limiting | Depends on user's plan |
| Allowed stages | All (spec, persona, prompt, validation) |
| Default priority | 1 (primary) |

**Required headers**:
```
Authorization: Bearer {OPENROUTER_API_KEY}
HTTP-Referer: {APP_URL}
X-Title: PromptForge
Content-Type: application/json
```

---

### 2. Anthropic

| Attribute | Value |
|---|---|
| Name | Anthropic |
| Authentication type | API key via `x-api-key` header |
| Environment variable | `ANTHROPIC_API_KEY` |
| Base URL | `https://api.anthropic.com/v1/messages` |
| Default model | `claude-3-5-sonnet-20241022` |
| Alternative models | `claude-3-haiku-20240307`, `claude-3-opus-20240229` |
| Request format | Anthropic Messages API (`messages[]`, `model`, `max_tokens`, `system`) |
| Response format | `content[0].text` |
| Reasoning capability | Yes (extended thinking available on selected models) |
| Rate limiting | RPM and TPM per plan |
| Allowed stages | All |
| Default priority | 2 (fallback) |

**Required headers**:
```
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01
Content-Type: application/json
```

---

### 3. MiniMax

| Attribute | Value |
|---|---|
| Name | MiniMax |
| Authentication type | Bearer token via `Authorization` header |
| Environment variable | `MINIMAX_API_KEY` |
| Base URL | `https://api.minimax.chat/v1/text/chatcompletion_v2` |
| Default model | `abab6.5s-chat` |
| Alternative models | `abab6.5-chat`, `abab5.5-chat` |
| Request format | MiniMax API (`messages[]`, `model`) |
| Response format | `choices[0].message.content` |
| Reasoning capability | Limited |
| Rate limiting | Per plan |
| Allowed stages | All (best effort) |
| Default priority | 3 (secondary) |

**Required headers**:
```
Authorization: Bearer {MINIMAX_API_KEY}
Content-Type: application/json
```

---

### 4. Claude Subscription (optional mode)

| Attribute | Value |
|---|---|
| Name | claude-subscription |
| Authentication type | Local session (no explicit API key) |
| Environment variable | `CLAUDE_SUBSCRIPTION_ENABLED` (boolean) |
| Base URL | Determined by local environment (CLI proxy or direct integration) |
| Default model | Active model in user's subscription |
| Alternative models | None (depends on subscription) |
| Request format | To be defined based on environment availability |
| Reasoning capability | Depends on the model in subscription |
| Rate limiting | Depends on personal plan |
| Allowed stages | All |
| Default priority | None (must be explicitly enabled) |

**Special rules**:
- This mode is **optional and not guaranteed**.
- Availability depends on the user's local environment.
- If `CLAUDE_SUBSCRIPTION_ENABLED=true` but the environment doesn't support it, the adapter returns `isAvailable: false` silently.
- **Never** should be the only configured provider.
- There must always be a fallback to an API-key-based provider.
- The UX should display "Local mode (subscription)" when active.

---

## Provider layer responsibilities

| Responsibility | Description |
|---|---|
| Abstraction | Common interface for all vendors |
| Selection | Choose provider based on user preference |
| Fallback | Try alternative provider on failure |
| Normalization | Convert each vendor's request/response to internal format |
| Availability | Check if provider is configured and accessible |
| Identification | Include provider name in the result |
| Isolation | Vendor logic isolated in adapters, no scattered conditionals |

---

## Model selection per stage

The user can configure provider per stage or globally:

| Stage | Suggested provider | Rationale |
|---|---|---|
| Spec generation | Default provider | Requires good text comprehension |
| Persona generation | Default provider | Requires creativity and structure |
| Prompt generation | Default provider | Most complex task |
| Validation | Default or fallback provider | Can use a cheaper model |

In the MVP, the configuration will be **global** (same provider for all stages). Per-stage selection is a future extension.

---

## Fallback logic

```
1. Try user's preferred provider
2. If fails (timeout, 4xx/5xx error, unavailable):
   2a. Try next provider by priority
   2b. If none available: return error with clear message
3. Record which provider was used in the result
4. If fallback was triggered, indicate in the response
```

**Retry behavior**:
- 1 retry for timeout (after 30s)
- No retry for 4xx errors (invalid API key, rate limit)
- 1 retry for 5xx errors
- 2-second backoff between retries

---

## Configuration UX

### Provider panel (modal/sidebar)

```
┌──────────────────────────────────────┐
│  ⚙️  Provider Configuration          │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ● OpenRouter        ✅ Active  │  │
│  │   API Key: ••••••••k3f9       │  │
│  │   Model: claude-3.5-sonnet    │  │
│  │   [Test] [Remove]             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ Anthropic    ⚠️ Not config.  │  │
│  │   API Key: [_______________]  │  │
│  │   [Add]                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ MiniMax      ⚠️ Not config.  │  │
│  │   API Key: [_______________]  │  │
│  │   [Add]                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ Claude (Local) ⚠️ Unavailable│  │
│  │   Requires compatible env.    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Default provider: [OpenRouter ▼]    │
│  Fallback:         [Anthropic ▼]     │
│                                      │
│              [Save]                  │
└──────────────────────────────────────┘
```

### Header badge

```
┌──────────────────────────────────────────────┐
│  🔥 PromptForge    [Upload][Spec]...  ⚡ OpenRouter (active)  ⚙️ │
└──────────────────────────────────────────────┘
```

---

## Error messages per provider

| Situation | Message |
|---|---|
| API key missing | "Configure an API key for {provider} in settings." |
| Invalid API key | "The {provider} API key is not valid. Check and try again." |
| Rate limit reached | "Request limit reached at {provider}. Wait or use another provider." |
| Provider outage | "Provider {provider} is temporarily unavailable. Using {fallback}." |
| No provider available | "No provider is configured or available. Go to settings to add an API key." |
| Timeout | "Request to {provider} exceeded the time limit. Trying {fallback}..." |
| claude-subscription unavailable | "Local subscription mode is not available in this environment. Use an API-key-based provider." |

---

## Behavior on unavailability

| Scenario | Behavior |
|---|---|
| 0 providers configured | Persistent banner. Generation buttons disabled. |
| Primary provider goes down | Automatic fallback + badge changes + informative toast |
| All providers go down | Clear error message. Suggestion to check configuration. |
| claude-subscription enabled but unavailable | Silently ignored, use next provider |
