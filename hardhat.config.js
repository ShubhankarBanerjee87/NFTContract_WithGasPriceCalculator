require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version : "0.8.23",
    settings : {
      optimizer : {
        enabled : true,
        runs : 2000
      }
    }
  },

  networks : {
    hardhat : {},
    polygonMumbai : {
      url : process.env.RPC_URL,
      accounts : [
        `0x${process.env.PRIVATE_KEY}`
      ]
    }
  },

  etherscan : {
    apiKey : {
      polygonMumbai : process.env.POLYGONSCAN_APIKEY
    }
  }
};

