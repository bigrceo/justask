"use client";

import Link from "next/link";
import { BRAND, MCP_URL, dexUrl, xUrl } from "@/lib/brand";
import { CopyUrl } from "@/components/ui/Copy";
import { CaChip } from "@/components/hero/AskBlock";
import { useToken } from "@/components/hero/useLive";
import { Logo, RH } from "@/components/ui/Brand";

export function Footer() {
  const { ca } = useToken();
  const x = xUrl(BRAND.x);
  return (
    <footer className="relative z-[2] bg-ink text-white">
      <div className="container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h2 className="text-[clamp(30px,4vw,52px)] font-medium leading-[1.05] tracking-[-0.04em]">Paste one link. Ask for a coin.</h2>
            <div className="mt-6 max-w-[520px]"><CopyUrl text={MCP_URL} dark /></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <CaChip dark />
            {x && <a href={x} target="_blank" rel="noreferrer" className="flex h-9 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium hover:bg-white hover:text-ink">X</a>}
            {ca && <a href={dexUrl(ca)} target="_blank" rel="noreferrer" className="flex h-9 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium hover:bg-white hover:text-ink">DEX Screener</a>}
            <Link href="/explore" className="flex h-9 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium hover:bg-white hover:text-ink">All coins</Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/55 md:flex-row md:items-center md:justify-between">
          <span className="flex items-center gap-2 text-white/80"><Logo light size={18} /> {BRAND.name} · live on <RH light /></span>
          <span>{BRAND.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
