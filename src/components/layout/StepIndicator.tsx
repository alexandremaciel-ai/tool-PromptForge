"use client";

import React from "react";

const STEPS = [
  { id: "upload", label: "Upload", icon: "📄" },
  { id: "spec", label: "Spec", icon: "📋" },
  { id: "persona", label: "Persona", icon: "🎭" },
  { id: "prompt", label: "Prompt", icon: "⚡" },
  { id: "validation", label: "Validação", icon: "✅" },
  { id: "export", label: "Export", icon: "📦" },
];

interface StepIndicatorProps {
  currentStep: string;
  completedSteps: string[];
}

export default function StepIndicator({
  currentStep,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const isPast =
          STEPS.findIndex((s) => s.id === currentStep) >
          STEPS.findIndex((s) => s.id === step.id);

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div
                className="h-[2px] w-4 sm:w-8 transition-all duration-300"
                style={{
                  background:
                    isPast || isCompleted
                      ? "var(--accent-primary)"
                      : "var(--border-subtle)",
                }}
              />
            )}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-300 cursor-default"
              style={{
                background: isActive
                  ? "rgba(99, 102, 241, 0.15)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(99, 102, 241, 0.3)"
                  : "1px solid transparent",
              }}
              title={step.label}
            >
              <span className="text-sm">{step.icon}</span>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{
                  color: isActive
                    ? "var(--text-accent)"
                    : isCompleted || isPast
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { STEPS };
