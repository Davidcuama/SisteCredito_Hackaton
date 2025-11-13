const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Iniciando deployment en Shibuya (Astar Testnet)...\n");

  // Verificar que estamos en la red correcta
  const network = await hre.ethers.provider.getNetwork();
  console.log("📡 Red:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  
  if (network.chainId.toString() !== "81") {
    console.error("❌ Error: Debes estar conectado a Shibuya (Chain ID: 81)");
    console.log("💡 Ejecuta: npx hardhat run scripts/deploy-shibuya.js --network shibuya");
    process.exit(1);
  }

  // Obtener cuentas
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando contratos con la cuenta:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", hre.ethers.formatEther(balance), "SBY\n");

  if (balance === 0n) {
    console.warn("⚠️  ADVERTENCIA: Tu cuenta no tiene SBY. Necesitas obtener tokens del faucet.");
    console.log("💡 Visita un faucet de Shibuya para obtener tokens de prueba\n");
  }

  // 1. Desplegar PaymentCredential primero
  console.log("1️⃣ Desplegando PaymentCredential...");
  const PaymentCredential = await hre.ethers.getContractFactory("PaymentCredential");
  const paymentCredential = await PaymentCredential.deploy();
  await paymentCredential.waitForDeployment();
  const paymentCredentialAddress = await paymentCredential.getAddress();
  console.log("✅ PaymentCredential desplegado en:", paymentCredentialAddress, "\n");

  // Esperar confirmaciones
  console.log("⏳ Esperando confirmaciones...");
  await paymentCredential.deploymentTransaction()?.wait(2);

  // 2. Desplegar RewardToken con referencia a PaymentCredential
  console.log("2️⃣ Desplegando RewardToken...");
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(paymentCredentialAddress);
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("✅ RewardToken desplegado en:", rewardTokenAddress, "\n");

  // Esperar confirmaciones
  await rewardToken.deploymentTransaction()?.wait(2);

  // 3. Desplegar PaymentCredentialWithRewards (integración completa)
  console.log("3️⃣ Desplegando PaymentCredentialWithRewards...");
  const PaymentCredentialWithRewards = await hre.ethers.getContractFactory("PaymentCredentialWithRewards");
  const paymentCredentialWithRewards = await PaymentCredentialWithRewards.deploy(rewardTokenAddress);
  await paymentCredentialWithRewards.waitForDeployment();
  const paymentCredentialWithRewardsAddress = await paymentCredentialWithRewards.getAddress();
  console.log("✅ PaymentCredentialWithRewards desplegado en:", paymentCredentialWithRewardsAddress, "\n");

  // Esperar confirmaciones
  await paymentCredentialWithRewards.deploymentTransaction()?.wait(2);

  // 4. Autorizar PaymentCredentialWithRewards en RewardToken
  console.log("4️⃣ Autorizando PaymentCredentialWithRewards en RewardToken...");
  const authTx = await rewardToken.authorizeContract(paymentCredentialWithRewardsAddress);
  await authTx.wait(2);
  console.log("✅ PaymentCredentialWithRewards autorizado\n");

  // 5. Desplegar RewardShop
  console.log("5️⃣ Desplegando RewardShop...");
  const RewardShop = await hre.ethers.getContractFactory("RewardShop");
  const rewardShop = await RewardShop.deploy(rewardTokenAddress);
  await rewardShop.waitForDeployment();
  const rewardShopAddress = await rewardShop.getAddress();
  console.log("✅ RewardShop desplegado en:", rewardShopAddress, "\n");

  // Esperar confirmaciones
  await rewardShop.deploymentTransaction()?.wait(2);

  // 6. Crear beneficios iniciales en RewardShop
  console.log("6️⃣ Creando beneficios iniciales en RewardShop...");
  
  // Beneficio 1: Descuento en tasa de interés (5%)
  const tx1 = await rewardShop.createBenefit(
    "Descuento 5% Tasa de Interés",
    "Obtén un 5% de descuento en la tasa de interés de tu próximo crédito",
    hre.ethers.parseEther("500"), // 500 SCRT
    0, // Stock ilimitado
    0 // DISCOUNT_RATE
  );
  await tx1.wait(1);
  console.log("   ✅ Beneficio 1 creado: Descuento 5% Tasa de Interés");

  // Beneficio 2: Reducción de comisiones
  const tx2 = await rewardShop.createBenefit(
    "Reducción de Comisiones",
    "Reduce las comisiones de tus transacciones en un 50% por 3 meses",
    hre.ethers.parseEther("300"), // 300 SCRT
    0,
    1 // FEE_REDUCTION
  );
  await tx2.wait(1);
  console.log("   ✅ Beneficio 2 creado: Reducción de Comisiones");

  // Beneficio 3: Acceso Premium
  const tx3 = await rewardShop.createBenefit(
    "Acceso Premium",
    "Acceso a productos financieros premium y atención prioritaria",
    hre.ethers.parseEther("1000"), // 1000 SCRT
    0,
    2 // PREMIUM_ACCESS
  );
  await tx3.wait(1);
  console.log("   ✅ Beneficio 3 creado: Acceso Premium");

  // Beneficio 4: Certificado NFT
  const tx4 = await rewardShop.createBenefit(
    "Certificado Buen Pagador",
    "Obtén un certificado NFT que acredita tu historial de pagos puntuales",
    hre.ethers.parseEther("200"), // 200 SCRT
    0,
    3 // CERTIFICATE
  );
  await tx4.wait(1);
  console.log("   ✅ Beneficio 4 creado: Certificado Buen Pagador");

  // Beneficio 5: Cashback
  const tx5 = await rewardShop.createBenefit(
    "Cashback 2%",
    "Recibe 2% de cashback en todas tus transacciones por 1 mes",
    hre.ethers.parseEther("400"), // 400 SCRT
    0,
    4 // CASHBACK
  );
  await tx5.wait(1);
  console.log("   ✅ Beneficio 5 creado: Cashback 2%");

  // Beneficio 6: Línea de Crédito Preferencial
  const tx6 = await rewardShop.createBenefit(
    "Línea de Crédito Preferencial",
    "Acceso a línea de crédito con mejores condiciones y aprobación rápida",
    hre.ethers.parseEther("1500"), // 1500 SCRT
    0,
    5 // CREDIT_LINE
  );
  await tx6.wait(1);
  console.log("   ✅ Beneficio 6 creado: Línea de Crédito Preferencial\n");

  console.log("📋 Resumen de deployment en Shibuya:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network: Shibuya (Astar Testnet)");
  console.log("Chain ID: 81");
  console.log("Deployer:", deployer.address);
  console.log("");
  console.log("RewardToken:", rewardTokenAddress);
  console.log("PaymentCredential:", paymentCredentialAddress);
  console.log("PaymentCredentialWithRewards:", paymentCredentialWithRewardsAddress);
  console.log("RewardShop:", rewardShopAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Guardar direcciones
  const addresses = {
    rewardToken: rewardTokenAddress,
    paymentCredential: paymentCredentialAddress,
    paymentCredentialWithRewards: paymentCredentialWithRewardsAddress,
    rewardShop: rewardShopAddress,
    network: "shibuya",
    chainId: 81,
    deployer: deployer.address,
    explorer: "https://blockscout.com/shibuya"
  };

  fs.writeFileSync(
    "./deployment-addresses-shibuya.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("💾 Direcciones guardadas en deployment-addresses-shibuya.json");
  console.log("\n🔍 Verifica los contratos en:");
  console.log("   https://blockscout.com/shibuya/address/" + paymentCredentialWithRewardsAddress);
  console.log("\n✨ Deployment completado exitosamente en Shibuya!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

