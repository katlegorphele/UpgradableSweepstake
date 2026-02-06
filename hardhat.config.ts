import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    arbitrumSepolia: {
      url:
        process.env.ARB_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY ?? ""],
      chainId: 421614,
    },
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: [process.env.PRIVATE_KEY ?? ""],
    },
  },
  etherscan: {
    apiKey: {
      // arbitrumSepolia: process.env.ETHERSCAN_API_KEY ?? "",
      celoSepolia: process.env.ETHERSCAN_API_KEY ?? "",
    },
    customChains: [
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=11142220",
          browserURL: "https://sepolia.celoscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
