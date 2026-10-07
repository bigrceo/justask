"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { fmtAge, fmtPct, fmtUsd, toNum, type Coin } from "@/components/data";
import { Reveal } from "@/components/motion/Reveal";

export function CoinCard({ c, i }: { c: Coin; i: number }) {
  const ch = toNum(c.changePct);
  return (
    <Reveal delay={Math.min(i, 8) * 0.03}>
    <Link href={`/c/${c.token}`} className="card-white group flex h-full flex-col p-5 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-ink">
      <div className="flex items-center gap-3">
        {c.image ? <img src={c.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full bg-paper-3 object-cover" />
          : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-3 text-[14px] font-medium">{(c.ticker || "?").slice(0, 2)}</span>}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-medium tracking-[-0.02em]">{c.name}</div>
          <div className="text-[14px] text-muted">${c.ticker}</div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium tabular-nums ${ch > 0 ? "bg-[#e6f6ec] text-[#1f7a45]" : ch < 0 ? "bg-[#fdeceb] text-[#c2342c]" : "bg-paper-3 text-muted"}`}>{fmtPct(ch)}</span>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-2 rounded-[14px] bg-paper p-3 text-[13px]">
        <div><dt className="text-muted">Mcap</dt><dd className="mt-0.5 font-medium tabular-nums">{fmtUsd(c.mcapUsd)}</dd></div>
        <div><dt className="text-muted">Paid</dt><dd className="mt-0.5 font-medium tabular-nums">{fmtUsd(c.paidUsd)}</dd></div>
        <div><dt className="text-muted">Age</dt><dd className="mt-0.5 font-medium">{fmtAge(c.createdAt)}</dd></div>
      </dl>
      <span className="mt-4 flex items-center justify-between rounded-full border border-line px-4 py-2 text-[14px] font-medium transition-colors group-hover:border-ink">
        View coin <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
    </Reveal>
  );
}
