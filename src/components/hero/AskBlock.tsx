"use client";

import { BRAND, dexUrl, xUrl } from "@/lib/brand";
import { copyText } from "@/components/ui/Copy";
import { Logo } from "@/components/ui/Brand";
import { fmtPct, fmtUsd, short } from "@/components/format";
import { useApi } from "@/components/data";
import { useToken } from "./useLive";

export function CaChip({ dark = false, compact = false, label }: { dark?: boolean; compact?: boolean; label?: string }) {
  const { ca } = useToken();
  // Nothing about $ASK shows before launch: the CA appears everywhere once ASK_TOKEN is set.
  if (!ca) return null;
  return (
    <button type="button" disabled={!ca} onClick={() => ca && copyText(ca)} aria-label={ca ? `Copy $${BRAND.ticker} contract address` : "Contract address posted at launch"}
      className={`flex h-9 min-w-0 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors disabled:cursor-default ${dark ? "bg-white/10 text-white enabled:hover:bg-white enabled:hover:text-ink" : "bg-paper-3 text-ink enabled:hover:bg-line-2"}`}>
      {ca && !compact && <span className={dark ? "text-white/60" : "text-muted"}>{label ?? `$${BRAND.ticker}`}</span>}{!ca && !label && !compact && <span className={dark ? "text-white/60" : "text-muted"}>${BRAND.ticker}</span>}
      <span className="mono truncate">{ca ? (compact ? `${ca.slice(0, 5)}…${ca.slice(-3)}` : short(ca)) : compact ? `$${BRAND.ticker} soon` : "CA soon"}</span>
      {ca && <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M3 10V4a1 1 0 0 1 1-1h6" /></svg>}
    </button>
  );
}

type Mkt = { coin?: { mcapUsd: number; changePct: number; spark?: number[] } };

function MiniSpark({ pts, up }: { pts: number[]; up: boolean }) {
  const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${((i / (pts.length - 1)) * 60).toFixed(1)} ${(20 - ((p - min) / span) * 18).toFixed(1)}`).join(" ");
  return <svg viewBox="0 0 60 22" className="h-5 w-[60px]" aria-hidden><path d={d} fill="none" stroke={up ? "#4ade80" : "#f87171"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function AskBlock() {
  const { ca } = useToken();
  const { data: m } = useApi<Mkt>(ca ? `/api/coins/${ca}` : "", 30_000);
  if (!ca) return null;
  const coin = m?.coin;
  const up = (coin?.changePct ?? 0) >= 0;
  const x = xUrl(BRAND.x);
  return (
    <div className="rounded-[20px] bg-ink p-2.5 pl-4 text-white">
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]"><Logo light size={20} /> ${BRAND.ticker}</span>
      {coin && (
        <span className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold tabular-nums">{fmtUsd(coin.mcapUsd)}</span>
          <span className={`tabular-nums ${up ? "text-[#4ade80]" : "text-[#f87171]"}`}>{fmtPct(coin.changePct)}</span>
          {coin.spark && coin.spark.length >= 2 && <MiniSpark pts={coin.spark} up={up} />}
        </span>
      )}
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-1.5">
        <CaChip dark label="CA" />
        {x && <a href={x} target="_blank" rel="noreferrer" aria-label="X" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </a>}
        {ca ? (
          <a href={dexUrl(ca)} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-full bg-highlight px-3.5 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-px">DEX Screener ↗</a>
        ) : (
          <span className="flex h-9 items-center rounded-full bg-white/10 px-3.5 text-[13px] text-white/60">DEX at launch</span>
        )}
      </div>
    </div>
      <p className="mt-2 border-t border-white/10 pt-2 text-[12.5px] text-white/70">🔥&nbsp; 50% of every coin&apos;s fees buy back &amp; burn ${BRAND.ticker}</p>
    </div>
  );
}
