import React from 'react';
import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => void;
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
      <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Web3 FanTan</h1>
        <button
          onClick={onConnect}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg text-white transition-colors"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
      </div>
    </div>
  );
}