import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { publicClient } from "@/lib/client";
import { getContractConstants } from "@/lib/constants-cache";
import { NextResponse } from "next/server";

export async function POST() {
  const privateKey = process.env.OWNER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Server not configured for distribution" }, { status: 500 });
  }

  try {
    // ROUND_DURATION is immutable — use cached value
    const constants = await getContractConstants();

    // Only 1 dynamic read needed
    const roundStart = await publicClient.readContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "roundStart",
    });

    const now = Math.floor(Date.now() / 1000);
    const roundEnd = Number(roundStart) + Number(constants.roundDuration);

    if (now < roundEnd) {
      return NextResponse.json(
        { error: "Round still active", timeRemaining: roundEnd - now },
        { status: 400 }
      );
    }

    // Sign and send distributeReward() as owner
    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, "")}`);
    const walletClient = createWalletClient({
      account,
      chain: celoSepolia,
      transport: http("https://forno.celo-sepolia.celo-testnet.org"),
    });

    const hash = await walletClient.writeContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "distributeReward",
    });

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      hash: receipt.transactionHash,
      status: receipt.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("distributeReward failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
