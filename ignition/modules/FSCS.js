const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("FSCS_BD", (m) => {
    const bottom = 15475n*2n**64n/100n;
    const reference = 130000n*2n**64n/100n;
    const grid = 13;
    const usdtAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
    const wbtcAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
    const poolAddress = "0x5969EFddE3cF5C0D9a88aE51E47d721096A97203";
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
