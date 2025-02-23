const { ethers } = require("hardhat");
const address = require("../contracts.json");

const zeroForOne = false;

async function distributeToken() {
    //找到巨鯨
    // arb
    const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; //452,552,724.53 USDT
    const WBTC_WHALE = "0x078f358208685046a11C85e8ad32895DED33A249"; //Aave: aWBTC Token V3, 2699 WBTC
    // Sepolia
    // const USDT_WHALE = "0x4b053461dd564CF8e0d2F9E3b73D78BD837de765"; 
    // const WBTC_WHALE = "0x4b053461dd564CF8e0d2F9E3b73D78BD837de765"; 
    await network.provider.send("hardhat_impersonateAccount", [USDT_WHALE]);
    const usdtHolderSigner = await ethers.getSigner(USDT_WHALE);
    await network.provider.send("hardhat_impersonateAccount", [WBTC_WHALE]);
    const wbtcHolderSigner = await ethers.getSigner(WBTC_WHALE);

    //一些重要的常數
    const [deployer] = await ethers.getSigners();
    const address = require("../contracts.json"); //讀取合約地址
    const usdtAmount = ethers.parseUnits("40000000", 6); //4e8個usdt 
    const wbtcAmount = ethers.parseUnits("2500", 8); //2e3個wbtc 2500

    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    const usdtAddress = address["USDT"];
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);
    const wbtcAddress = address["WBTC"];
    const wbtc = await ethers.getContractAt("IERC20", wbtcAddress);
    await network.provider.send("hardhat_setBalance", [
        WBTC_WHALE,
        "0x56BC75E2D631000000", // 100 ETH in hex
    ]);
    await usdt.connect(usdtHolderSigner).transfer(deployer, usdtAmount);
    await wbtc.connect(wbtcHolderSigner).transfer(deployer, wbtcAmount);
    if(zeroForOne) {
      for (let i = 1; i < 5; i++) {
          await wbtc.connect(deployer).transfer(accounts[i].address, 40_000_000_000);
          console.log("分配給" + accounts[i].address);
      }
    }
    else{
      for (let i = 1; i < 5; i++) {
          await usdt.connect(deployer).transfer(accounts[i].address, 100_000_000_000);
          console.log("分配給" + accounts[i].address);
      }
    }


}

async function mint() {
    //先創建FSCS合約實例
    const fscsAddress = address["FSCS"];
    const fscs = await ethers.getContractAt("FSCS", fscsAddress);
  //得到所有帳戶
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    if(zeroForOne)
    {
      const wbtcAddress = address["WBTC"];
      const wbtc = await ethers.getContractAt("IERC20", wbtcAddress);
      for (let i = 0; i < 5; i++) {
        await wbtc.connect(accounts[i]).approve(fscsAddress, 40000000000);
        let res = await fscs.connect(accounts[i]).deposit(40000000000, accounts[i].address);
        res.wait();
      }
    }
    else
    {
      const usdtAddress = address["USDT"];
      const usdt = await ethers.getContractAt("IERC20", usdtAddress);
      for (let i = 0; i < 5; i++) {
        await usdt.connect(accounts[i]).approve(fscsAddress, 100_000_000);
        let res = await fscs.connect(accounts[i]).deposit(100_000_000, accounts[i].address);
        res.wait();
      }
    }
}

//分配代幣
distributeToken()
    .then(() => {
        console.log("分配完畢");
        mint()
    })
//讓使用者鑄造fscs
