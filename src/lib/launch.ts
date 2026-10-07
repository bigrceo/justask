import { decodeEventLog, getAddress, isAddress, parseUnits } from "viem";
import { ADDR, askToken, erc20Abi, launchpadAbi, publicClient, routerAbi, serverWallet, splitterFactoryAbi } from "./chain";
import { BRAND } from "./brand";
import { ensureSchema, sql } from "@/server/db";
import { pictureUrl } from "@/server/pictures";

export type LaunchInput = {
  name: string;
  ticker: string;
  description?: string;
  picture_id?: string;
  image_url?: string;
  x?: string;
  website?: string;
  wallet?: string;
};

const PER_DAY = Number(process.env.LAUNCHES_PER_DAY ?? 5);

/** 5000 bps, or 7500 when the wallet holds at least 2,500,000 $ASK right now. */
export async function userBpsFor(wallet: `0x${string}` | null): Promise<number> {
  if (!wallet) return 0;
  const ask = askToken();
  if (!ask) return 5_000;
  const bal = await publicClient.readContract({ address: ask, abi: erc20Abi, functionName: "balanceOf", args: [wallet] });
  return bal >= parseUnits(String(BRAND.holdBonus), 18) ? 7_500 : 5_000;
}

export async function launchCoin(input: LaunchInput, meta: { client?: string; ip?: string } = {}) {
  const ticker = input.ticker.replace(/^\$/, "").toUpperCase();
  if (!/^[A-Z0-9]{1,10}$/.test(ticker)) throw new Error("The ticker must be 1 to 10 letters or numbers.");
  let wallet: `0x${string}` | null = null;
  if (input.wallet) {
    if (!isAddress(input.wallet)) throw new Error("That wallet isn't a valid address. It should start with 0x and have 42 characters.");
    wallet = getAddress(input.wallet);
  }

  const image = input.picture_id ? await pictureUrl(input.picture_id) : input.image_url ?? null;
  if (!image) throw new Error("The coin needs a picture: open the picture panel or give a direct image link.");

  await ensureSchema();
  if (meta.ip) {
    const [{ n }] = await sql<{ n: number }[]>`
      select count(*)::int as n from ja_coins where ip = ${meta.ip} and created_at > now() - interval '1 day'`;
    if (n >= PER_DAY) throw new Error(`You've launched ${PER_DAY} coins today. Come back tomorrow.`);
  }

  const userBps = await userBpsFor(wallet);
  const firstBuy = parseUnits(process.env.FIRST_BUY_NVDA ?? "0.005", 18);
  const w = serverWallet();
  await topUpNvda(w, firstBuy);

  // The factory pulls the opening buy from us: approve it once, for good.
  const allowance = await publicClient.readContract({
    address: ADDR.nvda, abi: erc20Abi, functionName: "allowance", args: [w.account.address, ADDR.factory],
  });
  if (allowance < firstBuy) {
    const h = await w.writeContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "approve", args: [ADDR.factory, 2n ** 256n - 1n] });
    await publicClient.waitForTransactionReceipt({ hash: h });
  }

  const hash = await w.writeContract({
    address: ADDR.factory,
    abi: splitterFactoryAbi,
    functionName: "launch",
    args: [
      input.name,
      ticker,
      image,
      ADDR.nvda,
      Number(process.env.FEE_PIPS ?? 20_000),
      Number(process.env.CREATOR_SHARE_PIPS ?? 150_000),
      firstBuy,
      wallet ?? "0x0000000000000000000000000000000000000000",
      userBps,
    ],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("The launch transaction failed. Nothing was created.");

  let token: `0x${string}` | undefined, splitter: `0x${string}` | undefined;
  for (const log of receipt.logs) {
    try {
      const ev = decodeEventLog({ abi: splitterFactoryAbi, data: log.data, topics: log.topics });
      if (ev.eventName === "Launched") ({ token, splitter } = ev.args);
    } catch {}
  }
  if (!token || !splitter) throw new Error(`Launch tx ${hash} emitted no Launched event`);
  const poolId = await publicClient.readContract({ address: ADDR.launchpad, abi: launchpadAbi, functionName: "poolIdOf", args: [token] });

  await sql`insert into ja_coins
    (token, splitter, pool_id, name, ticker, image, description, x, website, wallet, user_bps, client, ip, tx)
    values (${token.toLowerCase()}, ${splitter.toLowerCase()}, ${poolId}, ${input.name}, ${ticker}, ${image},
      ${input.description ?? null}, ${input.x ?? null}, ${input.website ?? null}, ${wallet}, ${userBps},
      ${meta.client ?? null}, ${meta.ip ?? null}, ${hash})`;

  return { token, splitter, poolId, tx: hash, userBps, wallet, image, ticker };
}

/** The wallet only needs ETH: when it runs out of NVDA for opening buys, it swaps a little ETH on the ETH/NVDA pool. */
async function topUpNvda(w: ReturnType<typeof serverWallet>, need: bigint) {
  const me = w.account.address;
  const bal = await publicClient.readContract({ address: ADDR.nvda, abi: erc20Abi, functionName: "balanceOf", args: [me] });
  if (bal >= need) return;
  const key = {
    currency0: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    currency1: ADDR.nvda,
    fee: 500,
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  };
  const value = parseUnits(process.env.TOPUP_ETH ?? "0.0002", 18);
  const h = await w.writeContract({
    address: ADDR.router, abi: routerAbi, functionName: "swapExactInput", args: [[{ key, zeroForOne: true }], value, need, me], value,
  });
  await publicClient.waitForTransactionReceipt({ hash: h });
}
