import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/providers/selector";
import { buildPersonaGeneratorPrompt } from "@/lib/prompts/persona-generator";

export async function POST(request: NextRequest) {
  try {
    const { spec, chunks, objective } = await request.json();

    if (!spec) {
      return NextResponse.json(
        { error: "Spec é obrigatória." },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildPersonaGeneratorPrompt(
      spec,
      chunks || [],
      objective || ""
    );

    const result = await generateWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 3072,
    });

    // Parse JSON from response
    let persona: Record<string, unknown>;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      persona = JSON.parse(jsonMatch?.[0] || result.text);
    } catch {
      persona = { raw_output: result.text };
    }

    return NextResponse.json({
      persona,
      provider: result.provider,
      isFallback: result.isFallback || false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar persona.",
      },
      { status: 500 }
    );
  }
}
