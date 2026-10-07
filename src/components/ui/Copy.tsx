"use client";

import { useEffect, useState } from "react";

const EVT = "justask:copied";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch {}
    ta.remove();
  }
  window.dispatchEvent(new Event(EVT));
}

export function Toast() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = () => { setN((v) => v + 1); clearTimeout(t); t = setTimeout(() => setN(0), 2200); };
    window.addEventListener(EVT, on);
    return () => { window.removeEventListener(EVT, on); clearTimeout(t); };
  }, []);
  if (!n) return null;
  return (
    <div
      key={n}
      role="status"
      className="caption fixed bottom-6 left-1/2 z-[90] whitespace-nowrap rounded-full bg-ink px-5 py-3 text-white shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]"
      style={{ animation: "toast-in .45s cubic-bezier(.16,1,.3,1) both" }}
    >
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-highlight align-middle" />
      Copied · now paste it in your AI
    </div>
  );
}

export function CopyUrl({ text, className = "", dark = false }: { text: string; className?: string; dark?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-full border py-2 pl-5 pr-2 ${dark ? "border-white/15 bg-white/5" : "border-line bg-white"} ${className}`}>
      <code className={`mono min-w-0 flex-1 truncate text-[14px] ${dark ? "text-white" : "text-ink-2"}`}>{text}</code>
      <button
        type="button"
        onClick={async () => { await copyText(text); setDone(true); setTimeout(() => setDone(false), 1600); }}
        className={`caption h-10 shrink-0 rounded-full px-5 transition-colors ${dark ? "bg-white text-ink hover:bg-highlight" : "bg-ink text-white hover:bg-ink-2"}`}
      >
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
