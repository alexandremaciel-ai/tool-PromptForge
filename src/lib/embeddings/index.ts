import { getConfig } from "@/lib/utils/config";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EmbeddingProviderConfig {
  id: string;
  apiUrl: string;
  apiKey: string;
  model: string;
}

/**
 * Monta a lista ordenada de provedores de embedding disponíveis.
 * O provedor definido em EMBEDDING_PROVIDER (default: openrouter) entra primeiro.
 * Se rate limitado, o código desce para o próximo da lista.
 */
function getEmbeddingProviders(): EmbeddingProviderConfig[] {
  const config = getConfig();
  const preferred = process.env.EMBEDDING_PROVIDER || "openrouter";

  const all: EmbeddingProviderConfig[] = [];

  if (config.providers.openrouter?.apiKey) {
    all.push({
      id: "openrouter",
      apiUrl: "https://openrouter.ai/api/v1/embeddings",
      apiKey: config.providers.openrouter.apiKey,
      model: "text-embedding-3-small",
    });
  }

  if (config.providers.minimax?.apiKey) {
    all.push({
      id: "minimax",
      apiUrl: "https://api.minimax.io/v1/embeddings",
      apiKey: config.providers.minimax.apiKey,
      model: "embo-01",
    });
  }

  // Reordena colocando o preferido na frente
  const preferredIdx = all.findIndex((p) => p.id === preferred);
  if (preferredIdx > 0) {
    const [pref] = all.splice(preferredIdx, 1);
    all.unshift(pref);
  }

  return all;
}

/**
 * Faz uma única chamada HTTP de embedding para um provedor específico.
 * Retorna null se rate limitado (429), para que o caller tente o próximo provedor.
 * Lança erro em qualquer outra falha.
 */
async function callEmbeddingProvider(
  provider: EmbeddingProviderConfig,
  batch: string[]
): Promise<number[][] | null> {
  const body: Record<string, unknown> = { model: provider.model };

  if (provider.id === "minimax") {
    body.texts = batch;
    body.type = "db";
  } else {
    body.input = batch;
  }

  const response = await fetch(provider.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  // Rate limit — sinaliza para o caller tentar próximo provedor
  if (response.status === 429) {
    console.warn(`⚠️  Rate limit em ${provider.id}. Tentando próximo provedor...`);
    return null;
  }

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`${provider.id} embedding error (${response.status}): ${err}`);
  }

  const result = await response.json();

  // MiniMax retorna rate limit com HTTP 200 em alguns casos
  if (
    result.base_resp &&
    result.base_resp.status_code !== 0 &&
    result.base_resp.status_code !== undefined
  ) {
    const msg: string = result.base_resp.status_msg || "";
    if (msg.toLowerCase().includes("rate limit")) {
      console.warn(`⚠️  Rate limit em ${provider.id} (HTTP 200). Tentando próximo provedor...`);
      return null;
    }
    throw new Error(`MiniMax API Error: ${msg}`);
  }

  // Normaliza resposta para number[][]
  if (Array.isArray(result.vectors)) {
    return result.vectors as number[][];
  }
  if (result.data && Array.isArray(result.data)) {
    return result.data.map((d: { embedding: number[] }) => d.embedding);
  }

  throw new Error(`Resposta de embedding em formato desconhecido: ${JSON.stringify(result).slice(0, 200)}`);
}

/**
 * Gera embeddings em lote com fallback entre provedores.
 * Se o provedor primário bater rate limit, tenta o próximo automaticamente.
 * Batch size = 2 (conservador para evitar 429 por tamanho de payload).
 */
export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  const providers = getEmbeddingProviders();

  if (providers.length === 0) {
    console.warn("Nenhum provider de embedding disponível. Retornando vetores zero.");
    return texts.map(() => Array(1536).fill(0));
  }

  console.log(`Gerando embeddings para ${texts.length} chunks via ${providers[0].id}...`);

  const BATCH_SIZE = 2;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    let embeddings: number[][] | null = null;

    // Tenta cada provedor em ordem até um funcionar
    for (const provider of providers) {
      const MAX_RETRIES_SAME_PROVIDER = 2;
      let attempt = 0;

      while (attempt < MAX_RETRIES_SAME_PROVIDER) {
        try {
          embeddings = await callEmbeddingProvider(provider, batch);

          if (embeddings !== null) {
            // Sucesso — sai do loop de provedores
            break;
          }

          // Rate limit neste provedor — não retenta, vai para o próximo
          break;
        } catch (err: unknown) {
          attempt++;
          const isLastAttempt = attempt >= MAX_RETRIES_SAME_PROVIDER;
          const msg = err instanceof Error ? err.message : String(err);

          if (isLastAttempt) {
            console.error(`Erro em ${provider.id} após ${attempt} tentativa(s): ${msg}`);
            // Continua para o próximo provedor
          } else {
            const wait = Math.pow(2, attempt) * 1000;
            console.warn(`Erro em ${provider.id}. Tentativa ${attempt}/${MAX_RETRIES_SAME_PROVIDER}. Aguardando ${wait / 1000}s...`);
            await delay(wait);
          }
        }
      }

      if (embeddings !== null) break;
    }

    // Nenhum provedor funcionou para este batch
    if (embeddings === null) {
      throw new Error(
        "Todos os provedores de embedding falharam ou atingiram rate limit. " +
        "Verifique suas API keys e tente novamente em alguns minutos."
      );
    }

    allEmbeddings.push(...embeddings);

    // Pausa entre lotes para não saturar a API
    if (i + BATCH_SIZE < texts.length) {
      await delay(1000);
    }
  }

  return allEmbeddings;
}

/**
 * Gera embedding para um único texto.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await batchGenerateEmbeddings([text]);
  return result[0];
}
