const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function main() {
    const tools = await require("./tools.js")
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    console.log("               accounts                     |       usdt balance        |       fscs balance      |       wbtc balance");
    console.log("FSCS", " ", await tools.usdt.balanceOf(address.FSCS), "  ", 0, "  ", await tools.wbtc.balanceOf(address.FSCS));
    for(const account of accounts)
    {
        console.log(account.address,"  ", await tools.usdt.balanceOf(account.address), "  ", await tools.fscs.balanceOf(account.address), "  ", await tools.wbtc.balanceOf(account.address));
    }
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
