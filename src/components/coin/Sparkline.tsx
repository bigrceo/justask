export function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const w = 600, h = 140, pad = 6;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [pad + (i / (points.length - 1)) * (w - pad * 2), h - pad - ((p - min) / span) * (h - pad * 2)]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const color = up ? "#1f9d55" : "#e5483f";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-28 w-full md:h-36" aria-label="Recent market cap">
      <defs><linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.18" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w - pad} ${h} L${pad} ${h} Z`} fill="url(#sparkfill)" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
