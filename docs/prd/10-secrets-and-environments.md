# 10 — Secrets and Environments

## Environment variables

### Required (at least one)

| Variable | Description | Example |
|---|---|---|
| `OPENROUTER_API_KEY` | API key for OpenRouter | `sk-or-v1-xxxx...` |
| `ANTHROPIC_API_KEY` | API key for Anthropic | `sk-ant-xxxx...` |
| `MINIMAX_API_KEY` | API key for MiniMax | `eyJhbGci...` |

**Rule**: at least one API key must be configured for the system to function. If none is present, the system starts in degraded mode and displays a configuration banner.

### Optional

| Variable | Description | Default |
|---|---|---|
| `CLAUDE_SUBSCRIPTION_ENABLED` | Enables local subscription mode | `false` |
| `DEFAULT_PROVIDER` | Default provider when multiple are available | `openrouter` |
| `FALLBACK_PROVIDER` | Fallback provider | `anthropic` |
| `NODE_ENV` | Execution environment | `development` |
| `PORT` | Server port | `3000` |
| `MAX_FILE_SIZE_MB` | Maximum file size in MB | `10` |
| `MAX_FILES_PER_SESSION` | Maximum number of files per session | `3` |
| `LOG_LEVEL` | Log level | `info` |

---

## Supported environments

### 1. Local (development)
- Docker with docker-compose
- Local `.env` with developer's real keys
- Hot reload via volume mount
- `NODE_ENV=development`

### 2. Demo
- Standalone Docker
- `.env` with demo keys
- `NODE_ENV=production`
- Optimized for presentation

### 3. CI/Test (future)
- No real API keys
- Provider mocks
- `NODE_ENV=test`

---

## Security policy

### Absolute rules
1. **Never commit real keys** → `.env` is in `.gitignore`
2. **Never expose keys on the frontend** → all authentication goes through the backend (API routes)
3. **Never log keys** → mask in logs (`sk-or-v1-****`)
4. **Never send keys in response** → API routes return only configuration status, not the key
5. **Validate presence before use** → explicit check before each call

### What the frontend knows
- Which providers are configured (boolean per provider)
- Which is the active provider
- Status of each provider (configured, not configured, unavailable)

### What the frontend does NOT know
- API keys
- Values of sensitive variables
- Authentication details

---

## Local bootstrap flow

### Step-by-step to run the project for the first time

```bash
# 1. Clone the repository
git clone <repo-url>
cd tool-prompt-maciel-v2

# 2. Copy the example file
cp .env.example .env

# 3. Edit .env with your keys
# Fill in at least one API key:
# OPENROUTER_API_KEY=sk-or-v1-your-key-here
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# MINIMAX_API_KEY=your-key-here

# 4. Start with Docker
docker-compose up --build

# 5. Access
# http://localhost:3000
```

### Without Docker (development)

```bash
# 1-3: Same steps as above
# 4. Install dependencies
npm install

# 5. Run in dev mode
npm run dev

# 6. Access
# http://localhost:3000
```

---

## `.env.example`

```bash
# ============================================
# PromptForge — Environment Variables
# ============================================
# Copy this file to .env and fill in
# at least ONE provider API key.
# ============================================

# --- Providers (fill in at least one) ---

# OpenRouter - https://openrouter.ai/keys
OPENROUTER_API_KEY=

# Anthropic - https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=

# MiniMax - https://www.minimax.chat/
MINIMAX_API_KEY=

# --- Provider Configuration ---

# Default provider: openrouter | anthropic | minimax
DEFAULT_PROVIDER=openrouter

# Fallback provider: openrouter | anthropic | minimax
FALLBACK_PROVIDER=anthropic

# --- Claude Subscription Mode (optional) ---
# Enables local runtime with Claude subscription.
# Requires compatible environment. Not mandatory.
CLAUDE_SUBSCRIPTION_ENABLED=false

# --- Application ---

# Server port
PORT=3000

# Environment: development | production | test
NODE_ENV=development

# Maximum file size in MB
MAX_FILE_SIZE_MB=10

# Maximum number of files per session
MAX_FILES_PER_SESSION=3

# Log level: debug | info | warn | error
LOG_LEVEL=info
```

---

## Configuration validation

### At application startup

```typescript
// Pseudocode for validation
function validateConfig() {
  const providers = {
    openrouter: process.env.OPENROUTER_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    minimax: process.env.MINIMAX_API_KEY,
  };

  const configured = Object.entries(providers)
    .filter(([_, key]) => key && key.length > 0);

  if (configured.length === 0) {
    console.warn('⚠️  No provider configured.');
    console.warn('   Fill in at least one API key in the .env file');
    console.warn('   The application will start in degraded mode.');
  } else {
    configured.forEach(([name]) => {
      console.log(`✅ Provider configured: ${name}`);
    });
  }

  if (process.env.CLAUDE_SUBSCRIPTION_ENABLED === 'true') {
    console.log('ℹ️  claude-subscription mode enabled (availability will be checked at runtime).');
  }
}
```

---

## Handling missing keys

| Situation | Behavior |
|---|---|
| No API key | App starts. Banner: "Configure a provider to get started." Generation buttons disabled. |
| One API key | App works normally with the configured provider. |
| Multiple API keys | App uses `DEFAULT_PROVIDER`. Falls back to `FALLBACK_PROVIDER`. |
| `DEFAULT_PROVIDER` without key | App automatically chooses a provider that has a key configured. |
| `CLAUDE_SUBSCRIPTION_ENABLED=true` without support | App silently ignores. Uses API-key-based providers. |

---

## Strategy for claude-subscription mode

1. Enableable via `CLAUDE_SUBSCRIPTION_ENABLED=true`.
2. At boot, adapter attempts to detect environment availability.
3. If available → appears as option in the provider panel.
4. If unavailable → appears as "Unavailable" in the panel, without blocking the system.
5. If selected as default but unavailable → automatic fallback.
6. Clear log: "claude-subscription mode enabled but unavailable in this environment."

---

## Risks and mitigation

| Risk | Mitigation |
|---|---|
| Key accidentally committed | `.env` in `.gitignore`. Pre-commit hook recommended. |
| Key exposed in log | Mask keys in logs (last 4 chars only). |
| Key exposed in response | API routes never return keys, only boolean status. |
| Invalid key without feedback | Connection test in configuration returns clear error. |
| Multiple people sharing `.env` | Each developer maintains their own local `.env`. |
