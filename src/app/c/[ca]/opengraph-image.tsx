import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { getCoin } from "@/components/coin/getCoin";
import { fmtPct, fmtUsd } from "@/components/format";

export const alt = "Coin launched with Just Ask";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

const FEATHER = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTUuODcgMTQ5LjUzIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzA1MDYwOTtzdHJva2Utd2lkdGg6MHB4O308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0uODYsMTQ5LjUzaDMuM2MuNiwwLDEuMi0uMywxLjQtLjhDMzAuNDYsODUuMzMsNTcuNTYsNTMuOTMsNzQuNTYsMzUuMTNjLjctLjguNC0xLjQtLjYtMS40aC0zMC40Yy0xLjEsMC0yLjAzLjQ0LTIuOCwxLjRsLTIxLjgsMjdjLTMuMiw0LTQsNy43LTQsMTN2MjcuNkM3Ljg2LDEyMi42MywzLjM2LDEzNi4xMy4wNiwxNDguMzNjLS4yLjc4LjEsMS4yLjgsMS4yWk0xMTAuNTYsNC4wM2MtNC43LTUtMjUuOS01LjItMzUuNy0xLjQtMi4wNC43OS00LDIuMTMtNC45LDIuOS05LDcuNy0xNSwxMy44LTIwLjcsMTkuOC0uNy43LS40LDEuNC42LDEuNGgzMy43YzMuMSwwLDQuOSwxLjgsNC45LDQuOXYzOGMwLDEsLjgsMS4zLDEuNC40bDIwLjMtMjYuNWMzLjMtNC4zLDQuMy01LjYsNS4yLTExLjYsMS4yLTguOC41LTIyLjMtNC44LTI3LjlabS00My41LDEwMC44bDEzLjktMjIuOWMuMy0uNi40LTEuMy40LTEuOHYtMzguMmMwLTEtLjctMS40LTEuNC0uNi0yMC45LDIzLjMtMzcuMiw0Ny44LTUyLjMsNzcuMy0uMzguNzQuMSwxLjQsMSwxLjFsMzEuMi05LjZjMy41Mi0xLjA4LDUuNS0yLjUsNy4yLTUuM1oiLz48L3N2Zz4=";

async function imageData(url?: string | null) {
  if (!url) return null;
  try {
    const r = await fetch(url);
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !type.startsWith("image/")) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (/image\/(png|jpe?g|gif)/.test(type)) return `data:${type};base64,${buf.toString("base64")}`;
    // WebP, AVIF…: the OG renderer can't read them, so redraw as PNG.
    const sharp = (await import("sharp")).default;
    const png = await sharp(buf).resize(512, 512, { fit: "cover" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

function Mark({ s = 44 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#050609" />
      <path d="M16 6c-5.8 0-10.4 4.1-10.4 9.2 0 2.7 1.3 5.2 3.5 6.9l-.9 3.7c-.2.6.5 1.1 1.1.7l3.8-2.4c.9.2 1.9.3 2.9.3 5.8 0 10.4-4.1 10.4-9.2S21.8 6 16 6z" fill="#fff" />
      <path d="M16 10.2l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" fill="#050609" />
    </svg>
  );
}

export default async function OG({ params }: { params: Promise<{ ca: string }> }) {
  const { ca } = await params;
  const c = await getCoin(ca);
  const img = await imageData(c?.image);
  const up = (c?.changePct ?? 0) >= 0;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(120deg, #f7f6f3 0%, #f7f6f3 45%, #fffbc4 100%)", color: "#050609", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}><Mark /> {BRAND.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, background: "#fff", borderRadius: 999, padding: "10px 22px", border: "1px solid #ececec" }}>
              <img src={FEATHER} width={20} height={26} alt="" /> Robinhood Chain
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            {img ? <img src={img} width={260} height={260} style={{ borderRadius: 56, objectFit: "cover" }} alt="" />
              : <div style={{ width: 260, height: 260, borderRadius: 56, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96 }}>{(c?.ticker ?? "?").slice(0, 2)}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 84, letterSpacing: -3, lineHeight: 1, maxWidth: 760, display: "flex" }}>{c?.name ?? "Coin not found"}</div>
              <div style={{ fontSize: 44, color: "#4b4f55", display: "flex" }}>{c ? `$${c.ticker}` : ""}</div>
              {c && (
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
                  <div style={{ fontSize: 52, letterSpacing: -2, display: "flex" }}>{fmtUsd(c.mcapUsd)}</div>
                  <div style={{ fontSize: 28, padding: "8px 18px", borderRadius: 999, background: up ? "#e6f6ec" : "#fdeceb", color: up ? "#1f7a45" : "#c2342c", display: "flex" }}>{fmtPct(c.changePct)}</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#050609", color: "#fff", borderRadius: 999, padding: "14px 26px" }}>
              <Mark s={30} /> Launched by asking AI · {BRAND.name}
            </div>
            <div style={{ display: "flex", color: "#4b4f55" }}>{BRAND.domain}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
