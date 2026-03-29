"use client";

import { useState, useEffect } from "react";

interface SavedPromptItem {
  id: string;
  name: string;
  score: number;
  strategies: string[];
  created_at: string;
}

interface LibraryPanelProps {
  onRestore: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function LibraryPanel({ onRestore, onClose }: LibraryPanelProps) {
  const [prompts, setPrompts] = useState<SavedPromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/saved-prompts")
      .then((r) => (r.ok ? r.json() : { prompts: [] }))
      .then((data) => setPrompts(data.prompts || []))
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await onRestore(id);
      onClose();
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-prompts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
        setConfirmDeleteId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80
      ? "var(--accent-success)"
      : score >= 60
      ? "var(--accent-warning)"
      : "var(--accent-danger)";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — mesmo estilo do ProviderPanel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto fade-in"
        style={{
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-subtle)",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header sticky */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div>
            <h2 className="text-lg font-bold gradient-text">📚 Biblioteca</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {loading ? "Carregando..." : `${prompts.length} prompt${prompts.length !== 1 ? "s" : ""} salvo${prompts.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-3 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4 opacity-20">💾</div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Nenhum prompt salvo ainda
              </p>
              <p className="text-xs mt-2 max-w-xs" style={{ color: "var(--text-muted)" }}>
                Gere e valide um prompt, depois salve-o na Biblioteca para reutilizar depois
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {prompts.map((p) => {
                const date = new Date(p.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const color = scoreColor(p.score ?? 0);
                const isDeleting = deletingId === p.id;
                const isRestoring = restoringId === p.id;
                const confirmingDelete = confirmDeleteId === p.id;

                return (
                  <div
                    key={p.id}
                    className="rounded-xl p-4 transition-all"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {/* Top row: score + name */}
                    <div className="flex items-start gap-3">
                      {/* Score circle */}
                      <div
                        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `${color}18`,
                          border: `1.5px solid ${color}40`,
                          color,
                        }}
                      >
                        {p.score ?? 0}%
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                          {p.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {date}
                        </p>
                        {p.strategies?.length > 0 && (
                          <span
                            className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(99,102,241,0.1)",
                              color: "var(--text-accent)",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          >
                            ⚡ {p.strategies.length} estratégia{p.strategies.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {confirmingDelete ? (
                      <div
                        className="mt-3 p-3 rounded-lg flex items-center justify-between gap-2"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        <p className="text-xs" style={{ color: "var(--accent-danger)" }}>
                          Excluir permanentemente?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={isDeleting}
                            className="text-xs px-3 py-1 rounded-lg"
                            style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-danger)", border: "1px solid rgba(239,68,68,0.3)" }}
                          >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleRestore(p.id)}
                          disabled={isRestoring}
                          className="flex-1 text-xs py-2 rounded-lg font-medium transition-all"
                          style={{
                            background: "rgba(99,102,241,0.12)",
                            color: "var(--text-accent)",
                            border: "1px solid rgba(99,102,241,0.25)",
                          }}
                        >
                          {isRestoring ? "Restaurando..." : "↩ Restaurar"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all"
                          style={{
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border-subtle)",
                          }}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
