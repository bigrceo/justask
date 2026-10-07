import { BRAND } from "@/lib/brand";
import { SectionHead } from "@/components/ui/Section";
import { Accordion } from "@/components/motion/Accordion";
import { Reveal } from "@/components/motion/Reveal";

const t = `$${BRAND.ticker}`;
const ITEMS = [
  { q: "What does it cost?", a: `$0. ${BRAND.name} pays gas and the opening buy.` },
  { q: "Claude Free or paid ChatGPT?", a: "Claude Free works. ChatGPT needs Plus, Pro or Business (Developer mode)." },
  { q: "How do I get paid?", a: `Give a 0x wallet at launch: 50% of creator fees, 75% if it holds 2.5M ${t}.` },
  { q: "What chain, what pair?", a: "Robinhood Chain. Every coin is paired with tokenized NVDA." },
  { q: `What happens to the rest?`, a: `Every 10 minutes it buys ${t} and burns it. Each burn is in the log with its tx.` },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 bg-paper py-16 md:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionHead title="FAQ" />
        <Reveal><Accordion items={ITEMS} defaultOpen={null} /></Reveal>
      </div>
    </section>
  );
}
