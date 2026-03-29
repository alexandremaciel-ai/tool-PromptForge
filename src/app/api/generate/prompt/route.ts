import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/providers/selector";
import { buildPromptBuilderPrompt } from "@/lib/prompts/prompt-builder";
import { saveProject } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const { spec, persona, chunks, projectId, selectedStrategies = [] } = await request.json();

    if (!spec || !persona) {
      return NextResponse.json(
        { error: "Spec e persona são obrigatórias." },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildPromptBuilderPrompt(
      spec,
      persona,
      chunks || [],
      selectedStrategies
    );

    const result = await generateWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 4096,
    });

    if (projectId) {
      await saveProject({ id: projectId, name: `Upload RAG`, final_prompt: result.text }).catch(() => null);
    }

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
