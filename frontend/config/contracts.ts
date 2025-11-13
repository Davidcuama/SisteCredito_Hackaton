// Configuración de direcciones de contratos
// Actualizar estas direcciones después del deployment en Shibuya

export const CONTRACT_ADDRESSES = {
  // Contratos desplegados en red local (Hardhat)
  // Para usar en Shibuya, actualiza estas direcciones
  paymentCredential: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  rewardToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  paymentCredentialWithRewards: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  rewardShop: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // RewardShop desplegado
  network: "localhost", // Red local de Hardhat
};

// Configuración de la red Shibuya
export const SHIBUYA_NETWORK = {
  chainId: 81,
  chainName: "Shibuya (Astar Testnet)",
  nativeCurrency: {
    name: "SBY",
    symbol: "SBY",
    decimals: 18,
  },
  rpcUrls: ["https://evm.shibuya.astar.network"],
  blockExplorerUrls: ["https://blockscout.com/shibuya"],
};

// ABI de los contratos (se generan automáticamente después de compilar)
// Estos se pueden importar desde los artifacts de Hardhat

