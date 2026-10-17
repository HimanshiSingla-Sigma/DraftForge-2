import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-[#E6E2D8] border-t-[#1E3E62] animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-transparent border-b-[#F59E0B] animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
        />
      </div>
      {label && (
        <p className="text-xs text-[#5A6A80] font-mono font-bold tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border-2 border-[#E6E2D8] p-5 rounded-3xl space-y-3 shadow-sm skeleton-shimmer"
        >
          <div className="h-4 bg-[#E6E2D8] rounded w-1/3" />
          <div className="h-3 bg-[#F3F0EA] rounded w-2/3" />
          <div className="h-3 bg-[#F3F0EA] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};