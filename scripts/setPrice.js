const { ethers } = require("ethers");

async function main() {
    while(true)
    {
        //輸入價格
        const price = parseInt(prompt("Enter price: "));
        //呼叫setPrice函數
        await swap.setPrice(price);
        //輸出設定成功
        console.log("Price set successfully");
    }
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
