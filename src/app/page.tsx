"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import ProviderPanel from "@/components/provider/ProviderPanel";
import LibraryPanel from "@/components/library/LibraryPanel";
import { useProvider } from "@/hooks/useProvider";
import { PROMPT_STRATEGIES, STRATEGY_CATEGORIES } from "@/lib/prompts/strategies";

const SESSION_KEY = "promptforge_project_id";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState("upload");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [providerConfigOpen, setProviderConfigOpen] = useState(false);
  const [libraryPanelOpen, setLibraryPanelOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

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
  const [knownFiles, setKnownFiles] = useState<{ filename: string; chunkCount: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Strategies state
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  // Library state
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [savePromptName, setSavePromptName] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  // Restaura sessão do localStorage no mount
  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_KEY);
    if (!savedId) return;

    setRestoring(true);
    fetch(`/api/project/${savedId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.project) return;
        const { project, chunks } = data;

        setProjectId(project.id);
        if (chunks?.length) {
          setChunks(chunks);
          setUploadedFiles([]);
          if (data.files?.length) setKnownFiles(data.files);
          setCurrentStep("spec");
          setCompletedSteps(["upload"]);
        }
        if (project.objective) setObjective(project.objective);
        if (project.spec) {
          setSpec(project.spec);
          setCurrentStep("persona");
          setCompletedSteps((p) => [...new Set([...p, "spec"])]);
        }
        if (project.persona) {
          setPersona(project.persona);
          setCurrentStep("prompt");
          setCompletedSteps((p) => [...new Set([...p, "persona"])]);
        }
        if (project.final_prompt) {
          setFinalPrompt(project.final_prompt);
          setCurrentStep("validation");
          setCompletedSteps((p) => [...new Set([...p, "prompt"])]);
        }
        if (project.validation_score) {
          setValidation(project.validation_score);
          setCurrentStep("export");
          setCompletedSteps((p) => [...new Set([...p, "validation"])]);
        }
      })
      .catch(() => localStorage.removeItem(SESSION_KEY))
      .finally(() => setRestoring(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    localStorage.removeItem(SESSION_KEY);
    setChunks([]);
    setProjectId(null);
    setUploadedFiles([]);
    setKnownFiles([]);
    setSpec(null);
    setPersona(null);
    setFinalPrompt(null);
    setValidation(null);
    setCurrentStep("upload");
    setCompletedSteps([]);
    setGenerating(null);
    setObjective("");
    setUploadError(null);
    setSelectedStrategies([]);
    setSavePromptName("");
    setSavedSuccess(false);
  };

  const handleFileUpload = async (files: FileList | null, appendToProjectId?: string | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    if (appendToProjectId) formData.append("projectId", appendToProjectId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Erro ao processar arquivo.");
        return;
      }

      const newFiles = Array.from(files).map((f) => ({ name: f.name, size: f.size, type: f.type }));

      if (appendToProjectId) {
        // Modo append: merge chunks e arquivos
        setChunks((prev) => [...prev, ...(data.chunks || [])]);
        setKnownFiles((prev) => {
          const updated = [...prev];
          for (const f of newFiles) {
            const existing = updated.find((k) => k.filename === f.name);
            if (existing) {
              existing.chunkCount += Math.round((data.totalChunks || 0) / newFiles.length);
            } else {
              updated.push({ filename: f.name, chunkCount: Math.round((data.totalChunks || 0) / newFiles.length) });
            }
          }
          return updated;
        });
      } else {
        // Primeiro upload: define projeto
        setChunks(data.chunks || []);
        if (data.projectId) {
          setProjectId(data.projectId);
          localStorage.setItem(SESSION_KEY, data.projectId);
        }
        setKnownFiles(
          newFiles.map((f) => ({ filename: f.name, chunkCount: data.totalChunks || 0 }))
        );
        setCurrentStep("spec");
        setCompletedSteps(["upload"]);
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
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
        body: JSON.stringify({ spec, chunks, objective, projectId }),
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
        body: JSON.stringify({ spec, persona, chunks, projectId, selectedStrategies }),
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
        body: JSON.stringify({ spec, persona, prompt: finalPrompt, projectId }),
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
    a.download = format === "md" ? "prompt.md" : "prompt-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setCompletedSteps((prev) => [...new Set([...prev, "export"])]);
  };

  const handleSavePrompt = async () => {
    if (!finalPrompt || !savePromptName.trim()) return;
    setSavingPrompt(true);
    try {
      const res = await fetch("/api/saved-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: savePromptName.trim(),
          final_prompt: finalPrompt,
          spec,
          persona,
          validation_score: validation,
          strategies: selectedStrategies,
          score: Number(validation?.score ?? 0),
        }),
      });
      if (res.ok) {
        setSavePromptName("");
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch { /* silent */ } finally {
      setSavingPrompt(false);
    }
  };

  const handleRestorePrompt = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-prompts/${id}`);
      if (!res.ok) return;
      const { prompt: saved } = await res.json();
      if (saved.final_prompt) setFinalPrompt(saved.final_prompt);
      if (saved.spec) { setSpec(saved.spec); setCompletedSteps((p) => [...new Set([...p, "spec"])]); }
      if (saved.persona) { setPersona(saved.persona); setCompletedSteps((p) => [...new Set([...p, "persona"])]); }
      if (saved.validation_score) { setValidation(saved.validation_score); setCompletedSteps((p) => [...new Set([...p, "validation"])]); }
      if (saved.strategies?.length) setSelectedStrategies(saved.strategies);
      setCurrentStep("export");
      setCompletedSteps((p) => [...new Set([...p, "prompt"])]);
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentStep={currentStep}
        completedSteps={completedSteps}
        hasActiveSession={knownFiles.length > 0 || chunks.length > 0}
        onOpenProviderConfig={() => setProviderConfigOpen(true)}
        onOpenLibrary={() => setLibraryPanelOpen(true)}
        onReset={handleClearKnowledge}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Restoring banner */}
        {restoring && (
          <div
            className="mb-8 p-4 rounded-xl flex items-center gap-3 slide-up"
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
              style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--text-accent)" }}>
              Restaurando sessão anterior do Supabase...
            </p>
          </div>
        )}

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
          {/* Section 1: Conhecimento */}
          <section className="section-card slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}>📄</div>
              <div className="flex-1">
                <h2 className="text-base font-semibold">Base de Conhecimento</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {knownFiles.length > 0
                    ? `${knownFiles.length} documento${knownFiles.length > 1 ? "s" : ""} · ${chunks.length} chunks na memória vetorial`
                    : "Envie documentos para extrair conhecimento base"}
                </p>
              </div>
              {knownFiles.length > 0 && (
                <button
                  onClick={handleClearKnowledge}
                  disabled={clearing || uploading || generating !== null}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--accent-danger)",
                    background: "transparent",
                  }}
                >
                  {clearing ? "Excluindo..." : "🗑️ Limpar base"}
                </button>
              )}
            </div>

            {knownFiles.length > 0 ? (
              <div className="space-y-2">
                {/* Cards de arquivos indexados */}
                {knownFiles.map((f, i) => {
                  const ext = f.filename.split(".").pop()?.toLowerCase() || "";
                  const icon = ext === "pdf" ? "📕" : ["docx","pptx","xlsx"].includes(ext) ? "📊" : ext === "md" ? "📝" : "📄";
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.filename}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {f.chunkCount} chunk{f.chunkCount !== 1 ? "s" : ""} indexado{f.chunkCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(16,185,129,0.12)", color: "var(--accent-success)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        ✓ RAG
                      </span>
                    </div>
                  );
                })}

                {/* Zona compacta de adicionar mais documentos */}
                <label
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all mt-1"
                  style={{
                    borderColor: uploading ? "var(--accent-primary)" : "var(--border-medium)",
                    background: "transparent",
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.md,.markdown,.docx,.pptx,.xlsx"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, projectId)}
                    disabled={uploading || generating !== null}
                  />
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                        style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-accent)" }}>
                          Processando embeddings...
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Gerando vetores e salvando no pgvector
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-lg flex-shrink-0" style={{ color: "var(--text-muted)" }}>＋</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                          Adicionar mais documentos
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          PDF, DOCX, PPTX, XLSX, TXT, MD · Máx. 10 MB · Acumula na mesma base
                        </p>
                      </div>
                    </>
                  )}
                </label>

                {/* Preview de chunks */}
                {chunks.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs cursor-pointer py-1" style={{ color: "var(--text-accent)" }}>
                      Inspecionar chunks ({chunks.length})
                    </summary>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5">
                      {chunks.slice(0, 5).map((chunk, i) => (
                        <div key={i} className="p-2 rounded-lg text-xs"
                          style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                          <span className="font-mono text-[0.65rem]" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                          <p className="mt-0.5 line-clamp-2">{chunk}</p>
                        </div>
                      ))}
                      {chunks.length > 5 && (
                        <p className="text-xs text-center py-1" style={{ color: "var(--text-muted)" }}>
                          + {chunks.length - 5} chunks adicionais
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              /* Drop zone inicial — base vazia */
              <label
                className="block border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer"
                style={{
                  borderColor: uploading ? "var(--accent-primary)" : "var(--border-medium)",
                  background: "var(--bg-tertiary)",
                }}
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
                    <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--text-accent)" }}>
                      Processando embeddings...
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Gerando vetores e salvando no pgvector
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3 opacity-40">📁</div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      Arraste arquivos ou clique para selecionar
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      PDF, DOCX, PPTX, XLSX, TXT, Markdown · Máx. 10 MB por arquivo
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
                  <>
                    {/* Painel de Estratégias Avançadas */}
                    <div className="mt-4 rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--border-medium)", background: "var(--bg-primary)" }}>

                      {/* Header do painel */}
                      <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-tertiary)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">⚡</span>
                          <div>
                            <p className="text-sm font-semibold">Estratégias Avançadas</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {selectedStrategies.length === 0
                                ? "Selecione para injetar no prompt final"
                                : `${selectedStrategies.length} de ${PROMPT_STRATEGIES.length} ativa${selectedStrategies.length > 1 ? "s" : ""}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: "rgba(99,102,241,0.12)", color: "var(--text-accent)", border: "1px solid rgba(99,102,241,0.2)" }}
                            onClick={() => setSelectedStrategies(PROMPT_STRATEGIES.map((s) => s.id))}
                          >
                            Todas
                          </button>
                          <button
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                            onClick={() => setSelectedStrategies([])}
                          >
                            Nenhuma
                          </button>
                        </div>
                      </div>

                      {/* Grid de estratégias por categoria */}
                      <div className="p-3 space-y-3">
                        {(Object.keys(STRATEGY_CATEGORIES) as Array<keyof typeof STRATEGY_CATEGORIES>).map((cat) => {
                          const catStrategies = PROMPT_STRATEGIES.filter((s) => s.category === cat);
                          const catInfo = STRATEGY_CATEGORIES[cat];
                          return (
                            <div key={cat}>
                              <p className="text-[0.65rem] font-semibold uppercase tracking-widest mb-1.5 px-1"
                                style={{ color: "var(--text-muted)" }}>
                                {catInfo.label}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {catStrategies.map((strategy) => {
                                  const active = selectedStrategies.includes(strategy.id);
                                  return (
                                    <button
                                      key={strategy.id}
                                      onClick={() =>
                                        setSelectedStrategies((prev) =>
                                          active ? prev.filter((id) => id !== strategy.id) : [...prev, strategy.id]
                                        )
                                      }
                                      className="flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all"
                                      style={{
                                        background: active ? catInfo.color : "var(--bg-tertiary)",
                                        border: `1px solid ${active ? catInfo.border : "var(--border-subtle)"}`,
                                        outline: "none",
                                      }}
                                    >
                                      {/* Checkbox visual */}
                                      <div className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center"
                                        style={{
                                          background: active ? "var(--accent-primary)" : "transparent",
                                          border: `1.5px solid ${active ? "var(--accent-primary)" : "var(--border-medium)"}`,
                                        }}>
                                        {active && (
                                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm leading-none">{strategy.icon}</span>
                                          <p className="text-xs font-semibold leading-tight truncate"
                                            style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                            {strategy.name}
                                          </p>
                                        </div>
                                        <p className="text-[0.65rem] mt-0.5 line-clamp-2 leading-tight"
                                          style={{ color: "var(--text-muted)" }}>
                                          {strategy.short}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botão de geração */}
                    <button
                      className="btn-primary mt-3 w-full"
                      onClick={handleGeneratePrompt}
                      disabled={generating === "prompt" || !anyConfigured}
                    >
                      {generating === "prompt"
                        ? "⏳ Gerando prompt..."
                        : selectedStrategies.length > 0
                        ? `⚡ Gerar Prompt com ${selectedStrategies.length} Estratégia${selectedStrategies.length > 1 ? "s" : ""}`
                        : "⚡ Gerar Prompt Final"}
                    </button>
                  </>
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

          {/* Section 6: Validação & Export */}
          <section className="section-card slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(16, 185, 129, 0.15)" }}>✅</div>
              <div className="flex-1">
                <h2 className="text-base font-semibold">Validação & Export</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Score de consistência e exportação do prompt
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
                <div className="space-y-1.5">
                  {(validation.checks as { criterion: string; pass: boolean; note: string }[] || []).map(
                    (check, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg"
                        style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                        <span className="flex-shrink-0 text-sm mt-0.5">{check.pass ? "✅" : "❌"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {check.criterion}
                          </p>
                          {check.note && (
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                              {check.note}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Score + Export */}
                <div className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                  {validation.score !== undefined && (
                    <div className="flex-shrink-0 relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                          style={{ stroke: "var(--border-medium)" }} />
                        <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                          strokeDasharray={`${Number(validation.score)} ${100 - Number(validation.score)}`}
                          strokeLinecap="round"
                          style={{ stroke: Number(validation.score) >= 80 ? "var(--accent-success)" : Number(validation.score) >= 60 ? "var(--accent-warning)" : "var(--accent-danger)", transition: "stroke-dasharray 0.6s ease" }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {String(validation.score)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Score de Consistência</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Coerência entre spec, persona e prompt
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap" onClick={() => handleExport("md")}>
                      📝 Prompt .md
                    </button>
                    <button className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap" onClick={() => handleExport("json")}>
                      {"{ }"} Artefato .json
                    </button>
                  </div>
                </div>

                {/* Salvar na biblioteca */}
                <div className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border-medium)", background: "var(--bg-primary)" }}>
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-tertiary)" }}>
                    <span className="text-sm">💾</span>
                    <p className="text-sm font-semibold">Salvar na Biblioteca</p>
                    {savedSuccess && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-success)", border: "1px solid rgba(16,185,129,0.25)" }}>
                        ✓ Salvo!
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Nome do prompt (ex: Agente de Suporte v1)"
                      value={savePromptName}
                      onChange={(e) => setSavePromptName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSavePrompt()}
                      maxLength={80}
                    />
                    <button
                      onClick={handleSavePrompt}
                      disabled={savingPrompt || !savePromptName.trim()}
                      className="btn-primary text-xs px-4 py-2 whitespace-nowrap flex-shrink-0"
                    >
                      {savingPrompt ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-tertiary)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Validação disponível após geração do prompt
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

      {/* Library Panel */}
      {libraryPanelOpen && (
        <LibraryPanel
          onRestore={handleRestorePrompt}
          onClose={() => setLibraryPanelOpen(false)}
        />
      )}
    </div>
  );
}
