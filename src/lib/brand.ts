export const BRAND = {
  name: "Just Ask",
  ticker: "ASK",
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "justask.fun",
  x: process.env.NEXT_PUBLIC_X_HANDLE ?? "",
  holdBonus: 2_500_000,
  pair: "NVDA",
  tagline: "Robinhood Chain, plugged into your AI.",
  disclaimer: "Not affiliated with Anthropic or OpenAI. Claude is a trademark of Anthropic. ChatGPT is a trademark of OpenAI.",
  explorer: "https://robinhoodchain.blockscout.com",
} as const;

export const dexUrl = (ca: string) => `https://dexscreener.com/robinhood/${ca}`;
export const xUrl = (h: string) => (h ? (h.startsWith("http") ? h : `https://x.com/${h.replace(/^@/, "")}`) : "");

export const SITE_URL = `https://${BRAND.domain}`;
export const MCP_URL = `${SITE_URL}/mcp`;

/** Short public link for a coin: /c/ + the first 8 hex digits of its CA. */
export const coinShortUrl = (token: string) => `${SITE_URL}/c/${token.slice(2, 10).toLowerCase()}`;

export const shareText = (ticker: string) =>
  `I just launched $${ticker} on Robinhood Chain by asking my AI.\n\nOne sentence. No wallet, no code, free.`;

export const shareIntent = (ticker: string, token: string) =>
  `https://x.com/intent/tweet?text=${encodeURIComponent(shareText(ticker))}&url=${encodeURIComponent(coinShortUrl(token))}`;
