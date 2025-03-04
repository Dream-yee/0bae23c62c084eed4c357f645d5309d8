const { ethers } = require("hardhat");
const fs = require("fs");

//檢查地址是否為合約地址
async function checkContract(address) {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const code = await provider.getCode(address);
    console.log(code);
    if (code !== "0x") {
        console.log("這是一個智能合約地址");
    } else {
        console.log("這是一個普通的以太坊地址");
    }
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // console.log("Deploying fakeUSDT");
    // const usdt = await ethers.deployContract("fakeUSDT");
    //
    // console.log("Deploying fakeWBTC");
    // const wbtc = await ethers.deployContract("fakeWBTC");
    //
    // console.log("USDT address:", usdt.target, ", WBTC address:", wbtc.target);
    //
    // // 部署 MockV3Aggregator (模擬 Chainlink 餵送合約)
    // console.log("Deploying MockV3Aggregator (Fake Chainlink)");
    // const decimals = 8;
    // const initialPrice = 2000 * 10 ** decimals; // 假設價格為 $2000
    // const mockV3Aggregator = await ethers.deployContract("MockChainlink", [decimals, initialPrice]);
    // console.log("MockV3Aggregator address:", mockV3Aggregator.target);

    // 部署 FSCS 合約
    const abiPath = './artifacts/contracts/FSCS.sol/FSCS.json';
    const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    console.log("Deploying FSCS");
    // const bottom = 2n**64n*100n/110000n;
    // const reference = 2n**64n*100n/90000n;
    // arb
    const bottom = 90000n*2n**64n/100n;
    const reference = 110000n*2n**64n/100n;
    const grid = 50;
    const usdtAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
    const wbtcAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
    const poolAddress = "0x5969EFddE3cF5C0D9a88aE51E47d721096A97203";
    // Sepolia
    // const poolAddress = "0x4b053461dd564CF8e0d2F9E3b73D78BD837de765";
    // const usdtAddress = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";
    // const wbtcAddress = "0x29f2D40B0605204364af54EC677bD022dA425d03";
    // const bottom = 1000n*2n**64n/100n;
    // const reference = 2000n*2n**64n/100n;
    const fscs = await ethers.deployContract("FSCS", [
        poolAddress,
        bottom,
        reference,
        grid,
    ],
        { maxFeePerGas: 10824610821 });
    console.log("FSCS address:", fscs.target);
    const swapAbiPath = './artifacts/contracts/SwapContract.sol/SwapContract.json';
    const swapArtifact = JSON.parse(fs.readFileSync(swapAbiPath, 'utf8'));
    console.log("Deploying SwapContract");
    const swap = await ethers.deployContract("SwapContract", [poolAddress],
        { maxFeePerGas: 10824610821 });

    //將合約地址寫入json文件
    let contracts = {
        "USDT": usdtAddress,
        "WBTC": wbtcAddress,
        "FSCS": fscs.target,
        "Pool": poolAddress,
        "SwapContract": swap.target,
    };
    fs.writeFileSync("./contracts.json", JSON.stringify(contracts, null, 4));
}

main();
