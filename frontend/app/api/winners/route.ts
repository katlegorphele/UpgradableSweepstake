import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { NextResponse } from "next/server";

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

export async function GET() {
  try {
    const roundId = await client.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "roundId",
    });

    const currentRound = Number(roundId);
    const winners: { address: string; round: number }[] = [];

    // Fetch winner history for past rounds (up to 10 most recent)
    const startRound = Math.max(1, currentRound - 10);
    const promises = [];

    for (let i = currentRound - 1; i >= startRound; i--) {
      promises.push(
        client
          .readContract({
            address: POOL_CONTRACT_ADDRESS,
            abi: POOL_ABI,
            functionName: "rewardHistory",
            args: [BigInt(i)],
          })
          .then((addr) => ({ address: addr as string, round: i }))
          .catch(() => null)
      );
    }

    const results = await Promise.all(promises);
    for (const result of results) {
      if (result && result.address !== "0x0000000000000000000000000000000000000000") {
        winners.push(result);
      }
    }

    return NextResponse.json({ winners, currentRound });
  } catch (error) {
    console.error("Failed to fetch winners:", error);
    return NextResponse.json({ error: "Failed to fetch winners" }, { status: 500 });
  }
}
