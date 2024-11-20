const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function initContracts() {
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);

    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);

    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);

    const mockAddress = address["MockV3Aggregator"];
    const mock = await (await ethers.getContractFactory("MockChainlink")).attach(mockAddress);

    const chainlinkAddress = address["Chainlink"];
    const abi = [
        "function latestRoundData() public view returns (uint80, int256, uint256, uint256, uint80)"
    ];

    // Connect to the price feed contract
    const chainlink = await ethers.getContractAt(abi, chainlinkAddress);

    return {
        fscsAddress,
        fscs,
        usdtAddress,
        usdt,
        wbtcAddress,
        wbtc,
        chainlinkAddress,
        chainlink,
        async setPrice(price) {
            await mock.updateAnswer(price);
        },
        async getPrice() {
            return await fscs.getTokenPrice(1);
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
            await fscs.connect(account).withdraw(amount, account, account);
        },
        async getTokenLevel() {
            return await fscs.getTokenLevel();
        },
        async asset() {
            return await fscs.asset();
        },
        async getAccounts() {
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            return await provider.listAccounts();
        },
        async getData() {
            return await mock.latestRoundData();
        },
    };
}

module.exports = initContracts();
