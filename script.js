const ethers = require("hardhat");
const address = require("../contracts.json");

function makeTransaction() {
    //先創建FSCS合約實例
    const fscsAddress = address.FSCS;
    const fscs = ethers.getContractFactory("FSCS").attach(fscsAddress);
    //先呼叫sellSignal and buySignal函數，並輸出結果
    let result = fscs.sellSignal();
    console.log("sellSignal:", result);
    if(result > 0)
    {
        console.log("because sellSinal > 0, so make a transaction");
        //呼叫makeTransaction函數
        fscs.makeTransaction();
        //輸出交易成功
        console.log("Transaction successful");
        return True;
    }
    result = fscs.buySignal();
    console.log("buySignal:", result);
    if(result > 0)
    {
        console.log("because buySignal > 0, so make a transaction");
        //呼叫makeTransaction函數
        fscs.makeTransaction();
        //輸出交易成功
        console.log("Transaction successful");
        return True;
    }
    return False;
}

function setPrice(price) {
    const swapAddress = address.Swap;
    const swap = (ethers.getContractFactory("contracts/fakeSwap.sol:fakeSwap")).attach(swapAddress);
    swap.setPrice(price);
    console.log("Price set successfully");
}

function getPrice() {
    const swapAddress = address.Swap;
    const swap = (ethers.getContractFactory("contracts/fakeSwap.sol:fakeSwap")).attach(swapAddress);
    return swap.getPrice();
}

function getUsers() {
    //get usdt 
    const usdtAddress = address.USDT;
    const usdt = (ethers.getContractFactory("USDT")).attach(usdtAddress);
    //get fscs
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    //get all users' address on network
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    var rawAccounts = provider.listAccounts();
    var accounts = [];
    for(let i = 0; i < 10 ; i++)
    {
        accounts.push(
            {"address" : rawAccounts[i].address, 
             "USDTbalance" : usdt.balanceOf(rawAccounts[i].address),
             "FSCSbalance" : fscs.balanceOf(rawAccounts[i].address)});
    }
    return accounts;
}

function totalAsset(){
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    return fscs.totalAsset();
}

function assetBalance(address){
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    return fscs.assetBalance(address);
}

function targetBalance(address){
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    return fscs.targetBalance(address);
}

function deposit(address,amount){
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    fscs.connect(address).deposit(amount);
    console.log("Deposit successful");
}

function withdraw(address,amount){
    const fscsAddress = address.FSCS;
    const fscs = (ethers.getContractFactory("FSCS")).attach(fscsAddress);
    fscs.connect(address).withdraw(amount);
    console.log("Withdraw successful");
}
