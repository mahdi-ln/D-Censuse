require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require("truffle-hdwallet-provider");


require('dotenv').config()  // Store environment-specific variable from '.env' to process.env
console.log('aa - process.env.MNEMONIC : '+process.env.MNEMONIC);
const config = {
  oasis: {
    mnemonic: secrets.mnemonics.oasis,
    endpoint: 'https://web3.oasiscloud.io',
    wsEndpoint: 'wss://web3.oasiscloud.io/ws'
  }
  }
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id

    },
    

    // Oasis Devnet
    oasis: {
      provider: function () {
        return new HDWalletProvider(config.oasis.mnemonic, config.oasis.endpoint, 0, 10);
      },
      gas: 16000000,
      network_id: "42261"
    },
    // testnets
    // properties
    // network_id: identifier for network based on ethereum blockchain. Find out more at https://github.com/ethereumbook/ethereumbook/issues/110
    // gas: gas limit
    // gasPrice: gas price in gwei
    ropsten: {
      provider: () => new HDWalletProvider("", "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 3,
      gas: 3000000,
      gasPrice: 10000000000
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 42,
      gas: 3000000,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },
    // main ethereum network(mainnet)
    main: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 1,
      gas: 3000000,
      gasPrice: 4000000000
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
        
      },
      version: "0.5.17"
    }
  }
}
