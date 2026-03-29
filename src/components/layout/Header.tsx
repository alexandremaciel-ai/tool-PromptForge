"use client";

import ProviderBadge from "./ProviderBadge";
import StepIndicator from "./StepIndicator";

interface HeaderProps {
  currentStep: string;
  completedSteps: string[];
  providerName: string | null;
  isFallback?: boolean;
  onOpenProviderConfig: () => void;
}

export default function Header({
  currentStep,
  completedSteps,
  providerName,
  isFallback,
  onOpenProviderConfig,
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

          {/* Provider + Settings */}
          <div className="flex items-center gap-3">
            <ProviderBadge
              providerName={providerName}
              isFallback={isFallback}
              onOpenConfig={onOpenProviderConfig}
            />
            <button
              onClick={onOpenProviderConfig}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
              title="Configurações"
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
