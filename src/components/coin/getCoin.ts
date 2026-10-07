import "server-only";
import { cache } from "react";
import { SITE_URL } from "@/lib/brand";
import { hasDb } from "@/server/db";
import { coinByToken, resolveShort } from "@/server/coins";
import { liveMarket } from "@/server/market";

export type CoinPage = {
  token: string; name: string; ticker: string; image?: string | null; description?: string; x?: string; website?: string;
  wallet?: string | null; userBps: number; mcapUsd: number; changePct: number; paidUsd: number; createdAt: string; tx?: string; spark: number[];
};

const isAddr = (s: string) => /^0x[0-9a-fA-F]{40}$/.test(s);

/** Coin for the public page: the API route first (has the sparkline), the database as a fallback. */
export const getCoin = cache(async (raw: string): Promise<CoinPage | null> => {
  const ca = isAddr(raw) ? raw : hasDb ? await resolveShort(raw).catch(() => null) : null;
  if (!ca) return null;
  const base = process.env.NEXT_PUBLIC_API_BASE || process.env.COIN_API_BASE || SITE_URL;
  try {
    const r = await fetch(`${base}/api/coins/${ca}`, { next: { revalidate: 30 } });
    if (r.ok) {
      const j = (await r.json()) as { coin?: CoinPage };
      if (j.coin) return { ...j.coin, spark: Array.isArray(j.coin.spark) ? j.coin.spark : [] };
    }
  } catch {}
  if (!hasDb) return null;
  try {
    const row = await coinByToken(ca);
    if (!row) return null;
    const live = await liveMarket(row.pool_id);
    return {
      token: row.token, name: row.name, ticker: row.ticker, image: row.image, description: row.description ?? undefined,
      x: row.x ?? undefined, website: row.website ?? undefined, wallet: row.wallet, userBps: row.user_bps,
      mcapUsd: live?.mcapUsd ?? 0, changePct: live?.changePct ?? 0, paidUsd: Number(row.paid_usd),
      createdAt: row.created_at.toISOString(), tx: row.tx, spark: [],
    };
  } catch {
    return null;
  }
});
