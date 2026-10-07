"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MCP_URL } from "@/lib/brand";
import { GITHUB_URL } from "@/lib/brand";
import { ChatGPTMark, ClaudeMark, Logo, Wordmark } from "@/components/ui/Brand";
import { CaChip } from "@/components/hero/AskBlock";
import { copyText } from "@/components/ui/Copy";

const LINKS = [
  { href: "/#setup", label: "Setup" },
  { href: "/#fees", label: "Fees" },
  { href: "/#coins", label: "Coins" },
  { href: "/#burns", label: "Burns" },
  { href: "/explore", label: "Explore" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  const pathname = usePathname();
  const [section, setSection] = useState("");
  useEffect(() => {
    if (pathname !== "/") { setSection(""); return; }
    const ids = ["setup", "fees", "coins", "burns"];
    const on = () => {
      const mid = window.innerHeight * 0.45;
      const hit = ids.find((id) => { const r = document.getElementById(id)?.getBoundingClientRect(); return r && r.top <= mid && r.bottom >= mid; });
      setSection(hit ?? "");
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);
  const isActive = (href: string) => (href === "/explore" ? pathname.startsWith("/explore") : pathname === "/" && href === `/#${section}`);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:pt-5">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={`pointer-events-auto w-full overflow-hidden rounded-[26px] bg-ink text-white shadow-[0_18px_50px_-20px_rgba(0,0,0,0.55)] transition-[max-width] duration-500 ${scrolled ? "max-w-[940px]" : "max-w-[1000px]"}`}
      >
        <div className="flex h-[52px] items-center justify-between gap-2 pl-4 pr-1.5 sm:pl-5">
          <Link href="/" aria-label="Home" className="shrink-0"><span className="sm:hidden"><Logo light size={24} /></span><span className="hidden sm:block"><Wordmark light /></span></Link>
          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "true" : undefined} className={`relative rounded-full px-3 py-1.5 text-[14px] transition-colors ${isActive(l.href) ? "text-ink" : "text-white/70 hover:text-white"}`}>{isActive(l.href) && <motion.span layoutId="navActive" className="absolute inset-0 rounded-full bg-highlight" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}<span className="relative">{l.label}</span></Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Just Ask on GitHub" title="Open source on GitHub"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 16 16" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <CaChip dark compact />
            {(["claude", "chatgpt"] as const).map((ai) => (
              <button key={ai} type="button" aria-label={`Add to ${ai === "claude" ? "Claude" : "ChatGPT"}`}
                onClick={() => { copyText(MCP_URL); window.dispatchEvent(new CustomEvent("setup-tab", { detail: ai })); document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" }); }}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13.5px] font-semibold transition-colors sm:px-3.5 ${ai === "claude" ? "bg-white text-ink hover:bg-highlight" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {ai === "claude" ? <ClaudeMark className="h-4 w-4" /> : <ChatGPTMark className="h-4 w-4 text-white" />}
                <span className="hidden sm:inline">Add to {ai === "claude" ? "Claude" : "ChatGPT"}</span>
              </button>
            ))}
            <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 lg:hidden">
              <span className="relative block h-3.5 w-4">
                <motion.span className="absolute left-0 top-0 block h-[1.5px] w-4 bg-white" animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} />
                <motion.span className="absolute left-0 top-[6px] block h-[1.5px] w-4 bg-white" animate={{ opacity: open ? 0 : 1 }} />
                <motion.span className="absolute left-0 top-[12px] block h-[1.5px] w-4 bg-white" animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} />
              </span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden px-4 lg:hidden"
            >
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.04 }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-3 rounded-xl px-2 py-2 hover:bg-white/10">
                    <span className="caption text-white/40">0{i + 1}</span>
                    <span className="text-[22px] font-medium tracking-[-0.03em]">{l.label}</span>
                  </Link>
                </motion.li>
              ))}
              <li className="h-3" />
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
