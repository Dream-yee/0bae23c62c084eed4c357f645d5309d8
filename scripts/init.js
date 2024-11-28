const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function distributeToken() {
    //找到巨鯨
    const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; //這是幣安的錢包
    const WBTC_WHALE = "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC";
    await network.provider.send("hardhat_impersonateAccount", [USDT_WHALE]);
    const usdtHolderSigner = await ethers.getSigner(USDT_WHALE);
    await network.provider.send("hardhat_impersonateAccount", [WBTC_WHALE]);
    const wbtcHolderSigner = await ethers.getSigner(WBTC_WHALE);

    //一些重要的常數
    const [deployer] = await ethers.getSigners();
    const address = require("../contracts.json"); //讀取合約地址
    const usdtAmount = ethers.parseUnits("1000000000", 6); //1e9個usdt
    const wbtcAmount = ethers.parseUnits("9000", 8); //9e3個wbtc

    //將usdt 分配給使用者
    const usdtAddress = address["USDT"];
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);
    await usdt.connect(usdtHolderSigner).transfer(deployer, usdtAmount);
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    for (let i = 1; i < 5; i++) {
        await usdt.connect(deployer).transfer(accounts[i].address, 10000000000000);
        console.log("分配給" + accounts[i].address);
    }

    const wbtcAddress = address["WBTC"];
    const wbtc = await ethers.getContractAt("IERC20", wbtcAddress);
    await network.provider.send("hardhat_setBalance", [
        WBTC_WHALE,
        "0x56BC75E2D631000000", // 100 ETH in hex
    ]);
    wbtc.connect(wbtcHolderSigner).transfer(deployer, wbtcAmount);
}

async function mint() {
    //先創建FSCS合約實例
    const fscsAddress = address["FSCS"];
    const fscs = await ethers.getContractAt("FSCS", fscsAddress);
    const usdtAddress = address["USDT"];
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);
    //得到所有人的地址
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    for (let i = 0; i < 5; i++) {
        await usdt.connect(accounts[i]).approve(fscsAddress, 1000000000000);
        let res = await fscs.connect(accounts[i]).deposit(1000000000000, accounts[i].address);
        res.wait();
    }
}

//分配代幣
distributeToken()
    .then(() => {
        console.log("分配完畢");
        mint()
    })
//讓使用者鑄造fscs
