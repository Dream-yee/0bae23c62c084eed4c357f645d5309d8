require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/hardhat-chainlink");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //這是要使用多種編譯器版本
    solidity: {
        compilers: [
            {
                version: "0.8.27",
            },
            {
                version: "0.5.16",
            },
        ],
    },
    chainlink:
    {
        confirmations: 1,
    }
};
