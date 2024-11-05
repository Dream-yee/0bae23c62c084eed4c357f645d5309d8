const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function main() {
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    console.log("               accounts                     |       usdt balance        |    fscs balance");
    for(const account of accounts)
    {
        console.log(account.address,"  ", await usdt.balanceOf(account.address), "  ", await fscs.balanceOf(account.address));
    }
    const swapAddress = address["Swap"];
    console.log("swap ", await usdt.balanceOf(swapAddress), "  ", await fscs.balanceOf(swapAddress));
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
