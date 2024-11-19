import address from "./contracts.json" assert {type: 'json'};
import fscsInfo from "./artifacts/contracts/FSCS.sol/FSCS.json" assert {type: 'json'};
import usdtInfo from "./artifacts/contracts/fakeUSDT.sol/fakeUSDT.json" assert {type: 'json'};
import wbtcInfo from "./artifacts/contracts/fakeWBTC.sol/fakeWBTC.json" assert {type: 'json'};
import swapInfo from "./artifacts/contracts/fakeSwap.sol/fakeSwap.json" assert {type: 'json'};

const fscsAddress = address["FSCS"];
const usdtAddress = address["USDT"];
const wbtcAddress = address["WBTC"];
const swapAddress = address["Swap"];

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = await provider.getSigner();

const fscs = new ethers.Contract(fscsAddress, fscsInfo.abi, provider);
const usdt = new ethers.Contract(usdtAddress, usdtInfo.abi, provider);
const wbtc = new ethers.Contract(wbtcAddress, wbtcInfo.abi, provider);
const swap = new ethers.Contract(swapAddress, swapInfo.abi, provider);


async function updatePrice() {
    let price = await swap.getPrice();
    document.getElementById("currentTargetValue").innerText = price;
}
async function updateSignal() {
    // 從合約中獲取買賣訊號
    let buySignal = await fscs.buySignal();
    let sellSignal = await fscs.sellSignal();
    
    // 將 Buy Signal 顯示在網頁上
    document.getElementById("buySignal").innerText = buySignal ? "True" : "False";
    
    // 將 Sell Signal 顯示在網頁上
    document.getElementById("sellSignal").innerText = sellSignal ? "True" : "False";
    
    // 判斷是否同時有買賣訊號，並顯示交易條件
    if (buySignal && sellSignal) {
        document.getElementById("tradeCondition").innerText = "是"; // 需要執行交易
    } else {
        document.getElementById("tradeCondition").innerText = "否"; // 不需要執行交易
    }
}
async function updateBalance() {
    //取得所有人的地址
    let accounts = await getAccounts();
    let table = document.getElementById("accounts");
    //清空表格
    table.innerHTML = "";
    //填入資料
    for(const account of accounts)
    {
        let row = table.insertRow();
        row.insertCell().innerText = account.address; //填入地址
        row.insertCell().innerText = account.usdt; //填入USDT餘額
        row.insertCell().innerText = account.fscs; //填入FSCS餘額
    }
    //更新fscs持有的資產
    document.getElementById("fscsAsset").innerText = await usdt.balanceOf(fscsAddress);
    document.getElementById("fscsTarget").innerText = await wbtc.balanceOf(fscsAddress);
}
async function initializeData() {
  try {
    await updateBalance();  // 例如呼叫您要初始化的函數
    await updateSignal();   // 或執行其他初始資料的更新函數
    await updatePrice();
  } catch (error) {
    console.error("初始化錯誤：", error);
  }
}

async function setPrice() {
    let price = document.getElementById("newTargetValue").value;
    await swap.connect(signer).setPrice(price);
    updatePrice();
}
async function makeTransaction()
{
    updateSignal();
    await fscs.connect(signer).makeTransaction();
}
// 取得表單中的資產數量和使用者地址，並呼叫 deposit 函數來存入資產
async function deposit() {
    // 從表單取得數量和地址
    const amount = document.getElementById("assetAmount").value;
    const accountAddress = document.getElementById("userAddress").value;

    if (!amount || !accountAddress) {
        alert("請輸入資產數量和使用者地址");
        return;
    }

    try {
        const account = await provider.getSigner(accountAddress);
        // 進行 USDT 授權以允許 FSCS 合約操作
        await usdt.connect(account).approve(fscsAddress, amount);
        const res = await fscs.connect(account).deposit(amount, accountAddress);
        await res.wait();
        alert("存入成功！");
    } catch (error) {
        console.error("存入失敗：", error);
        alert("存入失敗，請查看控制台以了解更多資訊。");
    }
}

// 取得表單中的資產數量和使用者地址，並呼叫 withdraw 函數來提出資產
async function withdraw() {
    // 從表單取得數量和地址
    const amount = document.getElementById("assetAmount").value;
    const accountAddress = document.getElementById("userAddress").value;

    if (!amount || !accountAddress) {
        alert("請輸入資產數量和使用者地址");
        return;
    }

    try {
        const account = await provider.getSigner(accountAddress);
        const res = await fscs.connect(account).withdraw(amount, accountAddress, accountAddress);
        await res.wait();
        alert("提出成功！");
    } catch (error) {
        console.error("提出失敗：", error);
        alert("提出失敗，請查看控制台以了解更多資訊。");
    }
}
async function getAccounts() {
    let accountsRaw = await provider.listAccounts();
    let accounts = [];
    for(const account of accountsRaw)
    {
        accounts.push({
            address: account.address,
            usdt: await usdt.balanceOf(account),
            fscs: await fscs.balanceOf(account),
        });
    }
    return accounts;
}
