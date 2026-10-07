import { createPublicClient, createWalletClient, defineChain, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
});

export const publicClient = createPublicClient({ chain: robinhood, transport: http() });

/** The one hot wallet: launches coins (operator), receives the burn share (protocol) and buys back $ASK. */
export function serverWallet() {
  const key = process.env.DEPLOYER_KEY as `0x${string}` | undefined;
  if (!key) throw new Error("DEPLOYER_KEY is not set");
  return createWalletClient({ account: privateKeyToAccount(key), chain: robinhood, transport: http() });
}

const env = (k: string, d: string) => (process.env[k] || d) as `0x${string}`;
export const ADDR = {
  launchpad: env("LAUNCHPAD", "0xd57759fc069ff9f8901042e3df8f13708c0d9e6f"),
  lens: env("LENS", "0x5498dd767f2a5ebd206d88f1ac2b647112f1845f"),
  router: env("ROUTER", "0x5b03ca37137feb729a9e4427c5683998b4ab09e3"),
  nvda: env("PAIR_ASSET", "0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec"),
  nvdaFeed: env("PAIR_FEED", "0x379EC4f7C378F34a1B47E4F3cbeBCbAC3E8E9F15"),
  factory: env("SPLITTER_FACTORY", "0x0000000000000000000000000000000000000000"),
  dead: "0x000000000000000000000000000000000000dEaD" as `0x${string}`,
};
export const askToken = () => (process.env.ASK_TOKEN || null) as `0x${string}` | null;

export const splitterFactoryAbi = parseAbi([
  "function launch(string name, string symbol, string logoURI, address pairAsset, uint24 feePips, uint24 creatorSharePips, uint256 firstBuy, address beneficiary, uint16 userBps) returns (address token, address splitter)",
  "event Launched(address indexed token, address indexed splitter, address indexed beneficiary)",
]);
export const splitterAbi = parseAbi([
  "function split()",
  "function userBps() view returns (uint16)",
  "function beneficiary() view returns (address)",
  "event Split(uint256 toUser, uint256 toProtocol)",
]);

const poolKey = "(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)";
export const launchpadAbi = parseAbi([
  "function poolIdOf(address) view returns (bytes32)",
  `function poolKeyOf(bytes32 id) view returns (${poolKey} key)`,
  "function collectPoolFees(bytes32 poolId)",
]);
export const routerAbi = parseAbi([
  `function swapExactInput((${poolKey} key, bool zeroForOne)[] path, uint256 amountIn, uint256 minOut, address to) payable returns (uint256)`,
]);
export const lensAbi = parseAbi([
  "struct Market { address token; address pairAsset; address creator; string name; string symbol; string logoURI; uint24 feePips; uint24 currentFeePips; uint24 creatorSharePips; bool tokenIs0; uint160 sqrtPriceX96; int24 tick; int24 openingTick; int24 tickCap; uint16 curveProgressBps; uint64 launchedAt; uint64 graduatedAt; uint32 swaps; uint128 quoteVolume; uint256 eligibleSupply; uint256 totalRewardsReceived; uint256 maxBuyNow; uint64 guardEndsAt; }",
  "function market(bytes32 id) view returns (Market m)",
]);
export const erc20Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
]);
export const feedAbi = parseAbi([
  "function latestRoundData() view returns (uint80, int256 answer, uint256, uint256 updatedAt, uint80)",
  "function decimals() view returns (uint8)",
]);
