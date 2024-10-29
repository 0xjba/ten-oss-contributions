import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Coins, Loader2, Wallet } from 'lucide-react';
import { Card } from './components/Card';
import { Stats } from './components/Stats';
import { ConnectWallet } from './components/ConnectWallet';
import { GameResult } from './components/GameResult';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

export default function App() {
  const [account, setAccount] = useState<string>('');
  const [cards, setCards] = useState<Array<{ number: number; suit: number }>>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>('0.001');
  const [loading, setLoading] = useState(false);
  const [newDeckLoading, setNewDeckLoading] = useState(false);
  const [stats, setStats] = useState({ gamesPlayed: 0, gamesWon: 0, totalWinnings: 0 });
  const [gameResult, setGameResult] = useState<{ selectedCard: number; winningCard: number; won: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (!account) return;

    const setupStatsListener = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      contract.on("StatsUpdated", (player, gamesPlayed, gamesWon, totalWinnings) => {
        if (player.toLowerCase() === account.toLowerCase()) {
          setStats({
            gamesPlayed: Number(gamesPlayed),
            gamesWon: Number(gamesWon),
            totalWinnings: Number(ethers.formatEther(totalWinnings))
          });
        }
      });

      loadPlayerStats(account);

      return () => {
        contract.removeAllListeners("StatsUpdated");
      };
    };

    setupStatsListener();
  }, [account]);

  // Timer effect based on contract timestamp
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && cards.length > 0) {
      const timer = setInterval(async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          const deckDetails = await contract.getCurrentDeck();
          
          if (!deckDetails.played) {
            setTimeLeft(prev => Math.max(0, prev - 1));
          } else {
            setTimeLeft(0);
            clearInterval(timer);
          }
        } catch (error) {
          console.error('Error updating time:', error);
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [timeLeft, cards]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const loadPlayerStats = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const result = await contract.getPlayerStats();
      console.log("Raw stats result:", result);
      
      if (result && result.length >= 3) {
        setStats({
          gamesPlayed: Number(result[0] || 0),
          gamesWon: Number(result[1] || 0),
          totalWinnings: Number(ethers.formatUnits(result[2] || 0, 'ether'))
        });
      } else {
        console.log("No stats found, setting defaults");
        setStats({
          gamesPlayed: 0,
          gamesWon: 0,
          totalWinnings: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        gamesPlayed: 0,
        gamesWon: 0,
        totalWinnings: 0
      });
    }
  };

  const getNewDeck = async () => {
    try {
      setNewDeckLoading(true);
      setCards([]);
      setSelectedCard(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.getNewDeck();
      const receipt = await tx.wait();
      
      const newDeckEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'NewDeck';
        } catch {
          return false;
        }
      });
  
      if (newDeckEvent) {
        const parsedLog = contract.interface.parseLog(newDeckEvent);
        const numbers = parsedLog.args[1];
        const suits = parsedLog.args[2];
        const newCards = numbers.map((num: bigint, i: number) => ({
          number: Number(num),
          suit: Number(suits[i])
        }));
        setCards(newCards);
  
        // Get deck details
        const deckDetails = await contract.getCurrentDeck();
        const deckTimestamp = Number(deckDetails.timestamp);
        setTimeLeft(120); // Start with 2 minutes
  
        // Store the deck creation timestamp
        localStorage.setItem('deckCreatedAt', deckTimestamp.toString());
      }
    } catch (error) {
      console.error('Error getting new deck:', error);
    } finally {
      setNewDeckLoading(false);
    }
  };

  const placeBet = async () => {
    if (selectedCard === null || timeLeft === 0) return;
    
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Check if deck is still valid
      const deckDetails = await contract.getCurrentDeck();
      
      if (deckDetails.played) {
        alert("This deck has already been played!");
        setTimeLeft(0);
        return;
      }
  
      // Convert bet amount to Wei
      const betAmountWei = ethers.parseEther(betAmount);
  
      // Check if casino has enough balance for potential payout
      const maxPayout = await contract.getMaxPayout(betAmountWei);
      const casinoBalance = await provider.getBalance(CONTRACT_ADDRESS);
      
      if (casinoBalance < maxPayout) {
        alert("Casino closed: Insufficient balance for potential payout!");
        return;
      }
      
      // Get signer for transaction
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      // Place bet transaction
      const tx = await contractWithSigner.placeBet(selectedCard, {
        value: betAmountWei
      });
  
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Find GameResult event
      const gameResultEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'GameResult';
        } catch {
          return false;
        }
      });
      
      if (gameResultEvent) {
        const parsedLog = contract.interface.parseLog(gameResultEvent);
        setGameResult({
          selectedCard: Number(parsedLog.args.selectedCard),
          winningCard: Number(parsedLog.args.winningCard),
          won: parsedLog.args.won
        });
  
        // Stop timer as deck has been played
        setTimeLeft(0);
        
        // Refresh player stats after bet
        await loadPlayerStats(account);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      // Check if it's a user rejection
      if ((error as any).code === 'ACTION_REJECTED') {
        alert('Transaction was rejected by user');
      } else if ((error as any).message?.includes('Cards expired')) {
        alert('Cards have expired! Please get a new deck.');
        setTimeLeft(0);
      } else {
        alert('Error placing bet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGameResultClose = () => {
    setGameResult(null);
    setSelectedCard(null);
  };

  if (!account) {
    return <ConnectWallet onConnect={connectWallet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-xl">
            <Wallet className="w-6 h-6" />
            <span className="font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
          
          <Stats stats={stats} />

          <div className="w-full max-w-4xl">
            <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm">
              {newDeckLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="text-lg">Getting new deck...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {cards.map((card, index) => (
                      <Card
                        key={index}
                        number={card.number}
                        suit={card.suit}
                        selected={selectedCard === index}
                        onClick={() => setSelectedCard(index)}
                        disabled={loading || timeLeft === 0}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {timeLeft !== null && (
                      <div className={`text-sm ${timeLeft < 30 ? 'text-red-400' : 'text-gray-300'}`}>
                        Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                    )}

                    <input
                      type="number"
                      min="0.001"
                      max="1"
                      step="0.001"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded px-4 py-2 w-40 text-center"
                      disabled={loading || timeLeft === 0}
                    />
                    
                    <button
                      onClick={getNewDeck}
                      disabled={loading || newDeckLoading}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {newDeckLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      New Deck
                    </button>
                    
                    <button
                      onClick={placeBet}
                      disabled={loading || selectedCard === null || timeLeft === 0}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Place Bet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {gameResult && (
        <GameResult
          selectedCard={gameResult.selectedCard}
          winningCard={gameResult.winningCard}
          won={gameResult.won}
          onClose={handleGameResultClose}
        />
      )}
    </div>
  );
}