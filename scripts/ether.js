const { ethers } = require("ethers");

async function main() {
  // 合約地址（你剛部署的合約地址）
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // 替換為你的實際合約地址

  // ABI，從 artifacts 中獲取編譯合約時生成的 ABI
  const fscsAbi = require("../artifacts/contracts/FSCS.sol/FSCS.json").abi;

  // 提供者 - 默認使用 Hardhat 提供者
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  // 合約實例 - 使用合約地址和 ABI 創建合約實例
  const fscs = new ethers.Contract(contractAddress, fscsAbi, provider);

  // 如果函數不需要簽名者，可以直接調用並返回值
  const result = await fscs.getSomething('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');  // 替換為你的函數名稱
  console.log("Function return value:", result);

}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
