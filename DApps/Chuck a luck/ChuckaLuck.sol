// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/// @title Chuck-a-Luck Smart Contract with House Pool
/// @notice A privacy-focused implementation of the Chuck-a-Luck dice game with house pool
contract ChuckALuck {
    // Game states - uint8 for gas optimization
    enum GameState { WAITING_FOR_PLAYERS, BETTING_OPEN, RESOLVING }
    
    struct RoundData {
        GameState state;
        uint40 bettingEndTime;      // Timestamps don't need full uint256
        uint8 playerCount;          // Max 5 players, uint8 is enough
        bool isActive;
        mapping(address => PlayerBet) bets;
        address[] players;
    }
    
    struct PlayerBet {
        uint128 amount;             // Half uint256 is plenty for bet amount
        uint8 chosenNumber;
        bool resolved;
    }
    
    struct RoundResult {
        uint8[3] diceResults;       // Hardcoded NUM_DICE=3 for gas optimization
        address[] players;
        uint8[] chosenNumbers;
        uint128[] betAmounts;       // Using uint128 consistently
        uint128[] winAmounts;
        uint40 timestamp;           // Timestamp optimization
        bool resolved;
    }
    
    // Packed round info for view functions
    struct RoundInfo {
        uint32 roundNumber;         // Supports many rounds while saving gas
        GameState state;
        uint40 bettingEndTime;
        uint8 currentPlayers;
        bool canBeResolved;
        bool isActive;
        address[] players;
    }
    
    // Constants
    uint128 public constant MIN_BET = 0.01 ether;
    uint128 public constant MAX_BET = 1 ether;
    uint40 public constant BETTING_WINDOW = 2 minutes;
    uint256 public constant MIN_HOUSE_POOL = 10 ether;
    address private immutable owner;

    // Storage optimization - pack related variables
    uint32 private currentRoundNumber;
    
    // Main storage
    mapping(uint32 => RoundData) private rounds;
    mapping(uint32 => RoundResult) private roundResults;
    mapping(address => uint32) private playerLastRound;
    
    // Events
    event RoundInitialized(uint32 indexed roundNumber);
    event RoundStarted(uint32 indexed roundNumber, uint40 bettingEndTime);
    event BetPlaced(
        address indexed player, 
        uint32 indexed roundNumber, 
        uint128 betAmount, 
        uint8 chosenNumber
    );
    event PlayerResult(
        address indexed player,
        uint32 indexed roundNumber,
        uint8 chosenNumber,
        uint8 matches,
        uint128 winAmount
    );
    event HousePoolUpdated(uint256 balance);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        currentRoundNumber = 1;
        rounds[currentRoundNumber].state = GameState.WAITING_FOR_PLAYERS;
        emit RoundInitialized(currentRoundNumber);
    }

    /// @notice Deposit funds to house pool
    function depositHousePool() external payable {
        emit HousePoolUpdated(address(this).balance);
    }

    /// @notice Withdraw excess funds from house pool
    function withdrawHousePool(uint256 amount) external onlyOwner {
        require(address(this).balance - amount >= MIN_HOUSE_POOL, "Must maintain minimum pool");
        require(amount <= getWithdrawableBalance(), "Amount exceeds withdrawable");
        payable(msg.sender).transfer(amount);
        emit HousePoolUpdated(address(this).balance);
    }

    /// @notice Get withdrawable balance
    function getWithdrawableBalance() public view returns (uint256) {
        uint256 activeBetsTotal = getActiveBetsTotal();
        if (address(this).balance < MIN_HOUSE_POOL + activeBetsTotal) {
            return 0;
        }
        return address(this).balance - MIN_HOUSE_POOL - activeBetsTotal;
    }

    /// @notice Calculate total value of active bets
    function getActiveBetsTotal() public view returns (uint256) {
        if (!rounds[currentRoundNumber].isActive) return 0;
        
        uint256 total = 0;
        address[] memory currentPlayers = rounds[currentRoundNumber].players;
        for (uint256 i = 0; i < currentPlayers.length; i++) {
            total += rounds[currentRoundNumber].bets[currentPlayers[i]].amount;
        }
        return total;
    }
    
    /// @notice Place a bet for the current round
    /// @param chosenNumber The number to bet on (1-6)
    function placeBet(uint8 chosenNumber) external payable {
        require(address(this).balance >= MIN_HOUSE_POOL, "House pool too low");
        require(chosenNumber >= 1 && chosenNumber <= 6, "Invalid number");
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet");
        
        RoundData storage round = rounds[currentRoundNumber];
        require(round.playerCount < 5, "Round full");
        require(round.bets[msg.sender].amount == 0, "Already bet");
        
        // Start timer if first bet
        if (!round.isActive) {
            require(round.state == GameState.WAITING_FOR_PLAYERS, "Not waiting");
            round.isActive = true;
            round.bettingEndTime = uint40(block.timestamp) + BETTING_WINDOW;
            round.state = GameState.BETTING_OPEN;
            emit RoundStarted(currentRoundNumber, round.bettingEndTime);
        } else {
            require(round.state == GameState.BETTING_OPEN, "Not open");
            require(block.timestamp < round.bettingEndTime, "Expired");
        }
        
        // Record bet
        round.bets[msg.sender] = PlayerBet({
            amount: uint128(msg.value),
            chosenNumber: chosenNumber,
            resolved: false
        });
        
        round.players.push(msg.sender);
        round.playerCount++;
        playerLastRound[msg.sender] = currentRoundNumber;
        
        emit BetPlaced(msg.sender, currentRoundNumber, uint128(msg.value), chosenNumber);
    }
    
    /// @notice Resolve round and get results
    function resolveRound() external returns (RoundResult memory) {
        uint32 playerRound = playerLastRound[msg.sender];
        require(playerRound > 0, "No rounds played");
        
        if (roundResults[playerRound].resolved) {
            return roundResults[playerRound];
        }
        
        RoundData storage round = rounds[playerRound];
        require(
            playerRound == currentRoundNumber && 
            block.timestamp >= round.bettingEndTime &&
            round.state == GameState.BETTING_OPEN && 
            round.playerCount > 0, 
            "Cannot resolve"
        );
        
        round.state = GameState.RESOLVING;
        
        // Create result arrays
        uint8[] memory chosenNumbers = new uint8[](round.playerCount);
        uint128[] memory betAmounts = new uint128[](round.playerCount);
        uint128[] memory winAmounts = new uint128[](round.playerCount);
        
        // Roll dice once for all players
        uint8[3] memory diceResults;
        uint256 randomness = uint256(block.difficulty);
        for (uint8 i = 0; i < 3; i++) {
            diceResults[i] = uint8((randomness >> (i * 8)) % 6) + 1;
        }
        
        // Process all players
        for(uint8 i = 0; i < round.playerCount; i++) {
            address player = round.players[i];
            PlayerBet storage bet = round.bets[player];
            
            uint8 matches = 0;
            for (uint8 j = 0; j < 3; j++) {
                if (diceResults[j] == bet.chosenNumber) matches++;
            }
            
            uint128 winAmount = matches > 0 ? bet.amount * matches : 0;
            
            if (winAmount > 0) {
                payable(player).transfer(winAmount);
            }
            // Lost bets remain in contract as house funds
            
            chosenNumbers[i] = bet.chosenNumber;
            betAmounts[i] = bet.amount;
            winAmounts[i] = winAmount;
            
            emit PlayerResult(player, playerRound, bet.chosenNumber, matches, winAmount);
        }
        
        // Store results
        RoundResult memory results = RoundResult({
            diceResults: diceResults,
            players: round.players,
            chosenNumbers: chosenNumbers,
            betAmounts: betAmounts,
            winAmounts: winAmounts,
            timestamp: uint40(block.timestamp),
            resolved: true
        });
        
        roundResults[playerRound] = results;
        
        // Initialize new round
        currentRoundNumber++;
        rounds[currentRoundNumber].state = GameState.WAITING_FOR_PLAYERS;
        emit RoundInitialized(currentRoundNumber);
        
        return results;
    }
    
    /// @notice Get current round information
    function getCurrentRoundInfo() external view returns (RoundInfo memory) {
        RoundData storage round = rounds[currentRoundNumber];
        return RoundInfo({
            roundNumber: currentRoundNumber,
            state: round.state,
            bettingEndTime: round.bettingEndTime,
            currentPlayers: round.playerCount,
            canBeResolved: round.isActive && 
                          block.timestamp >= round.bettingEndTime && 
                          round.state == GameState.BETTING_OPEN && 
                          round.playerCount > 0,
            isActive: round.isActive,
            players: round.players
        });
    }
    
    /// @notice Get player's last round information
    function getPlayerLastRound(address player) external view returns (
        uint32 roundNum,
        bool resolved,
        bool canResolve
    ) {
        roundNum = playerLastRound[player];
        if (roundNum > 0) {
            RoundData storage round = rounds[roundNum];
            resolved = roundResults[roundNum].resolved;
            canResolve = roundNum == currentRoundNumber && 
                        round.isActive &&
                        block.timestamp >= round.bettingEndTime && 
                        round.state == GameState.BETTING_OPEN;
        }
    }

    /// @notice Get contract balance
    function getHousePool() external view returns (uint256) {
        return address(this).balance;
    }
}