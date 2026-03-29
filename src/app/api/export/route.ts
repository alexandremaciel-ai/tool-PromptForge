import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { spec, persona, prompt, validation, format } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt não pode ser vazio." }, { status: 400 });
    }

    if (format === "json") {
      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          tool: "PromptForge",
          version: "1.0.0",
        },
        prompt,
        spec: spec ?? null,
        persona: persona ?? null,
        validation: validation ?? null,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="prompt-export.json"',
        },
      });
    }

    // MD — exporta o prompt diretamente, limpo e pronto para uso
    return new NextResponse(prompt as string, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="prompt.md"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao exportar." }, { status: 500 });
  }
}
