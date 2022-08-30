/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 import { HardhatUserConfig } from 'hardhat/config';

 import 'hardhat-contract-sizer';
 import 'hardhat-gas-reporter';
 import '@typechain/hardhat';
 import '@nomiclabs/hardhat-etherscan';
 import '@nomiclabs/hardhat-waffle';
 import '@nomiclabs/hardhat-ethers';

 import "./deploy/deploy";

 require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./hardhat-test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    ganache_ultron: {
      url: `http://127.0.0.1:8545`,
      chainId: 1000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true
  }
};

export default config;
