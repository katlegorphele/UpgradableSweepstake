import { formatUnits } from "viem";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { publicClient } from "@/lib/client";
import { getContractConstants } from "@/lib/constants-cache";
import { NextResponse } from "next/server";

// In-memory response cache
let cachedResponse: { data: object; timestamp: number } | null = null;
const CACHE_TTL_MS = 5_000;
const PAUSED_CACHE_TTL_MS = 60_000; // Cache for 60s when paused (reduce RPC calls)

export async function GET() {
  // Check if we have a cached response
  if (cachedResponse) {
    const cachedData = cachedResponse.data as { paused?: boolean };
    const cacheTTL = cachedData.paused ? PAUSED_CACHE_TTL_MS : CACHE_TTL_MS;

    if (Date.now() - cachedResponse.timestamp < cacheTTL) {
      return NextResponse.json(cachedResponse.data);
    }
  }

  try {
    // First, check if contract is paused (single RPC call)
    const paused = await publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "paused",
    });

    // If paused, return minimal data with longer cache
    if (paused) {
      const data = {
        paused: true,
        roundId: 0,
        roundStart: 0,
        roundDuration: 0,
        poolBalances: { celo: "0", cusd: "0", czar: "0" },
        participants: [],
        ticketPrices: { celo: "0", cusd: "0", czar: "0" },
        maxParticipants: 0,
      };
      cachedResponse = { data, timestamp: Date.now() };
      return NextResponse.json(data);
    }

    // Contract is active - fetch full state
    const constants = await getContractConstants();

    // Dynamic values — auto-batched into a single multicall by viem
    const [
      roundId,
      roundStart,
      poolBalances,
      participants,
    ] = await Promise.all([
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundId" }),
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundStart" }),
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getPoolBalances" }),
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "getParticipants" }),
    ]);

    // Pool balances returns [celo, cusd, czar]
    const [celoBal, cusdBal, czarBal] = poolBalances as [bigint, bigint, bigint];

    const data = {
      roundId: Number(roundId),
      roundStart: Number(roundStart),
      roundDuration: Number(constants.roundDuration),
      poolBalances: {
        celo: formatUnits(celoBal, 18),
        cusd: formatUnits(cusdBal, 18),
        czar: formatUnits(czarBal, 18),
      },
      participants: participants as string[],
      paused: false,
      ticketPrices: {
        celo: constants.ticketPriceCelo.toString(),
        cusd: constants.ticketPriceCusd.toString(),
        czar: constants.ticketPriceCzar.toString(),
      },
      maxParticipants: Number(constants.maxParticipants),
    };

    cachedResponse = { data, timestamp: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch pool state:", error);
    return NextResponse.json({ error: "Failed to fetch pool state" }, { status: 500 });
  }
}
