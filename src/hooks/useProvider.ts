"use client";

import { useState, useEffect, useCallback } from "react";
import { ProviderStatus } from "@/lib/providers/types";

interface ProviderState {
  providers: ProviderStatus[];
  defaultProvider: string;
  fallbackProvider: string;
  anyConfigured: boolean;
  activeProviderName: string | null;
  loading: boolean;
}

export function useProvider() {
  const [state, setState] = useState<ProviderState>({
    providers: [],
    defaultProvider: "openrouter",
    fallbackProvider: "anthropic",
    anyConfigured: false,
    activeProviderName: null,
    loading: true,
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/provider/config");
      const data = await res.json();

      const activeProvider = data.providers?.find(
        (p: ProviderStatus) => p.id === data.defaultProvider && p.configured
      ) || data.providers?.find((p: ProviderStatus) => p.configured);

      setState({
        providers: data.providers || [],
        defaultProvider: data.defaultProvider || "openrouter",
        fallbackProvider: data.fallbackProvider || "anthropic",
        anyConfigured: data.anyConfigured || false,
        activeProviderName: activeProvider?.name || null,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const testProvider = useCallback(
    async (providerId: string) => {
      const res = await fetch("/api/provider/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      return res.json();
    },
    []
  );

  return {
    ...state,
    refresh: fetchConfig,
    testProvider,
  };
}
