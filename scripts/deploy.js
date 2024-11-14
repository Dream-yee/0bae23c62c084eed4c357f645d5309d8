const {ethers} = require("hardhat");
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

    console.log("Deploying fakeSwap");
    const swap = await ethers.deployContract("contracts/fakeSwap.sol:fakeSwap", [usdt.target,wbtc.target]);
    console.log("Swap address:", swap.target);
    //變更swap的價格
    await swap.setPrice(50);

    console.log("Deploying FSCS");
    const bottom = 10;
    const reference = 100;
    const grid = 5;
    const fscs = await ethers.deployContract("FSCS", [usdt.target,wbtc.target,swap.target, bottom, reference, grid]);
    console.log("FSCS address:", fscs.target);
    
    const test = await ethers.deployContract("DataConsumerV3");
    //將合約地址寫入json文件
    let contracts = {
        "TEST": test.target,
        "USDT": usdt.target,
        "WBTC": wbtc.target,
        "Swap": swap.target,
        "FSCS": fscs.target
    };
    fs.writeFileSync("./contracts.json", JSON.stringify(contracts, null, 4));

}

main();
