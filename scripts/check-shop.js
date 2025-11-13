const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando RewardShop...\n");

  // Leer deployment addresses
  const fs = require("fs");
  if (!fs.existsSync("./deployment-addresses.json")) {
    console.error("❌ No se encontró deployment-addresses.json");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
  console.log("📋 Dirección actual del RewardShop:", addresses.rewardShop);

  // Intentar obtener el contrato
  try {
    const RewardShop = await hre.ethers.getContractFactory("RewardShop");
    const shop = RewardShop.attach(addresses.rewardShop);
    
    // Intentar llamar a getBenefitCount
    const count = await shop.getBenefitCount();
    console.log("✅ RewardShop encontrado!");
    console.log("📊 Cantidad de beneficios:", count.toString());
    
    // Obtener beneficios activos
    const activeIds = await shop.getActiveBenefits();
    console.log("📋 IDs de beneficios activos:", activeIds.map(id => id.toString()).join(", "));
    
  } catch (error) {
    console.error("❌ Error al acceder al RewardShop:", error.message);
    console.log("\n💡 Posibles soluciones:");
    console.log("   1. Verifica que Hardhat node esté corriendo");
    console.log("   2. Verifica que el RewardShop esté desplegado");
    console.log("   3. Ejecuta: npx hardhat run scripts/deploy-shop-local.js");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

