import { createPublicClient, http, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { NextResponse } from "next/server";

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});

export async function GET() {
  try {
    const [roundId, roundStart, roundDuration, poolBalance, participants, paused, minContribution, maxParticipants] =
      await Promise.all([
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundId" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundStart" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "ROUND_DURATION" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getPoolBalance" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getParticipants" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "paused" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "MIN_CONTRIBUTION" }),
        client.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "MAX_PARTICIPANTS" }),
      ]);

    return NextResponse.json({
      roundId: Number(roundId),
      roundStart: Number(roundStart),
      roundDuration: Number(roundDuration),
      poolBalance: formatEther(poolBalance),
      participants: participants as string[],
      paused,
      minContribution: formatEther(minContribution),
      maxParticipants: Number(maxParticipants),
    });
  } catch (error) {
    console.error("Failed to fetch pool state:", error);
    return NextResponse.json({ error: "Failed to fetch pool state" }, { status: 500 });
  }
}
