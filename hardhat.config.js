require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
        shibuya: {
          url: "https://evm.shibuya.astar.network",
          chainId: 81,
          accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
          gasPrice: "auto", // Dejar que Hardhat calcule el gas price automáticamente
        },
    // Agregar otras redes según necesidad (Polygon, Sepolia, etc.)
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

