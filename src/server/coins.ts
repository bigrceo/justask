import { getAddress } from "viem";
import { ensureSchema, hasDb, sql } from "./db";
import { liveMarket } from "./market";

type Row = {
  token: string; pool_id: `0x${string}`; name: string; ticker: string; image: string; description: string | null;
  x: string | null; website: string | null; wallet: string | null; user_bps: number; paid_usd: string; created_at: Date;
};

let cache: { at: number; coins: Awaited<ReturnType<typeof load>> } | undefined;

async function load() {
  await ensureSchema();
  const rows = await sql<Row[]>`select * from ja_coins order by created_at desc limit 500`;
  const coins = await Promise.all(
    rows.map(async (r) => {
      const live = await liveMarket(r.pool_id);
      return {
        token: getAddress(r.token), name: r.name, ticker: r.ticker, image: r.image,
        description: r.description ?? undefined, x: r.x ?? undefined, website: r.website ?? undefined,
        wallet: r.wallet ?? undefined, userBps: r.user_bps,
        mcapUsd: live?.mcapUsd ?? 0, changePct: live?.changePct ?? 0,
        paidUsd: Number(r.paid_usd), createdAt: r.created_at.toISOString(),
      };
    }),
  );
  await snapshot(coins);
  return coins;
}

/** One market-cap point per coin every 5 minutes at most: enough for the sparklines. */
async function snapshot(coins: { token: string; mcapUsd: number }[]) {
  const live = coins.filter((c) => c.mcapUsd > 0);
  if (!live.length) return;
  try {
    await sql`
      insert into ja_prices (token, mcap_usd)
      select t.token, t.mcap from unnest(${live.map((c) => c.token.toLowerCase())}::text[], ${live.map((c) => c.mcapUsd)}::numeric[]) as t(token, mcap)
      where not exists (select 1 from ja_prices p where p.token = t.token and p.at > now() - interval '5 minutes')`;
  } catch (e) {
    console.error("snapshot", e);
  }
}

export async function sparkOf(token: string, points = 48): Promise<number[]> {
  await ensureSchema();
  const rows = await sql<{ m: string }[]>`
    select mcap_usd as m from ja_prices where token = ${token.toLowerCase()} order by at desc limit ${points}`;
  return rows.map((r) => Number(r.m)).reverse();
}

export async function coinDetail(token: string) {
  const r = await coinByToken(token);
  if (!r) return null;
  const live = await liveMarket(r.pool_id);
  const spark = await sparkOf(r.token);
  const mcapUsd = live?.mcapUsd ?? 0;
  return {
    token: getAddress(r.token), name: r.name, ticker: r.ticker, image: r.image,
    description: r.description ?? undefined, x: r.x ?? undefined, website: r.website ?? undefined,
    wallet: r.wallet ?? undefined, userBps: r.user_bps, mcapUsd, changePct: live?.changePct ?? 0,
    paidUsd: Number(r.paid_usd), createdAt: r.created_at.toISOString(), tx: r.tx,
    spark: spark.length && mcapUsd ? [...spark, mcapUsd] : spark,
  };
}

export async function coinsByWallet(wallet: string) {
  await ensureSchema();
  const rows = await sql<{ token: string }[]>`
    select token from ja_coins where lower(wallet) = ${wallet.toLowerCase()} order by created_at desc limit 50`;
  return (await Promise.all(rows.map((r) => coinDetail(r.token)))).filter((c) => c !== null);
}

export async function listCoins(sort: "top" | "new", limit: number) {
  if (!hasDb) return [];
  if (!cache || Date.now() - cache.at > 30_000) cache = { at: Date.now(), coins: await load() };
  const coins = [...cache.coins];
  if (sort === "top") coins.sort((a, b) => b.mcapUsd - a.mcapUsd);
  return coins.slice(0, limit);
}

export async function coinByToken(token: string) {
  await ensureSchema();
  const [r] = await sql<(Row & { splitter: string; tx: string; paid_nvda: string })[]>`
    select * from ja_coins where token = ${token.toLowerCase()}`;
  return r ?? null;
}

/** Resolves a short code (first hex digits of a CA) to the coin's full address, if exactly one matches. */
export async function resolveShort(code: string): Promise<string | null> {
  if (!/^[0-9a-fA-F]{6,40}$/.test(code)) return null;
  await ensureSchema();
  const rows = await sql<{ token: string }[]>`select token from ja_coins where token like ${"0x" + code.toLowerCase() + "%"} limit 2`;
  return rows.length === 1 ? getAddress(rows[0].token) : null;
}
