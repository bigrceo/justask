"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BRAND, MCP_URL } from "@/lib/brand";
import { ChatGPTMark, ClaudeMark } from "@/components/ui/Brand";

function useTyping(texts: string[], go: boolean, key: string) {
  const reduce = useReducedMotion();
  const total = texts.reduce((a, t) => a + t.length, 0);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) { setN(total); return; }
    if (!go) return;
    setN(0);
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => { i++; setN(i); if (i >= total) clearInterval(id); }, 38);
      cleanup.push(() => clearInterval(id));
    }, 500);
    const cleanup: (() => void)[] = [() => clearTimeout(start)];
    return () => cleanup.forEach((f) => f());
  }, [go, total, reduce, key]);
  let left = n;
  const out = texts.map((t) => { const s = t.slice(0, Math.max(0, left)); left -= t.length; return s; });
  return { out, done: n >= total, active: texts.findIndex((t, i) => out[i].length < t.length) };
}

function Field({ label, value, active, mono, color, ring }: { label: string; value: string; active: boolean; mono?: boolean; color: string; ring: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium" style={{ color }}>{label}</span>
      <span className={`flex h-9 items-center overflow-hidden rounded-lg border bg-white px-3 text-[13px] ${mono ? "font-mono text-[12px]" : ""}`} style={{ borderColor: active ? ring : "#e5e2da", boxShadow: active ? `0 0 0 3px ${ring}22` : undefined }}>
        <span className={`truncate ${active ? "caret" : ""}`}>{value || <span className="opacity-35">{mono ? "https://" : ""}</span>}</span>
      </span>
    </label>
  );
}

