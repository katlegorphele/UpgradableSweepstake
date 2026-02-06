import { formatUnits } from "viem";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { publicClient } from "@/lib/client";
import { NextResponse } from "next/server";

// In-memory response cache (30-second TTL)
let cachedResponse: { data: object; timestamp: number } | null = null;
const CACHE_TTL_MS = 30_000;

interface WinnerInfo {
  address: string;
  round: number;
  prizeAmount: string;
  timestamp: number;
}

export async function GET() {
  // Return cached response if fresh
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse.data);
  }

  try {
    const roundId = await publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "roundId",
    });

    const currentRound = Number(roundId);
    const winners: WinnerInfo[] = [];

    // Fetch winner history for past rounds (up to 10 most recent)
    // All reads are auto-batched into a single multicall by viem
    const startRound = Math.max(1, currentRound - 10);
    const promises = [];

    for (let i = currentRound - 1; i >= startRound; i--) {
      promises.push(
        publicClient
          .readContract({
            address: POOL_CONTRACT_ADDRESS,
            abi: POOL_ABI,
            functionName: "getWinnerInfo",
            args: [BigInt(i)],
          })
          .then((result) => {
            const [winner, prizeAmount, timestamp] = result as [string, bigint, bigint];
            return {
              address: winner,
              round: i,
              prizeAmount: formatUnits(prizeAmount, 18),
              timestamp: Number(timestamp),
            };
          })
          .catch(() => null)
      );
    }

    const results = await Promise.all(promises);
    for (const result of results) {
      if (
        result &&
        result.address !== "0x0000000000000000000000000000000000000000" &&
        parseFloat(result.prizeAmount) > 0
      ) {
        winners.push(result);
      }
    }

    const data = { winners, currentRound };
    cachedResponse = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch winners:", error);
    return NextResponse.json({ error: "Failed to fetch winners" }, { status: 500 });
  }
}
