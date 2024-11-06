const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function main() {
    const signer = await ethers.provider.getSigner();
    //先給swap wBTC
    const swapAddress = address["Swap"];
    const swap = await (await ethers.getContractFactory("contracts/fakeSwap.sol:fakeSwap")).attach(swapAddress);
    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);
    await wbtc.transfer(swapAddress, 100000000000);

    //將usdt 分配給使用者，以及swap合約
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    console.log("done");
    for (const account of accounts) {
        await usdt.transfer(account.address, 10000000000);
    }
    console.log("done");
    await usdt.transfer(swapAddress, 100000000000);
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
