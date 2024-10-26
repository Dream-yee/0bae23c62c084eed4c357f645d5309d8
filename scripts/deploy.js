async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const FSCS = await ethers.getContractFactory("FSCS"); // 替換為你的合約名稱
  const fscs = await FSCS.deploy("0xdAC17F958D2ee523a2206206994597C13D831ec7","0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599");
  const TEST = await ethers.getContractFactory("contracts/test.sol:Test"); // 替換為你的合約名稱
  const test = await TEST.deploy();

  console.log("Type of Test is ",typeof test);
  console.log("FSCS contract deployed to:", fscs.target);
  console.log("Test contract deployed to:",test.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
