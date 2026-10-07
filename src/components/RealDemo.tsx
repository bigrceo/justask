"use client";
/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ClaudeMark } from "@/components/ui/Brand";

/**
 * The real product, from real screenshots of a $PAWS launch in Claude:
 * ask → review card → picture added, tap Launch → live → public coin page. Loops.
 */
const STEPS = [
  { label: "Ask", ms: 1600 },
  { label: "Review", ms: 2000 },
  { label: "Tap Launch", ms: 2400 },
  { label: "Live", ms: 3000 },
  { label: "Share", ms: 3200 },
] as const;

const ease = [0.22, 0.7, 0.2, 1] as const;

export function RealDemo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEPS[step].ms);
    return () => clearTimeout(t);
  }, [step, inView, reduce]);

  return (
    <div ref={ref} className={className}>
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#262624] shadow-[0_30px_80px_-20px_rgba(0,0,0,.45)]">
        {/* Claude window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[.07] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 flex items-center gap-1.5 text-[12px] text-white/60">
            <ClaudeMark className="h-3.5 w-3.5" /> Launching Diamond Paws
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/[.06] px-2 py-0.5 text-[10.5px] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> real recording
          </span>
        </div>

        <div className="relative aspect-[1070/760] w-full">
          <AnimatePresence mode="popLayout" initial={false}>
            {step < 4 ? (
              <motion.div key="chat" className="absolute inset-0 flex flex-col gap-[3%] p-[3%]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease }}>
                <motion.img src="/demo/prompt.webp" alt="launch Diamond Paws, ticker PAWS, fees to 0x9098…Fa88"
                  className="ml-auto w-[55%] rounded-[10px]"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }} />
                {step === 0 && (
                  <motion.div className="flex items-center gap-2 text-[12.5px] text-white/55"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <ClaudeMark className="h-4 w-4 animate-spin [animation-duration:2.4s]" /> Claude is using Just Ask…
                  </motion.div>
                )}
                <div className="relative w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    {step >= 1 && (
                      <motion.img key={step === 1 ? "review" : step === 2 ? "ready" : "live"}
                        src={step === 1 ? "/demo/review.webp" : step === 2 ? "/demo/ready.webp" : "/demo/live.webp"}
                        alt={step === 3 ? "$PAWS live on Robinhood Chain" : "Just Ask review card"}
                        className="w-full rounded-[12px]"
                        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.4, ease }} />
                    )}
                  </AnimatePresence>
                  {step === 2 && <Tap />}
                  {step === 3 && <Confetti />}
                </div>
              </motion.div>
            ) : (
              <motion.div key="page" className="absolute inset-0 bg-[#f7f6f2] p-[3%]"
                initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] text-black/50 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> getjustask.com/c/a1bb4a10
                </div>
                <motion.img src="/demo/page.webp" alt="Public $PAWS coin page" className="mt-[3%] w-full rounded-[10px] shadow-md"
                  initial={{ y: 0 }} animate={{ y: "-6%" }} transition={{ duration: 3, ease: "linear" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step rail */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {STEPS.map((s, i) => (
          <button key={s.label} type="button" onClick={() => setStep(i)}
            className={`rounded-full px-2.5 py-1 text-[11.5px] transition-colors ${i === step ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
            {i + 1}. {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A cursor that taps the Launch button on the ready card. */
function Tap() {
  return (
    <motion.div className="pointer-events-none absolute left-[52%] top-[68%]"
      initial={{ opacity: 0, x: 40, y: 30 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease }}>
      <motion.span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-white/40"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.6], opacity: [0.8, 0] }} transition={{ duration: 0.6, delay: 1.4 }} />
      <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
        <path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  const colors = ["#fff27a", "#22c55e", "#f4f4f5", "#D97757"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((i) => (
        <motion.i key={i} className="absolute top-0 block h-2.5 w-1.5 rounded-[2px]"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length] }}
          initial={{ y: -10, opacity: 1, rotate: 0 }} animate={{ y: 260, opacity: 0, rotate: 420 }}
          transition={{ duration: 1.4, delay: (i % 7) * 0.05, ease: [0.2, 0.6, 0.4, 1] }} />
      ))}
    </div>
  );
}
