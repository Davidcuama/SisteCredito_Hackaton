const hre = require("hardhat");

/**
 * Script simplificado para mintear tokens en la red local de Hardhat
 * Este script asume que ya tienes los contratos desplegados localmente
 */
async function main() {
  console.log("🎁 Minteando tokens de prueba en red local...\n");

  // Obtener cuentas
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  
  // Dirección del RewardToken (actualizar si es diferente)
  // Si no está desplegado, primero ejecuta: npm run deploy
  const fs = require("fs");
  let rewardTokenAddress;
  
  if (fs.existsSync("./deployment-addresses.json")) {
    const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
    rewardTokenAddress = addresses.rewardToken;
  } else {
    console.error("❌ No se encontró deployment-addresses.json");
    console.log("💡 Primero despliega los contratos: npm run deploy");
    process.exit(1);
  }

  console.log("📝 RewardToken address:", rewardTokenAddress);
  console.log("👤 Deployer:", deployer.address);
  console.log("👤 User1:", user1.address);
  console.log("👤 User2:", user2.address, "\n");

  // Obtener instancia del contrato
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(rewardTokenAddress);

  // Verificar que somos el owner
  const owner = await rewardToken.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ Error: Solo el owner puede mintear tokens");
    process.exit(1);
  }

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
      const mintTx = await rewardToken.mintAdditionalTokens(amountInWei);
      await mintTx.wait();

      // Transferir al usuario
      const transferTx = await rewardToken.transfer(address, amountInWei);
      await transferTx.wait();

      const balance = await rewardToken.balanceOf(address);
      const balanceFormatted = hre.ethers.formatEther(balance);
      
      console.log(`✅ ${address.slice(0, 10)}...${address.slice(-8)}: ${balanceFormatted} SCRT`);
    } catch (error) {
      console.error(`❌ Error minteando para ${address}:`, error.message);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ ¡Tokens minteados exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 Para usar estos tokens:");
  console.log("   1. Inicia Hardhat node: npx hardhat node");
  console.log("   2. Importa una de las cuentas en MetaMask");
  console.log("   3. Conecta MetaMask a localhost:8545");
  console.log("   4. Los tokens deberían aparecer automáticamente\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

