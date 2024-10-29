// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/// @title Fantan Game
/// @author 0xjba
contract FantanGame {
    address private owner;
    uint256 private minBet;
    uint256 private maxBet;
    
    uint8 private constant NUM_CARDS = 4;
    uint8 private constant MULTIPLIER = 2;
    uint8 private constant HOUSE_FEE = 1; // 1%
    uint256 private constant TIME_LIMIT = 2 minutes;
    
    struct Game {
        uint8[NUM_CARDS] numbers;
        uint8[NUM_CARDS] suits;
        uint256 timestamp;
        bool played;
    }
    
    struct PlayerStats {
        uint32 gamesPlayed;
        uint32 gamesWon;
        uint192 totalWinnings;
    }
    
    mapping(address => Game) private games;
    mapping(address => PlayerStats) private stats;
    
    event NewDeck(
        address indexed player, 
        uint8[NUM_CARDS] numbers,
        uint8[NUM_CARDS] suits
    );
    
    event GameResult(
        address indexed player,
        uint8 selectedCard,
        uint8 winningCard,
        bool won
    );

    event StatsUpdated(
        address indexed player,
        uint32 gamesPlayed,
        uint32 gamesWon,
        uint192 totalWinnings
    );
    
    constructor(uint256 _minBet, uint256 _maxBet) {
        require(_minBet > 0 && _maxBet > _minBet, "Invalid bet limits");
        owner = msg.sender;
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    function getNewDeck() external returns (uint8[NUM_CARDS] memory numbers, uint8[NUM_CARDS] memory suits) {
        uint8[NUM_CARDS] memory newNumbers;
        uint8[NUM_CARDS] memory newSuits;
        
        unchecked {
            for(uint256 i; i < NUM_CARDS; ++i) {
                newNumbers[i] = uint8((uint256(keccak256(abi.encodePacked(block.difficulty, msg.sender, i))) % 13) + 1);
                newSuits[i] = uint8(uint256(keccak256(abi.encodePacked(block.difficulty, msg.sender, i, "s"))) % 4);
            }
        }
        
        games[msg.sender] = Game({
            numbers: newNumbers,
            suits: newSuits,
            timestamp: block.timestamp,
            played: false
        });
        
        emit NewDeck(msg.sender, newNumbers, newSuits);
        return (newNumbers, newSuits);
    }

    function getMaxPayout(uint256 betAmount) public pure returns (uint256) {
        uint256 grossPayout = betAmount * MULTIPLIER;
        uint256 houseFee = (grossPayout * HOUSE_FEE) / 100;
        return grossPayout - houseFee;
    }
    
    function placeBet(uint8 selectedCard) external payable {
        require(selectedCard < NUM_CARDS, "Invalid card");
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        
        uint256 maxPayout = getMaxPayout(msg.value);
        require(address(this).balance >= maxPayout, "Casino closed: Insufficient balance");
        
        Game storage game = games[msg.sender];
        require(!game.played, "Already played");
        require(block.timestamp <= game.timestamp + TIME_LIMIT, "Cards expired");
        
        game.played = true;
        
        uint8 winningCard = uint8(uint256(keccak256(abi.encodePacked(
            block.difficulty,
            msg.sender,
            game.timestamp
        ))) % NUM_CARDS);
        
        bool won;
        unchecked {
            if(selectedCard == winningCard) {
                PlayerStats storage playerStats = stats[msg.sender];
                playerStats.gamesWon += 1;
                playerStats.totalWinnings += uint192(maxPayout);
                
                payable(msg.sender).transfer(maxPayout);
                won = true;
            }
            
            stats[msg.sender].gamesPlayed += 1;
            
            PlayerStats memory updatedStats = stats[msg.sender];
            emit StatsUpdated(
                msg.sender,
                updatedStats.gamesPlayed,
                updatedStats.gamesWon,
                updatedStats.totalWinnings
            );
        }
        
        emit GameResult(msg.sender, selectedCard, winningCard, won);
    }
    
    function getCurrentDeck() external view returns (
        uint8[NUM_CARDS] memory numbers,
        uint8[NUM_CARDS] memory suits,
        uint256 timestamp,
        bool played
    ) {
        Game memory game = games[msg.sender];
        return (game.numbers, game.suits, game.timestamp, game.played);
    }
    
    function getPlayerStats() external view returns (
        uint32 gamesPlayed,
        uint32 gamesWon,
        uint192 totalWinnings
    ) {
        PlayerStats memory playerStats = stats[msg.sender];
        return (
            playerStats.gamesPlayed,
            playerStats.gamesWon,
            playerStats.totalWinnings
        );
    }

    function houseDeposit() external payable {
        require(msg.sender == owner, "Only house can deposit");
    }
    
    function houseWithdrawal(uint256 amount) external {
        require(msg.sender == owner, "Only house can withdraw");
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
    }
}