require("@nomicfoundation/hardhat-toolbox");

// Ensure your configuration variables are set before executing the script
const { vars } = require("hardhat/config");

// Go to https://alchemy.com, sign up, create a new App in
// its dashboard, and add its key to the configuration variables
const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

// Add your Sepolia account private key to the configuration variables
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

module.exports = {
  solidity: {
      version: "0.8.27",
      settings: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      }
  },
  networks: {
    hardhat: {
        forking: {
            url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            blockNumber: 312121040
            // url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            // blockNumber: 7747378
        },
        blockGasLimit: 19021092026,
        accounts: {
            accountsBalance: "1000000000000000000000000",
        },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
// require("@nomicfoundation/hardhat-toolbox");
//
// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//     solidity: {
//         version: "0.8.27",
//         settings: {
//             optimizer: {
//                 enabled: true,
//                 runs: 200
//             }
//         }
//     },
//     networks: {
//     },
// };
