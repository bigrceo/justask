// Tokenized stocks a coin can be paired with on Karat (from karat/deploy/pair-assets.json).
export const PAIR_ASSETS = {
  SPY: "0x117cc2133c37b721f49de2a7a74833232b3b4c0c",
  META: "0xc0d6457c16cc70d6790dd43521c899c87ce02f35",
  AAPL: "0xaf3d76f1834a1d425780943c99ea8a608f8a93f9",
  TSLA: "0x322f0929c4625ed5bad873c95208d54e1c003b2d",
  PLTR: "0x894e1ec2d74ffe5aef8dc8a9e84686accb964f2a",
  GOOGL: "0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3",
  NVDA: "0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec",
  MSFT: "0xe93237c50d904957cf27e7b1133b510c669c2e74",
  COIN: "0x6330d8c3178a418788df01a47479c0ce7ccf450b",
  AMZN: "0x12f190a9f9d7d37a250758b26824b97ce941bf54",
} as const satisfies Record<string, `0x${string}`>;

export type PairSymbol = keyof typeof PAIR_ASSETS;
export const PAIR_SYMBOLS = Object.keys(PAIR_ASSETS) as [PairSymbol, ...PairSymbol[]];
