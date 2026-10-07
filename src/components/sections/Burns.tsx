"use client";

import { BRAND } from "@/lib/brand";
import { SectionHead, Skel } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Odometer } from "@/components/motion/Odometer";
import { useApi, toNum, fmtNum, fmtUsd, fmtAge, short, type Burn, type Stats } from "@/components/data";

export function Burns() {
  const { data, loading } = useApi<{ burns: Burn[] }>("/api/burns?limit=20", 60_000);
  const { data: stats } = useApi<Stats>("/api/stats", 60_000);
  const burns = Array.isArray(data?.burns) ? data.burns : [];
  const t = `$${BRAND.ticker}`;
  return (
    <section id="burns" className="scroll-mt-20 bg-ink py-16 text-white md:py-24">
      <div className="container">
        <SectionHead dark title="Burn log." 
          body={`Fees buy ${t} and send it to 0x…dEaD every 10 minutes. Every burn, with its tx.`} />
        <div className="mt-14 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="flex flex-col justify-between rounded-[24px] bg-white/5 p-7 ring-1 ring-white/10">
            <div className="caption text-white/50">{t} burned to date</div>
            <div className="mt-10 text-[clamp(48px,7vw,96px)] font-medium leading-none tracking-[-0.05em]"><Odometer value={toNum(stats?.burned)} compact /></div>
            <p className="mt-6 text-[15px] text-white/65">{burns.length ? `${burns.length} recent burns` : "No burns yet."} A small ETH + NVDA reserve is kept back to pay for launches.</p>
          </Reveal>
          <Reveal delay={0.1} className="overflow-x-auto rounded-[24px] bg-white/5 ring-1 ring-white/10">
            <table className="w-full min-w-[520px] text-left">
              <thead><tr className="caption border-b border-white/10 text-white/50">
                <th className="px-5 py-4 font-normal">When</th><th className="px-5 py-4 text-right font-normal">Fees spent</th>
                <th className="px-5 py-4 text-right font-normal">Bought and burned</th><th className="px-5 py-4 text-right font-normal">Transaction</th>
              </tr></thead>
              <tbody>
                {loading && !burns.length && Array.from({ length: 3 }, (_, i) => (
                  <tr key={i}><td colSpan={4} className="px-5 py-4"><Skel className="w-full opacity-20" /></td></tr>
                ))}
                {!loading && !burns.length && (
                  <tr><td colSpan={4} className="caption px-5 py-14 text-center text-white/50">The first burn lands here with its transaction.</td></tr>
                )}
                {burns.map((b) => (
                  <tr key={b.tx} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                    <td className="caption px-5 py-4 text-white/60">{fmtAge(b.at)} ago</td>
                    <td className="px-5 py-4 text-right tabular-nums">{fmtUsd(b.feesUsd)}</td>
                    <td className="px-5 py-4 text-right tabular-nums">{fmtNum(b.burned)} {t}</td>
                    <td className="px-5 py-4 text-right"><a href={`${BRAND.explorer}/tx/${b.tx}`} target="_blank" rel="noreferrer" className="mono text-highlight hover:underline">{short(b.tx)}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
