import { publicClient } from "./client";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "./contract";

let cache: {
  roundDuration: bigint;
  minContribution: bigint;
  maxParticipants: bigint;
} | null = null;

export async function getContractConstants() {
  if (cache) return cache;

  const [roundDuration, minContribution, maxParticipants] = await Promise.all([
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "ROUND_DURATION",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "MIN_CONTRIBUTION",
    }),
    publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "MAX_PARTICIPANTS",
    }),
  ]);

  cache = {
    roundDuration: roundDuration as bigint,
    minContribution: minContribution as bigint,
    maxParticipants: maxParticipants as bigint,
  };

  return cache;
}
