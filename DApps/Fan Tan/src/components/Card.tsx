import React from 'react';

const SUITS = {
  0: '♥',
  1: '♦',
  2: '♣',
  3: '♠'
};

const NUMBERS = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K'
};

interface CardProps {
  number: number;
  suit: number;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function Card({ number, suit, selected, onClick, disabled }: CardProps) {
  const displayNumber = NUMBERS[number as keyof typeof NUMBERS] || number;
  const suitSymbol = SUITS[suit as keyof typeof SUITS];
  const isRed = suit === 0 || suit === 1;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-32 h-48 rounded-xl cursor-pointer transition-all duration-200
        ${selected ? 'transform -translate-y-4' : 'hover:-translate-y-2'}
        ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}
      `}
    >
      <div className={`
        absolute inset-0 rounded-xl bg-white shadow-xl
        ${selected ? 'ring-4 ring-amber-400' : ''}
      `}>
        <div className={`
          p-4 flex flex-col h-full
          ${isRed ? 'text-red-600' : 'text-gray-900'}
        `}>
          <div className="text-2xl font-bold">{displayNumber}</div>
          <div className="text-4xl mx-auto my-auto">{suitSymbol}</div>
          <div className="text-2xl font-bold self-end rotate-180">{displayNumber}</div>
        </div>
      </div>
    </div>
  );
}