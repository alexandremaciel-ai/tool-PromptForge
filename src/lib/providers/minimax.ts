import { ProviderAdapter, GenerateParams, GenerateResult } from "./types";

const MINIMAX_BASE_URL =
  "https://api.minimax.io/v1/text/chatcompletion_v2";

const MODELS = [
  "MiniMax-M2.7",
  "MiniMax-M2.7-highspeed",
  "abab6.5s-chat",
  "abab6.5-chat"
];

export class MiniMaxAdapter implements ProviderAdapter {
  id = "minimax" as const;
  name = "MiniMax";

  private getApiKey(): string | null {
    return process.env.MINIMAX_API_KEY || null;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.getApiKey();
  }

  listModels(): string[] {
    return MODELS;
  }

  getDefaultModel(): string {
    return process.env.MINIMAX_MODEL || MODELS[0];
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("MiniMax API key não configurada.");
    }

    const model = params.model || this.getDefaultModel();

    const response = await fetch(MINIMAX_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new Error(
        `MiniMax error (${response.status}): ${error}`
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text,
      model,
      provider: this.name,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}
