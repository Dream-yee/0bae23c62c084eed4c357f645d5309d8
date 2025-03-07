
const zeroForOne = false; 
async function main() {
    const tools = await require("./tools.js")
    while (await tools.getTokenLevel() < 20) 
    {
        await tools.swap(zeroForOne?50_000_000n:50_000_000_000n);
        console.log(await tools.getTokenLevel());
    }
    await tools.makeTransaction();
    while (await tools.getTokenLevel() > 10) 
    {
        await tools.swapback(zeroForOne?50_000_000_000n:8_000_000n);
        console.log(await tools.getTokenLevel());
    }
    while(await tools.getTokenLevel() > 0)
    {
        await tools.swapback(zeroForOne?5000_000_000n:5_000_000n);
        console.log(await tools.getTokenLevel());
    }
    await tools.makeTransaction();
    console.log(await tools.getPrice());
    console.log(await tools.fscs.assetBalance());
    const asset = zeroForOne?tools.wbtc:tools.usdt;
    console.log(await asset.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    await tools.withdraw(1000000, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    console.log(await asset.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    console.log(await tools.fscs.assetBalance());
    while (await tools.getTokenLevel() < 20) 
    {
        await tools.swap(zeroForOne?50_000_000n:50_000_000_000n);
        console.log(await tools.getTokenLevel());
    }
    console.log(await tools.fscs.targetBalance());
    await tools.makeTransaction();
    console.log(await tools.fscs.targetBalance());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
