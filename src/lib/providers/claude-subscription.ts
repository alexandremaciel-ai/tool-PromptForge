import { ProviderAdapter, GenerateParams, GenerateResult } from "./types";

/**
 * Claude Subscription adapter — optional local runtime.
 * This adapter is a stub that detects availability based on
 * the CLAUDE_SUBSCRIPTION_ENABLED env var.
 * Actual implementation depends on the user's local environment.
 */
export class ClaudeSubscriptionAdapter implements ProviderAdapter {
  id = "claude-subscription" as const;
  name = "Claude (Local)";

  async isAvailable(): Promise<boolean> {
    if (process.env.CLAUDE_SUBSCRIPTION_ENABLED !== "true") {
      return false;
    }
    // In a real implementation, this would check if the Claude CLI
    // or local proxy is reachable.
    return false;
  }

  listModels(): string[] {
    return ["claude-subscription-active"];
  }

  getDefaultModel(): string {
    return "claude-subscription-active";
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error(
        "Modo Claude Subscription não está disponível neste ambiente. " +
          "Use um provider por API key."
      );
    }

    // Stub: in a real implementation, this would route to the
    // local Claude CLI or proxy.
    throw new Error(
      "Claude Subscription: implementação local não configurada. " +
        "Use OpenRouter, Anthropic ou MiniMax como alternativa."
    );
  }
}
