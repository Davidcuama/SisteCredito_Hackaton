const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("RewardToken", function () {
  let rewardToken;
  let paymentCredential;
  let owner;
  let user1;

  // Helper para generar hash de usuario
  function generateUserHash(identifier) {
    return ethers.keccak256(ethers.toUtf8Bytes(identifier));
  }

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Desplegar PaymentCredential primero
    const PaymentCredential = await ethers.getContractFactory("PaymentCredential");
    paymentCredential = await PaymentCredential.deploy();
    await paymentCredential.waitForDeployment();

    // Desplegar RewardToken
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(await paymentCredential.getAddress());
    await rewardToken.waitForDeployment();
  });

  describe("Configuración inicial", function () {
    it("Debería tener 1 millón de tokens en el contrato", async function () {
      const contractBalance = await rewardToken.balanceOf(await rewardToken.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("1000000"));
    });

    it("Debería tener la configuración correcta de recompensas", async function () {
      const info = await rewardToken.getRewardInfo();
      expect(info.rewardPerPayment).to.equal(ethers.parseEther("100"));
      expect(info.threshold).to.equal(10);
      expect(info.multiplier).to.equal(2);
    });
  });

  describe("Registro de direcciones de usuario", function () {
    it("Debería permitir registrar dirección de usuario desde PaymentCredential", async function () {
      const userHash = generateUserHash("user123");
      
      await paymentCredential.createUser(userHash);
      
      // Usar impersonation para simular llamada desde PaymentCredential
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await paymentCredential.getAddress()],
      });
      
      // Dar balance al contrato para que pueda hacer transacciones
      await hre.network.provider.request({
        method: "hardhat_setBalance",
        params: [await paymentCredential.getAddress(), "0x1000000000000000000"], // 1 ETH
      });
      
      const paymentCredentialSigner = await ethers.getSigner(await paymentCredential.getAddress());
      await rewardToken.connect(paymentCredentialSigner).registerUserAddress(userHash, user1.address);
      
      const registeredAddress = await rewardToken.userHashToAddress(userHash);
      expect(registeredAddress).to.equal(user1.address);
    });

    it("No debería permitir registrar desde una dirección no autorizada", async function () {
      const userHash = generateUserHash("user123");
      
      await expect(
        rewardToken.connect(user1).registerUserAddress(userHash, user1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Distribución de recompensas", function () {
    let userHash;

    beforeEach(async function () {
      userHash = generateUserHash("user123");
      await paymentCredential.createUser(userHash);
      
      // Registrar dirección del usuario usando impersonation
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await paymentCredential.getAddress()],
      });
      
      // Dar balance al contrato para que pueda hacer transacciones
      await hre.network.provider.request({
        method: "hardhat_setBalance",
        params: [await paymentCredential.getAddress(), "0x1000000000000000000"], // 1 ETH
      });
      
      const paymentCredentialSigner = await ethers.getSigner(await paymentCredential.getAddress());
      await rewardToken.connect(paymentCredentialSigner).registerUserAddress(userHash, user1.address);
    });

    it("Debería distribuir recompensa por pago puntual", async function () {
      const initialBalance = await rewardToken.balanceOf(user1.address);
      
      // Simular distribución de recompensa
      const paymentCredentialSigner = await ethers.getSigner(await paymentCredential.getAddress());
      await rewardToken.connect(paymentCredentialSigner).distributeReward(userHash, true);
      
      const finalBalance = await rewardToken.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("100"));
    });

    it("Debería resetear contador en pago tardío", async function () {
      const paymentCredentialSigner = await ethers.getSigner(await paymentCredential.getAddress());
      
      // Pago puntual
      await rewardToken.connect(paymentCredentialSigner).distributeReward(userHash, true);
      let stats = await rewardToken.getUserRewardStats(userHash);
      expect(stats.consecutiveCount).to.equal(1);
      
      // Pago tardío
      await rewardToken.connect(paymentCredentialSigner).distributeReward(userHash, false);
      stats = await rewardToken.getUserRewardStats(userHash);
      expect(stats.consecutiveCount).to.equal(0);
    });
  });
});

