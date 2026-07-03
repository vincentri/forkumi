"use client";

import { useMemo } from "react";
import type { CRUDConfig, CRUDFieldSelect, QueryState } from "@repo/crud";

/**
 * Loose shape for a model router that exposes the optional `options` query.
 * The CRUD view and the keyValue view both use this hook and pass it their
 * own typed router.
 */
interface ModelWithOptions {
  options?: {
    useQuery: (
      input: undefined,
      opts: { enabled: boolean; refetchOnMount: "always" | boolean; gcTime: number },
    ) => { data?: Record<string, Array<{ value: string; label: string }>>; isLoading: boolean; isError: boolean };
  };
}

export interface UseDynamicOptionsResult {
  runtimeConfig: CRUDConfig;
  optionsLoading: boolean;
  optionsError: boolean;
}

/**
 * Loads any `select` fields with `hasDynamicOptions`, and returns a copy of the
 * config with those fields' `options` array replaced by the latest data.
 */
export function useDynamicOptions(
  config: CRUDConfig,
  m: ModelWithOptions | undefined,
): UseDynamicOptionsResult {
  const shouldPreloadOptions = config.fields.some(
    (field) => field.type === "select" && field.hasDynamicOptions,
  );

  const optionsQuery = m?.options?.useQuery(undefined, {
    enabled: shouldPreloadOptions,
    refetchOnMount: "always",
    gcTime: 0,
  });

  const runtimeConfig = useMemo<CRUDConfig>(() => {
    const dynamicOptions = optionsQuery?.data;
    if (!dynamicOptions) return config;

    return {
      ...config,
      fields: config.fields.map((field) => {
        if (field.type !== "select") return field;
        const options = dynamicOptions[field.name];
        return options ? ({ ...field, options } as CRUDFieldSelect) : field;
      }),
    };
  }, [config, optionsQuery?.data]);

  return {
    runtimeConfig,
    optionsLoading: !!optionsQuery?.isLoading,
    optionsError: !!optionsQuery?.isError,
  };
}

// Re-export for callers that need QueryState
export type { QueryState };
