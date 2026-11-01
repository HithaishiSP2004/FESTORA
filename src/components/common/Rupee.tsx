import React from 'react';

interface RupeeProps {
  amount: number;
  className?: string;
  isLakh?: boolean;
}

/**
 * Rupee component providing crisp, modern, glitch-free currency typography.
 * Overrides any inherited serif font on the ₹ symbol and numerals.
 */
export const Rupee: React.FC<RupeeProps> = ({ amount, className = '', isLakh = false }) => {
  if (isLakh) {
    const lakhVal = (amount / 100000).toFixed(2);
    return (
      <span className={`inline-flex items-baseline font-sans font-bold tabular-nums tracking-tight ${className}`}>
        <span className="font-semibold mr-0.5 select-none">₹</span>
        <span>{lakhVal}L</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline font-sans font-bold tabular-nums tracking-tight ${className}`}>
      <span className="font-semibold mr-0.5 select-none">₹</span>
      <span>{amount.toLocaleString('en-IN')}</span>
    </span>
  );
};

export const formatINR = (val: number): string => `₹${val.toLocaleString('en-IN')}`;

