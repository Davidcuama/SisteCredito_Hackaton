const hre = require("hardhat");

/**
 * Script para mintear tokens de prueba (SCRT) a una cuenta
 * Útil para testing y demostraciones sin necesidad de tokens reales
 */
async function main() {
  console.log("🎁 Minteando tokens de prueba SCRT...\n");

  // Obtener la dirección del RewardToken desde el deployment
  const fs = require("fs");
  let rewardTokenAddress;
  
  // Intentar leer desde deployment-addresses-shibuya.json
  if (fs.existsSync("./deployment-addresses-shibuya.json")) {
    const addresses = JSON.parse(fs.readFileSync("./deployment-addresses-shibuya.json", "utf8"));
    rewardTokenAddress = addresses.rewardToken;
    console.log("📋 Usando RewardToken desde deployment-addresses-shibuya.json");
  } else if (fs.existsSync("./deployment-addresses.json")) {
    const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
    rewardTokenAddress = addresses.rewardToken;
    console.log("📋 Usando RewardToken desde deployment-addresses.json");
  } else {
    console.error("❌ No se encontró archivo de deployment. Despliega los contratos primero.");
    process.exit(1);
  }

  // Obtener la cuenta que va a recibir los tokens
  const [deployer] = await hre.ethers.getSigners();
  const recipientAddress = process.env.RECIPIENT_ADDRESS || deployer.address;
  const amount = process.env.AMOUNT || "10000"; // 10,000 tokens por defecto

  console.log("📝 Dirección del RewardToken:", rewardTokenAddress);
  console.log("👤 Dirección que recibirá tokens:", recipientAddress);
  console.log("💰 Cantidad a mintear:", amount, "SCRT\n");

  // Obtener instancia del contrato
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(rewardTokenAddress);

  // Verificar que somos el owner
  const owner = await rewardToken.owner();
  console.log("🔑 Owner del contrato:", owner);
  console.log("📝 Cuenta que ejecuta:", deployer.address);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ Error: Solo el owner puede mintear tokens adicionales");
    console.log("💡 Usa la cuenta que desplegó el contrato o transfiere ownership");
    process.exit(1);
  }

  // Mintear tokens
  const amountInWei = hre.ethers.parseEther(amount);
  console.log("⏳ Minteando tokens...");
  
  const tx = await rewardToken.mintAdditionalTokens(amountInWei);
  console.log("📤 Transacción enviada:", tx.hash);
  
  await tx.wait();
  console.log("✅ Tokens minteados al contrato\n");

  // Transferir tokens al destinatario
  console.log("⏳ Transfiriendo tokens al destinatario...");
  const transferTx = await rewardToken.transfer(recipientAddress, amountInWei);
  console.log("📤 Transacción de transferencia enviada:", transferTx.hash);
  
  await transferTx.wait();
  console.log("✅ Tokens transferidos exitosamente\n");

  // Verificar balance
  const balance = await rewardToken.balanceOf(recipientAddress);
  const balanceFormatted = hre.ethers.formatEther(balance);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ ¡Tokens minteados exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Dirección:", recipientAddress);
  console.log("💰 Balance actual:", balanceFormatted, "SCRT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Si estamos en localhost, mostrar instrucciones
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId === 1337n || network.name === "localhost") {
    console.log("💡 Para usar estos tokens en el frontend:");
    console.log("   1. Asegúrate de estar conectado a la red local de Hardhat");
    console.log("   2. Conecta tu wallet MetaMask a localhost:8545");
    console.log("   3. Importa la cuenta con la clave privada del deployer");
    console.log("   4. Los tokens deberían aparecer automáticamente\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

