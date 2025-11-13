const hre = require("hardhat");

async function main() {
  console.log("🎁 Minteando tokens de prueba en red local...\n");

  // Leer direcciones del deployment
  const fs = require("fs");
  if (!fs.existsSync("./deployment-addresses.json")) {
    console.error("❌ No se encontró deployment-addresses.json. Despliega los contratos primero.");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
  const rewardTokenAddress = addresses.rewardToken;

  console.log("📝 RewardToken address:", rewardTokenAddress);

  // Obtener cuentas
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address, "\n");

  // Obtener instancia del contrato
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(rewardTokenAddress);

  // Cantidades a mintear (en tokens, no wei)
  const amounts = {
    [deployer.address]: "50000",  // 50,000 tokens
    [user1.address]: "10000",     // 10,000 tokens
    [user2.address]: "5000"       // 5,000 tokens
  };

  console.log("⏳ Minteando tokens...\n");

  for (const [address, amount] of Object.entries(amounts)) {
    try {
      // Mintear al contrato primero
      const amountInWei = hre.ethers.parseEther(amount);
      console.log(`   Minteando ${amount} SCRT para ${address.slice(0, 10)}...`);
      
      const mintTx = await rewardToken.mintAdditionalTokens(amountInWei);
      await mintTx.wait();

      // Transferir al usuario
      const transferTx = await rewardToken.transfer(address, amountInWei);
      await transferTx.wait();

      const balance = await rewardToken.balanceOf(address);
      const balanceFormatted = hre.ethers.formatEther(balance);
      
      console.log(`   ✅ ${address.slice(0, 10)}...${address.slice(-8)}: ${balanceFormatted} SCRT\n`);
    } catch (error) {
      console.error(`   ❌ Error minteando para ${address}:`, error.message);
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ ¡Tokens minteados exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 Para usar estos tokens:");
  console.log("   1. Importa una de estas cuentas en MetaMask:");
  console.log(`      - Deployer: ${deployer.address}`);
  console.log(`      - User1: ${user1.address}`);
  console.log(`      - User2: ${user2.address}`);
  console.log("   2. Conecta MetaMask a localhost:8545 (Chain ID: 1337)");
  console.log("   3. Los tokens aparecerán automáticamente\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

