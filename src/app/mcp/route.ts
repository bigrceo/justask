import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { formatUnits, getAddress } from "viem";
import { BRAND, SITE_URL } from "@/lib/brand";
import { ADDR, erc20Abi, publicClient } from "@/lib/chain";
import { launchCoin, userBpsFor } from "@/lib/launch";
import { createReview, getReview, markReviewLaunched, pictureUrl } from "@/server/pictures";
import { coinByToken, coinDetail, coinsByWallet, listCoins } from "@/server/coins";
import { clientIp } from "@/server/http";
import { liveMarket } from "@/server/market";
import { picturePanelHtml } from "@/server/picturePanel";
import { coinCardHtml, listCardHtml } from "@/server/coinCard";
import { appCsp } from "@/server/appShell";
import { ICON_PNG } from "@/server/brandIcon";

export const maxDuration = 120;

const PANEL_URI = "ui://justask/picture-v2.html";
const CARD_URI = "ui://justask/coin-v3.html";
const LIST_URI = "ui://justask/list-v1.html";
// ChatGPT's Apps SDK reads its own template format; same cards, served under a second URI.
const GPT = (uri: string) => uri.replace(".html", ".gpt.html");
const GPT_MIME = "text/html+skybridge";
const APP_MIME = "text/html;profile=mcp-app";
const launchInput = z.object({
  name: z.string().min(1).max(32).describe("The coin's name, up to 32 characters."),
  ticker: z.string().min(1).max(10).regex(/^\$?[A-Za-z0-9]+$/).describe("The ticker without $, up to 10 letters or numbers."),
  description: z.string().max(400).optional().describe("Optional. One or two plain sentences, only if the user gave lore or a description."),
  picture_id: z.string().optional().describe("The id from the Just Ask picture panel, like pic_…"),
  image_url: z.string().url().optional().describe("A direct link to the coin's picture, if the user gave one."),
  x: z.string().url().optional().describe("Optional. The coin's X (Twitter) link."),
  website: z.string().url().optional().describe("Optional. The coin's website."),
  wallet: z.string().optional().describe(`Optional. The user's EVM wallet address (0x…). It gets 50% of the coin's creator fees, or 75% if it holds at least ${BRAND.holdBonus.toLocaleString("en-US")} $${BRAND.ticker}, locked on chain.`),
});

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const scan = (kind: "token" | "tx", v: string) => `https://robinhoodchain.blockscout.com/${kind}/${v}`;

