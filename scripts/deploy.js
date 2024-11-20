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

    console.log("Deploying fakeUSDT");
    const usdt = await ethers.deployContract("fakeUSDT");

    console.log("Deploying fakeWBTC");
    const wbtc = await ethers.deployContract("fakeWBTC");

    console.log("USDT address:", usdt.target, ", WBTC address:", wbtc.target);

    // 部署 MockV3Aggregator (模擬 Chainlink 餵送合約)
    console.log("Deploying MockV3Aggregator (Fake Chainlink)");
    const decimals = 8;
    const initialPrice = 2000 * 10 ** decimals; // 假設價格為 $2000
    const mockV3Aggregator = await ethers.deployContract("MockChainlink", [decimals, initialPrice]);
    console.log("MockV3Aggregator address:", mockV3Aggregator.target);

    // 部署 FSCS 合約
    console.log("Deploying FSCS");
    const bottom = 10;
    const reference = 100;
    const grid = 5;
    const chainlinkAddress = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
    const fscs = await ethers.deployContract("FSCS", [
        usdt.target,
        wbtc.target,
        chainlinkAddress,
        bottom,
        reference,
        grid,
    ]);
    console.log("Deploying FSCS");
    console.log("FSCS address:", fscs.target);

    //將合約地址寫入json文件
    let contracts = {
        "USDT": usdt.target,
        "WBTC": wbtc.target,
        "FSCS": fscs.target,
        "MockV3Aggregator": mockV3Aggregator.target,
        "Chainlink": chainlinkAddress
    };
    fs.writeFileSync("./contracts.json", JSON.stringify(contracts, null, 4));
}

main();
