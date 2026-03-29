import { NextRequest, NextResponse } from "next/server";
import { getSavedPrompt, deleteSavedPrompt } from "@/lib/db/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompt = await getSavedPrompt(id);
    return NextResponse.json({ prompt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Prompt não encontrado." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSavedPrompt(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir." },
      { status: 500 }
    );
  }
}
