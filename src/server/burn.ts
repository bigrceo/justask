import { decodeEventLog, formatUnits, parseUnits } from "viem";
import { ADDR, askToken, erc20Abi, launchpadAbi, publicClient, routerAbi, serverWallet, splitterAbi } from "@/lib/chain";
import { ensureSchema, sql } from "./db";
import { liveMarket, nvdaUsd } from "./market";

const EVERY_MS = 10 * 60_000;

/** Claims the next cycle slot, so traffic-triggered and cron-triggered runs never overlap. */
async function claim(): Promise<boolean> {
  await ensureSchema();
  const cutoff = String(Date.now() - EVERY_MS + 30_000);
  const rows = await sql`
    insert into ja_state (key, value) values ('cycle_at', ${String(Date.now())})
    on conflict (key) do update set value = excluded.value
    where ja_state.value::bigint < ${cutoff}::bigint
    returning key`;
  return rows.length > 0;
}

/** Collect each traded coin's fees, split them, then buy $ASK with our share and burn it. */
export async function runCycle({ force = false } = {}) {
  if (!force && !(await claim())) return { skipped: true };
  const w = serverWallet();
  const usd = await nvdaUsd();
  const coins = await sql<{ token: string; splitter: `0x${string}`; pool_id: `0x${string}`; last_swaps: number }[]>`
    select token, splitter, pool_id, last_swaps from ja_coins`;

  let collected = 0;
  for (const c of coins) {
    const live = await liveMarket(c.pool_id);
    if (!live || live.swaps <= c.last_swaps) continue;
    try {
      const h1 = await w.writeContract({ address: ADDR.launchpad, abi: launchpadAbi, functionName: "collectPoolFees", args: [c.pool_id] });
      await publicClient.waitForTransactionReceipt({ hash: h1 });
      const h2 = await w.writeContract({ address: c.splitter, abi: splitterAbi, functionName: "split" });
      const r = await publicClient.waitForTransactionReceipt({ hash: h2 });
      let toUser = 0n;
      for (const log of r.logs) {
        try {
          const ev = decodeEventLog({ abi: splitterAbi, data: log.data, topics: log.topics });
          if (ev.eventName === "Split") toUser = ev.args.toUser;
        } catch {}
      }
      const nvda = Number(formatUnits(toUser, 18));
      await sql`update ja_coins set last_swaps = ${live.swaps}, paid_nvda = paid_nvda + ${nvda},
        paid_usd = paid_usd + ${nvda * usd} where token = ${c.token}`;
      collected++;
    } catch (e) {
      console.error("collect failed", c.token, e);
    }
  }

  const burn = await buyAndBurn(usd);
  return { collected, burn };
}

async function buyAndBurn(usd: number) {
  const ask = askToken();
  if (!ask) return null;
  const w = serverWallet();
  const me = w.account.address;
  const reserve = parseUnits(process.env.RESERVE_NVDA ?? "0.5", 18);
  const bal = await publicClient.readContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "balanceOf", args: [me] });
  const spend = bal - reserve;
  if (spend < parseUnits(process.env.MIN_BURN_NVDA ?? "0.001", 18)) return null;

  const poolId = await publicClient.readContract({ address: ADDR.launchpad, abi: launchpadAbi, functionName: "poolIdOf", args: [ask] });
  const key = await publicClient.readContract({ address: ADDR.launchpad, abi: launchpadAbi, functionName: "poolKeyOf", args: [poolId] });
  const allowance = await publicClient.readContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "allowance", args: [me, ADDR.router] });
  if (allowance < spend) {
    const h = await w.writeContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "approve", args: [ADDR.router, 2n ** 256n - 1n] });
    await publicClient.waitForTransactionReceipt({ hash: h });
  }
  const zeroForOne = key.currency0.toLowerCase() === ADDR.nvda.toLowerCase();
  const before = await publicClient.readContract({ address: ask, abi: erc20Abi, functionName: "balanceOf", args: [me] });
  const hBuy = await w.writeContract({
    address: ADDR.router, abi: routerAbi, functionName: "swapExactInput", args: [[{ key, zeroForOne }], spend, 0n, me],
  });
  await publicClient.waitForTransactionReceipt({ hash: hBuy });
  const after = await publicClient.readContract({ address: ask, abi: erc20Abi, functionName: "balanceOf", args: [me] });
  const bought = after - before;
  const hBurn = await w.writeContract({ address: ask, abi: erc20Abi, functionName: "transfer", args: [ADDR.dead, bought] });
  await publicClient.waitForTransactionReceipt({ hash: hBurn });

  const fees = Number(formatUnits(spend, 18));
  await sql`insert into ja_burns (tx, fees_nvda, fees_usd, burned)
    values (${hBurn}, ${fees}, ${fees * usd}, ${formatUnits(bought, 18)})`;
  return { tx: hBurn, burned: formatUnits(bought, 18) };
}
