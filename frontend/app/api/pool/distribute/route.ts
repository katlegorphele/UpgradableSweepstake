import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract";
import { NextResponse } from "next/server";

const transport = http("https://sepolia-rollup.arbitrum.io/rpc");

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport,
});

export async function POST() {
  const privateKey = process.env.OWNER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Server not configured for distribution" }, { status: 500 });
  }

  try {
    // Check if round is actually over
    const [roundStart, roundDuration] = await Promise.all([
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "roundStart" }),
      publicClient.readContract({ address: POOL_CONTRACT_ADDRESS, abi: POOL_ABI, functionName: "ROUND_DURATION" }),
    ]);

    const now = Math.floor(Date.now() / 1000);
    const roundEnd = Number(roundStart) + Number(roundDuration);

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
      chain: arbitrumSepolia,
      transport,
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
