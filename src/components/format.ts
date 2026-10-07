const num = (v: unknown) => { const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0; return Number.isFinite(n) ? n : 0; };
export const toNum = num;

export function fmtUsd(v: unknown, compact = true) {
  const n = num(v);
  if (n > 0 && n < 0.01) return "<$0.01";
  if (compact && Math.abs(n) >= 1000) return "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: n && Math.abs(n) < 100 ? 2 : 0, maximumFractionDigits: 2 });
}
export function fmtNum(v: unknown) {
  const n = num(v);
  if (Math.abs(n) >= 1000) return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
export function fmtPct(v: unknown) {
  const n = num(v);
  return `${n > 0 ? "+" : ""}${n.toFixed(Math.abs(n) >= 100 ? 0 : 1)}%`;
}
export function fmtAge(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "–";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
export const short = (a: string) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);
