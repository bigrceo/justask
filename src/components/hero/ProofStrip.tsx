"use client";
import { fmtUsd } from "@/components/format";
import { useToken } from "./useLive";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Coin } from "@/components/data";
import { fmtAge, fmtNum, toNum } from "@/components/format";
import { useLatest, useStats } from "./useLive";
import { BRAND } from "@/lib/brand";

function Chip({ c }: { c: Coin }) {
  return (
    <Link href={`/c/${c.token.slice(2, 10).toLowerCase()}`} className="flex shrink-0 items-center gap-1.5 rounded-full bg-paper py-1 pl-1 pr-2.5 text-[13px] transition-colors hover:bg-paper-3">
      {c.image ? <img src={c.image} alt="" width={22} height={22} loading="lazy" className="h-[22px] w-[22px] rounded-full bg-paper-3 object-cover" />
        : <span className="h-[22px] w-[22px] rounded-full bg-paper-3" />}
      <span className="font-semibold">${c.ticker}</span>
      <span className="text-muted">{fmtAge(c.createdAt)}</span>
    </Link>
  );
}

export function ProofStrip() {
  const { data: stats } = useStats();
  const { coins, loading } = useLatest();
  const n = toNum(stats?.coins);
  const burned = toNum(stats?.burned);
  const { ca } = useToken();
  const loop = coins.length > 3;
  return (
    <div className="grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[20px] border border-line bg-white px-4">
      <div className="leading-tight">
        <div className="text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{stats ? fmtNum(n) : "–"}</div>
        <div className="text-[11.5px] text-muted">launched</div>
      </div>
      <div className="relative min-w-0 overflow-hidden border-x border-line px-3 [mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)]">
        <div className="mb-1 flex items-center gap-1.5 text-[11.5px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] [animation:pulse-dot_1.6s_ease-in-out_infinite]" /> Latest</div>
        {loading && !coins.length ? <div className="skeleton h-[30px] w-40 !rounded-full" />
          : !coins.length ? <div className="h-[30px] text-[13px] leading-[30px] text-muted">First launch lands here</div>
          : (
            <div className="flex w-max gap-1.5" style={loop ? { animation: `marquee ${coins.length * 3.5}s linear infinite` } : undefined}>
              {coins.map((c) => <Chip key={c.token} c={c} />)}
              {loop && coins.map((c) => <Chip key={`d${c.token}`} c={c} />)}
            </div>
          )}
      </div>
      <div className="text-right leading-tight">
        {/* $ASK isn't shown before its launch: until then this slot shows what creators were paid. */}
        <div className="text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{!stats ? "–" : ca ? fmtNum(burned) : fmtUsd(Number(stats.paidUsd ?? 0))}</div>
        <div className="text-[11.5px] text-muted">{ca ? `$${BRAND.ticker} burned` : "paid to creators"}</div>
      </div>
    </div>
  );
}
