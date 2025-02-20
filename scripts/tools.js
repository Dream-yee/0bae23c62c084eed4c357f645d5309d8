const { ethers } = require("hardhat");
const address = require("../contracts.json");

const zeroForOne = false;
const MIN_SQRT_RATIO = 4295128739n;
const MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342n;

async function initContracts() {
    const fscsAddress = address["FSCS"];
    const fscsAbi = require("../artifacts/contracts/FSCS.sol/FSCS.json").abi;
    const fscs = await ethers.getContractAt(fscsAbi, fscsAddress);

    const usdtAddress = address["USDT"];
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);

    const wbtcAddress = address["WBTC"];
    const wbtc = await ethers.getContractAt("IERC20", wbtcAddress);

    const poolAddress = address["Pool"];
    const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddress);
    
    const swapAddress = address["SwapContract"];
    const swapAbi = require("../artifacts/contracts/SwapContract.sol/SwapContract.json").abi;
    const swap = await ethers.getContractAt(swapAbi, swapAddress);

    const [deployer] = await ethers.getSigners();

    return {
        deployer,
        fscsAddress,
        fscs,
        usdtAddress,
        usdt,
        wbtcAddress,
        wbtc,
        poolAddress,
        pool,
        swap,
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
            if(zeroForOne) {
                await wbtc.connect(signer).approve(fscsAddress, amount);
            } else {
                await usdt.connect(signer).approve(fscsAddress, amount);
            }
            const res = await fscs.connect(signer).deposit(amount, account);
            await res.wait();
        },
        async withdraw(amount, account) {
            const signer = await ethers.getSigner(account);
            const tx = await fscs.connect(signer).withdraw(amount, signer, signer);
            const receipt = await tx.wait();
            return receipt;
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
        async swapWAccount(amount, account) {
            const signer = await ethers.getSigner(account);
            if(zeroForOne) {
                await wbtc.connect(signer).approve(swapAddress, amount);
            }
            else {
                await usdt.connect(signer).approve(swapAddress, amount);
            }
            await swap.connect(signer).swap(zeroForOne,amount);
        },
        async swap(amount) {
            if(zeroForOne) {
              await wbtc.approve(swapAddress, amount);
            }
            else {
              await usdt.approve(swapAddress, amount);
            }
            await swap.swap(zeroForOne,amount);
        },
        async swapbackWAccount(amount, account) {
            const signer = await ethers.getSigner(account);
            if(zeroForOne) {
                await usdt.connect(signer).approve(swapAddress, amount);
            }
            else {
                await wbtc.connect(signer).approve(swapAddress, amount);
            }
            await swap.connect(signer).swap(!zeroForOne, amount);
        },
        async swapback(amount) {
            if(zeroForOne) {
              await usdt.approve(swapAddress, amount);
            }
            else {
              await wbtc.approve(swapAddress, amount);
            }
            await swap.swap(!zeroForOne, amount);
        }
    };
}

module.exports = initContracts();
