// Copyright 2026 katlegorphele
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ethers, upgrades } from "hardhat";

async function main() {
  // Proxy contract 
  const proxyAddress = "0x1408e43C68C1cf5d327b66A104900804341eF22E";

  const EthRewardPoolV3 = await ethers.getContractFactory(
    "EthRewardPoolUpgradeableV3"
  );

  console.log("Upgrading EthRewardPool to V3...");

  // Upgrade proxy to V3
  await upgrades.upgradeProxy(proxyAddress, EthRewardPoolV3);

  console.log("Upgrade complete");
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New implementation address:", implementationAddress);

  // Get V3 contract instance at the proxy
  const pool = await ethers.getContractAt(
    "EthRewardPoolUpgradeableV3",
    proxyAddress
  );

  // Run V3 initializer
  const tx = await pool.initializeV3();
  await tx.wait();

  console.log("V3 initialization complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

