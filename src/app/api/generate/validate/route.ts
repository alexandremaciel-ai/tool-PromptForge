import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/providers/selector";
import { buildValidatorPrompt } from "@/lib/prompts/validator";
import { saveProject } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const { spec, persona, prompt, projectId } = await request.json();

    if (!spec || !persona || !prompt) {
      return NextResponse.json(
        { error: "Spec, persona e prompt são obrigatórios." },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildValidatorPrompt(
      spec,
      persona,
      prompt
    );

    const result = await generateWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 2048,
    });

    // Parse JSON from response
    let validation: Record<string, unknown>;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      validation = JSON.parse(jsonMatch?.[0] || result.text);
    } catch {
      validation = {
        checks: [
          {
            criterion: "Análise manual necessária",
            pass: false,
            note: "Não foi possível parsear a validação automaticamente.",
          },
        ],
        score: 0,
        suggestions: ["Revise o prompt manualmente."],
        raw_output: result.text,
      };
    }

    if (projectId) {
      await saveProject({ id: projectId, name: `Upload RAG`, validation_score: validation }).catch(() => null);
    }

    return NextResponse.json({
      validation,
      provider: result.provider,
      isFallback: result.isFallback || false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao validar.",
      },
      { status: 500 }
    );
  }
}
