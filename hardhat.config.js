require("@nomicfoundation/hardhat-toolbox");

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
    networks: {
        hardhat: {
            forking: {
                url: "https://eth-mainnet.g.alchemy.com/v2/5ibJR2xUNR2z1ludTzNgB19VCJjVceb6",
                blockNumber: 21228016
            },
            blockGasLimit: 19021092026,
            accounts: {
                accountsBalance: "1000000000000000000000000",
            },
        },
    },
};
