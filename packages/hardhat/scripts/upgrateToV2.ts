import { deployments, upgrades, ethers, getChainId, run } from "hardhat";
import { YourContractV2 } from "../typechain-types";
import { verify } from "../utils/verify";

async function main() {
  const chainId = await getChainId();

  // We can get this deployement because we have `save` deployments in 00_deploy_your_contract.ts
  const YourContractProxy = await deployments.get("YourContract_Proxy");

  // Get V2 contractFactory to which we will upgrade
  const YourContractV2 = await ethers.getContractFactory("YourContractV2");

  // Upgrade the contract
  const upgradedContract = (await upgrades.upgradeProxy(YourContractProxy.address, YourContractV2)) as YourContractV2;

  // Wait for 3 blocks to confirm the transaction if we are on a live network
  if (chainId !== "31337") {
    console.log("Waiting for 2 blocks to be mined...");
    await upgradedContract.deployTransaction.wait(2);
    console.log("Transaction confirmed.");
  }
  // We had to wait for blocks to be mined before we could get the implementation address because sometimes its error out
  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(upgradedContract.address);

  // transferOwership to my Frontend(Burner) address
  await upgradedContract.transferOwnership("0xF37dB18dA71970FeE6242EdFF9cb5C841D68F117");

  console.log(`YourContract_Proxy is now pointing to implementation deployed at: ${newImplementationAddress}`);

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

  await deployments.save("YourContract_Proxy", proxyDeployment);

  await deployments.save("YourContractV2_Implementation", implementationDeployment);

  // Export the hardhat-deploy deployments to JSON file and put it in the frontend
  await run("export", { exportAll: "./temp/hardhat_contracts.json" });
  await run("run", { script: "scripts/generateTsAbis.ts" });

  if (chainId !== "31337") {
    console.log("Verifying YourContractV2_Implementation on Etherscan...");
    await verify(newImplementationAddress, []);
    console.log("YourContractV2_Implementation verified on Etherscan.");
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
