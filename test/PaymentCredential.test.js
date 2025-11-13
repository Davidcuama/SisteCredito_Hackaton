const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentCredential", function () {
  let paymentCredential;
  let rewardToken;
  let owner;
  let entity;
  let user1;
  let user2;

  // Helper para generar hash de usuario
  function generateUserHash(identifier) {
    return ethers.keccak256(ethers.toUtf8Bytes(identifier));
  }

  beforeEach(async function () {
    [owner, entity, user1, user2] = await ethers.getSigners();

    // Desplegar RewardToken
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(ethers.ZeroAddress);
    await rewardToken.waitForDeployment();

    // Desplegar PaymentCredential
    const PaymentCredential = await ethers.getContractFactory("PaymentCredential");
    paymentCredential = await PaymentCredential.deploy();
    await paymentCredential.waitForDeployment();

    // Autorizar entidad
    await paymentCredential.setEntityAuthorization(entity.address, true);
  });

  describe("Creación de usuarios", function () {
    it("Debería crear un nuevo usuario", async function () {
      const userHash = generateUserHash("user123");
      
      await expect(paymentCredential.createUser(userHash))
        .to.emit(paymentCredential, "UserCreated")
        .withArgs(userHash, owner.address);

      const profile = await paymentCredential.getUserProfile(userHash);
      expect(profile.exists).to.be.true;
      expect(profile.score).to.equal(500); // Puntuación inicial
    });

    it("No debería permitir crear un usuario duplicado", async function () {
      const userHash = generateUserHash("user123");
      await paymentCredential.createUser(userHash);

      await expect(paymentCredential.createUser(userHash))
        .to.be.revertedWith("User already exists");
    });
  });

  describe("Registro de pagos", function () {
    let userHash;
    let entityHash;

    beforeEach(async function () {
      userHash = generateUserHash("user123");
      entityHash = generateUserHash("entity1");
      await paymentCredential.createUser(userHash);
    });

    it("Debería registrar un pago puntual", async function () {
      const dueDate = Math.floor(Date.now() / 1000) - 86400; // Ayer
      const paymentDate = dueDate; // Pago puntual

      await expect(
        paymentCredential.connect(entity).registerPayment(
          userHash,
          ethers.parseEther("100"),
          dueDate,
          paymentDate,
          entityHash,
          "servicios"
        )
      ).to.emit(paymentCredential, "PaymentRegistered");

      const stats = await paymentCredential.getUserStats(userHash);
      expect(stats.totalPayments).to.equal(1);
      expect(stats.onTimePayments).to.equal(1);
      expect(stats.score).to.equal(1000); // 100% puntualidad
    });

    it("Debería registrar un pago tardío", async function () {
      const dueDate = Math.floor(Date.now() / 1000) - 172800; // Hace 2 días
      const paymentDate = Math.floor(Date.now() / 1000) - 86400 + 1; // Más de 1 día después del vencimiento (tardío)

      await paymentCredential.connect(entity).registerPayment(
        userHash,
        ethers.parseEther("100"),
        dueDate,
        paymentDate,
        entityHash,
        "servicios"
      );

      const stats = await paymentCredential.getUserStats(userHash);
      expect(stats.totalPayments).to.equal(1);
      expect(stats.onTimePayments).to.equal(0);
      expect(stats.score).to.equal(0); // 0% puntualidad
    });

    it("No debería permitir registrar pagos sin autorización", async function () {
      const dueDate = Math.floor(Date.now() / 1000);
      const paymentDate = dueDate;

      await expect(
        paymentCredential.connect(user1).registerPayment(
          userHash,
          ethers.parseEther("100"),
          dueDate,
          paymentDate,
          entityHash,
          "servicios"
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Estadísticas de usuario", function () {
    let userHash;

    beforeEach(async function () {
      userHash = generateUserHash("user123");
      await paymentCredential.createUser(userHash);
    });

    it("Debería calcular correctamente las estadísticas", async function () {
      const entityHash = generateUserHash("entity1");
      const now = Math.floor(Date.now() / 1000);

      // Registrar 3 pagos puntuales y 1 tardío
      for (let i = 0; i < 3; i++) {
        await paymentCredential.connect(entity).registerPayment(
          userHash,
          ethers.parseEther("100"),
          now - (i + 1) * 86400,
          now - (i + 1) * 86400,
          entityHash,
          "servicios"
        );
      }

      // Pago tardío
      await paymentCredential.connect(entity).registerPayment(
        userHash,
        ethers.parseEther("100"),
        now - 86400 * 5,
        now - 86400 * 2,
        entityHash,
        "servicios"
      );

      const stats = await paymentCredential.getUserStats(userHash);
      expect(stats.totalPayments).to.equal(4);
      expect(stats.onTimePayments).to.equal(3);
      expect(stats.score).to.equal(750); // 75% puntualidad
      expect(stats.onTimePercentage).to.equal(75);
    });
  });
});

