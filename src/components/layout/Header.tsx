"use client";

import StepIndicator from "./StepIndicator";

interface HeaderProps {
  currentStep: string;
  completedSteps: string[];
  hasActiveSession: boolean;
  onOpenProviderConfig: () => void;
  onOpenLibrary: () => void;
  onReset: () => void;
}

export default function Header({
  currentStep,
  completedSteps,
  hasActiveSession,
  onOpenProviderConfig,
  onOpenLibrary,
  onReset,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl"
      style={{
        background: "rgba(10, 10, 15, 0.85)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              ⚡
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-tight">
                PromptForge
              </h1>
              <p
                className="text-[0.6rem] font-medium tracking-wider uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Spec-Driven Prompts
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="hidden md:flex">
            <StepIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Biblioteca */}
            <button
              onClick={onOpenLibrary}
              className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
              title="Biblioteca de prompts salvos"
            >
              <span>📚</span>
              <span className="hidden sm:inline">Biblioteca</span>
            </button>

            {/* Reiniciar — só aparece quando há sessão ativa */}
            {hasActiveSession && (
              <button
                onClick={onReset}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "var(--accent-danger)",
                }}
                title="Reiniciar — apaga sessão atual e recomeça"
              >
                🔄
              </button>
            )}

            {/* Configurações */}
            <button
              onClick={onOpenProviderConfig}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
              title="Configurações de provider"
              aria-label="Abrir configurações de provider"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
