import { NextRequest, NextResponse } from "next/server";
import { savePrompt, listSavedPrompts } from "@/lib/db/supabase";

export async function GET() {
  try {
    const prompts = await listSavedPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao listar prompts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, final_prompt, spec, persona, validation_score, strategies, score } =
      await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    if (!final_prompt?.trim()) {
      return NextResponse.json({ error: "Prompt não pode ser vazio." }, { status: 400 });
    }

    const saved = await savePrompt({ name: name.trim(), final_prompt, spec, persona, validation_score, strategies, score });
    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar prompt." },
      { status: 500 }
    );
  }
}
