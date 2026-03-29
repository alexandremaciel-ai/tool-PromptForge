# 10 — Secrets and Environments

## Variáveis de ambiente

### Obrigatórias (ao menos uma)

| Variável | Descrição | Exemplo |
|---|---|---|
| `OPENROUTER_API_KEY` | API key para OpenRouter | `sk-or-v1-xxxx...` |
| `ANTHROPIC_API_KEY` | API key para Anthropic | `sk-ant-xxxx...` |
| `MINIMAX_API_KEY` | API key para MiniMax | `eyJhbGci...` |

**Regra**: pelo menos uma API key deve estar configurada para que o sistema funcione. Se nenhuma estiver presente, o sistema inicia em modo degradado e exibe banner de configuração.

### Opcionais

| Variável | Descrição | Default |
|---|---|---|
| `CLAUDE_SUBSCRIPTION_ENABLED` | Habilita modo de subscrição local | `false` |
| `DEFAULT_PROVIDER` | Provider padrão quando há múltiplos | `openrouter` |
| `FALLBACK_PROVIDER` | Provider de fallback | `anthropic` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta do servidor | `3000` |
| `MAX_FILE_SIZE_MB` | Tamanho máximo de arquivo em MB | `10` |
| `MAX_FILES_PER_SESSION` | Número máximo de arquivos por sessão | `3` |
| `LOG_LEVEL` | Nível de log | `info` |

---

## Ambientes suportados

### 1. Local (desenvolvimento)
- Docker com docker-compose
- `.env` local com chaves reais do desenvolvedor
- Hot reload via volume mount
- `NODE_ENV=development`

### 2. Demo
- Docker standalone
- `.env` com chaves de demonstração
- `NODE_ENV=production`
- Otimizado para apresentação

### 3. CI/Test (futuro)
- Sem API keys reais
- Mocks de providers
- `NODE_ENV=test`

---

## Política de segurança

### Regras absolutas
1. **Nunca commitar chaves reais** → `.env` está no `.gitignore`
2. **Nunca expor chaves no frontend** → toda autenticação passa pelo backend (API routes)
3. **Nunca logar chaves** → mascarar em logs (`sk-or-v1-****`)
4. **Nunca enviar chaves em response** → API routes retornam apenas status de configuração, não a key
5. **Validar presença antes de usar** → checagem explícita antes de cada chamada

### O que o frontend sabe
- Quais providers estão configurados (boolean por provider)
- Qual é o provider ativo
- Status de cada provider (configurado, não configurado, indisponível)

### O que o frontend NÃO sabe
- API keys
- Valores de variáveis sensíveis
- Detalhes de autenticação

---

## Fluxo de bootstrap local

### Passo a passo para rodar o projeto pela primeira vez

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd tool-prompt-maciel-v2

# 2. Copiar arquivo de exemplo
cp .env.example .env

# 3. Editar .env com suas chaves
# Preencha pelo menos uma API key:
# OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
# ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
# MINIMAX_API_KEY=sua-chave-aqui

# 4. Subir com Docker
docker-compose up --build

# 5. Acessar
# http://localhost:3000
```

### Sem Docker (desenvolvimento)

```bash
# 1-3: Mesmos passos acima
# 4. Instalar dependências
npm install

# 5. Rodar em modo dev
npm run dev

# 6. Acessar
# http://localhost:3000
```

---

## `.env.example`

```bash
# ============================================
# PromptForge — Variáveis de Ambiente
# ============================================
# Copie este arquivo para .env e preencha
# pelo menos UMA API key de provider.
# ============================================

# --- Providers (preencha pelo menos um) ---

# OpenRouter - https://openrouter.ai/keys
OPENROUTER_API_KEY=

# Anthropic - https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=

# MiniMax - https://www.minimax.chat/
MINIMAX_API_KEY=

# --- Configuração de Provider ---

# Provider padrão: openrouter | anthropic | minimax
DEFAULT_PROVIDER=openrouter

# Provider de fallback: openrouter | anthropic | minimax
FALLBACK_PROVIDER=anthropic

# --- Modo Claude Subscription (opcional) ---
# Habilita runtime local com subscrição do Claude.
# Requer ambiente compatível. Não é obrigatório.
CLAUDE_SUBSCRIPTION_ENABLED=false

# --- Aplicação ---

# Porta do servidor
PORT=3000

# Ambiente: development | production | test
NODE_ENV=development

# Tamanho máximo de arquivo em MB
MAX_FILE_SIZE_MB=10

# Número máximo de arquivos por sessão
MAX_FILES_PER_SESSION=3

# Nível de log: debug | info | warn | error
LOG_LEVEL=info
```

---

## Validação de configuração

### No startup da aplicação

```typescript
// Pseudocódigo da validação
function validateConfig() {
  const providers = {
    openrouter: process.env.OPENROUTER_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    minimax: process.env.MINIMAX_API_KEY,
  };

  const configured = Object.entries(providers)
    .filter(([_, key]) => key && key.length > 0);

  if (configured.length === 0) {
    console.warn('⚠️  Nenhum provider configurado.');
    console.warn('   Preencha pelo menos uma API key no arquivo .env');
    console.warn('   A aplicação iniciará em modo degradado.');
  } else {
    configured.forEach(([name]) => {
      console.log(`✅ Provider configurado: ${name}`);
    });
  }

  if (process.env.CLAUDE_SUBSCRIPTION_ENABLED === 'true') {
    console.log('ℹ️  Modo claude-subscription habilitado (disponibilidade será verificada em runtime).');
  }
}
```

---

## Tratamento de ausência de chave

| Situação | Comportamento |
|---|---|
| Nenhuma API key | App inicia. Banner: "Configure um provider para começar." Botões de geração desabilitados. |
| Uma API key | App funciona normalmente com o provider configurado. |
| Múltiplas API keys | App usa `DEFAULT_PROVIDER`. Fallback para `FALLBACK_PROVIDER`. |
| `DEFAULT_PROVIDER` sem key | App escolhe automaticamente um provider que tem key configurada. |
| `CLAUDE_SUBSCRIPTION_ENABLED=true` sem suporte | App ignora silenciosamente. Usa providers por API key. |

---

## Estratégia para modo claude-subscription

1. Habilitável via `CLAUDE_SUBSCRIPTION_ENABLED=true`.
2. No boot, adapter tenta detectar disponibilidade do ambiente.
3. Se disponível → aparece como opção no painel de providers.
4. Se indisponível → aparece como "Indisponível" no painel, sem bloquear o sistema.
5. Se selecionado como padrão mas indisponível → fallback automático.
6. Log claro: "Modo claude-subscription habilitado mas indisponível neste ambiente."

---

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Chave commitada acidentalmente | `.env` no `.gitignore`. Pre-commit hook recomendado. |
| Chave exposta em log | Mascarar chaves em logs (últimos 4 chars apenas). |
| Chave exposta em response | API routes nunca retornam keys, apenas status boolean. |
| Chave inválida sem feedback | Teste de conexão na configuração retorna erro claro. |
| Múltiplas pessoas compartilhando `.env` | Cada desenvolvedor mantém seu `.env` local. |
