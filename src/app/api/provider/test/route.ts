import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/providers/registry";

export async function POST(request: NextRequest) {
  try {
    const { providerId } = await request.json();

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId é obrigatório." },
        { status: 400 }
      );
    }

    const adapter = getAdapter(providerId);
    if (!adapter) {
      return NextResponse.json(
        { error: `Provider "${providerId}" não encontrado.` },
        { status: 404 }
      );
    }

    const available = await adapter.isAvailable();

    if (!available) {
      return NextResponse.json({
        success: false,
        provider: adapter.name,
        message: `Provider ${adapter.name} não está configurado. Verifique a API key.`,
      });
    }

    // Try a minimal generation to test connectivity
    try {
      await adapter.generate({
        systemPrompt: "Respond with only: OK",
        userPrompt: "Test connectivity. Reply with: OK",
        maxTokens: 64, // Alguns provedores (ex: Azure on OpenRouter) exigem mínimo de 16 tokens
        temperature: 0,
      });

      return NextResponse.json({
        success: true,
        provider: adapter.name,
        message: `Conexão com ${adapter.name} verificada com sucesso.`,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        provider: adapter.name,
        message: `Falha ao conectar com ${adapter.name}: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao testar provider." },
      { status: 500 }
    );
  }
}
