import { ethers, upgrades } from "hardhat";

async function main() {
  /*
    Get the contract factory for the upgradeable implementation.
    IMPORTANT:
    - This is NOT deployed directly
    - A proxy will be deployed instead
  */
  const EthRewardPool = await ethers.getContractFactory(
    "EthRewardPoolUpgradeable"
  );

  console.log("Deploying EthRewardPoolUpgradeable proxy...");

  /*
    Deploys:
    1. Implementation contract
    2. ERC1967 proxy pointing to it
    3. Calls initialize() via the proxy
  */
  const pool = await upgrades.deployProxy(
    EthRewardPool,
    [], // initialize() has no arguments
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await pool.waitForDeployment();

  /*
    This is the address users interact with.
    The implementation address can change via upgrades.
  */
  const proxyAddress = await pool.getAddress();

  console.log("EthRewardPoolUpgradeable deployed to proxy:", proxyAddress);

  /*
    Optional but very useful:
    Print implementation address for verification/debugging
  */
  const implementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("Implementation address:", implementationAddress);
}

/*
  Standard Hardhat pattern:
  - Catches async errors
  - Sets proper exit codes
*/
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
