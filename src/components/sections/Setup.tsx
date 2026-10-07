"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { BRAND, MCP_URL } from "@/lib/brand";
import { SectionHead } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { CopyUrl } from "@/components/ui/Copy";
import { ChatGPTMark, ClaudeMark } from "@/components/ui/Brand";
import { ChatGPTMock, ClaudeMock } from "@/components/SetupMockups";

const PATHS = {
  claude: {
    label: "Claude",
    title: "Add it to Claude",
    body: `Name it ${BRAND.name}, paste the link, keep "No sign-in". Works on Claude Free.`,
    crumbs: ["Settings", "Connectors", "+ Add", "Add custom connector"],
  },
  chatgpt: {
    label: "ChatGPT",
    title: "Add it to ChatGPT",
    body: `Turn on Developer mode, create a connector with the link. Needs Plus, Pro or Business.`,
    crumbs: ["Settings", "Apps & Connectors", "Advanced settings", "Developer mode", "Create"],
  },
} as const;
type K = keyof typeof PATHS;

export function Setup() {
  const [k, setK] = useState<K>("claude");
  // The nav's "Add to Claude / ChatGPT" buttons open the matching tab.
  useEffect(() => {
    const on = (e: Event) => setK((e as CustomEvent<K>).detail);
    window.addEventListener("setup-tab", on);
    return () => window.removeEventListener("setup-tab", on);
  }, []);
  const p = PATHS[k];
  const ai = k === "claude" ? "Claude" : "ChatGPT";
  return (
    <section id="setup" className="scroll-mt-20 bg-paper py-16 md:py-24">
      <div className="container">
        <SectionHead title="Live in 60 seconds." highlight={["60"]}
          body="3 steps. Add it once on phone, desktop or web; it works everywhere." />

        <Reveal className="mt-12 flex justify-center lg:justify-start">
          <div role="tablist" className="relative flex rounded-full bg-white p-1">
            {(Object.keys(PATHS) as K[]).map((key) => (
              <button key={key} role="tab" aria-selected={k === key} onClick={() => setK(key)} className={`relative z-[1] flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors ${k === key ? "text-white" : "text-ink"}`}>
                {k === key && <motion.span layoutId="tab" className="absolute inset-0 -z-[1] rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {key === "claude" ? <ClaudeMark /> : <ChatGPTMark />}
                {PATHS[key].label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-6 grid gap-3 lg:grid-cols-3 [&>*]:min-w-0">
          <Reveal className="card-white flex flex-col p-7">
            <div className="caption text-muted">Step 1</div>
            <h3 className="mt-3 text-[26px] font-medium tracking-[-0.03em]">Copy the link</h3>
            <p className="caption-lg mt-3 text-muted">No sign-up. No wallet. Nothing to install.</p>
            <div className="mt-auto pt-8">
              <div className="caption mb-2 text-muted-3">Remote MCP server URL</div>
              <CopyUrl text={MCP_URL} />
            </div>
          </Reveal>
          <Reveal delay={0.05} className="card-white grid gap-6 p-5 sm:p-7 [&>*]:min-w-0 lg:col-span-2 lg:grid-cols-[0.8fr_1.2fr]">
            <AnimatePresence mode="wait">
              <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col">
                <div className="caption text-muted">Step 2</div>
                <h3 className="mt-3 text-[26px] font-medium tracking-[-0.03em]">{p.title}</h3>
                <p className="caption-lg mt-3 text-muted">{p.body}</p>
                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-8">
                  {p.crumbs.map((c, i) => (
                    <span key={c} className="flex items-center gap-1.5">
                      <span className="rounded-full bg-paper-3 px-3 py-1.5 text-[13px] font-medium">{c}</span>
                      {i < p.crumbs.length - 1 && <span className="text-muted-3">›</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div key={k}>{k === "claude" ? <ClaudeMock /> : <ChatGPTMock />}</div>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-6 rounded-[24px] bg-ink p-7 text-white lg:col-span-3 lg:grid-cols-2 lg:items-end">
            <div>
            <div className="caption text-white/50">Step 3</div>
            <h3 className="mt-3 text-[26px] font-medium tracking-[-0.03em]">Ask {ai} to make a coin</h3>
            <p className="caption-lg mt-3 text-white/70">Name + ticker. Add a 0x wallet to earn 50% of fees. Tap Launch. Live in ~10s.</p>
            </div>
            <div>
              <div className="ml-auto w-fit max-w-full rounded-[20px] rounded-br-md bg-white px-4 py-3 text-[15px] text-ink">
                launch Diamond Paws, ticker PAWS, fees to 0x9Wz4…mE2q
              </div>
              <div className="mt-3 flex items-center gap-2 text-[13px] text-white/60">
                {k === "claude" ? <ClaudeMark /> : <ChatGPTMark className="h-4 w-4 text-white" />} {ai} · using {BRAND.name}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
