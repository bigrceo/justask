import { NextResponse } from "next/server";

/** Public read API: the in-chat cards (sandboxed iframes on Claude / ChatGPT) fetch it cross-origin. */
export const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS" };

export const json = (data: unknown, init?: number | ResponseInit) => {
  const base: ResponseInit = typeof init === "number" ? { status: init } : init ?? {};
  return NextResponse.json(data, { ...base, headers: { ...CORS, ...(base.headers as Record<string, string>) } });
};

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
