"use client";

import { useMemo, useState } from "react";
import { BRAND, MCP_URL } from "@/lib/brand";
import { useApi, type Coin } from "@/components/data";
import { CoinCard } from "@/components/CoinCard";
import { TextReveal } from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Kicker } from "@/components/ui/Section";
import { Logo, Nvda, RH } from "@/components/ui/Brand";
import { copyText } from "@/components/ui/Copy";

export function Explore() {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [q, setQ] = useState("");
  const { data, loading } = useApi<{ coins: Coin[] }>(`/api/coins?sort=${sort}&limit=50`, 60_000);
  const all = useMemo(() => (Array.isArray(data?.coins) ? data.coins : []), [data]);
  const coins = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? all.filter((c) => `${c.name} ${c.ticker} ${c.token}`.toLowerCase().includes(s)) : all;
  }, [all, q]);

  return (
    <>
      <section className="bg-paper pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="container">
          <Reveal><Kicker n="05">Explore</Kicker></Reveal>
          <TextReveal as="h1" text={"Every coin,\noff the plug."} highlight={["plug."]} tone="yellow" className="display mt-5" />
          <Reveal delay={0.1} className="caption-lg mt-6 max-w-[56ch] text-ink-2">Every coin launched with {BRAND.name} on <RH />, paired against <Nvda className="h-[1.1em] w-[1.1em] align-[-0.2em]" /> NVDA.</Reveal>
        </div>
      </section>
      <section className="py-10 md:py-16">
        <div className="container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="tablist" className="flex w-fit rounded-full bg-paper-3 p-1">
              {(["top", "new"] as const).map((s) => (
                <button key={s} role="tab" aria-selected={sort === s} onClick={() => setSort(s)} className={`h-9 rounded-full px-5 text-[14px] font-medium transition-colors ${sort === s ? "bg-ink text-white" : "text-ink-2 hover:bg-white"}`}>{s === "top" ? "Top" : "New"}</button>
              ))}
            </div>
            <label className="relative w-full sm:max-w-[320px]">
              <svg viewBox="0 0 16 16" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" strokeLinecap="round" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ticker or address" aria-label="Search coins" className="field !py-2.5 !pl-11" />
            </label>
          </div>

          {loading && all.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="card-white p-5"><div className="flex items-center gap-3"><div className="skeleton h-12 w-12 rounded-full" /><div className="flex-1"><div className="skeleton h-4 w-2/3" /><div className="skeleton mt-2 h-3 w-1/3" /></div></div><div className="skeleton mt-6 h-16 w-full" /></div>
              ))}
            </div>
          ) : all.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <div style={{ animation: "bob 5s ease-in-out infinite" }}><Logo size={64} /></div>
              <p className="mt-6 text-[24px] font-medium tracking-[-0.03em]">No coins yet.</p>
              <p className="mt-2 max-w-[42ch] text-[16px] text-muted">Add {BRAND.name} to Claude or ChatGPT and ask it to launch. Your coin shows up here.</p>
              <button type="button" onClick={() => copyText(MCP_URL)} className="mt-7 h-12 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5">Be the first: copy the link</button>
            </div>
          ) : coins.length === 0 ? (
            <p className="py-16 text-center text-[16px] text-muted">No coin matches “{q}”.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {coins.map((c, i) => <CoinCard key={c.token} c={c} i={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
