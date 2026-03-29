import { ProviderAdapter, GenerateParams, GenerateResult } from "./types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro-1.5",
  "meta-llama/llama-3.1-70b-instruct",
];

export class OpenRouterAdapter implements ProviderAdapter {
  id = "openrouter" as const;
  name = "OpenRouter";

  private getApiKey(): string | null {
    return process.env.OPENROUTER_API_KEY || null;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.getApiKey();
  }

  listModels(): string[] {
    return MODELS;
  }

  getDefaultModel(): string {
    return process.env.OPENROUTER_MODEL || MODELS[0];
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OpenRouter API key não configurada.");
    }

    const model = params.model || this.getDefaultModel();

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "PromptForge",
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
        `OpenRouter error (${response.status}): ${error}`
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
