const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function main() {
    //取得usdt
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    //取得fscs
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);
    //取得wbtc
    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);
    //取得所有人的地址
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    console.log("               accounts                     |       usdt balance        |       fscs balance      |       wbtc balance");
    for(const account of accounts)
    {
        console.log(account.address,"  ", await usdt.balanceOf(account.address), "  ", await fscs.balanceOf(account.address), "  ", await wbtc.balanceOf(account.address));
    }
    const swapAddress = address["Swap"];
    console.log("swap ", await usdt.balanceOf(swapAddress), "  ", await fscs.balanceOf(swapAddress), "  ", await wbtc.balanceOf(swapAddress));
    console.log("fscs ", await usdt.balanceOf(fscsAddress), "  ", await fscs.balanceOf(fscsAddress), "  ", await wbtc.balanceOf(fscsAddress));
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
