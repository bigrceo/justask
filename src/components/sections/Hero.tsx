"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MCP_URL } from "@/lib/brand";
import { copyText } from "@/components/ui/Copy";
import { Feather } from "@/components/ui/Brand";
import { RealDemo } from "@/components/RealDemo";
import { useLatest } from "@/components/hero/useLive";
import { fmtAge } from "@/components/format";
import { LogoRow } from "@/components/hero/LogoRow";
import { AskBlock } from "@/components/hero/AskBlock";
import { ProofStrip } from "@/components/hero/ProofStrip";

const up = (d: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

function LastLaunch() {
  const { coins } = useLatest(1);
  const c = coins[0];
  if (!c) return null;
  return (
    <Link href={`/c/${c.token.slice(2, 10).toLowerCase()}`} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12.5px] font-medium text-ink-2 ring-1 ring-line hover:ring-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] [animation:pulse-dot_1.6s_ease-in-out_infinite]" /> Last launch {fmtAge(c.createdAt)} ago · ${c.ticker}
    </Link>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper pb-14 pt-[96px] md:pb-20 md:pt-32">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-[25%] h-[600px] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#fffdbd,transparent)]" />
      <div className="container relative grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="flex flex-col gap-4 md:gap-5">
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-2">
            Live on <Feather />Robinhood Chain
          </span>
          <h1 className="text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.06] tracking-[-0.045em] text-balance">
            Launch a coin by asking{" "}
            <span className="rounded-[0.16em] bg-highlight px-[0.08em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">Claude or ChatGPT.</span>
          </h1>
          <div className="flex min-h-[26px] flex-wrap items-center gap-x-3 gap-y-2"><p className="text-[16px] font-medium text-ink-2 md:text-[18px]">Free. No wallet. 50% of the fees to you.</p><LastLaunch /></div>
          <motion.div {...up(0.05)}><LogoRow /></motion.div>
          <motion.div {...up(0.1)}><AskBlock /></motion.div>
          <motion.div {...up(0.15)}><ProofStrip /></motion.div>
          <motion.div {...up(0.2)} className="flex items-center gap-3">
            <button type="button" onClick={() => copyText(MCP_URL)}
              className="group flex h-[52px] min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-ink pl-5 pr-1.5 text-white shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:flex-none">
              <span className="text-[15px] font-semibold">Copy MCP link</span>
              <span className="mono truncate rounded-full bg-white/10 px-3 py-2 text-[12.5px] text-white/80 transition-colors group-hover:bg-highlight group-hover:text-ink">{MCP_URL.replace("https://", "")}</span>
            </button>
            <Link href="#setup" className="shrink-0 text-[14px] font-semibold text-ink-2 hover:text-ink">60s setup ↓</Link>
          </motion.div>
        </div>
        <motion.div {...up(0.15)} className="lg:sticky lg:top-28 lg:self-center">
          <RealDemo />
        </motion.div>
      </div>
    </section>
  );
}
