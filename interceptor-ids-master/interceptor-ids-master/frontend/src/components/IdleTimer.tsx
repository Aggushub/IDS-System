import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface IdleTimerProps {
  timeout: number; // in seconds
  onTimeout: () => void;
}

export function IdleTimer({ timeout, onTimeout }: IdleTimerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeout);
  const warningThreshold = 60; // Show warning 60 seconds before timeout

  useEffect(() => {
    let lastActivity = Date.now();
    let timer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimer = () => {
      setShowWarning(false);
      setTimeLeft(timeout);
      lastActivity = Date.now();
    };

    const checkIdle = () => {
      const idle = (Date.now() - lastActivity) / 1000;
      setTimeLeft(Math.max(0, timeout - idle));

      if (idle >= timeout) {
        onTimeout();
      } else if (idle >= timeout - warningThreshold) {
        setShowWarning(true);
      }
    };

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Check idle state every second
    timer = setInterval(checkIdle, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(timer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [timeout, onTimeout]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 timeout-warning">
      <div className="glass-darker p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
        <div>
          <p className="text-white">
            Your session will expire in{' '}
            <span className="font-bold text-yellow-500">
              {Math.ceil(timeLeft)} seconds
            </span>
          </p>
          <p className="text-sm text-gray-400">
            Move your mouse or press any key to stay logged in
          </p>
        </div>
      </div>
    </div>
  );
}