import { BRAND } from "@/lib/brand";
import { SectionHead } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

const t = `$${BRAND.ticker}`;
const ROWS = [
  { k: "Default", you: 50, note: "Paid to your wallet as people trade. Nothing to claim." },
  { k: `Hold 2.5M ${t}`, you: 75, note: "Checked once, at launch. Locked forever after." },
  { k: "No wallet", you: 0, note: `Every fee buys ${t} and burns it.` },
];

export function Fees() {
  return (
    <section id="fees" className="scroll-mt-20 py-16 md:py-24">
      <div className="container">
        <SectionHead title="Every trade pays you." highlight={["pays", "you."]} body={`Your split is set at launch and can't be changed, by anyone. Our share buys ${t} and burns it every 10 minutes.`} />
        <Reveal className="mt-10 flex flex-col gap-2.5">
          {ROWS.map((r) => (
            <div key={r.k} className="grid items-center gap-3 rounded-[20px] border border-line bg-white p-3 md:grid-cols-[170px_1fr_300px] md:p-4">
              <div className="px-1 text-[15px] font-semibold">{r.k}</div>
              <div className="flex h-12 gap-1 overflow-hidden rounded-[12px] text-[14px] font-semibold">
                {r.you > 0 && <div className="flex items-center justify-between bg-ink px-3 text-white" style={{ width: `${r.you}%` }}><span>{r.you}%</span><span className="hidden font-normal text-white/60 sm:inline">you</span></div>}
                <div className="flex flex-1 items-center justify-between bg-highlight px-3"><span>{100 - r.you}%</span><span className="font-normal text-ink-2">{t} burn</span></div>
              </div>
              <div className="px-1 text-[14px] text-muted">{r.note}</div>
            </div>
          ))}
        </Reveal>
        <p className="mt-5 text-[14px] text-muted">Check any coin: ask your AI to run <code className="mono rounded-md bg-paper-3 px-1.5 py-0.5 text-ink">coin_status</code>.</p>
      </div>
    </section>
  );
}
