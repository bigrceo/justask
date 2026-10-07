"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  text: string;
  /** Words to wrap in the yellow highlight. */
  highlight?: string[];
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** yellow: highlighter (default) · muted: grey word like the template's light sections · hero: italic yellow on dark */
  tone?: "yellow" | "muted" | "hero";
};

const word: Variants = {
  hidden: { y: "110%", opacity: 0, rotate: 2 },
  show: (i: { idx: number; delay: number; stagger: number }) => ({
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.5, delay: i.delay + i.idx * i.stagger, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Word-by-word entrance: each word rises out of a clipped line, like the template's headlines.
 * The viewport trigger sits on the whole heading (clipped words never intersect on their own).
 */
export function TextReveal({ text, highlight = [], as = "h2", className = "", delay = 0, stagger = 0.03, once = true, tone = "muted" }: Props) {
  const hlClass = tone === "yellow" ? "rounded-[0.18em] bg-highlight px-[0.08em] -mx-[0.08em]" : tone === "hero" ? "italic text-highlight pr-[0.04em]" : "text-muted";
  const Tag = as;
  const lines = text.split("\n");
  let i = 0;
  const nodes: ReactNode[] = lines.map((line, li) => {
    const words = line.split(" ");
    return (
      <span key={li} className="block">
        {words.map((w, wi) => {
          const idx = i++;
          const clean = w.replace(/[.,!?]/g, "");
          const hl = highlight.includes(clean);
          return (
            <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
              <motion.span
                variants={word}
                custom={{ idx, delay, stagger }}
                className={`inline-block ${hl ? hlClass : ""}`}
              >
                {w}
              </motion.span>
              {wi < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    );
  });
  return (
    <Tag className={className}>
      <motion.span className="block" initial="hidden" whileInView="show" viewport={{ once, amount: 0.15 }}>
        {nodes}
      </motion.span>
    </Tag>
  );
}
