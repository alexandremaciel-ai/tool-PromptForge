/**
 * Provider types for PromptForge.
 * Common interface for all AI model providers.
 */

export interface GenerateParams {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
  provider: string;
  tokensUsed?: number;
  isFallback?: boolean;
}

export interface ProviderAdapter {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether the provider is configured and available */
  isAvailable(): Promise<boolean>;
  /** Generate text completion */
  generate(params: GenerateParams): Promise<GenerateResult>;
  /** List available models */
  listModels(): string[];
  /** Get default model */
  getDefaultModel(): string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  configured: boolean;
  available?: boolean;
}

export interface ProviderConfig {
  defaultProvider: string;
  fallbackProvider: string;
  providers: Record<string, ProviderStatus>;
  anyConfigured: boolean;
}

export type ProviderID = "openrouter" | "anthropic" | "minimax" | "claude-subscription";
