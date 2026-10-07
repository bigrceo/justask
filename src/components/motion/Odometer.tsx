"use client";

import { useInView } from "motion/react";
import { useMemo, useRef } from "react";

type Props = {
  value: number | null | undefined;
  className?: string;
  suffix?: string;
  prefix?: string;
  /** Digits after the decimal point. */
  decimals?: number;
  /** Compact large numbers (23.8K) like the original stat tiles. */
  compact?: boolean;
  duration?: number;
};

const DIGIT_H = 1; // em

function Column({ digit, delay }: { digit: string; delay: number }) {
  if (!/\d/.test(digit)) {
    return <span className="inline-block">{digit}</span>;
  }
  const n = Number(digit);
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ height: `${DIGIT_H}em`, lineHeight: `${DIGIT_H}em` }}>
      <span
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${n * DIGIT_H}em)`,
          transition: `transform 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ height: `${DIGIT_H}em`, lineHeight: `${DIGIT_H}em` }} className="block tabular-nums">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Rolling-digit counter: every digit is a wheel that spins into place when the number scrolls into view. */
export function Odometer({ value, className = "", suffix = "", prefix = "", decimals = 0, compact = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const target = useMemo(() => {
    if (value == null) return "0";
    let text: string;
    let unit = "";
    if (compact && Math.abs(value) >= 1000) {
      const units = ["", "K", "M", "B"];
      let v = value;
      let u = 0;
      while (Math.abs(v) >= 1000 && u < units.length - 1) {
        v /= 1000;
        u++;
      }
      text = v.toFixed(Math.abs(v) < 10 ? 1 : 0);
      unit = units[u];
    } else {
      text = value.toFixed(decimals);
    }
    return text + unit;
  }, [value, decimals, compact]);
  const shown = inView ? target : target.replace(/\d/g, "0");

  const chars = Array.from(shown);
  return (
    <span ref={ref} className={`inline-flex items-baseline tabular-nums ${className}`} aria-label={`${prefix}${shown}${suffix}`}>
      {prefix && <span>{prefix}</span>}
      {chars.map((c, i) => (
        <Column key={`${i}-${chars.length}`} digit={c} delay={i * 70} />
      ))}
      {suffix && <span className="ml-[0.08em] text-[0.45em] font-normal text-muted-2">{suffix}</span>}
    </span>
  );
}
