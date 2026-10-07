import { listCoins } from "@/server/coins";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const sort = q.get("sort") === "new" ? "new" : "top";
  const limit = Math.min(Math.max(Number(q.get("limit")) || 50, 1), 200);
  try {
    return json({ coins: await listCoins(sort, limit) });
  } catch (e) {
    console.error(e);
    return json({ coins: [] });
  }
}
