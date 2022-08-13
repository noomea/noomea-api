const SOLANA_RPC_APIS = {
  mainnet: {
    name: "mainnet-beta",
    url: "https://api.mainnet-beta.solana.com",
    tokenId: "8AxFH7RYhBHMVHdhKXKEQJpedv5S41BofwVb2oJ1LNxf",
  },
  testnet: {
    name: "testnet",
    url: "https://api.testnet.solana.com",
  },
  devnet: {
    name: "devnet",
    url: "https://api.devnet.solana.com/",
    tokenId: "9L2y2aYnSXWnUrj1ThttJ9i3SgT7JryN4QDswiqmbVeM",
  },
};

const SOLANA_RPC_API = SOLANA_RPC_APIS.mainnet;

module.exports = {
  SOLANA_RPC_API,
};
