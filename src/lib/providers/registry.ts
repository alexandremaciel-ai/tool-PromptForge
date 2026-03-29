import { ProviderAdapter, ProviderStatus } from "./types";
import { OpenRouterAdapter } from "./openrouter";
import { AnthropicAdapter } from "./anthropic";
import { MiniMaxAdapter } from "./minimax";
import { ClaudeSubscriptionAdapter } from "./claude-subscription";

/**
 * Registry of all available provider adapters.
 */
const adapters: ProviderAdapter[] = [
  new OpenRouterAdapter(),
  new AnthropicAdapter(),
  new MiniMaxAdapter(),
  new ClaudeSubscriptionAdapter(),
];

/**
 * Get a provider adapter by ID.
 */
export function getAdapter(id: string): ProviderAdapter | undefined {
  return adapters.find((a) => a.id === id);
}

/**
 * Get all registered adapters.
 */
export function getAllAdapters(): ProviderAdapter[] {
  return adapters;
}

/**
 * Get status of all providers (safe for frontend — no secrets).
 */
export async function getProviderStatuses(): Promise<ProviderStatus[]> {
  const results: ProviderStatus[] = [];

  for (const adapter of adapters) {
    const available = await adapter.isAvailable();
    results.push({
      id: adapter.id,
      name: adapter.name,
      configured: available,
      available,
    });
  }

  return results;
}

/**
 * Get the first available configured adapter.
 */
export async function getFirstAvailable(): Promise<ProviderAdapter | null> {
  for (const adapter of adapters) {
    if (await adapter.isAvailable()) {
      return adapter;
    }
  }
  return null;
}
