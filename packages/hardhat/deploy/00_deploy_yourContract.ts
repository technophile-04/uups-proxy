import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { verify } from "../utils/verify";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContractContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { log } = hre.deployments;

  const chainId = await hre.getChainId();

  // Get contract factory for YourContract
  const YourContract = await hre.ethers.getContractFactory("YourContract");

  // "0xF37dB18dA71970FeE6242EdFF9cb5C841D68F117" is my burner(frontend) address, add yours (This will be passed to initialze function)
  const proxy = await hre.upgrades.deployProxy(YourContract, ["0xF37dB18dA71970FeE6242EdFF9cb5C841D68F117"], {
    kind: "uups",
  });

  // Wait for 3 blocks to confirm the transaction if we are on a live network
  if (chainId !== "31337") {
    log("Waiting for 2 blocks to be mined...");
    await proxy.deployTransaction.wait(2);
    log("Transaction confirmed.");
  }
  // We had to wait for blocks to be mined before we could get the implementation address because sometimes its error out
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxy.address);

  log(`YourContract Proxy deployed to: ${proxy.address}`);
  log(`YourContract Implementation deployed to: ${implementationAddress}`);

  const artifacts = await hre.deployments.getExtendedArtifact("YourContract");

  const proxyDeployment = {
    address: proxy.address,
    ...artifacts,
  };

  const implementationDeployment = {
    address: implementationAddress,
    ...artifacts,
  };

  await hre.deployments.save("YourContract", proxyDeployment);
  await hre.deployments.save("YourContract_Implementation", implementationDeployment);

  if (chainId !== "31337") {
    log("Verifying YourContract_Implementation on Etherscan...");
    await verify(implementationAddress, []);
    log("YourContract_Implementation Proxy verified on Etherscan.");

    log("Verifying Proxy on Etherscan...");
    await verify(proxy.address, []);
    log("Proxy verified on Etherscan.");
  }
};

export default deployYourContractContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContractContract.tags = ["YourContract"];
