const { ethers } = require("hardhat");
const address = require("../contracts.json");

async function initContracts() {
    const fscsAddress = address["FSCS"];
    const fscsAbi = require("../artifacts/contracts/FSCS.sol/FSCS.json").abi;
    const fscs = await ethers.getContractAt(fscsAbi, fscsAddress);

    const usdtAddress = address["USDT"];
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);

    const wbtcAddress = address["WBTC"];
    const wbtc = await ethers.getContractAt("IERC20", wbtcAddress);

    const curveAddress = address["CurvePool"];
    const curveAbi = [
        "function last_prices(uint256) external view returns (uint256)",
        "function exchange(uint256, uint256, uint256, uint256) external payable",
        "function price_scale(uint256) external view returns (uint256)",
        "function gamma() external view returns (uint256)",
        "function A() external view returns (uint256)",
        "function is_killed() external view returns (bool)",
    ];
    const curve = await ethers.getContractAt(curveAbi, curveAddress);

    return {
        fscsAddress,
        fscs,
        usdtAddress,
        usdt,
        wbtcAddress,
        wbtc,
        curveAddress,
        curve,
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
            const tx = await fscs.makeTransaction();
            const receipt = await tx.wait();
            return receipt;
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
        async target() {
            return await fscs.targetAddress();
        },
        async getAccounts() {
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            return await provider.listAccounts();
        },
        async swap(amount, account) {
            const signer = await ethers.getSigner(account);
            await usdt.connect(signer).approve(curveAddress, amount);
            await curve.connect(signer).exchange(0, 1, amount, 0);
        },
        async swap(amount) {
            await usdt.approve(curveAddress, amount);
            await curve.exchange(0, 1, amount, 0);
        },
        async swapback(amount, account) {
            const signer = await ethers.getSigner(account);
            await wbtc.connect(signer).approve(curveAddress, amount);
            await curve.connect(signer).exchange(1, 0, amount, 0);
        },
        async swapback(amount) {
            await wbtc.approve(curveAddress, amount);
            await curve.exchange(1, 0, amount, 0);
        }
    };
}

module.exports = initContracts();
