const { ethers } = require("ethers");

async function main() {
    //先建立使用者陣列
    const accounts = await provider.listAccounts();
    //輸出使用者的編號和地址
    let i = 0;
    for (const account of accounts) {
        console.log(i + account);
        i++;
    }
    //無窮迴圈
    while (true) {
        //輸入使用者編號
        const accountNumber = parseInt(prompt("Enter account number: "));
        const account = accounts[accountNumber];
        //輸入交易金額
        const amount = parseInt(prompt("Enter amount: "));
        //該帳號把錢轉入FSCS合約，並mint FSCS token
        await usdt.connect(account).approve(fscs.address, amount);
        await fscs.connect(account).deposit(amount);
        //輸出交易成功，並顯示帳戶餘額
        console.log("Transaction successful");
        console.log("Account balance: " + await usdt.balanceOf(account));
    }
}

// 運行主函數
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
