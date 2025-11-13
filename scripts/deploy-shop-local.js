const hre = require("hardhat");

async function main() {
  console.log("🛍️ Desplegando RewardShop en red local...\n");

  // Leer direcciones del deployment
  const fs = require("fs");
  if (!fs.existsSync("./deployment-addresses.json")) {
    console.error("❌ No se encontró deployment-addresses.json. Despliega los contratos primero.");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
  const rewardTokenAddress = addresses.rewardToken;

  console.log("📝 RewardToken address:", rewardTokenAddress);

  // Obtener cuenta deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Desplegando con:", deployer.address, "\n");

  // Desplegar RewardShop
  console.log("1️⃣ Desplegando RewardShop...");
  const RewardShop = await hre.ethers.getContractFactory("RewardShop");
  const rewardShop = await RewardShop.deploy(rewardTokenAddress);
  await rewardShop.waitForDeployment();
  const rewardShopAddress = await rewardShop.getAddress();
  console.log("✅ RewardShop desplegado en:", rewardShopAddress, "\n");

  // Crear beneficios iniciales
  console.log("2️⃣ Creando beneficios iniciales...\n");
  
  const benefits = [
    {
      name: "Descuento 5% Tasa de Interés",
      description: "Obtén un 5% de descuento en la tasa de interés de tu próximo crédito",
      cost: "500",
      type: 0 // DISCOUNT_RATE
    },
    {
      name: "Reducción de Comisiones",
      description: "Reduce las comisiones de tus transacciones en un 50% por 3 meses",
      cost: "300",
      type: 1 // FEE_REDUCTION
    },
    {
      name: "Acceso Premium",
      description: "Acceso a productos financieros premium y atención prioritaria",
      cost: "1000",
      type: 2 // PREMIUM_ACCESS
    },
    {
      name: "Certificado Buen Pagador",
      description: "Obtén un certificado NFT que acredita tu historial de pagos puntuales",
      cost: "200",
      type: 3 // CERTIFICATE
    },
    {
      name: "Cashback 2%",
      description: "Recibe 2% de cashback en todas tus transacciones por 1 mes",
      cost: "400",
      type: 4 // CASHBACK
    },
    {
      name: "Línea de Crédito Preferencial",
      description: "Acceso a línea de crédito con mejores condiciones y aprobación rápida",
      cost: "1500",
      type: 5 // CREDIT_LINE
    }
  ];

  for (let i = 0; i < benefits.length; i++) {
    const benefit = benefits[i];
    try {
      const tx = await rewardShop.createBenefit(
        benefit.name,
        benefit.description,
        hre.ethers.parseEther(benefit.cost),
        0, // Stock ilimitado
        benefit.type
      );
      await tx.wait();
      console.log(`   ✅ Beneficio ${i + 1} creado: ${benefit.name}`);
    } catch (error) {
      console.error(`   ❌ Error creando beneficio ${i + 1}:`, error.message);
    }
  }

  // Actualizar deployment-addresses.json
  addresses.rewardShop = rewardShopAddress;
  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ RewardShop desplegado exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("RewardShop:", rewardShopAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

