import React, { useState, useMemo, useEffect } from 'react';
import { Shield, AlertTriangle, RefreshCcw, Settings, LogOut, AlertOctagon } from 'lucide-react';
import type { Log, Stats, User } from '../types';
import { fetchLogs, fetchStats } from '../api'; // Import API client
import { SecurityChatbot } from './SecurityChatbot';
import { TelegramSettings } from './TelegramSettings';
import { ThreatIntelligence } from './ThreatIntelligence';
import { AttackMap } from './AttackMap';
import { AttackPatterns } from './AttackPatterns';
import { LogFilter, type FilterCriteria } from './LogFilter';
import { Reports } from './Reports';
import { AutomatedResponse } from './AutomatedResponse';
import { BlockedIPs } from './BlockedIPs';
import { AutoRefreshIndicator } from './AutoRefreshIndicator';
import { IdleTimer } from './IdleTimer';
import { Sidebar } from './Sidebar';

interface DashboardProps {
  onViewModelDetails: () => void;
  user: User;
  onLogout: () => void;
}

export function Dashboard({ onViewModelDetails, user, onLogout }: DashboardProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    maliciousCount: 0,
    benignCount: 0,
    accuracy: 0,
  });
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>({
    startDate: '',
    endDate: '',
    eventTypes: [],
    severity: [],
    sourceIP: '',
    searchQuery: '',
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modelTrainingProgress, setModelTrainingProgress] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const [logsData, statsData] = await Promise.all([fetchLogs(), fetchStats()]);
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Could not connect to the server. Please check the backend.');
      setLogs([]);
      setStats({ totalLogs: 0, maliciousCount: 0, benignCount: 0, accuracy: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const response = await fetch('http://localhost:5000/api/train-model', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to train model');
      }

      await fetchData();
    } catch (error) {
      console.error('Error training model:', error);
      setError('Failed to train model. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) {
        return false;
      }
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(log.event)) {
        return false;
      }
      if (filters.severity.length > 0 && log.severity && !filters.severity.includes(log.severity)) {
        return false;
      }
      if (filters.sourceIP && !log.sourceIP.includes(filters.sourceIP)) {
        return false;
      }
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        return (
          log.event.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) ||
          log.sourceIP.includes(searchLower)
        );
      }
      return true;
    });
  }, [logs, filters]);

  const LoadingState = () => (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center space-x-3">
        <RefreshCcw className="w-6 h-6 text-cyan-500 animate-spin" />
        <p className="text-gray-400">Loading data...</p>
      </div>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center space-x-3 text-red-400">
        <AlertOctagon className="w-6 h-6" />
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg text-white">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        recentLogs={logs.slice(0, 5)}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <nav className="glass border-b border-gray-700 sticky top-0 z-10">
          <div className="w-[80%] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-cyan-500" />
              <h1 className="text-2xl font-bold">Interceptor IDS</h1>
            </div>
            <div className="flex items-center space-x-6">
              <AutoRefreshIndicator interval={30} onRefresh={fetchData} />
              <div className="text-sm text-gray-400">
                Logged in as <span className="text-cyan-500">{user.username}</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-gray-300">{user.role}</span>
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowTelegramSettings(true)}
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-[1920px] mx-auto py-8 w-full">
          <div className="w-[80%] mx-auto space-y-8">
            {error && (
              <div className="mb-4">
                <div className="bg-red-900 bg-opacity-50 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {isLoading ? (
                <LoadingState />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Total Logs</h3>
                      <p className="text-3xl font-bold text-cyan-500">{stats.totalLogs}</p>
                    </div>
                    <div className="glass p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Detection Rate</h3>
                      <p className="text-3xl font-bold text-green-500">{stats.accuracy}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Threats Detected</h3>
                      <p className="text-3xl font-bold text-red-500">{stats.maliciousCount}</p>
                    </div>
                    <div className="glass p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">System Status</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <p className="text-lg font-medium">Operational</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-8">
              <div className="glass p-6 rounded-lg">
                <LogFilter
                  onFilter={setFilters}
                  onReset={() => setFilters({
                    startDate: '',
                    endDate: '',
                    eventTypes: [],
                    severity: [],
                    sourceIP: '',
                    searchQuery: '',
                  })}
                  totalLogs={logs.length}
                  filteredCount={filteredLogs.length}
                />
              </div>

              <div id="attack-origin" className="scroll-mt-20">
                <AttackMap />
              </div>

              <div id="mitre-pattern" className="scroll-mt-20">
                <AttackPatterns logs={filteredLogs} />
              </div>

              <div id="threat-intelligence" className="scroll-mt-20">
                <ThreatIntelligence logs={filteredLogs} />
              </div>

              <div id="security-report" className="scroll-mt-20">
                <Reports logs={logs} stats={stats} />
              </div>

              <div id="blocked-ip" className="scroll-mt-20">
                <BlockedIPs userRole={user.role} />
              </div>

              <div id="automated-responses" className="scroll-mt-20">
                <AutomatedResponse userRole={user.role} />
              </div>

              <div id="model-training" className="scroll-mt-20">
                {(user.role === 'admin' || user.role === 'analyst') && (
                  <div className="glass p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Model Training</h2>
                      <button
                        onClick={onViewModelDetails}
                        className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    {isTraining && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <SecurityChatbot logs={filteredLogs} userRole={user.role} />
        {showTelegramSettings && (
          <TelegramSettings onClose={() => setShowTelegramSettings(false)} />
        )}
        <IdleTimer timeout={900} onTimeout={onLogout} />
      </div>
    </div>
  );
}
