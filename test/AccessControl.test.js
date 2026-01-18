const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventHorizonAccessControl", function () {
  let contract;
  let owner;
  let engineer;
  let marketing;

  const ROLE = {
    FOUNDER: 0,
    ENGINEER: 1,
    MARKETING: 2,
  };

  const ACCESS_TYPE = {
    FULL: 0,
    PARTIAL: 1,
    SEMANTIC: 2,
    DENIED: 3,
  };

  beforeEach(async function () {
    [owner, engineer, marketing] = await ethers.getSigners();

    const AccessControl = await ethers.getContractFactory("EventHorizonAccessControl");
    contract = await AccessControl.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should assign founder role to owner", async function () {
      const role = await contract.getUserRole(owner.address);
      expect(role).to.equal(ROLE.FOUNDER);
    });
  });

  describe("Role Assignment", function () {
    it("Should assign engineer role", async function () {
      await contract.assignRole(engineer.address, ROLE.ENGINEER);
      const role = await contract.getUserRole(engineer.address);
      expect(role).to.equal(ROLE.ENGINEER);
    });

    it("Should assign marketing role", async function () {
      await contract.assignRole(marketing.address, ROLE.MARKETING);
      const role = await contract.getUserRole(marketing.address);
      expect(role).to.equal(ROLE.MARKETING);
    });

    it("Should emit RoleAssigned event", async function () {
      await expect(contract.assignRole(engineer.address, ROLE.ENGINEER))
        .to.emit(contract, "RoleAssigned")
        .withArgs(engineer.address, ROLE.ENGINEER);
    });

    it("Should only allow owner to assign roles", async function () {
      await expect(
        contract.connect(engineer).assignRole(marketing.address, ROLE.MARKETING)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Access Control - Founder", function () {
    it("Should grant FULL access to revenue", async function () {
      const access = await contract.checkFieldAccess(owner.address, 0); // revenue
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });

    it("Should grant FULL access to risks", async function () {
      const access = await contract.checkFieldAccess(owner.address, 1); // risks
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });

    it("Should grant FULL access to roadmap", async function () {
      const access = await contract.checkFieldAccess(owner.address, 2); // roadmap
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });

    it("Should grant FULL access to marketSize", async function () {
      const access = await contract.checkFieldAccess(owner.address, 3); // marketSize
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });
  });

  describe("Access Control - Engineer", function () {
    beforeEach(async function () {
      await contract.assignRole(engineer.address, ROLE.ENGINEER);
    });

    it("Should grant PARTIAL access to revenue", async function () {
      const access = await contract.checkFieldAccess(engineer.address, 0);
      expect(access).to.equal(ACCESS_TYPE.PARTIAL);
    });

    it("Should deny access to risks", async function () {
      const access = await contract.checkFieldAccess(engineer.address, 1);
      expect(access).to.equal(ACCESS_TYPE.DENIED);
    });

    it("Should grant FULL access to roadmap", async function () {
      const access = await contract.checkFieldAccess(engineer.address, 2);
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });

    it("Should grant FULL access to marketSize", async function () {
      const access = await contract.checkFieldAccess(engineer.address, 3);
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });
  });

  describe("Access Control - Marketing", function () {
    beforeEach(async function () {
      await contract.assignRole(marketing.address, ROLE.MARKETING);
    });

    it("Should grant PARTIAL access to revenue", async function () {
      const access = await contract.checkFieldAccess(marketing.address, 0);
      expect(access).to.equal(ACCESS_TYPE.PARTIAL);
    });

    it("Should grant SEMANTIC access to risks", async function () {
      const access = await contract.checkFieldAccess(marketing.address, 1);
      expect(access).to.equal(ACCESS_TYPE.SEMANTIC);
    });

    it("Should grant FULL access to roadmap", async function () {
      const access = await contract.checkFieldAccess(marketing.address, 2);
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });

    it("Should grant FULL access to marketSize", async function () {
      const access = await contract.checkFieldAccess(marketing.address, 3);
      expect(access).to.equal(ACCESS_TYPE.FULL);
    });
  });

  describe("Access Verification Event", function () {
    it("Should emit AccessVerified event", async function () {
      await contract.assignRole(engineer.address, ROLE.ENGINEER);

      await expect(contract.connect(engineer).verifyAndLogAccess(0)) // revenue field
        .to.emit(contract, "AccessVerified")
        .withArgs(engineer.address, "revenue", ACCESS_TYPE.PARTIAL);
    });

    it("Should log denied access as event", async function () {
      await contract.assignRole(engineer.address, ROLE.ENGINEER);

      await expect(contract.connect(engineer).verifyAndLogAccess(1)) // risks field
        .to.emit(contract, "AccessVerified")
        .withArgs(engineer.address, "risks", ACCESS_TYPE.DENIED);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle unassigned roles", async function () {
      const access = await contract.checkFieldAccess(marketing.address, 0);
      expect(access).to.equal(ACCESS_TYPE.DENIED);
    });

    it("Should validate field index", async function () {
      await expect(contract.connect(owner).verifyAndLogAccess(99)).to.be.revertedWith(
        "Invalid field index"
      );
    });

    it("Should reject invalid user address", async function () {
      await expect(
        contract.assignRole("0x0000000000000000000000000000000000000000", ROLE.ENGINEER)
      ).to.be.revertedWith("Invalid user address");
    });
  });

  describe("Integration Tests", function () {
    it("Complete workflow: assign roles and check access", async function () {
      // Assign roles
      await contract.assignRole(engineer.address, ROLE.ENGINEER);
      await contract.assignRole(marketing.address, ROLE.MARKETING);

      // Verify founder access
      expect(await contract.checkFieldAccess(owner.address, 0)).to.equal(ACCESS_TYPE.FULL);
      expect(await contract.checkFieldAccess(owner.address, 1)).to.equal(ACCESS_TYPE.FULL);

      // Verify engineer access
      expect(await contract.checkFieldAccess(engineer.address, 0)).to.equal(
        ACCESS_TYPE.PARTIAL
      );
      expect(await contract.checkFieldAccess(engineer.address, 1)).to.equal(ACCESS_TYPE.DENIED);

      // Verify marketing access
      expect(await contract.checkFieldAccess(marketing.address, 0)).to.equal(
        ACCESS_TYPE.PARTIAL
      );
      expect(await contract.checkFieldAccess(marketing.address, 1)).to.equal(ACCESS_TYPE.SEMANTIC);
    });

    it("Should handle role changes", async function () {
      // Initially no role
      expect(await contract.checkFieldAccess(engineer.address, 1)).to.equal(ACCESS_TYPE.DENIED);

      // Assign engineer role
      await contract.assignRole(engineer.address, ROLE.ENGINEER);
      expect(await contract.checkFieldAccess(engineer.address, 1)).to.equal(ACCESS_TYPE.DENIED);

      // Change to marketing role
      await contract.assignRole(engineer.address, ROLE.MARKETING);
      expect(await contract.checkFieldAccess(engineer.address, 1)).to.equal(ACCESS_TYPE.SEMANTIC);

      // Change back to founder
      await contract.assignRole(engineer.address, ROLE.FOUNDER);
      expect(await contract.checkFieldAccess(engineer.address, 1)).to.equal(ACCESS_TYPE.FULL);
    });
  });

  describe("Gas Optimization", function () {
    it("Read operations should be gas efficient", async function () {
      // These should use minimal gas (read-only)
      await contract.getUserRole(owner.address);
      await contract.checkFieldAccess(owner.address, 0);
    });

    it("Multiple assignments should work", async function () {
      for (let i = 0; i < 10; i++) {
        const [, user] = await ethers.getSigners();
        const role = i % 3; // Cycle through roles
        await contract.assignRole(user.address, role);
      }
    });
  });
});
