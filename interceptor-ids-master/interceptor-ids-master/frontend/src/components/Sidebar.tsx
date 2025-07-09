import React from 'react';
import {
  Map,
  Target,
  Shield,
  FileText,
  Ban,
  Bot,
  Brain,
  Activity,
  Menu,
  X
} from 'lucide-react';
import type { Log } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  recentLogs: Log[];
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ activePage, onNavigate, recentLogs, isOpen, onToggle }: SidebarProps) {
  const navigationItems = [
    { id: 'attack-origin', label: 'Attack Origin', icon: Map },
    { id: 'mitre-pattern', label: 'MITRE Pattern', icon: Target },
    { id: 'threat-intelligence', label: 'Threat Intelligence', icon: Shield },
    { id: 'security-report', label: 'Security Report', icon: FileText },
    { id: 'blocked-ip', label: 'Blocked IP', icon: Ban },
    { id: 'automated-responses', label: 'Automated Responses', icon: Bot },
    { id: 'model-training', label: 'Model Training', icon: Brain }
  ];

  return (
    <>
      {/* Toggle Button - Shown when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 p-2 hover:bg-gray-700 rounded-lg transition-colors z-30"
        >
          <Menu className="w-6 h-6 text-gray-400" />
        </button>
      )}

      <div className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      } flex flex-col overflow-hidden z-20`}>
        {/* Toggle Button - Shown when sidebar is open */}
        {isOpen && (
          <button
            onClick={onToggle}
            className="absolute top-4 left-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}

        {/* Navigation Links */}
        <div className="p-4 mt-14 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Threat Feed */}
        <div className="flex-1 p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Live Threat Feed
          </h3>
          <div className="space-y-3">
            {recentLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg text-sm ${
                  log.classification === 'malicious'
                    ? 'bg-red-900 bg-opacity-50'
                    : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-gray-200">{log.event}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}