import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

export function Kicker({ n, children, dark = false }: { n?: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`caption flex items-center gap-2 ${dark ? "text-white/60" : "text-muted"}`}>
      {n && <span className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 ${dark ? "bg-white/10" : "bg-paper-3 text-ink"}`}>{n}</span>}
      {children}
    </div>
  );
}

export function SectionHead({ n, kicker, title, highlight, body, center = false, dark = false }: { n?: string; kicker?: string; title: string; highlight?: string[]; body?: ReactNode; center?: boolean; dark?: boolean }) {
  return (
    <div className={center ? "mx-auto flex max-w-[900px] flex-col items-center text-center" : "grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"}>
      <div className={center ? "flex flex-col items-center" : ""}>
        {kicker && <Reveal><Kicker n={n} dark={dark}>{kicker}</Kicker></Reveal>}
        <TextReveal as="h2" text={title} highlight={highlight} className={`headline ${kicker ? "mt-5" : ""}`} tone="yellow" />
      </div>
      {body && <Reveal delay={0.2} className={`caption-lg max-w-[46ch] ${dark ? "text-white/55" : "text-muted"} ${center ? "mt-6" : "lg:justify-self-end lg:pb-2"}`}>{body}</Reveal>}
    </div>
  );
}

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />;
}
