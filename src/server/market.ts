import { ADDR, feedAbi, lensAbi, publicClient } from "@/lib/chain";

let cached: { usd: number; at: number } | undefined;

/** NVDA stock token in USD, from its Chainlink feed. */
export async function nvdaUsd(): Promise<number> {
  if (cached && Date.now() - cached.at < 60_000) return cached.usd;
  try {
    const [[, answer], decimals] = await Promise.all([
      publicClient.readContract({ address: ADDR.nvdaFeed, abi: feedAbi, functionName: "latestRoundData" }),
      publicClient.readContract({ address: ADDR.nvdaFeed, abi: feedAbi, functionName: "decimals" }),
    ]);
    cached = { usd: Number(answer) / 10 ** decimals, at: Date.now() };
  } catch {
    cached ??= { usd: Number(process.env.NVDA_USD_FALLBACK ?? 225), at: 0 };
  }
  return cached.usd;
}

const SUPPLY = 1_000_000_000;

/** Token price in NVDA from a v4 sqrtPrice or tick, whichever side the token sits on. Both have 18 decimals. */
function priceFromSqrt(sqrtPriceX96: bigint, tokenIs0: boolean) {
  const p = (Number(sqrtPriceX96) / 2 ** 96) ** 2;
  return tokenIs0 ? p : 1 / p;
}
function priceFromTick(tick: number, tokenIs0: boolean) {
  const p = 1.0001 ** tick;
  return tokenIs0 ? p : 1 / p;
}

export type Live = { mcapUsd: number; changePct: number; swaps: number };

export async function liveMarket(poolId: `0x${string}`): Promise<Live | null> {
  try {
    const m = await publicClient.readContract({ address: ADDR.lens, abi: lensAbi, functionName: "market", args: [poolId] });
    const usd = await nvdaUsd();
    const now = priceFromSqrt(m.sqrtPriceX96, m.tokenIs0);
    const open = priceFromTick(m.openingTick, m.tokenIs0);
    return { mcapUsd: now * SUPPLY * usd, changePct: open ? (now / open - 1) * 100 : 0, swaps: m.swaps };
  } catch {
    return null;
  }
}
