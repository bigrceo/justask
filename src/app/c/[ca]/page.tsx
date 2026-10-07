/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, MCP_URL, shareIntent } from "@/lib/brand";
import { getCoin } from "@/components/coin/getCoin";
import { CopyCA } from "@/components/coin/CopyCA";
import { Sparkline } from "@/components/coin/Sparkline";
import { fmtAge, fmtPct, fmtUsd, short } from "@/components/format";
import { ChatGPTMark, ClaudeMark, Logo, RH } from "@/components/ui/Brand";
import { CopyUrl } from "@/components/ui/Copy";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 30;

type Props = { params: Promise<{ ca: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ca } = await params;
  const c = await getCoin(ca);
  if (!c) return { title: "Coin not found" };
  const description = `${c.name} ($${c.ticker}) launched on Robinhood Chain by asking AI with ${BRAND.name}. ${fmtUsd(c.mcapUsd)} market cap.`;
  return { title: { absolute: `$${c.ticker} · ${BRAND.name}` }, description, openGraph: { title: `$${c.ticker} · ${BRAND.name}`, description }, twitter: { card: "summary_large_image" } };
}

export default async function CoinPage({ params }: Props) {
  const { ca } = await params;
  const c = await getCoin(ca);
  if (!c) return <NotFound ca={ca} />;

  const up = c.changePct >= 0;
  const userPct = Math.round((c.userBps ?? 0) / 100);
  const share = shareIntent(c.ticker, c.token);
  const xUrl = c.x ? (c.x.startsWith("http") ? c.x : `https://x.com/${c.x.replace(/^@/, "")}`) : null;
  const site = c.website ? (c.website.startsWith("http") ? c.website : `https://${c.website}`) : null;

  return (
    <>
      <section className="relative overflow-hidden bg-paper pb-12 pt-28 md:pb-16 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#fffdbd,transparent)]" />
        <div className="container relative">
          <Link href="/explore" className="mb-8 inline-flex items-center gap-2 text-[14px] text-muted hover:text-ink">
            <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 2L4 7l5 5" /></svg>
            All coins
          </Link>
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-center">
            {c.image ? <img src={c.image} alt="" className="h-24 w-24 shrink-0 rounded-[28px] bg-white object-cover shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] md:h-32 md:w-32" />
              : <span className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-[32px] font-medium md:h-32 md:w-32">{c.ticker.slice(0, 2)}</span>}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] text-ink-2 ring-1 ring-line">
                  <ClaudeMark className="h-3.5 w-3.5" /><ChatGPTMark className="h-3.5 w-3.5" /> Launched by asking AI
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[13px] text-muted ring-1 ring-line">{fmtAge(c.createdAt)} ago</span>
              </div>
              <h1 className="headline mt-3 break-words">{c.name}</h1>
              <p className="mt-1 text-[20px] text-muted">${c.ticker} · on <RH /></p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container grid gap-3 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="card-white flex flex-col p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[14px] text-muted">Market cap</div>
                <div className="mt-1 text-[clamp(40px,6vw,72px)] font-medium leading-none tracking-[-0.05em] tabular-nums">{fmtUsd(c.mcapUsd)}</div>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-[15px] font-medium tabular-nums ${up ? "bg-[#e6f6ec] text-[#1f7a45]" : "bg-[#fdeceb] text-[#c2342c]"}`}>{fmtPct(c.changePct)} since launch</span>
            </div>
            <div className="mt-6">
              {c.spark.length >= 2 ? <Sparkline points={c.spark} up={up} /> : <div className="flex h-28 items-center justify-center rounded-[14px] bg-paper text-[14px] text-muted md:h-36">Chart fills in as people trade.</div>}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-[14px]">
              <div className="rounded-[14px] bg-paper px-4 py-3"><div className="text-muted">Paid to creator</div><div className="mt-0.5 text-[18px] font-medium tabular-nums">{fmtUsd(c.paidUsd)}</div></div>
              <div className="rounded-[14px] bg-paper px-4 py-3"><div className="text-muted">Paired with</div><div className="mt-0.5 flex items-center gap-1.5 text-[18px] font-medium"><img src="/logos/NVDA.svg" alt="" className="h-5 w-5 rounded-full" /> NVDA</div></div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="overflow-hidden rounded-[24px] border border-line bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-paper px-5 py-3">
              <span className="flex items-center gap-2 text-[14px] font-medium"><Logo size={17} /> {BRAND.name}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12.5px] text-[#1f7a45] ring-1 ring-line"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> Live on <RH /></span>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <CopyCA ca={c.token} />
              <div>
                <div className="mb-2 text-[13px] text-muted">Creator fees</div>
                <div className="flex h-11 gap-1.5 overflow-hidden rounded-[12px] text-[13px] font-medium">
                  {userPct > 0 && <div className="flex items-center justify-between bg-ink px-3 text-white" style={{ width: `${userPct}%` }}><span>{userPct}%</span><span className="mono truncate pl-2 text-white/70">{c.wallet ? short(c.wallet) : ""}</span></div>}
                  <div className="flex flex-1 items-center justify-between bg-highlight px-3 text-ink"><span>{100 - userPct}%</span><span className="truncate pl-2">${BRAND.ticker} burn</span></div>
                </div>
                <p className="mt-2 text-[13px] text-muted">{userPct > 0 ? <>{userPct}% of fees → <span className="mono text-ink">{c.wallet ? short(c.wallet) : "creator"}</span>, the rest buys ${BRAND.ticker} and burns it.</> : <>No wallet given: every fee buys ${BRAND.ticker} and burns it.</>}</p>
              </div>
              {c.description && <p className="text-[15px] leading-relaxed text-ink-2">{c.description}</p>}
              {(xUrl || site) && (
                <div className="flex flex-wrap gap-2 text-[14px]">
                  {xUrl && <a href={xUrl} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-1.5 hover:border-ink">𝕏 Profile</a>}
                  {site && <a href={site} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-1.5 hover:border-ink">Website ↗</a>}
                </div>
              )}
              <div className="mt-auto grid grid-cols-2 gap-2">
                <a href={share} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-medium text-white transition-colors hover:bg-ink-2">Share on 𝕏</a>
                <a href={`${BRAND.explorer}/token/${c.token}`} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-line-2 text-[14px] font-medium transition-colors hover:border-ink">Blockscout ↗</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}

function CTA() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container">
        <Reveal className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-white md:px-14 md:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,253,189,0.18),transparent)]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-[14px] text-white/60"><ClaudeMark className="h-4 w-4" /><ChatGPTMark className="h-4 w-4 text-white" /> Works in Claude and ChatGPT</div>
              <h2 className="headline mt-4">Launch yours in one sentence.</h2>
              <p className="mt-4 max-w-[46ch] text-[17px] text-white/70">Add {BRAND.name} to your AI, say the name and ticker, approve it. Free to launch, and you earn on every trade.</p>
            </div>
            <div>
              <CopyUrl text={MCP_URL} dark />
              <Link href="/#setup" className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-white/80 hover:text-white">How to set it up →</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function NotFound({ ca }: { ca: string }) {
  return (
    <>
      <section className="flex min-h-[60vh] items-center bg-paper pt-28">
        <div className="container flex flex-col items-center pb-16 text-center">
          <Logo size={56} />
          <h1 className="headline mt-6">Coin not found.</h1>
          <p className="mt-3 max-w-[48ch] text-[17px] text-muted">No {BRAND.name} coin at <span className="mono break-all text-ink">{ca}</span>. It may still be launching.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/explore" className="flex h-11 items-center rounded-full bg-ink px-6 text-[14px] font-medium text-white">See all coins</Link>
            <Link href="/" className="flex h-11 items-center rounded-full border border-line-2 px-6 text-[14px] font-medium">Home</Link>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
