# Just Ask

Launch a coin on Robinhood Chain by asking Claude or ChatGPT.

**[getjustask.com](https://getjustask.com)** · MCP server: `https://getjustask.com/mcp`

Add the link as a custom connector in Claude (Settings › Connectors › Add custom connector, *No sign-in*) or ChatGPT (developer mode), then ask: *"launch Diamond Paws, ticker PAWS, fees to 0x…"*. A review card appears in the chat; tap **Launch** and the coin is live.

## How it works

- **Free to launch.** The server wallet pays gas and the launchpad's opening buy. Users need no wallet.
- **Every coin is paired with NVDA** (tokenized stock) on the Karat launchpad (Uniswap v4 hooks).
- **Fees are split on chain, for good.** Each coin's creator is its own `FeeSplitter` clone, set once at launch:
  50% to the user's wallet (75% if it holds ≥ 2.5M $ASK at launch), the rest buys back and burns $ASK.
  No wallet given → 100% to the burn.
- **Every 10 minutes** fees are collected and split, and the burn share buys $ASK and sends it to `0x…dEaD`, logged with its tx.

## MCP tools

| Tool | What it does |
|---|---|
| `review_launch` | Shows a review card (picture, name, ticker, fee split) with a Launch button. Nothing launches until the user taps. |
| `launch_coin` | Launches from a `review_id` (or explicit args). Returns a live coin card. |
| `coin_status` | Live card for any Just Ask coin: market cap, split, paid to creator. |
| `my_coins` / `top_coins` | Lists, as cards. |
| `ping` | Connection check. |

Cards are MCP Apps (`text/html;profile=mcp-app`), also served as ChatGPT Apps SDK templates.

## Stack

- `contracts/SplitterFactory.sol` — per-launch fee splitter clones (Foundry, fork tests in `test/`)
- `src/app/mcp` — MCP server (`mcp-handler`), `src/server` — launch, burn cycle, cards, Postgres
- Next.js 16 on Vercel, viem, Postgres

## Contracts (Robinhood Chain, 4663)

- SplitterFactory: [`0x1bD88F5A74936212755734197C3A181e435CFcff`](https://robinhoodchain.blockscout.com/address/0x1bD88F5A74936212755734197C3A181e435CFcff)
- Karat launchpad: `0xD57759Fc069FF9f8901042E3df8f13708c0d9E6F`

## Dev

```bash
npm install
cp .env.example .env.local   # fill RPC_URL, DATABASE_URL, DEPLOYER_KEY, SPLITTER_FACTORY…
npm run dev
forge test                   # fork tests: FORK_RPC=http://127.0.0.1:8545
```

Not affiliated with Anthropic or OpenAI. Claude is a trademark of Anthropic. ChatGPT is a trademark of OpenAI.
