const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
    const bottom = 1000n*2n**64n/100n;
    const reference = 2000n*2n**64n/100n;
    const grid = 50;
    // const chainlinkAddress = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
    const poolAddress = "0x4b053461dd564CF8e0d2F9E3b73D78BD837de765";
    const token = m.contract("FSCS",[
        poolAddress,
        bottom,
        reference,
        grid,
      ]
    );

  return { token };
});

module.exports = TokenModule;

