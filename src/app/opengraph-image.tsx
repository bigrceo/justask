import { ImageResponse } from "next/og";
import { BRAND, MCP_URL } from "@/lib/brand";

export const alt = `${BRAND.name} · Robinhood Chain, plugged into your AI`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f6f3", padding: 72, fontFamily: "sans-serif", color: "#050609" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34 }}>
          <svg width="60" height="60" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#050609" /><path d="M16 6c-5.8 0-10.4 4.1-10.4 9.2 0 2.7 1.3 5.2 3.5 6.9l-.9 3.7c-.2.6.5 1.1 1.1.7l3.8-2.4c.9.2 1.9.3 2.9.3 5.8 0 10.4-4.1 10.4-9.2S21.8 6 16 6z" fill="#fff" /><path d="M16 10.2l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" fill="#050609" /></svg>
          {BRAND.name} · ${BRAND.ticker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, letterSpacing: -4, lineHeight: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="62" height="80" viewBox="0 0 115.87 149.53"><path fill="#050609" d="Layer_1" /></svg>
            Robinhood Chain,
          </div>
          <div style={{ display: "flex" }}><span style={{ background: "#fffdbd", padding: "0 10px" }}>plugged</span>&nbsp;into your AI.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#4b4f55" }}><span>Just ask Claude or ChatGPT to launch it.</span><span style={{ background: "#050609", color: "#fff", borderRadius: 999, padding: "14px 26px" }}>{MCP_URL.replace("https://", "")}</span></div>
      </div>
    ),
    size,
  );
}
