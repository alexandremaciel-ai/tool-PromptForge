import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { spec, persona, prompt, validation, format } =
      await request.json();

    if (format === "json") {
      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          tool: "PromptForge",
          version: "1.0.0",
        },
        spec,
        persona,
        prompt,
        validation,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition":
            'attachment; filename="promptforge-export.json"',
        },
      });
    }

    // Markdown export
    const md = buildMarkdownExport(spec, persona, prompt, validation);

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="promptforge-export.md"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao exportar." },
      { status: 500 }
    );
  }
}

function buildMarkdownExport(
  spec: Record<string, unknown> | null,
  persona: Record<string, unknown> | null,
  prompt: string | null,
  validation: Record<string, unknown> | null
): string {
  const sections: string[] = [];

  sections.push("# PromptForge — Export\n");
  sections.push(
    `> Exportado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n`
  );

  // Spec
  if (spec) {
    sections.push("## Especificação do Prompt\n");
    for (const [key, value] of Object.entries(spec)) {
      const label = key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
      if (Array.isArray(value)) {
        sections.push(`### ${label}`);
        (value as string[]).forEach((v) => sections.push(`- ${v}`));
        sections.push("");
      } else {
        sections.push(`### ${label}\n${String(value)}\n`);
      }
    }
  }

  // Persona
  if (persona) {
    sections.push("---\n");
    sections.push("## Persona do Agente\n");
    for (const [key, value] of Object.entries(persona)) {
      const label = key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
      if (typeof value === "object" && value !== null) {
        sections.push(`### ${label}`);
        sections.push("```json");
        sections.push(JSON.stringify(value, null, 2));
        sections.push("```\n");
      } else if (Array.isArray(value)) {
        sections.push(`### ${label}`);
        (value as string[]).forEach((v) => sections.push(`- ${v}`));
        sections.push("");
      } else {
        sections.push(`### ${label}\n${String(value)}\n`);
      }
    }
  }

  // Prompt
  if (prompt) {
    sections.push("---\n");
    sections.push("## Prompt Final\n");
    sections.push("```markdown");
    sections.push(prompt);
    sections.push("```\n");
  }

  // Validation
  if (validation) {
    sections.push("---\n");
    sections.push("## Validação\n");
    const checks = (validation.checks || []) as {
      criterion: string;
      pass: boolean;
      note: string;
    }[];
    checks.forEach((check) => {
      sections.push(
        `- ${check.pass ? "✅" : "❌"} **${check.criterion}**${
          check.note ? ` — ${check.note}` : ""
        }`
      );
    });
    if (validation.score !== undefined) {
      sections.push(`\n**Score: ${validation.score}%**\n`);
    }
    const suggestions = (validation.suggestions || []) as string[];
    if (suggestions.length) {
      sections.push("### Sugestões de Melhoria");
      suggestions.forEach((s) => sections.push(`- ${s}`));
    }
  }

  return sections.join("\n");
}