const handler = createMcpHandler(
  (server) => {
    server.registerResource(
      "picture-panel",
      PANEL_URI,
      { title: "Just Ask picture panel", mimeType: "text/html;profile=mcp-app" },
      async (uri) => ({
        contents: [{
          uri: uri.href,
          mimeType: "text/html;profile=mcp-app",
          text: picturePanelHtml(),
          _meta: { ui: { prefersBorder: false, csp: appCsp } },
        }],
      }),
    );

    server.registerResource(
      "coin-card",
      CARD_URI,
      { title: "Just Ask coin card", mimeType: APP_MIME },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: APP_MIME, text: coinCardHtml(SITE_URL), _meta: { ui: { prefersBorder: false, csp: appCsp } } }],
      }),
    );

    server.registerResource(
      "coin-list",
      LIST_URI,
      { title: "Just Ask coin list", mimeType: APP_MIME },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: APP_MIME, text: listCardHtml(SITE_URL), _meta: { ui: { prefersBorder: false, csp: appCsp } } }],
      }),
    );

    for (const [name, uri, html] of [["coin-card", CARD_URI, coinCardHtml(SITE_URL)], ["coin-list", LIST_URI, listCardHtml(SITE_URL)]] as const) {
      server.registerResource(`${name}-gpt`, GPT(uri), { title: `Just Ask ${name}`, mimeType: GPT_MIME }, async (u) => ({
        contents: [{
          uri: u.href, mimeType: GPT_MIME, text: html,
          _meta: { "openai/widgetCSP": { connect_domains: [SITE_URL], resource_domains: [SITE_URL, "https:"] }, "openai/widgetPrefersBorder": false },
        }],
      }));
    }

    server.registerTool(
      "review_launch",
      {
        title: "Review a coin launch",
        description:
          "Shows the user a Just Ask card to review a coin before it launches: picture, name, ticker and fee split, with a Launch button. " +
          "Nothing is launched by this tool: the coin goes live only when the user taps Launch on the card. " +
          "This is the default way to launch: call it as soon as the user asks to launch, create or deploy a coin and you have a name and a ticker. " +
          "The picture is optional here (the card lets the user pick one). Ask once for an EVM wallet (0x…) for the creator fees if none was given, but don't block on it. Never make up an address. " +
          "After the card is shown, tell the user in one short line to add a picture if needed and tap Launch. If they say go / launch it in the chat instead, call launch_coin with the review_id.",
        inputSchema: launchInput,
        annotations: { readOnlyHint: true },
        _meta: { ui: { resourceUri: CARD_URI }, "openai/outputTemplate": GPT(CARD_URI), "openai/widgetAccessible": true },
      },
      async (input) => {
        const ticker = input.ticker.replace(/^\$/, "").toUpperCase();
        const wallet = input.wallet && /^0x[0-9a-fA-F]{40}$/.test(input.wallet) ? getAddress(input.wallet) : null;
        if (input.wallet && !wallet) return { ...text("That wallet isn't a valid address. It should start with 0x and have 42 characters."), isError: true };
        const image = input.picture_id ? await pictureUrl(input.picture_id) : input.image_url ?? null;
        const userBps = await userBpsFor(wallet).catch(() => (wallet ? 5000 : 0));
        const reviewId = await createReview({ ...input, ticker }, image);
        return {
          structuredContent: {
            kind: "review", reviewId, name: input.name, ticker, description: input.description, image, wallet, userBps, site: SITE_URL,
            args: { review_id: reviewId },
          },
          ...text(
            `Review card shown for ${input.name} ($${ticker}), review_id ${reviewId}. ` +
            (image ? "" : "No picture yet: the user can add one on the card. ") +
            (wallet ? `${userBps / 100}% of fees go to ${wallet}. ` : "No wallet: all fees go to the $ASK burn. ") +
            "The coin launches when the user taps Launch on the card. If the user instead says go / launch it in the chat, call launch_coin with just this review_id: it picks up the picture they added on the card.",
          ),
        };
      },
    );

    server.registerTool(
      "my_coins",
      {
        title: "My Just Ask coins",
        description: "Lists the coins launched with Just Ask whose creator fees go to a wallet, with what each has earned. Read-only: call it right away when the user asks for their coins or earnings.",
        inputSchema: z.object({ wallet: z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("The user's EVM wallet (0x…).") }),
        annotations: { readOnlyHint: true },
        _meta: { ui: { resourceUri: LIST_URI }, "openai/outputTemplate": GPT(LIST_URI) },
      },
      async ({ wallet }) => {
        const coins = await coinsByWallet(wallet);
        const total = coins.reduce((a, c) => a + c.paidUsd, 0);
        return {
          structuredContent: { kind: "mine", title: `Coins of ${wallet.slice(0, 6)}…${wallet.slice(-4)}`, coins, site: SITE_URL },
          ...text(coins.length ? `${coins.length} coin(s), $${total.toFixed(2)} earned: ` + coins.map((c) => `$${c.ticker} (${c.token})`).join(", ") : "No coins launched from this wallet yet."),
        };
      },
    );

    server.registerTool(
      "top_coins",
      {
        title: "Top Just Ask coins",
        description: "Shows the top coins made with Just Ask right now (or the newest). Read-only: call it right away when the user asks what's trending, the top or the latest coins.",
        inputSchema: z.object({ sort: z.enum(["top", "new"]).default("top"), limit: z.number().int().min(1).max(20).default(8) }),
        annotations: { readOnlyHint: true },
        _meta: { ui: { resourceUri: LIST_URI }, "openai/outputTemplate": GPT(LIST_URI) },
      },
      async ({ sort, limit }) => {
        const coins = await listCoins(sort, limit);
        return {
          structuredContent: { kind: sort, title: sort === "new" ? "Newest coins" : "Top coins", coins, site: SITE_URL },
          ...text(coins.length ? coins.map((c, i) => `${i + 1}. $${c.ticker} · $${Math.round(c.mcapUsd).toLocaleString("en-US")} · ${c.token}`).join("\n") : "No coins yet."),
        };
      },
    );

    server.registerTool(
      "ping",
      {
        title: "Ping Just Ask",
        description: "Checks that Just Ask is connected. Use when the user asks to test, check or ping Just Ask.",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
      },
      async () => text(`Just Ask is connected. Ask me to launch a coin on Robinhood Chain: give it a name, a ticker and a picture.`),
    );

    server.registerTool(
      "launch_coin",
      {
        title: "Launch a coin with Just Ask",
        description:
          "Launches a coin right away. Always start with review_launch, which shows the user a card with a Launch button. Call launch_coin only after that, when the user says go in the chat: pass the review_id from review_launch and nothing else (it carries the name, ticker, wallet and the picture added on the card). " +
          "Launches a new coin on Robinhood Chain with Just Ask, through the Karat launchpad, paired with the NVDA stock token. " +
          "The user needs no wallet: Just Ask creates the coin and pays for it. Use when the user asks to launch or deploy a coin. " +
          "Needs a name, a ticker and a picture: the one added on the review card (pass review_id), or `image_url`, a direct link to an image. " +
          "A description is optional: only pass one if the user gave lore or a description. An X (Twitter) link goes in `x`, any other link in `website`. " +
          `Fees: if the user gives an EVM wallet address (0x…) in \`wallet\`, 50% of the coin's creator fees go to it, written into the coin on chain for good and paid automatically as it trades. ` +
          `If that wallet holds at least ${BRAND.holdBonus.toLocaleString("en-US")} $${BRAND.ticker} when the coin launches, its share is 75% instead; Just Ask checks this itself at launch. ` +
          "If the user hasn't given one, ask once before launching whether they want to add a wallet address for that; it's optional, and without one Just Ask keeps the fees and burns them. Never make up an address. " +
          "Show the user the name, ticker, picture and wallet (or that there's none) and confirm before calling: a launch can't be undone, and the fee split can never be changed.",
        inputSchema: launchInput.partial({ name: true, ticker: true }).extend({
          review_id: z.string().optional().describe("The review_id returned by review_launch. Pass it alone: name, ticker, wallet and picture come from the review."),
        }),
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
        _meta: { ui: { resourceUri: CARD_URI, visibility: ["model", "app"] }, "openai/outputTemplate": GPT(CARD_URI), "openai/widgetAccessible": true },
      },
      async (input, ctx) => {
        const req = ctx.http?.req;
        try {
          let args = input as typeof input & { name: string; ticker: string };
          if (input.review_id) {
            const rev = await getReview(input.review_id);
            if (!rev) throw new Error("That review expired. Ask me to review the launch again.");
            if (rev.token) throw new Error(`This coin is already live: ${rev.token}`);
            args = { ...(rev.args as typeof args), ...(rev.image ? { image_url: rev.image, picture_id: undefined } : {}) };
          }
          if (!args.name || !args.ticker) throw new Error("A name and a ticker are needed. Start with review_launch.");
          const r = await launchCoin(args, {
            ip: req ? clientIp(req) : undefined,
            client: req?.headers.get("user-agent")?.slice(0, 120),
          });
          if (input.review_id) await markReviewLaunched(input.review_id, r.token);
          const share = r.wallet ? `${r.userBps / 100}% of its creator fees go to ${r.wallet}, locked on chain.` : "No wallet was given, so its creator fees go to the $ASK burn.";
          const live = await liveMarket(r.poolId);
          return {
            structuredContent: {
              kind: "launch", token: r.token, name: args.name, ticker: r.ticker, image: r.image, wallet: r.wallet,
              userBps: r.userBps, mcapUsd: live?.mcapUsd ?? 0, changePct: 0, paidUsd: 0, spark: [], site: SITE_URL,
            },
            ...text(
            `$${r.ticker} is live on Robinhood Chain.\nCA: ${r.token}\nTrade it: ${SITE_URL}/explore\nToken: ${scan("token", r.token)}\nLaunch tx: ${scan("tx", r.tx)}\n${share}`,
            ),
          };
        } catch (e) {
          return { ...text(`The launch didn't go through: ${(e as Error).message}`), isError: true };
        }
      },
    );

    server.registerTool(
      "coin_status",
      {
        title: "Check a Just Ask coin",
        description: "Checks a coin launched with Just Ask: that it exists, how its creator fees are split (locked on chain) and what the launcher's wallet has been paid. Read-only and free: call it right away whenever the user asks to check, look up or get the status of a coin or a CA, without asking for confirmation first.",
        inputSchema: z.object({ ca: z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("The coin's contract address (CA).") }),
        annotations: { readOnlyHint: true },
        _meta: { ui: { resourceUri: CARD_URI }, "openai/outputTemplate": GPT(CARD_URI) },
      },
      async ({ ca }) => {
        const c = await coinByToken(ca);
        if (!c) return text(`${ca} wasn't launched with Just Ask.`);
        const live = await liveMarket(c.pool_id);
        const pending = await publicClient
          .readContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "balanceOf", args: [c.splitter as `0x${string}`] })
          .catch(() => 0n);
        const split = c.wallet ? `${c.user_bps / 100}% to ${c.wallet}, ${100 - c.user_bps / 100}% to the $ASK burn` : "100% to the $ASK burn (no wallet given)";
        return {
          structuredContent: { kind: "status", ...(await coinDetail(c.token)), site: SITE_URL },
          ...text(
          [
            `$${c.ticker} (${c.name}) · ${scan("token", c.token)}`,
            `Market cap: ${live ? `$${Math.round(live.mcapUsd).toLocaleString("en-US")}` : "unknown"} · ${live ? `${live.changePct.toFixed(1)}% since launch` : ""}`,
            `Creator fees split, locked on chain: ${split}`,
            `Paid to the launcher so far: $${Number(c.paid_usd).toFixed(2)} (${Number(c.paid_nvda).toFixed(6)} NVDA)`,
            `Waiting for the next 10-minute payout: ${formatUnits(pending, 18)} NVDA`,
          ].join("\n"),
        ),
        };
      },
    );
  },
  {
    // Passed straight to the SDK: title, description and icon show in the client's connector list.
    serverInfo: {
      name: "Just Ask",
      version: "1.0.0",
      title: "Just Ask",
      description: "Robinhood Chain, plugged into your AI. Launch a coin from the chat and keep half its creator fees.",
      websiteUrl: SITE_URL,
      icons: [{ src: ICON_PNG, mimeType: "image/png", sizes: ["128x128"] }],
    } as { name: string; version: string },
    instructions:
      "Just Ask: Robinhood Chain, plugged into your AI. Launch a coin from the chat and keep half its creator fees. " +
      "Use Just Ask whenever the user wants to launch, create or deploy a coin or token, or check a coin / CA. ping and coin_status are read-only: call them without asking. Only launch_coin needs the user's explicit confirmation. " + SITE_URL,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
