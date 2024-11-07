const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function initContracts() {
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);

    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);

    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);

    const swapAddress = address["Swap"];
    const swap = await (await ethers.getContractFactory("contracts/fakeSwap.sol:fakeSwap")).attach(swapAddress);

    return {
        fscsAddress,
        fscs,
        usdtAddress,
        usdt,
        wbtcAddress,
        wbtc,
        swapAddress,
        swap,
        async setPrice(price) {
            await swap.setPrice(price);
        },
        async getPrice() {
            return await swap.getPrice();
        },
        async buySignal() {
            return await fscs.buySignal();
        },
        async sellSignal() {
            return await fscs.sellSignal();
        },
        async makeTransaction() {
            await fscs.makeTransaction();
        },
        async deposit(amount, account) {
            await usdt.connect(account).approve(fscsAddress, amount);
            const res = await fscs.connect(account).deposit(amount, account);
            await res.wait();
        },
        async withdraw(amount, account) {
            await fscs.connect(account).withdraw(amount, account , account);
        },
        async getTokenLevel() {
            return await fscs.getTokenLevel();
        },
        async asset()
        {
            return await fscs.asset();
        },
        async getAccounts() {
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            return await provider.listAccounts();
        }
    };
}

module.exports = initContracts();
