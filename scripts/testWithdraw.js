
async function main() {
    const tools = await require("./tools.js")
    console.log(tools);
    while (await tools.getTokenLevel() < 7) await tools.swap(50000000000n);
    await tools.makeTransaction();
    while (await tools.getTokenLevel() > 0) await tools.swapback(500000000n);
    await tools.makeTransaction();
    await tools.swapback(5000n); // 前面的交易量太大，會讓price不準確
    console.log(await tools.fscs.assetBalance());
    console.log(await tools.fscs.targetBalance());
    console.log(await tools.usdt.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    await tools.withdraw(10000, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    console.log(await tools.usdt.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    console.log(await tools.fscs.assetBalance());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
