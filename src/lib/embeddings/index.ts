import { getConfig } from "@/lib/utils/config";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

/**
 * Gera embeddings em lote (limite seguro dependendo do provider).
 */
export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  const config = getConfig();
  let apiUrl = "";
  let apiKey = "";
  let model = "";

  if (config.providers.minimax?.apiKey) {
    apiUrl = "https://api.minimax.io/v1/embeddings";
    apiKey = config.providers.minimax.apiKey;
    model = "embo-01";
  } else if (config.providers.openrouter?.apiKey) {
    apiUrl = "https://openrouter.ai/api/v1/embeddings";
    apiKey = config.providers.openrouter.apiKey;
    model = "text-embedding-3-small";
  } else {
    // Caso não exista, retorna vetores vazios simulados (apenas como fallback agressivo)
    console.warn("Nenhum provider para Embeddings. Retornando fallback.");
    return texts.map(() => Array(1536).fill(0));
  }

  // Dividir em lotes extremamente conservadores (2 por request) para não estourar payload/rate limits
  const BATCH_SIZE = 2;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    
    // Tratamento para MiniMax (que usa "texts" array) e OpenRouter/OpenAI (que usa "input")
    const body: Record<string, any> = { model: model };
    
    if (apiUrl.includes("minimax")) {
      body.texts = batch;
      body.type = "db"; // MiniMax costuma pedir type pra uso em db
    } else {
      body.input = batch;
    }

    let retries = 0;
    const maxRetries = 5;
    let success = false;
    let result: any = null;

    while (!success && retries < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("rate limit exceeded");
          }
          const err = await response.text();
          console.error(`Erro ao gerar Embeddings via ${apiUrl}:`, err);
          throw new Error(`Falha no Embeddings API: ${response.statusText}`);
        }

        result = await response.json();
        
        // Tratamento de Erros da API nativa da MiniMax (HTTP 200 com status_code de erro)
        if (result.base_resp && result.base_resp.status_code !== 0 && result.base_resp.status_code !== undefined) {
          if (result.base_resp.status_msg?.toLowerCase().includes("rate limit")) {
            throw new Error("rate limit exceeded");
          }
          throw new Error(`MiniMax API Error: ${result.base_resp.status_msg}`);
        }

        success = true;
      } catch (err: any) {
        if (err.message.includes("rate limit")) {
          retries++;
          const waitTime = Math.pow(2, retries) * 1000 + (Math.random() * 500); // Exponencial + Jitter
          console.warn(`⏳ Rate Limit na Embeddings API. Tentativa ${retries}/${maxRetries}. Aguardando ${Math.round(waitTime/1000)}s...`);
          if (retries >= maxRetries) {
            throw new Error("Rate limit excedido (Max retries atingido). Tente novamente mais tarde.");
          }
          await delay(waitTime);
        } else {
          throw err;
        }
      }
    }

    let embeddings: number[][] = [];
    
    if (Array.isArray(result.vectors)) {
      // Formato Nativo MiniMax (v1/embeddings)
      embeddings = result.vectors;
    } else if (result.data && Array.isArray(result.data)) {
      // Formato OpenAI / OpenRouter (data[].embedding)
      embeddings = result.data.map((d: any) => d.embedding);
    } else {
      console.error("Formato não reconhecido de Embeddings:", result);
      throw new Error("Resposta de Embeddings vazia ou em formato desconhecido.");
    }

    allEmbeddings.push(...embeddings);
    
    // Pausa sistemática entre lotes para esfriar a API (Prevenção de 429 RPM preventivo)
    if (i + BATCH_SIZE < texts.length) {
      await delay(1500);
    }
  }

  return allEmbeddings;
}

/**
 * Gera embedding simples para 1 text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await batchGenerateEmbeddings([text]);
  return result[0];
}
