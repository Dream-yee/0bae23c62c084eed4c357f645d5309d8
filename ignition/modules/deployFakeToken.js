// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("LockModule", (m) => {

    const usdt = m.contract("fakeUSDT", []);
    const wbtc = m.contract("fakeWBTC", []);
    console.log(usdt);
    return { usdt, wbtc };
});