export function ClaudeMock() {
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { amount: 0.3, once: true });
  const { out, done, active } = useTyping([BRAND.name, MCP_URL], go, "claude");
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[18px] border border-[#e8e4d8] bg-[#faf9f5] text-[#29261b]">
      <div className="flex items-center gap-1.5 border-b border-[#e8e4d8] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e8e4d8]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e8e4d8]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e8e4d8]" />
        <span className="ml-3 flex items-center gap-1.5 text-[12px] opacity-70"><ClaudeMark className="h-3.5 w-3.5" /> Settings</span>
      </div>
      <div className="flex min-h-[470px]">
        <ul className="hidden w-[140px] shrink-0 flex-col gap-0.5 border-r border-[#e8e4d8] p-3 text-[13px] sm:flex">
          {["General", "Account", "Privacy", "Billing", "Usage", "Capabilities", "Connectors"].map((x) => (
            <li key={x} className={`rounded-md px-2 py-1.5 ${x === "Connectors" ? "bg-[#f0eee6] font-medium" : "opacity-60"}`}>{x}</li>
          ))}
        </ul>
        <div className="relative flex-1 p-4">
          <div className="text-[15px] font-medium">Connectors</div>
          <div className="mt-1 text-[12px] opacity-60">Allow Claude to reference other apps and services.</div>
          <div className="mt-3 h-8 w-32 rounded-lg bg-[#f0eee6]" />
          <div className="absolute inset-0 flex items-center justify-center bg-[#29261b]/20 p-3 backdrop-blur-[1px]">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={go ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ duration: 0.35 }}
              className="w-full max-w-[340px] rounded-[14px] border border-[#e8e4d8] bg-[#faf9f5] p-4 shadow-xl">
              <div className="text-[15px] font-medium">Add custom connector</div>
              <div className="mt-1 text-[11.5px] opacity-60">Connect Claude to your data and tools.</div>
              <div className="mt-3 space-y-2.5">
                <Field label="Name" value={out[0]} active={active === 0 && go} color="#29261b" ring="#D97757" />
                <Field label="Remote MCP server URL" value={out[1]} active={active === 1 && go} mono color="#29261b" ring="#D97757" />
              </div>
              <div className="mt-3 text-[12.5px] font-medium">Authentication</div>
              <div className="mt-1.5 space-y-1.5 text-[12px]">
                {[["Sign in now", false], ["Sign in when needed", false], ["No sign-in", true]].map(([label, on]) => (
                  <div key={label as string} className={`flex items-center gap-2 ${on ? "" : "opacity-50"}`}>
                    <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${on ? "border-[#2c84db]" : "border-[#bdb8aa]"}`}>
                      {on && <motion.span initial={{ scale: 0 }} animate={done ? { scale: 1 } : { scale: 0 }} className="h-2 w-2 rounded-full bg-[#2c84db]" />}
                    </span>
                    {label as string}
                    {on && <motion.span initial={{ opacity: 0 }} animate={done ? { opacity: 1 } : {}} className="rounded bg-[#f0eee6] px-1.5 py-0.5 text-[10px] font-medium">Detected</motion.span>}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[11px] opacity-55">Leave request headers empty. No key needed.</div>
              <div className="mt-3 flex justify-end gap-2 text-[13px]">
                <span className="rounded-lg border border-[#e8e4d8] px-3 py-1.5">Cancel</span>
                <motion.span animate={done ? { scale: [1, 0.94, 1] } : {}} transition={{ delay: 0.4 }} className={`rounded-lg px-3 py-1.5 text-white transition-colors ${done ? "bg-[#29261b]" : "bg-[#29261b]/40"}`}>Add</motion.span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatGPTMock() {
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { amount: 0.3, once: true });
  const { out, done, active } = useTyping([BRAND.name, MCP_URL], go, "gpt");
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[18px] border border-[#ececec] bg-white text-[#0d0d0d]">
      <div className="flex items-center gap-1.5 border-b border-[#ececec] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" />
        <span className="ml-3 flex items-center gap-1.5 text-[12px] opacity-70"><ChatGPTMark className="h-3.5 w-3.5" /> Settings</span>
      </div>
      <div className="flex min-h-[330px]">
        <ul className="hidden w-[150px] shrink-0 flex-col gap-0.5 p-3 text-[13px] sm:flex">
          {["General", "Notifications", "Personalization", "Apps & Connectors", "Data controls", "Security", "Account"].map((x) => (
            <li key={x} className={`rounded-lg px-2 py-1.5 ${x === "Apps & Connectors" ? "bg-[#f4f4f4] font-medium" : "opacity-60"}`}>{x}</li>
          ))}
        </ul>
        <div className="relative flex-1 border-l border-[#ececec] p-4">
          <div className="text-[13px] opacity-60">Advanced settings</div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#f9f9f9] px-3 py-2 text-[13px]">
            Developer mode
            <span className="relative h-5 w-9 rounded-full bg-[#0d0d0d]"><span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" /></span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 p-3">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={go ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ duration: 0.35 }}
              className="w-full max-w-[340px] rounded-[16px] bg-white p-4 shadow-xl">
              <div className="text-[15px] font-semibold">New Connector</div>
              <div className="mt-3 space-y-2.5">
                <Field label="Name" value={out[0]} active={active === 0 && go} color="#0d0d0d" ring="#0d0d0d" />
                <Field label="MCP Server URL" value={out[1]} active={active === 1 && go} mono color="#0d0d0d" ring="#0d0d0d" />
                <div><span className="mb-1 block text-[12px] font-medium">Authentication</span><span className="flex h-9 items-center justify-between rounded-lg border border-[#e5e5e5] px-3 text-[13px]">No authentication <span className="opacity-40">⌄</span></span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px]"><span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${done ? "border-[#0d0d0d] bg-[#0d0d0d] text-white" : "border-[#ccc]"}`}>{done ? "✓" : ""}</span> I trust this application</div>
              <div className="mt-3 flex justify-end">
                <motion.span animate={done ? { scale: [1, 0.94, 1] } : {}} transition={{ delay: 0.4 }} className={`rounded-full px-4 py-1.5 text-[13px] text-white ${done ? "bg-[#0d0d0d]" : "bg-[#0d0d0d]/35"}`}>Create</motion.span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
