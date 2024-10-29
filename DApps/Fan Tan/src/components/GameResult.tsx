import React from 'react';
import { Trophy, XCircle } from 'lucide-react';

interface GameResultProps {
  selectedCard: number;
  winningCard: number;
  won: boolean;
  onClose: () => void;
}

export function GameResult({ selectedCard, winningCard, won, onClose }: GameResultProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 rounded-xl p-8 text-center text-white max-w-md mx-4">
        <div className="mb-6">
          {won ? (
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold mb-2">
            {won ? 'Congratulations!' : 'Better Luck Next Time!'}
          </h2>
          <p className="text-lg opacity-90">
            You selected card #{selectedCard + 1}
            <br />
            Winning card was #{winningCard + 1}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
        >
          Continue playing by getting a new deck
        </button>
      </div>
    </div>
  );
}