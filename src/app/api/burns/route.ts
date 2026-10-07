import { ensureSchema, hasDb, sql } from "@/server/db";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!hasDb) return json({ burns: [] });
  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit")) || 20, 100);
  await ensureSchema();
  const rows = await sql<{ tx: string; fees_usd: string; burned: string; at: Date }[]>`
    select tx, fees_usd, burned::text, at from ja_burns order by at desc limit ${limit}`;
  return json({ burns: rows.map((r) => ({ at: r.at.toISOString(), feesUsd: Number(r.fees_usd), burned: r.burned, tx: r.tx })) });
}
