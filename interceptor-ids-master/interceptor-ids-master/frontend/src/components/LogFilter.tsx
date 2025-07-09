import React, { useState } from 'react';
import { Filter, X, Search, Calendar, AlertTriangle, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Log } from '../types';

interface LogFilterProps {
  onFilter: (filters: FilterCriteria) => void;
  onReset: () => void;
  totalLogs: number;
  filteredCount: number;
}

export interface FilterCriteria {
  startDate: string;
  endDate: string;
  eventTypes: string[];
  severity: string[];
  sourceIP: string;
  searchQuery: string;
}

const EVENT_TYPES = [
  'SSH Login Attempt',
  'SQL Injection Attempt',
  'Command Injection',
  'File Download',
  'Port Scan',
  'System Access'
];

export function LogFilter({ onFilter, onReset, totalLogs, filteredCount }: LogFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    startDate: '',
    endDate: '',
    eventTypes: [],
    severity: [],
    sourceIP: '',
    searchQuery: ''
  });

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleEventTypeToggle = (eventType: string) => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(t => t !== eventType)
      : [...filters.eventTypes, eventType];
    handleFilterChange('eventTypes', newEventTypes);
  };

  const handleSeverityToggle = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    handleFilterChange('severity', newSeverity);
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventTypes: [],
      severity: [],
      sourceIP: '',
      searchQuery: ''
    });
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <div className="bg-gray-800 rounded-lg">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          {hasActiveFilters && (
            <div className="text-sm">
              <span className="text-cyan-500 font-medium">{filteredCount}</span>
              <span className="text-gray-400"> of </span>
              <span className="text-gray-300">{totalLogs}</span>
              <span className="text-gray-400"> logs</span>
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Logs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in log details..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source IP
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by IP address..."
                  value={filters.sourceIP}
                  onChange={(e) => handleFilterChange('sourceIP', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleEventTypeToggle(type)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filters.eventTypes.includes(type)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Severity
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSeverityToggle('high')}
                className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
                  filters.severity.includes('high')
                    ? 'bg-red-900 text-red-200'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                High
              </button>
              <button
                onClick={() => handleSeverityToggle('medium')}
                className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
                  filters.severity.includes('medium')
                    ? 'bg-yellow-900 text-yellow-200'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Medium
              </button>
              <button
                onClick={() => handleSeverityToggle('low')}
                className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
                  filters.severity.includes('low')
                    ? 'bg-green-900 text-green-200'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Low
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}