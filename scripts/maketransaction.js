const { ethers } = require("ethers");

async function main() {
    //先創建FSCS合約實例
    const fscsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const fscsAbi = require("../artifacts/contracts/FSCS.sol/FSCS.json").abi;
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const fscs = new ethers.Contract(fscsAddress, fscsAbi, provider);
    //先輸出assetBalance
    console.log("assetBalance:", await fscs.assetBalance());
    //再輸出targetBalance
    console.log("targetBalance:", await fscs.targetBalance());
    //先呼叫sellSignal and buySignal函數，並輸出結果
    let result = await fscs.sellSignal();
    console.log("sellSignal:", result);
    if(result > 0)
    {
        console.log("because sellSinal > 0, so make a transaction");
        //呼叫makeTransaction函數
        await fscs.makeTransaction();
        //輸出交易成功
        console.log("Transaction successful");
    }
    result = await fscs.buySignal();
    console.log("buySignal:", result);
    if(result > 0)
    {
        console.log("because buySignal > 0, so make a transaction");
        //呼叫makeTransaction函數
        await fscs.makeTransaction();
        //輸出交易成功
        console.log("Transaction successful");
    }
    //先輸出assetBalance
    console.log("assetBalance:", await fscs.assetBalance());
    //再輸出targetBalance
    console.log("targetBalance:", await fscs.targetBalance());
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
