const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function initContracts() {
    const fscsAddress = address["FSCS"];
    const fscs = await (await ethers.getContractFactory("FSCS")).attach(fscsAddress);

    const usdtAddress = address["USDT"];
    const usdt = await (await ethers.getContractFactory("fakeUSDT")).attach(usdtAddress);

    const wbtcAddress = address["WBTC"];
    const wbtc = await (await ethers.getContractFactory("fakeWBTC")).attach(wbtcAddress);

    const curveAddress = address["CurvePool"];
    const curveAbi = [
        "function last_prices(uint256) external view returns (uint256)",
        "function exchange(uint256, uint256, uint256, uint256) external payable returns (uint256)",
    ];
    const curve = await ethers.getContractAt(curveAbi, curveAddress);

    // const mockAddress = address["MockV3Aggregator"];
    // const mock = await (await ethers.getContractFactory("MockChainlink")).attach(mockAddress);

    const chainlinkAddress = address["Chainlink"];
    const chainlinkAbi = [
        "function latestRoundData() public view returns (uint80, int256, uint256, uint256, uint80)"
    ];

    // Connect to the price feed contract
    const chainlink = await ethers.getContractAt(chainlinkAbi, chainlinkAddress);

    return {
        fscsAddress,
        fscs,
        usdtAddress,
        usdt,
        wbtcAddress,
        wbtc,
        chainlinkAddress,
        chainlink,
        curveAddress,
        curve,
        async setPrice(price) {
            await mock.updateAnswer(price);
        },
        async getPrice() {
            return await fscs.getTokenPrice();
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
            const signer = await ethers.getSigner(account);
            await usdt.connect(signer).approve(fscsAddress, amount);
            const res = await fscs.connect(signer).deposit(amount, account);
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
