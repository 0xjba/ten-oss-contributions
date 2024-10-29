import React from 'react';
import { Trophy, Hash, Coins } from 'lucide-react';

interface StatsProps {
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalWinnings: number;
  };
}

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Hash className="w-5 h-5" />
          <span className="font-semibold">Games Played</span>
        </div>
        <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
      </div>
      
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">Games Won</span>
        </div>
        <div className="text-2xl font-bold">{stats.gamesWon}</div>
      </div>
      
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Coins className="w-5 h-5" />
          <span className="font-semibold">Total Winnings</span>
        </div>
        <div className="text-2xl font-bold">{stats.totalWinnings} ETH</div>
      </div>
    </div>
  );
}