const {ethers} = require("hardhat");
import address from "../contracts.json" assert {type: 'json'};

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

const fscsAddress = address["FSCS"];
import fscsInfo from "../artifacts/contracts/FSCS.sol/FSCS.json" assert {type: 'json'};
const fscs = new ethers.Contract(fscsAddress, fscsInfo.abi, provider);

const usdtAddress = address["USDT"];
import usdtInfo from "../artifacts/contracts/fakeUSDT.sol/fakeUSDT.json" assert {type: 'json'};
const usdt = new ethers.Contract(usdtAddress, usdtInfo.abi, provider);

const wbtcAddress = address["WBTC"];
import wbtcInfo from "../artifacts/contracts/fakeWBTC.sol/fakeWBTC.json" assert {type: 'json'};
const wbtc = new ethers.Contract(wbtcAddress, wbtcInfo.abi, provider);

const swapAddress = address["Swap"];
import swapInfo from "../artifacts/contracts/fakeSwap.sol/fakeSwap.json" assert {type: 'json'};
const swap = new ethers.Contract(swapAddress, swapInfo.abi, provider);

const signer = await provider.getSigner();
async function initContracts() {
    return{

        async setPrice(price) {
            await swap.connect(signer).setPrice(price);
        }
        async getPrice() {
            return await swap.getPrice();
        }
        async makeTransaction() {
            await fscs.connect(signer).makeTransaction();
        }
        async deposit(amount, account) {
            account = await provider.getSigner(account);
            await usdt.connect(account).approve(fscsAddress, amount);
            const res = await fscs.connect(account).deposit(amount, account);
            await res.wait();
        }
        async withdraw(amount, account) {
            account = await provider.getSigner(account);
            await fscs.connect(account).withdraw(amount, account , account);
        }
        async getAccounts() {
            let accountsRaw = await provider.listAccounts();
            let accounts = [];
            for(const account of accountsRaw)
            {
                accounts.push({
                    address: account.address,
                    usdt: await usdt.balanceOf(account),
                    fscs: await fscs.balanceOf(account),
                    wbtc: await wbtc.balanceOf(account)
                });
            }
            accounts.push({
                address: "swap",
                usdt: await usdt.balanceOf(swapAddress),
                fscs: await fscs.balanceOf(swapAddress),
                wbtc: await wbtc.balanceOf(swapAddress)
            });
            accounts.push({
                address: "fscs",
                usdt: await usdt.balanceOf(fscsAddress),
                fscs: await fscs.balanceOf(fscsAddress),
                wbtc: await wbtc.balanceOf(fscsAddress)
            });
            return accounts;
        }
    }
}
module.exports = initContracts();
