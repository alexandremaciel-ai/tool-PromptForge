import { ProviderAdapter, GenerateParams, GenerateResult } from "./types";
import { getAdapter, getFirstAvailable } from "./registry";

/**
 * Select a provider and execute generation with fallback logic.
 *
 * Flow:
 * 1. Try the preferred provider.
 * 2. If unavailable/fails → try fallback provider.
 * 3. If fallback fails → try first available.
 * 4. If nothing works → throw descriptive error.
 */
export async function generateWithFallback(
  params: GenerateParams,
  preferredProviderId?: string
): Promise<GenerateResult> {
  const defaultId = preferredProviderId || process.env.DEFAULT_PROVIDER || "openrouter";
  const fallbackId = process.env.FALLBACK_PROVIDER || "anthropic";

  // 1. Try preferred
  const preferred = getAdapter(defaultId);
  if (preferred && (await preferred.isAvailable())) {
    try {
      return await preferred.generate(params);
    } catch (error) {
      console.warn(
        `⚠️ Provider ${preferred.name} falhou: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }. Tentando fallback...`
      );
    }
  }

  // 2. Try fallback
  if (fallbackId !== defaultId) {
    const fallback = getAdapter(fallbackId);
    if (fallback && (await fallback.isAvailable())) {
      try {
        const result = await fallback.generate(params);
        return { ...result, isFallback: true };
      } catch (error) {
        console.warn(
          `⚠️ Fallback ${fallback.name} falhou: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
    }
  }

  // 3. Try first available
  const firstAvailable = await getFirstAvailable();
  if (firstAvailable && firstAvailable.id !== defaultId && firstAvailable.id !== fallbackId) {
    try {
      const result = await firstAvailable.generate(params);
      return { ...result, isFallback: true };
    } catch (error) {
      console.error(
        `❌ Provider ${firstAvailable.name} falhou: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  // 4. Nothing works
  throw new Error(
    "Nenhum provider disponível. Configure pelo menos uma API key nas configurações."
  );
}
