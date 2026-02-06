import { createPublicClient, http } from "viem";
import { celoSepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http("https://forno.celo-sepolia.celo-testnet.org/"),
  batch: { multicall: true },
});
