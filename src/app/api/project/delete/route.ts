import { NextRequest, NextResponse } from "next/server";
import { deleteProject } from "@/lib/db/supabase";

export async function DELETE(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "ID do projeto não fornecido." },
        { status: 400 }
      );
    }

    await deleteProject(projectId);

    return NextResponse.json({ success: true, message: "Projeto e base de conhecimento deletados com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao deletar base de conhecimento.",
      },
      { status: 500 }
    );
  }
}
