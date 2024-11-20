const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function distributeToken() {
    const signer = await ethers.provider.getSigner();
    const address = require("../contracts.json");
    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);

    //將usdt 分配給使用者
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    for(let i = 0 ; i < 5 ; i++)
    {
        await usdt.transfer(accounts[i].address, 100000000000000);
    }
}

async function mint() {
    //先創建FSCS合約實例
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);
    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);
    //得到所有人的地址
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    for(let i = 0 ; i < 5 ; i++)
    {
        await usdt.connect(accounts[i]).approve(fscsAddress,100000000000);
        let res = await fscs.connect(accounts[i]).deposit(100000000000,accounts[i]);
        res.wait();
    }
}

//分配代幣
distributeToken()
//讓使用者鑄造fscs
mint()
