"use client";

import { useState } from "react";
import { copyText } from "@/components/ui/Copy";

export function CopyCA({ ca }: { ca: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { await copyText(ca); setDone(true); setTimeout(() => setDone(false), 1400); }}
      className="group flex w-full items-center justify-between gap-3 rounded-[14px] bg-paper px-4 py-3 text-left transition-colors hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-ink">
      <span className="min-w-0">
        <span className="block text-[12px] text-muted">Contract address</span>
        <span className="mono block truncate text-[14px] text-ink">{ca}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-2">
        {done ? "Copied" : (<><svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M3 10V4a1 1 0 0 1 1-1h6" /></svg>Copy</>)}
      </span>
    </button>
  );
}
