export const CONTRACT_ADDRESS = '0x8E17c5eaEBcFe64A119EE43617618a86A3F9b491';

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_minBet", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxBet", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "selectedCard", "type": "uint8" },
      { "indexed": false, "internalType": "uint8", "name": "winningCard", "type": "uint8" },
      { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }
    ],
    "name": "GameResult",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getNewDeck",
    "outputs": [
      { "internalType": "uint8[4]", "name": "numbers", "type": "uint8[4]" },
      { "internalType": "uint8[4]", "name": "suits", "type": "uint8[4]" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "houseDeposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "houseWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint8[4]", "name": "numbers", "type": "uint8[4]" },
      { "indexed": false, "internalType": "uint8[4]", "name": "suits", "type": "uint8[4]" }
    ],
    "name": "NewDeck",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "selectedCard", "type": "uint8" }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint32", "name": "gamesPlayed", "type": "uint32" },
      { "indexed": false, "internalType": "uint32", "name": "gamesWon", "type": "uint32" },
      { "indexed": false, "internalType": "uint192", "name": "totalWinnings", "type": "uint192" }
    ],
    "name": "StatsUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getCurrentDeck",
    "outputs": [
      { "internalType": "uint8[4]", "name": "numbers", "type": "uint8[4]" },
      { "internalType": "uint8[4]", "name": "suits", "type": "uint8[4]" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "played", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "betAmount", "type": "uint256" }
    ],
    "name": "getMaxPayout",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerStats",
    "outputs": [
      { "internalType": "uint32", "name": "gamesPlayed", "type": "uint32" },
      { "internalType": "uint32", "name": "gamesWon", "type": "uint32" },
      { "internalType": "uint192", "name": "totalWinnings", "type": "uint192" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];