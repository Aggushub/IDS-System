import React, { useState } from 'react';
import { Shield, Unlock, RefreshCw } from 'lucide-react';
import type { BlockedIP, UserRole } from '../types';

// Mock data
const mockBlockedIPs: BlockedIP[] = [
  {
    ip: '192.168.1.100',
    reason: 'Brute force attack detected',
    blockedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes from now
    autoResponseId: '1'
  },
  {
    ip: '203.0.113.45',
    reason: 'Multiple SQL injection attempts',
    blockedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 minutes from now
    autoResponseId: '2'
  }
];

interface BlockedIPsProps {
  userRole: UserRole;
}

export function BlockedIPs({ userRole }: BlockedIPsProps) {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>(mockBlockedIPs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canUnblock = userRole === 'admin';

  const handleUnblock = (ip: string) => {
    if (window.confirm(`Are you sure you want to unblock ${ip}?`)) {
      setBlockedIPs(prev => prev.filter(blocked => blocked.ip !== ip));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    const minutes = Math.floor(remaining / (1000 * 60));
    return minutes > 0 ? `${minutes} minutes` : 'Expiring soon';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-bold">Blocked IPs</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {blockedIPs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No IPs currently blocked</p>
        ) : (
          blockedIPs.map((blocked) => (
            <div
              key={blocked.ip}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{blocked.ip}</h3>
                    <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded-full">
                      Blocked
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{blocked.reason}</p>
                </div>
                {canUnblock && (
                  <button
                    onClick={() => handleUnblock(blocked.ip)}
                    className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors text-sm"
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    Unblock
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                <div>
                  Blocked: {new Date(blocked.blockedAt).toLocaleString()}
                </div>
                <div>
                  Time remaining: {getTimeRemaining(blocked.expiresAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}