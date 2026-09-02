"use client";

import useSWR, { SWRConfiguration } from "swr";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

async function fetcher<T>(key: string): Promise<T> {
  const res = await fetch(key);
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json.data;
}

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  errorRetryCount: 2,
};

export function useApi<T>(key: string | null, config?: SWRConfiguration) {
  return useSWR<T>(key, fetcher, { ...defaultConfig, ...config });
}
