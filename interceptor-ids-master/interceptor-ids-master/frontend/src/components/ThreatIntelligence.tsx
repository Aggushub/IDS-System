import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import type { ThreatIntelligence, Log } from '../types';

// Mock data - replace with actual API calls
const mockThreatData: ThreatIntelligence[] = [
  {
    id: '1',
    ip: '192.168.1.100',
    type: 'malware',
    severity: 'high',
    lastSeen: new Date().toISOString(),
    source: 'VirusTotal',
    details: 'Known malware distribution endpoint',
    confidence: 95,
    tags: ['malware', 'botnet'],
    matches: [
      {
        ip: '192.168.1.100',
        timestamp: new Date().toISOString(),
        event: 'SSH Login Attempt'
      }
    ]
  },
  {
    id: '2',
    ip: '203.0.113.45',
    type: 'ransomware',
    severity: 'high',
    lastSeen: new Date().toISOString(),
    source: 'AbuseIPDB',
    details: 'Associated with ransomware campaign',
    confidence: 87,
    tags: ['ransomware', 'cryptolocker']
  }
];

interface ThreatIntelligenceProps {
  logs: Log[];
}

export function ThreatIntelligence({ logs }: ThreatIntelligenceProps) {
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'matched'>('all');

  useEffect(() => {
    // Simulate API call
    const fetchThreats = async () => {
      setIsLoading(true);
      try {
        // In production, replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Compare with logs and add matches
        const threatsWithMatches = mockThreatData.map(threat => ({
          ...threat,
          matches: logs.filter(log => log.sourceIP === threat.ip).map(log => ({
            ip: log.sourceIP,
            timestamp: log.timestamp,
            event: log.event
          }))
        }));
        
        setThreats(threatsWithMatches);
      } catch (error) {
        console.error('Error fetching threat intelligence:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreats();
  }, [logs]);

  const filteredThreats = filter === 'matched'
    ? threats.filter(threat => threat.matches?.length)
    : threats;

  const refreshData = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-bold">Threat Intelligence</h2>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'matched')}
            className="bg-gray-700 border border-gray-600 rounded-md text-sm px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Threats</option>
            <option value="matched">Matched Only</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-gray-400">Loading threat data...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className={`bg-gray-700 p-4 rounded-lg border-l-4 ${
                threat.severity === 'high'
                  ? 'border-red-500'
                  : threat.severity === 'medium'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">{threat.ip}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        threat.severity === 'high'
                          ? 'bg-red-900 text-red-200'
                          : threat.severity === 'medium'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-green-900 text-green-200'
                      }`}
                    >
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{threat.details}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {threat.source}
                  </span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {threat.confidence}% confidence
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {threat.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {threat.matches?.length ? (
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-sm font-medium text-red-400 mb-2">
                    Matches in Honeypot Logs:
                  </p>
                  <div className="space-y-2">
                    {threat.matches.map((match, index) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-800 p-2 rounded"
                      >
                        <span className="text-gray-400">
                          {new Date(match.timestamp).toLocaleString()}
                        </span>
                        <p className="text-white">{match.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}