import { NextResponse } from "next/server";
import { getProviderStatuses } from "@/lib/providers/registry";

export async function GET() {
  try {
    const statuses = await getProviderStatuses();
    const defaultProvider = process.env.DEFAULT_PROVIDER || "openrouter";
    const fallbackProvider = process.env.FALLBACK_PROVIDER || "anthropic";
    const anyConfigured = statuses.some((s) => s.configured);

    return NextResponse.json({
      providers: statuses,
      defaultProvider,
      fallbackProvider,
      anyConfigured,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao verificar configuração de providers." },
      { status: 500 }
    );
  }
}
