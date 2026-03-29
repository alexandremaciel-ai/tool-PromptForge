"use client";

interface ProviderBadgeProps {
  providerName: string | null;
  isFallback?: boolean;
  onOpenConfig: () => void;
}

export default function ProviderBadge({
  providerName,
  isFallback,
  onOpenConfig,
}: ProviderBadgeProps) {
  if (!providerName) {
    return (
      <button
        onClick={onOpenConfig}
        className="badge badge-warning cursor-pointer hover:scale-105 transition-transform"
      >
        <span
          className="w-2 h-2 rounded-full pulse-dot"
          style={{ background: "var(--accent-warning)" }}
        />
        Configurar Provider
      </button>
    );
  }

  return (
    <button
      onClick={onOpenConfig}
      className="badge badge-success cursor-pointer hover:scale-105 transition-transform"
    >
      <span
        className="w-2 h-2 rounded-full pulse-dot"
        style={{ background: "var(--accent-success)" }}
      />
      {providerName}
      {isFallback && (
        <span className="text-[0.65rem] opacity-70">(fallback)</span>
      )}
    </button>
  );
}
