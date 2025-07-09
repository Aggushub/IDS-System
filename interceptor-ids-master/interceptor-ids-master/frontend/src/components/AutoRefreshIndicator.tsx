import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshIndicatorProps {
  interval: number; // in seconds
  onRefresh: () => void;
}

export function AutoRefreshIndicator({ interval, onRefresh }: AutoRefreshIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState(interval);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, onRefresh]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-400">
      <RefreshCw className={`w-4 h-4 ${timeLeft <= 30 ? 'pulse' : ''}`} />
      <span>
        Refreshing in {formatTime(timeLeft)}
      </span>
    </div>
  );
}