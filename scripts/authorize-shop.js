const hre = require("hardhat");

async function main() {
  console.log("🔐 Autorizando PaymentCredentialWithRewards en RewardToken...\n");

  // Leer deployment addresses
  const fs = require("fs");
  if (!fs.existsSync("./deployment-addresses.json")) {
    console.error("❌ No se encontró deployment-addresses.json");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
  
  console.log("📝 RewardToken:", addresses.rewardToken);
  console.log("📝 PaymentCredentialWithRewards:", addresses.paymentCredentialWithRewards);
  console.log("");

  // Obtener cuentas
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address, "\n");

  // Obtener instancias de los contratos
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(addresses.rewardToken);

  // Verificar si ya está autorizado
  const isAuthorized = await rewardToken.authorizedContracts(addresses.paymentCredentialWithRewards);
  console.log("🔍 PaymentCredentialWithRewards ya está autorizado:", isAuthorized);

  if (!isAuthorized) {
    console.log("⏳ Autorizando PaymentCredentialWithRewards...");
    const tx = await rewardToken.authorizeContract(addresses.paymentCredentialWithRewards);
    await tx.wait();
    console.log("✅ PaymentCredentialWithRewards autorizado exitosamente\n");
  } else {
    console.log("✅ PaymentCredentialWithRewards ya está autorizado\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ Proceso completado!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

