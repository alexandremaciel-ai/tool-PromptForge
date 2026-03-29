/**
 * Configuration utility for PromptForge.
 * Validates environment variables and provides typed access.
 */

export interface AppConfig {
  providers: {
    openrouter: { apiKey: string | null; model: string | null };
    anthropic: { apiKey: string | null; model: string | null };
    minimax: { apiKey: string | null; model: string | null };
    claudeSubscription: { enabled: boolean };
  };
  defaultProvider: string;
  fallbackProvider: string;
  maxFileSizeMB: number;
  maxFilesPerSession: number;
  logLevel: string;
  nodeEnv: string;
}

export function getConfig(): AppConfig {
  return {
    providers: {
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY || null,
        model: process.env.OPENROUTER_MODEL || null,
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || null,
        model: process.env.ANTHROPIC_MODEL || null,
      },
      minimax: {
        apiKey: process.env.MINIMAX_API_KEY || null,
        model: process.env.MINIMAX_MODEL || null,
      },
      claudeSubscription: {
        enabled: process.env.CLAUDE_SUBSCRIPTION_ENABLED === "true",
      },
    },
    defaultProvider: process.env.DEFAULT_PROVIDER || "openrouter",
    fallbackProvider: process.env.FALLBACK_PROVIDER || "anthropic",
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10),
    maxFilesPerSession: parseInt(
      process.env.MAX_FILES_PER_SESSION || "3",
      10
    ),
    logLevel: process.env.LOG_LEVEL || "info",
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

/**
 * Returns a safe provider status object for the frontend.
 * Never exposes API keys — only booleans.
 */
export function getProviderStatus() {
  const config = getConfig();

  return {
    openrouter: {
      configured: !!config.providers.openrouter.apiKey,
      name: "OpenRouter",
    },
    anthropic: {
      configured: !!config.providers.anthropic.apiKey,
      name: "Anthropic",
    },
    minimax: {
      configured: !!config.providers.minimax.apiKey,
      name: "MiniMax",
    },
    claudeSubscription: {
      configured: config.providers.claudeSubscription.enabled,
      name: "Claude (Local)",
    },
    defaultProvider: config.defaultProvider,
    fallbackProvider: config.fallbackProvider,
    anyConfigured:
      !!config.providers.openrouter.apiKey ||
      !!config.providers.anthropic.apiKey ||
      !!config.providers.minimax.apiKey,
  };
}

/**
 * Validates configuration on startup and logs status.
 */
export function validateConfig(): void {
  const config = getConfig();

  const providers = [
    { name: "OpenRouter", key: config.providers.openrouter.apiKey },
    { name: "Anthropic", key: config.providers.anthropic.apiKey },
    { name: "MiniMax", key: config.providers.minimax.apiKey },
  ];

  const configured = providers.filter((p) => p.key && p.key.length > 0);

  console.log("\n🔧 PromptForge — Configuração de providers:");

  if (configured.length === 0) {
    console.warn("⚠️  Nenhum provider configurado.");
    console.warn("   Preencha pelo menos uma API key no arquivo .env");
    console.warn("   A aplicação iniciará em modo degradado.\n");
  } else {
    configured.forEach((p) => {
      const maskedKey = p.key!.slice(-4).padStart(p.key!.length, "•");
      console.log(`✅ ${p.name}: ${maskedKey}`);
    });
    console.log("");
  }

  if (config.providers.claudeSubscription.enabled) {
    console.log(
      "ℹ️  Modo claude-subscription habilitado (disponibilidade verificada em runtime).\n"
    );
  }
}
