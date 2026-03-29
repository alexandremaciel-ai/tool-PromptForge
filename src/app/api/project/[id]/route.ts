import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectChunks, getProjectFiles } from "@/lib/db/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID do projeto é obrigatório." }, { status: 400 });
    }

    const [project, chunks, files] = await Promise.all([
      getProject(id),
      getProjectChunks(id),
      getProjectFiles(id),
    ]);

    return NextResponse.json({ project, chunks, files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Projeto não encontrado." },
      { status: 404 }
    );
  }
}
