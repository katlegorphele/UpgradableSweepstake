import { publicClient } from "./client";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "./contract";

let cache: {
  roundDuration: bigint;
  maxParticipants: bigint;
  ticketPriceCelo: bigint;
  ticketPriceCusd: bigint;
  ticketPriceCzar: bigint;
} | null = null;

export async function getContractConstants() {
  if (cache) return cache;

  const [roundDuration, maxParticipants, ticketPriceCelo, ticketPriceCusd, ticketPriceCzar] = await Promise.all([
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "ROUND_DURATION",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "MAX_PARTICIPANTS",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "TICKET_PRICE_CELO",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "TICKET_PRICE_CUSD",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "TICKET_PRICE_CZAR",
    }),
  ]);

  cache = {
    roundDuration: roundDuration as bigint,
    maxParticipants: maxParticipants as bigint,
    ticketPriceCelo: ticketPriceCelo as bigint,
    ticketPriceCusd: ticketPriceCusd as bigint,
    ticketPriceCzar: ticketPriceCzar as bigint,
  };

  return cache;
}
