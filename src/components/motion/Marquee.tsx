import type { ReactNode } from "react";

type Props = { children: ReactNode; speed?: number; className?: string; reverse?: boolean };

/** Infinite horizontal scroll (logo strip in the template). Content is duplicated for a seamless loop. */
export function Marquee({ children, speed = 40, className = "", reverse = false }: Props) {
  return (
    <div className={`relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] ${className}`}>
      <div
        className="flex w-max items-center gap-12 pr-12"
        style={{ animation: `marquee ${speed}s linear infinite ${reverse ? "reverse" : ""}` }}
      >
        <div className="flex items-center gap-12">{children}</div>
        <div className="flex items-center gap-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
