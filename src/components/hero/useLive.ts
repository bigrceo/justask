"use client";

import { useApi, type Coin, type Stats } from "@/components/data";

export function useToken() {
  const { data, loading } = useApi<{ ca: string | null }>("/api/token", 60_000);
  return { ca: data?.ca ?? null, loading };
}
export function useStats() {
  return useApi<Stats>("/api/stats", 30_000);
}
export function useLatest(limit = 12) {
  const { data, loading } = useApi<{ coins: Coin[] }>(`/api/coins?sort=new&limit=${limit}`, 30_000);
  return { coins: Array.isArray(data?.coins) ? data.coins : [], loading };
}
