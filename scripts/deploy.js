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
    console.log("Deploying FSCS");
    const bottom = ethers.parseUnits("10000", 18);
    const reference = ethers.parseUnits("200000", 18);
    const grid = 7;
    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const wbtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    const chainlinkAddress = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
    const curvePoolAddress = "0xf5f5B97624542D72A9E06f04804Bf81baA15e2B4";
    const fscs = await ethers.deployContract("FSCS", [
        usdtAddress,
        wbtcAddress,
        curvePoolAddress,
        bottom,
        reference,
        grid,
    ],
        { maxFeePerGas: 10824610821 });
    console.log("FSCS address:", fscs.target);

    //將合約地址寫入json文件
    let contracts = {
        "USDT": usdtAddress,
        "WBTC": wbtcAddress,
        "FSCS": fscs.target,
        "Chainlink": chainlinkAddress,
        "CurvePool": curvePoolAddress,
    };
    fs.writeFileSync("./contracts.json", JSON.stringify(contracts, null, 4));
}

main();
