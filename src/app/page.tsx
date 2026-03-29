"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import ProviderPanel from "@/components/provider/ProviderPanel";
import { useProvider } from "@/hooks/useProvider";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState("upload");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [providerConfigOpen, setProviderConfigOpen] = useState(false);

  // Provider state
  const {
    providers,
    defaultProvider,
    fallbackProvider,
    anyConfigured,
    activeProviderName,
    testProvider,
  } = useProvider();

  // Pipeline state
  const [chunks, setChunks] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [objective, setObjective] = useState("");
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [persona, setPersona] = useState<Record<string, unknown> | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [validation, setValidation] = useState<Record<string, unknown> | null>(null);

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generation state
  const [generating, setGenerating] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleClearKnowledge = async () => {
    if (!projectId) {
      resetState();
      return;
    }
    setClearing(true);
    try {
      await fetch("/api/project/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      resetState();
    } catch {
      setUploadError("Erro ao apagar conhecimento da base de dados.");
    } finally {
      setClearing(false);
    }
  };

  const resetState = () => {
    setChunks([]);
    setProjectId(null);
    setUploadedFiles([]);
    setSpec(null);
    setPersona(null);
    setFinalPrompt(null);
    setValidation(null);
    setCurrentStep("upload");
    setCompletedSteps([]);
    setGenerating(null);
    setObjective("");
    setUploadError(null);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Erro ao processar arquivo.");
        return;
      }

      setChunks(data.chunks || []);
      if (data.projectId) setProjectId(data.projectId);

      setUploadedFiles(
        Array.from(files).map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );
      setCurrentStep("spec");
      setCompletedSteps(["upload"]);
    } catch {
      setUploadError("Erro de conexão ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateSpec = async () => {
    if (!chunks.length || !objective.trim()) return;
    setGenerating("spec");

    try {
      const res = await fetch("/api/generate/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks, projectId, objective }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSpec(data.spec);
      setCurrentStep("persona");
      setCompletedSteps((prev) => [...new Set([...prev, "spec"])]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao gerar spec.");
    } finally {
      setGenerating(null);
    }
  };

  const handleGeneratePersona = async () => {
    if (!spec) return;
    setGenerating("persona");

    try {
      const res = await fetch("/api/generate/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, chunks, objective }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setPersona(data.persona);
      setCurrentStep("prompt");
      setCompletedSteps((prev) => [...new Set([...prev, "persona"])]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao gerar persona.");
    } finally {
      setGenerating(null);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!spec || !persona) return;
    setGenerating("prompt");

    try {
      const res = await fetch("/api/generate/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, persona, chunks }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setFinalPrompt(data.prompt);
      setCurrentStep("validation");
      setCompletedSteps((prev) => [...new Set([...prev, "prompt"])]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao gerar prompt.");
    } finally {
      setGenerating(null);
    }
  };

  const handleValidate = async () => {
    if (!spec || !persona || !finalPrompt) return;
    setGenerating("validation");

    try {
      const res = await fetch("/api/generate/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, persona, prompt: finalPrompt }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setValidation(data.validation);
      setCurrentStep("export");
      setCompletedSteps((prev) => [...new Set([...prev, "validation"])]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao validar.");
    } finally {
      setGenerating(null);
    }
  };

  const handleExport = async (format: "md" | "json") => {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec, persona, prompt: finalPrompt, validation, format }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptforge-export.${format === "md" ? "md" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
    setCompletedSteps((prev) => [...new Set([...prev, "export"])]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentStep={currentStep}
        completedSteps={completedSteps}
        providerName={activeProviderName}
        onOpenProviderConfig={() => setProviderConfigOpen(true)}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* No Provider Banner */}
        {!anyConfigured && (
          <div
            className="mb-8 p-4 rounded-xl flex items-center justify-between slide-up"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-warning)" }}>
                  Nenhum provider configurado
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Configure pelo menos um provider de IA para começar a gerar artefatos.
                </p>
              </div>
            </div>
            <button className="btn-primary text-xs" onClick={() => setProviderConfigOpen(true)}>
              Configurar
            </button>
          </div>
        )}

        {/* Error toast */}
        {uploadError && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between slide-up"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">❌</span>
              <p className="text-sm" style={{ color: "var(--accent-danger)" }}>
                {uploadError}
              </p>
            </div>
            <button
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setUploadError(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Upload */}
          <section className="section-card slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}>📄</div>
              <div>
                <h2 className="text-base font-semibold">Conhecimento</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Envie documentos para extrair conhecimento base
                </p>
              </div>
              {uploadedFiles.length > 0 && (
                <button
                  onClick={handleClearKnowledge}
                  disabled={clearing || uploading || generating !== null}
                  className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500 hover:bg-opacity-10"
                  style={{ 
                    border: "1px solid rgba(239, 68, 68, 0.3)", 
                    color: "var(--accent-danger)",
                    background: "transparent"
                  }}
                >
                  {clearing ? "🗑️ Excluindo..." : "🗑️ Deletar Arquivos"}
                </button>
              )}
            </div>

            {uploadedFiles.length > 0 ? (
              <div className="space-y-3">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <span className="text-lg">
                      {f.name.endsWith(".pdf") ? "📕" : f.name.match(/\.(docx|pptx|xlsx)$/i) ? "📊" : f.name.endsWith(".md") ? "📝" : "📄"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {(f.size / 1024).toFixed(1)} KB · {chunks.length} chunks extraídos
                      </p>
                    </div>
                    <span className="badge badge-success text-xs">✅ Processado</span>
                  </div>
                ))}

                {chunks.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer" style={{ color: "var(--text-accent)" }}>
                      Ver chunks extraídos ({chunks.length})
                    </summary>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                      {chunks.slice(0, 5).map((chunk, i) => (
                        <div key={i} className="p-2 rounded-lg text-xs" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                          <span className="font-mono text-[0.65rem]" style={{ color: "var(--text-muted)" }}>Chunk {i + 1}:</span>
                          <p className="mt-1 line-clamp-3">{chunk}</p>
                        </div>
                      ))}
                      {chunks.length > 5 && (
                        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                          ... e mais {chunks.length - 5} chunks
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <label
                className="block border-2 border-dashed rounded-xl p-12 text-center transition-all hover:border-[var(--accent-primary)] cursor-pointer"
                style={{ borderColor: "var(--border-medium)", background: "var(--bg-tertiary)" }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.markdown,.docx,.pptx,.xlsx"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--text-accent)" }}>Processando...</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3 opacity-50">📁</div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Formatos aceitos: PDF, DOCX, PPTX, XLSX, TXT, Markdown · Máx. 10 MB
                    </p>
                  </>
                )}
              </label>
            )}
          </section>

          {/* Section 2: Objective */}
          <section className="section-card slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}>🎯</div>
              <div>
                <h2 className="text-base font-semibold">Objetivo</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Defina o que o prompt deve alcançar
                </p>
              </div>
            </div>
            <textarea
              className="input-field resize-none"
              placeholder="Ex: Criar um agente de suporte que responda dúvidas frequentes com base na documentação enviada..."
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              disabled={chunks.length === 0}
            />
            {chunks.length > 0 && objective.trim() && !spec && (
              <button
                className="btn-primary mt-3"
                onClick={handleGenerateSpec}
                disabled={generating === "spec" || !anyConfigured}
              >
                {generating === "spec" ? "⏳ Gerando spec..." : "⚡ Gerar Especificação"}
              </button>
            )}
          </section>

          {/* Section 3: Spec */}
          <section className="section-card slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}>📋</div>
              <div>
                <h2 className="text-base font-semibold">Especificação</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Spec de prompt gerada a partir do conhecimento
                </p>
              </div>
            </div>
            {generating === "spec" ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-4 rounded" style={{ width: `${90 - i * 10}%` }} />
                ))}
              </div>
            ) : spec ? (
              <div className="space-y-3">
                {Object.entries(spec).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-accent)" }}>
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {Array.isArray(value) ? (value as string[]).join(", ") : String(value)}
                    </p>
                  </div>
                ))}
                {!persona && (
                  <button
                    className="btn-primary mt-2"
                    onClick={handleGeneratePersona}
                    disabled={generating === "persona" || !anyConfigured}
                  >
                    {generating === "persona" ? "⏳ Gerando persona..." : "🎭 Gerar Persona"}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  A spec será gerada após upload e definição de objetivo
                </p>
              </div>
            )}
          </section>

          {/* Section 4: Persona */}
          <section className="section-card slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(139, 92, 246, 0.15)" }}>🎭</div>
              <div>
                <h2 className="text-base font-semibold">Persona do Agente</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Tom, personalidade, voz e comportamento
                </p>
              </div>
            </div>
            {generating === "persona" ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton h-4 rounded" style={{ width: `${95 - i * 8}%` }} />
                ))}
              </div>
            ) : persona ? (
              <div className="space-y-3">
                {Object.entries(persona).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-accent)" }}>
                      {key.replace(/_/g, " ")}
                    </p>
                    {typeof value === "object" && value !== null ? (
                      <pre className="text-xs overflow-x-auto" style={{ color: "var(--text-secondary)" }}>
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {Array.isArray(value) ? (value as string[]).join(", ") : String(value)}
                      </p>
                    )}
                  </div>
                ))}
                {!finalPrompt && (
                  <button
                    className="btn-primary mt-2"
                    onClick={handleGeneratePrompt}
                    disabled={generating === "prompt" || !anyConfigured}
                  >
                    {generating === "prompt" ? "⏳ Gerando prompt..." : "⚡ Gerar Prompt Final"}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Designer de persona disponível após geração da spec
                </p>
              </div>
            )}
          </section>

          {/* Section 5: Prompt Final */}
          <section className="section-card slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}>⚡</div>
              <div>
                <h2 className="text-base font-semibold">Prompt Final</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Prompt operacional baseado na spec e persona
                </p>
              </div>
            </div>
            {generating === "prompt" ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton h-4 rounded" style={{ width: `${100 - i * 7}%` }} />
                ))}
              </div>
            ) : finalPrompt ? (
              <div>
                <div className="relative">
                  <pre
                    className="p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap"
                    style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                  >
                    {finalPrompt}
                  </pre>
                  <button
                    className="absolute top-2 right-2 btn-secondary text-xs py-1 px-2"
                    onClick={() => navigator.clipboard.writeText(finalPrompt)}
                  >
                    📋 Copiar
                  </button>
                </div>
                {!validation && (
                  <button
                    className="btn-primary mt-3"
                    onClick={handleValidate}
                    disabled={generating === "validation" || !anyConfigured}
                  >
                    {generating === "validation" ? "⏳ Validando..." : "✅ Validar Consistência"}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  O prompt final será gerado após definição da persona
                </p>
              </div>
            )}
          </section>

          {/* Section 6: Validation + Export */}
          <section className="section-card slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(16, 185, 129, 0.15)" }}>✅</div>
              <div>
                <h2 className="text-base font-semibold">Validação & Export</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Consistência, score e exportação de artefatos
                </p>
              </div>
            </div>
            {generating === "validation" ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-4 rounded" style={{ width: `${85 - i * 10}%` }} />
                ))}
              </div>
            ) : validation ? (
              <div className="space-y-4">
                {/* Checks */}
                <div className="space-y-2">
                  {(validation.checks as { criterion: string; pass: boolean; note: string }[] || []).map(
                    (check, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                        <span>{check.pass ? "✅" : "❌"}</span>
                        <span className="text-sm flex-1">{check.criterion}</span>
                        {check.note && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{check.note}</span>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Score */}
                {validation.score !== undefined && (
                  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{
                        background: `conic-gradient(var(--accent-success) ${Number(validation.score)}%, var(--bg-primary) 0)`,
                      }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: "var(--bg-tertiary)" }}>
                        {String(validation.score)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Score de Consistência</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Coerência entre spec, persona e prompt
                      </p>
                    </div>
                  </div>
                )}

                {/* Export buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="btn-primary flex-1" onClick={() => handleExport("md")}>
                    📝 Export Markdown
                  </button>
                  <button className="btn-secondary flex-1" onClick={() => handleExport("json")}>
                    {"{ }"} Export JSON
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Validação e export disponíveis após geração do prompt
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="py-4 text-center text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
        PromptForge · Spec-Driven Prompt Engineering · Demo
      </footer>

      {/* Provider Panel */}
      {providerConfigOpen && (
        <ProviderPanel
          providers={providers}
          defaultProvider={defaultProvider}
          fallbackProvider={fallbackProvider}
          onTest={testProvider}
          onClose={() => setProviderConfigOpen(false)}
        />
      )}
    </div>
  );
}
