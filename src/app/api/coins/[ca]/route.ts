import { coinDetail } from "@/server/coins";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ ca: string }> }) {
  const { ca } = await params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(ca)) return json({ error: "Not a contract address" }, 400);
  const coin = await coinDetail(ca).catch(() => null);
  return coin ? json({ coin }) : json({ error: "Not a Just Ask coin" }, 404);
}
