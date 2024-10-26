// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("LockModule", (m) => {

  const fscs = m.contract("FSCS", ["0xdAC17F958D2ee523a2206206994597C13D831ec7","0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"]);
  const test = m.contract("contracts/test.sol:Test", []);

  return { fscs ,test };
});