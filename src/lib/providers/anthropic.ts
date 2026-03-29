import { ProviderAdapter, GenerateParams, GenerateResult } from "./types";

const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1/messages";

const MODELS = [
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
];

export class AnthropicAdapter implements ProviderAdapter {
  id = "anthropic" as const;
  name = "Anthropic";

  private getApiKey(): string | null {
    return process.env.ANTHROPIC_API_KEY || null;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.getApiKey();
  }

  listModels(): string[] {
    return MODELS;
  }

  getDefaultModel(): string {
    return process.env.ANTHROPIC_MODEL || MODELS[0];
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Anthropic API key não configurada.");
    }

    const model = params.model || this.getDefaultModel();

    const response = await fetch(ANTHROPIC_BASE_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.userPrompt }],
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Anthropic error (${response.status}): ${error}`
      );
    }

    const data = await response.json();
    const text =
      data.content?.[0]?.type === "text"
        ? data.content[0].text
        : "";

    return {
      text,
      model,
      provider: this.name,
      tokensUsed:
        (data.usage?.input_tokens || 0) +
        (data.usage?.output_tokens || 0),
    };
  }
}
