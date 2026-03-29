import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parser";
import { chunkText } from "@/lib/parser/chunker";
import { batchGenerateEmbeddings } from "@/lib/embeddings";
import { insertKnowledgeChunks, saveProject } from "@/lib/db/supabase";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_SESSION || "3", 10);
const ALLOWED_EXTENSIONS = ["pdf", "txt", "md", "markdown", "docx", "pptx", "xlsx"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_FILES} arquivos permitidos.` },
        { status: 400 }
      );
    }

    const allChunks: string[] = [];

    for (const file of files) {
      // Validate extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Formato não suportado: .${ext}. Use PDF, DOCX, PPTX, XLSX, TXT ou MD.` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo "${file.name}" excede o limite de ${MAX_FILE_SIZE / (1024 * 1024)} MB.` },
          { status: 400 }
        );
      }

      // Parse
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await parseFile(buffer, file.name);

      if (!text.trim()) {
        return NextResponse.json(
          {
            error: `Não foi possível extrair texto de "${file.name}". Verifique se o PDF contém texto selecionável.`,
          },
          { status: 400 }
        );
      }

      // Chunk
      const chunks = chunkText(text);
      allChunks.push(...chunks);
    }
    // Gera um novo projeto temporário para RAG
    const tempProject = await saveProject({
      name: `Upload RAG ${new Date().toISOString()}`,
    });
    const projectId = tempProject.id;
    
    // Gera Embeddings em Lotes
    if (projectId && allChunks.length > 0) {
      try {
        console.log(`Gerando embeddings para ${allChunks.length} chunks...`);
        const embeddings = await batchGenerateEmbeddings(allChunks);
        
        console.log("Inserindo embeddings no Supabase pgvector...");
        const kbEntries = allChunks.map((content, idx) => ({
          content,
          embedding: embeddings[idx],
        }));
        await insertKnowledgeChunks(projectId, kbEntries);
        console.log("RAG Storage completo!");
      } catch (err) {
        console.error("Erro ao gerar/salvar Embeddings:", err);
      }
    }

    return NextResponse.json({
      chunks: allChunks,
      projectId: projectId || null,
      totalChunks: allChunks.length,
      files: files.map((f) => ({ name: f.name, size: f.size })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao processar arquivo.",
      },
      { status: 500 }
    );
  }
}
