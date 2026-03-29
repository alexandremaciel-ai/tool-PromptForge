import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/providers/selector";
import { buildPromptBuilderPrompt } from "@/lib/prompts/prompt-builder";

export async function POST(request: NextRequest) {
  try {
    const { spec, persona, chunks } = await request.json();

    if (!spec || !persona) {
      return NextResponse.json(
        { error: "Spec e persona são obrigatórias." },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildPromptBuilderPrompt(
      spec,
      persona,
      chunks || []
    );

    const result = await generateWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 4096,
    });

    return NextResponse.json({
      prompt: result.text,
      provider: result.provider,
      isFallback: result.isFallback || false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar prompt.",
      },
      { status: 500 }
    );
  }
}
