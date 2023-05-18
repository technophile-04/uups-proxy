import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { verify } from "../utils/verify";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContractV2Contract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, upgrades } = hre;

  const chainId = await hre.getChainId();

  // We can get this deployement because we have `save` deployments in 00_deploy_your_contract.ts
  const YourContractProxy = await deployments.get("YourContract");

  // Get V2 contractFactory to which we will upgrade
  const YourContractV2 = await ethers.getContractFactory("YourContractV2");

  // Upgrade the contract
  const upgradedContract = await upgrades.upgradeProxy(YourContractProxy.address, YourContractV2);

  // Wait for 3 blocks to confirm the transaction if we are on a live network
  if (chainId !== "31337") {
    deployments.log("Waiting for 2 blocks to be mined...");
    await upgradedContract.deployTransaction.wait(2);
    deployments.log("Transaction confirmed.");
  }
  // We had to wait for blocks to be mined before we could get the implementation address because sometimes its error out
  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(upgradedContract.address);

  deployments.log(`YourContractProxy is now pointing to implementation deployed to: ${newImplementationAddress}`);

  const yourContractV2artifacts = await deployments.getExtendedArtifact("YourContractV2");

  // Update the deployments with the new implementation artifacts
  const proxyDeployment = {
    address: upgradedContract.address, // This is will not change (This is proxy address)
    ...yourContractV2artifacts,
  };

  // Add the deployments for the new implementation
  const implementationDeployment = {
    address: newImplementationAddress,
    ...yourContractV2artifacts,
  };

  await deployments.save("YourContract", proxyDeployment);

  await deployments.save("YourContractV2_Implementation", implementationDeployment);

  if (chainId !== "31337") {
    deployments.log("Verifying YourContractV2_Implementation on Etherscan...");
    await verify(newImplementationAddress, []);
    deployments.log("YourContract_ImplementationV2 Proxy verified on Etherscan.");
  }
};

export default deployYourContractV2Contract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContractV2Contract.tags = ["YourContractV2"];
