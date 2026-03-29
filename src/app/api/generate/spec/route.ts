import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/providers/selector";
import { buildSpecGeneratorPrompt } from "@/lib/prompts/spec-generator";
import { generateEmbedding } from "@/lib/embeddings";
import { matchKnowledge } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const { chunks, projectId, objective } = await request.json();

    if (!chunks?.length) {
      return NextResponse.json(
        { error: "Nenhum chunk de conhecimento fornecido." },
        { status: 400 }
      );
    }

    if (!objective?.trim()) {
      return NextResponse.json(
        { error: "Objetivo é obrigatório." },
        { status: 400 }
      );
    }

    let relevantChunks = chunks;

    if (projectId && chunks.length > 5) {
      try {
        console.log("Aplicando RAG via pgvector... Buscando chunks mais relevantes");
        const objectiveEmbedding = await generateEmbedding(objective);
        const matched = await matchKnowledge(projectId, objectiveEmbedding, 5);
        if (matched && matched.length > 0) {
          relevantChunks = matched.map((m: any) => m.content);
          console.log(`Usando os ${relevantChunks.length} chunks mais relevantes (Redução drástica de contexto).`);
        }
      } catch (err) {
        console.error("Fall-back RAG failed - usando chunks originais:", err);
      }
    }

    const { systemPrompt, userPrompt } = buildSpecGeneratorPrompt(
      relevantChunks,
      objective
    );

    const result = await generateWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 2048,
    });

    // Parse JSON from response
    let spec: Record<string, unknown>;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      spec = JSON.parse(jsonMatch?.[0] || result.text);
    } catch {
      spec = { raw_output: result.text };
    }

    return NextResponse.json({
      spec,
      provider: result.provider,
      isFallback: result.isFallback || false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar spec.",
      },
      { status: 500 }
    );
  }
}
