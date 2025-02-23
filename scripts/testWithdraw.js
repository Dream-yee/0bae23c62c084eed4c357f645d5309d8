
const zeroForOne = false; 
async function main() {
    const tools = await require("./tools.js")
    while (await tools.getTokenLevel() < 30) 
    {
        await tools.swap(zeroForOne?50_000_000n:50_000_000_000n);
        console.log(await tools.getTokenLevel());
    }
    await tools.makeTransaction();
    while (await tools.getTokenLevel() > 10) 
    {
        await tools.swapback(zeroForOne?50_000_000_000n:50_000_000_000n);
        console.log(await tools.getTokenLevel());
    }
    while(await tools.getTokenLevel() > 0)
    {
        await tools.swapback(zeroForOne?5_000_000n:500_000_000n);
        console.log(await tools.getTokenLevel());
    }
    await tools.makeTransaction();
    await tools.swapback(5000n); // 前面的交易量太大，會讓price不準確
    console.log(await tools.getPrice());
    console.log(await tools.fscs.assetBalance());
    console.log(await tools.fscs.targetBalance());
    const asset = zeroForOne?tools.wbtc:tools.usdt;
    console.log(await asset.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    await tools.withdraw(1000000, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    console.log(await asset.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    console.log(await tools.fscs.assetBalance());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
