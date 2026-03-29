"use client";

import { useState } from "react";
import { ProviderStatus } from "@/lib/providers/types";

interface ProviderPanelProps {
  providers: ProviderStatus[];
  defaultProvider: string;
  fallbackProvider: string;
  onTest: (providerId: string) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export default function ProviderPanel({
  providers,
  defaultProvider,
  fallbackProvider,
  onTest,
  onClose,
}: ProviderPanelProps) {
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleTest = async (providerId: string) => {
    setTesting(providerId);
    try {
      const result = await onTest(providerId);
      setTestResults((prev) => ({ ...prev, [providerId]: result }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: { success: false, message: "Erro ao testar conexão." },
      }));
    }
    setTesting(null);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto fade-in"
        style={{
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-subtle)",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h2 className="text-lg font-bold gradient-text">
            ⚙️ Providers
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            API keys são definidas via variáveis de ambiente (.env).
            Apenas o status é exibido aqui.
          </p>

          {providers.map((provider) => {
            const isDefault = provider.id === defaultProvider;
            const isFallback = provider.id === fallbackProvider;
            const testResult = testResults[provider.id];

            return (
              <div
                key={provider.id}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: "var(--bg-tertiary)",
                  border: `1px solid ${
                    provider.configured
                      ? "rgba(16, 185, 129, 0.3)"
                      : "var(--border-subtle)"
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: provider.configured
                          ? "var(--accent-success)"
                          : "var(--text-muted)",
                      }}
                    />
                    <span className="text-sm font-semibold">
                      {provider.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDefault && (
                      <span className="badge badge-info text-[0.65rem]">
                        Padrão
                      </span>
                    )}
                    {isFallback && !isDefault && (
                      <span className="badge badge-warning text-[0.65rem]">
                        Fallback
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{
                      color: provider.configured
                        ? "var(--accent-success)"
                        : "var(--text-muted)",
                    }}
                  >
                    {provider.configured
                      ? "✅ Configurado"
                      : provider.id === "claude-subscription"
                      ? "⚠️ Indisponível"
                      : "⚠️ Não configurado"}
                  </span>

                  {provider.configured && (
                    <button
                      className="btn-secondary text-xs py-1 px-3"
                      onClick={() => handleTest(provider.id)}
                      disabled={testing === provider.id}
                    >
                      {testing === provider.id ? "Testando..." : "Testar"}
                    </button>
                  )}
                </div>

                {testResult && (
                  <div
                    className="mt-2 p-2 rounded-lg text-xs"
                    style={{
                      background: testResult.success
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: testResult.success
                        ? "var(--accent-success)"
                        : "var(--accent-danger)",
                    }}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            );
          })}

          {/* Info box */}
          <div
            className="rounded-xl p-4 text-xs"
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "var(--text-secondary)",
            }}
          >
            <p className="font-semibold mb-1" style={{ color: "var(--text-accent)" }}>
              💡 Como configurar
            </p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Copie <code className="text-[0.7rem] px-1 py-0.5 rounded" style={{ background: "var(--bg-primary)" }}>.env.example</code> para <code className="text-[0.7rem] px-1 py-0.5 rounded" style={{ background: "var(--bg-primary)" }}>.env</code></li>
              <li>Preencha pelo menos uma API key</li>
              <li>Reinicie a aplicação</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
