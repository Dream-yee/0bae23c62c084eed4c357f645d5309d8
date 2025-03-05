
const zeroForOne = false; 
async function shouldMakeTransaction() {
    const tools = await require("./tools.js")
    let level = await tools.getTokenLevel();
    let previousLevel = await tools.getPreviousLevel();
    if(level == previousLevel)return false;
    if(level < previousLevel) //買入
    {
        if(previousLevel == await tools.GRID_NUM())
        {
            previousLevel = await tools.GRID_NUM()-1n;
        }
        let amount = await tools.fscs.assetBalance()/previousLevel; 
        if(amount == 0)return false;
        for(let i = level; i < previousLevel; i++)
        {
            if(await tools.buyQty(i) == 0)
            {
                return true;
            }
        }
        return false;
    }
    else if(level > previousLevel) //賣出
    {
        if(previousLevel == 0n)
        {
            previousLevel = 1n;
        }
        for(let i = previousLevel ; i < level; i++)
        {
            if(await tools.buyQty(i-1n) != 0n)
            {
                return true;
            }
        }
        return false;
    }
}
async function main() {
    const tools = await require("./tools.js")
    let initTotalAsset = await tools.fscs.totalAssets();
    console.log("initTotalAsset: ", initTotalAsset);
    let cnt = 0;
    // repeat 100 times and randomly swap 50_000_000 or 50_000_000_000
    for (let i = 0; i < 100; i++) {
        //generate random number 0 or 1
        if(Math.floor(Math.random() * 2) == 0) {
            await tools.swap(zeroForOne?45_000_000n:150_000_000_000n);
            console.log("swap");
        } else {
            await tools.swapback(zeroForOne?38_000_000_000n:180_000_000n);
            console.log("swapback");
        }
        console.log(await tools.getTokenLevel(),await tools.getPrice()*100n>>64n);
        if(await shouldMakeTransaction()){
            let assetBalance = await tools.fscs.assetBalance();
            let targetBalance = await tools.fscs.targetBalance();
            await tools.makeTransaction();
            console.log("diff: ", - assetBalance + await tools.fscs.assetBalance(),",", - targetBalance + await tools.fscs.targetBalance());
            cnt++;
        }
    }
    let finalTotalAsset = await tools.fscs.totalAssets();
    console.log("Profit: ", 10000n*(finalTotalAsset - initTotalAsset)/initTotalAsset);
    console.log("Transaction count: ", cnt);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
