import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celoSepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "CeloSweepstake",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
  chains: [celoSepolia],
  transports: {
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org/"),
  },
  ssr: true,
});
