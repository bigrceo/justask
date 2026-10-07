"use client";

import { useEffect, useState } from "react";

export type Stats = { coins: number; paidUsd: number; burned: string; reserve?: { eth: string; nvda: string } };
export type Coin = {
  token: string; name: string; ticker: string; image?: string | null; description?: string; x?: string; website?: string;
  wallet?: string | null; userBps?: number; mcapUsd: number; changePct: number; paidUsd: number; createdAt: string;
};
export type Burn = { at: string; feesUsd: number; burned: string; tx: string };

/** Client fetch that never throws: errors and bad payloads resolve to null. */
export function useApi<T>(url: string, refreshMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    if (!url) { setData(null); setLoading(false); return; }
    const load = async () => {
      try {
        const r = await fetch((process.env.NEXT_PUBLIC_API_BASE ?? "") + url, { cache: "no-store" });
        const j = r.ok ? ((await r.json()) as T) : null;
        if (alive) setData(j);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = refreshMs ? setInterval(load, refreshMs) : undefined;
    return () => { alive = false; if (id) clearInterval(id); };
  }, [url, refreshMs]);
  return { data, loading };
}

export { toNum, fmtUsd, fmtNum, fmtPct, fmtAge, short } from "./format";
