'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullScreen && 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
      className
    )}>
      <div className={cn(
        'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400',
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn(
          'text-gray-600 dark:text-gray-300 font-medium',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  return spinner;
}

// Skeleton loader for better UX
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            'bg-gray-200 dark:bg-gray-700 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            'h-4 mb-2 last:mb-0'
          )}
        />
      ))}
    </div>
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="text-right">
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                'h-4 bg-gray-200 dark:bg-gray-700 rounded',
                colIndex === columns - 1 && 'w-3/4' // Last column shorter
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
