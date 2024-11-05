const ethers = require('ethers');

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function checkContract() {
    const code = await provider.getCode(address);
    console.log(code);
    if (code !== "0x") {
        console.log("這是一個智能合約地址");
    } else {
        console.log("這是一個普通的以太坊地址");
    }
}

checkContract();
