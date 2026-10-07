import { after } from "next/server";
import { formatUnits } from "viem";
import { ADDR, erc20Abi, publicClient, serverWallet } from "@/lib/chain";
import { ensureSchema, hasDb, sql } from "@/server/db";
import { runCycle } from "@/server/burn";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb) return json({ coins: 0, paidUsd: 0, burned: "0", reserve: { eth: "0", nvda: "0" } });
  await ensureSchema();
  const [c] = await sql<{ coins: number; paid: string; burned: string }[]>`
    select (select count(*)::int from ja_coins) as coins,
      (select coalesce(sum(paid_usd), 0) from ja_coins) as paid,
      (select coalesce(sum(burned), 0)::text from ja_burns) as burned`;
  let reserve = { eth: "0", nvda: "0" };
  try {
    const me = serverWallet().account.address;
    const [eth, nvda] = await Promise.all([
      publicClient.getBalance({ address: me }),
      publicClient.readContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "balanceOf", args: [me] }),
    ]);
    reserve = { eth: formatUnits(eth, 18), nvda: formatUnits(nvda, 18) };
  } catch {}
  // Vercel Hobby only runs daily crons: visits keep the 10-minute burn cycle going.
  if (process.env.DEPLOYER_KEY) after(() => runCycle().catch((e) => console.error("cycle", e)));
  return json({ coins: c.coins, paidUsd: Number(c.paid), burned: c.burned, reserve });
}
