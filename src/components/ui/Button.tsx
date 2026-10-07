import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline" | "white" | "outline-white" | "ghost-white";

type Common = { variant?: Variant; children: ReactNode; className?: string; arrow?: boolean; size?: "md" | "lg" | "sm" };
type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "children">;

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-[family-name:var(--font-abel)] uppercase tracking-[0.02em] transition-[background-color,color,transform,box-shadow] duration-300 will-change-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
const sizes = { sm: "h-9 px-4 text-[12px]", md: "h-11 px-6 text-[13px]", lg: "h-[52px] px-8 text-[14px]" };
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]",
  ghost: "bg-transparent text-ink hover:bg-paper-3",
  outline: "border border-line-2 bg-transparent text-ink hover:border-ink",
  white: "bg-white text-ink hover:bg-highlight",
  "outline-white": "border border-white/60 bg-transparent text-white hover:bg-white hover:text-ink",
  "ghost-white": "bg-transparent text-white hover:bg-white/10",
};

function Arrow() {
  return (
    <span className="relative ml-1 inline-flex h-3.5 w-3.5 items-center overflow-hidden" aria-hidden>
      <svg viewBox="0 0 14 14" className="absolute h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
      <svg viewBox="0 0 14 14" className="absolute h-3.5 w-3.5 -translate-x-4 transition-transform duration-300 group-hover:translate-x-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </span>
  );
}

/** Text that rolls up letter-by-letter on hover (the template's "READ MORE" effect). */
export function RollText({ text }: { text: string }) {
  return (
    <span className="relative inline-block overflow-hidden leading-none" aria-label={text}>
      <span className="block transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full" aria-hidden>
        {text}
      </span>
      <span className="absolute left-0 top-full block transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full" aria-hidden>
        {text}
      </span>
    </span>
  );
}

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", children, className = "", arrow = true, size = "md", ...rest } = props;
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (typeof rest.href === "string") {
    const { href, ...linkRest } = rest as Omit<AsLink, keyof Common>;
    return (
      <Link href={href} className={cls} {...linkRest}>
        <span>{children}</span>
        {arrow && <Arrow />}
      </Link>
    );
  }
  const { href: _ignored, ...buttonRest } = rest as Omit<AsButton, keyof Common>;
  void _ignored;
  return (
    <button className={cls} {...buttonRest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}
