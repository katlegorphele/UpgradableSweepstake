import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying CeloSweepstakeV1 to Celo Alfajores...\n");

  // Celo Alfajores token addresses
  const CUSD_TOKEN = "0xd077A400968890Eacc75cdc901F0356c943e4fDb";
  // Note: cZAR may not be available on Alfajores - using a placeholder
  // You may need to deploy a mock token or use a different testnet
  const CZAR_TOKEN = "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e";

  // Ticket prices (base: R20 ZAR)
  // CELO: ~R8/CELO = 2.5 CELO for R20
  // cUSD: ~R18/USD = 1.11 cUSD for R20
  // cZAR: exactly 20 cZAR
  const TICKET_PRICE_CELO = ethers.parseEther("2.5");
  const TICKET_PRICE_CUSD = ethers.parseUnits("1.11", 18);
  const TICKET_PRICE_CZAR = ethers.parseUnits("20", 18);

  console.log("Configuration:");
  console.log("- cUSD Token:", CUSD_TOKEN);
  console.log("- cZAR Token:", CZAR_TOKEN);
  console.log("- Ticket Price CELO:", ethers.formatEther(TICKET_PRICE_CELO), "CELO");
  console.log("- Ticket Price cUSD:", ethers.formatUnits(TICKET_PRICE_CUSD, 18), "cUSD");
  console.log("- Ticket Price cZAR:", ethers.formatUnits(TICKET_PRICE_CZAR, 18), "cZAR");
  console.log("");

  const CeloSweepstake = await ethers.getContractFactory("CeloSweepstakeV1");

  // Deploy with UUPS proxy
  const pool = await upgrades.deployProxy(
    CeloSweepstake,
    [
      CUSD_TOKEN,
      CZAR_TOKEN,
      TICKET_PRICE_CELO,
      TICKET_PRICE_CUSD,
      TICKET_PRICE_CZAR,
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await pool.waitForDeployment();
  const proxyAddress = await pool.getAddress();

  console.log("CeloSweepstakeV1 deployed!");
  console.log("- Proxy address:", proxyAddress);

  const implementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("- Implementation address:", implementationAddress);

  // Log current settings
  const roundDuration = await pool.ROUND_DURATION();
  const maxParticipants = await pool.MAX_PARTICIPANTS();
  const manualSwapMode = await pool.manualSwapMode();

  console.log("\nContract Settings:");
  console.log("- Round Duration:", Number(roundDuration) / 60, "minutes");
  console.log("- Max Participants:", Number(maxParticipants));
  console.log("- Manual Swap Mode:", manualSwapMode);

  console.log("\n--- Verification Commands ---");
  console.log(`npx hardhat verify --network celoAlfajores ${implementationAddress}`);
  console.log("\n--- Important ---");
  console.log("1. Update CZAR_TOKEN address when available");
  console.log("2. Fund contract owner wallet with CELO for gas");
  console.log("3. Update frontend/lib/contract.ts with proxy address:", proxyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
