"use client";

import { BRAND, MCP_URL } from "@/lib/brand";
import { SectionHead } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CoinCard } from "@/components/CoinCard";
import { copyText } from "@/components/ui/Copy";
import { useApi, type Coin } from "@/components/data";

export function TopCoins() {
  const { data, loading } = useApi<{ coins: Coin[] }>("/api/coins?sort=top&limit=8", 60_000);
  const coins = Array.isArray(data?.coins) ? data.coins : [];
  return (
    <section id="coins" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionHead title="Top coins." body="By market cap, live from the chain." />
        <div className="mt-12">
          {loading && !coins.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-[214px] !rounded-[24px]" />)}
            </div>
          ) : !coins.length ? (
            <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
              <div><p className="text-[20px] font-medium tracking-[-0.02em]">No coins yet.</p><p className="mt-1 text-[15px] text-muted">The first one made with {BRAND.name} shows up here.</p></div>
              <Button onClick={() => copyText(MCP_URL)}>Be the first</Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {coins.map((c, i) => <CoinCard key={c.token} c={c} i={i} />)}
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-center"><Button href="/explore" variant="outline">See all coins</Button></div>
      </div>
    </section>
  );
}
