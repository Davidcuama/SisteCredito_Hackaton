const hre = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deployment de contratos SisteCredito...\n");

  // Obtener cuentas
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando contratos con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // 1. Desplegar PaymentCredential primero (RewardToken lo necesita)
  console.log("1️⃣ Desplegando PaymentCredential...");
  const PaymentCredential = await hre.ethers.getContractFactory("PaymentCredential");
  const paymentCredential = await PaymentCredential.deploy();
  await paymentCredential.waitForDeployment();
  const paymentCredentialAddress = await paymentCredential.getAddress();
  console.log("✅ PaymentCredential desplegado en:", paymentCredentialAddress, "\n");

  // 2. Desplegar RewardToken con referencia a PaymentCredential
  console.log("2️⃣ Desplegando RewardToken...");
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(paymentCredentialAddress);
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("✅ RewardToken desplegado en:", rewardTokenAddress, "\n");

  // 3. Desplegar PaymentCredentialWithRewards (integración completa)
  console.log("3️⃣ Desplegando PaymentCredentialWithRewards...");
  const PaymentCredentialWithRewards = await hre.ethers.getContractFactory("PaymentCredentialWithRewards");
  const paymentCredentialWithRewards = await PaymentCredentialWithRewards.deploy(rewardTokenAddress);
  await paymentCredentialWithRewards.waitForDeployment();
  const paymentCredentialWithRewardsAddress = await paymentCredentialWithRewards.getAddress();
  console.log("✅ PaymentCredentialWithRewards desplegado en:", paymentCredentialWithRewardsAddress, "\n");

  // 4. Autorizar PaymentCredentialWithRewards en RewardToken
  console.log("4️⃣ Autorizando PaymentCredentialWithRewards en RewardToken...");
  await rewardToken.authorizeContract(paymentCredentialWithRewardsAddress);
  console.log("✅ PaymentCredentialWithRewards autorizado\n");
  
  console.log("✨ Configuración completada\n");

  console.log("📋 Resumen de deployment:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("RewardToken:", rewardTokenAddress);
  console.log("PaymentCredential:", paymentCredentialAddress);
  console.log("PaymentCredentialWithRewards:", paymentCredentialWithRewardsAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✨ Deployment completado exitosamente!\n");

  // Guardar direcciones en un archivo para uso en frontend
  const fs = require("fs");
  const addresses = {
    rewardToken: rewardTokenAddress,
    paymentCredential: paymentCredentialAddress,
    paymentCredentialWithRewards: paymentCredentialWithRewardsAddress,
    network: hre.network.name,
    deployer: deployer.address
  };

  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("💾 Direcciones guardadas en deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

