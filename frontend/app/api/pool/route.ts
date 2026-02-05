import { formatEther } from "viem";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { publicClient } from "@/lib/client";
import { getContractConstants } from "@/lib/constants-cache";
import { NextResponse } from "next/server";

// In-memory response cache (5-second TTL)
let cachedResponse: { data: object; timestamp: number } | null = null;
const CACHE_TTL_MS = 5_000;

export async function GET() {
  // Return cached response if fresh
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse.data);
  }

  try {
    // These never change — fetched once and cached forever
    const constants = await getContractConstants();

    // Dynamic values — auto-batched into a single multicall by viem
    const [roundId, roundStart, poolBalance, participants, paused] =
      await Promise.all([
        publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundId" }),
        publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundStart" }),
        publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getPoolBalance" }),
        publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getParticipants" }),
        publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "paused" }),
      ]);

    const data = {
      roundId: Number(roundId),
      roundStart: Number(roundStart),
      roundDuration: Number(constants.roundDuration),
      poolBalance: formatEther(poolBalance as bigint),
      participants: participants as string[],
      paused,
      minContribution: formatEther(constants.minContribution),
      maxParticipants: Number(constants.maxParticipants),
    };

    cachedResponse = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch pool state:", error);
    return NextResponse.json({ error: "Failed to fetch pool state" }, { status: 500 });
  }
}
