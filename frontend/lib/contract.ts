// Contract address - UPDATE after deployment
export const POOL_CONTRACT_ADDRESS = "0x72814a29870607c6aB3284252e9C313D6147F19c" as const;

// Celo Sepolia token addresses
export const TOKEN_ADDRESSES = {
  CELO: "native" as const,
  CUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as const,
  CZAR: "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e" as const, // UPDATE when available
} as const;

export type TokenType = "CELO" | "CUSD" | "CZAR";

export const TOKEN_INFO: Record<TokenType, { name: string; symbol: string; decimals: number }> = {
  CELO: { name: "Celo", symbol: "CELO", decimals: 18 },
  CUSD: { name: "Celo Dollar", symbol: "cUSD", decimals: 18 },
  CZAR: { name: "Celo Rand", symbol: "cZAR", decimals: 18 },
};

export const POOL_ABI = [
  // Read functions
  {
    inputs: [],
    name: "MAX_PARTICIPANTS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROUND_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CUSD_TOKEN",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CZAR_TOKEN",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TICKET_PRICE_CELO",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TICKET_PRICE_CUSD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TICKET_PRICE_CZAR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolBalanceCELO",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolBalanceCUSD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolBalanceCZAR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolBalances",
    outputs: [
      { internalType: "uint256", name: "celo", type: "uint256" },
      { internalType: "uint256", name: "cusd", type: "uint256" },
      { internalType: "uint256", name: "czar", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTicketPrices",
    outputs: [
      { internalType: "uint256", name: "celo", type: "uint256" },
      { internalType: "uint256", name: "cusd", type: "uint256" },
      { internalType: "uint256", name: "czar", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getParticipants",
    outputs: [{ internalType: "address payable[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getParticipantCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_roundId", type: "uint256" }],
    name: "getWinnerInfo",
    outputs: [
      { internalType: "address", name: "winner", type: "address" },
      { internalType: "uint256", name: "prizeAmount", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasJoined",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "roundId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "roundStart",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "manualSwapMode",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [],
    name: "joinPoolWithCELO",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "joinPoolWithToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "distributeReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "participant", type: "address" },
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "roundId", type: "uint256" },
    ],
    name: "ParticipantJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "prizeAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "roundId", type: "uint256" },
    ],
    name: "RewardDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "roundId", type: "uint256" },
    ],
    name: "NewRoundStarted",
    type: "event",
  },
] as const;

// ERC20 ABI for token approvals and balances
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
