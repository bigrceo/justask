import { askToken } from "@/lib/chain";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";
export const GET = () => json({ ca: askToken() });
