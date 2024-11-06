const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function main() {
    //先創建FSCS合約實例
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    //得到所有人的地址
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    for(const account of accounts)
    {
        await usdt.connect(account).approve(fscsAddress,1000000000);
        var res = await fscs.connect(account).deposit(1000000000,account);
        res.wait();
        console.log("Deposit successful");
    }
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
