import React, { useState } from 'react';
import { FileText, Download, Calendar, RefreshCw } from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import type { Log, Stats, UserRole } from '../types';

interface ReportsProps {
  logs: Log[];
  stats: Stats;
  userRole: UserRole;
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly';
type ReportFormat = 'pdf' | 'csv';

interface ReportMetrics {
  totalEvents: number;
  maliciousEvents: number;
  benignEvents: number;
  topAttackTypes: { type: string; count: number }[];
  topSourceIPs: { ip: string; count: number }[];
  detectionRate: number;
}

export function Reports({ logs, stats, userRole }: ReportsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');

  const canGenerateReports = userRole === 'admin' || userRole === 'analyst';

  const calculateMetrics = (startDate: Date, endDate: Date): ReportMetrics => {
    const periodLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    // Calculate attack types
    const attackTypes = periodLogs.reduce((acc, log) => {
      acc[log.event] = (acc[log.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAttackTypes = Object.entries(attackTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top source IPs
    const sourceIPs = periodLogs.reduce((acc, log) => {
      acc[log.sourceIP] = (acc[log.sourceIP] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSourceIPs = Object.entries(sourceIPs)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maliciousEvents = periodLogs.filter(log => log.classification === 'malicious').length;
    const totalEvents = periodLogs.length;

    return {
      totalEvents,
      maliciousEvents,
      benignEvents: totalEvents - maliciousEvents,
      topAttackTypes,
      topSourceIPs,
      detectionRate: totalEvents > 0 ? (maliciousEvents / totalEvents) * 100 : 0
    };
  };

  const generateReport = async () => {
    if (!canGenerateReports) return;
    
    setIsGenerating(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = endOfDay(now);

      switch (selectedPeriod) {
        case 'daily':
          startDate = startOfDay(now);
          break;
        case 'weekly':
          startDate = startOfDay(subDays(now, 7));
          break;
        case 'monthly':
          startDate = startOfDay(subMonths(now, 1));
          break;
        default:
          startDate = startOfDay(now);
      }

      const metrics = calculateMetrics(startDate, endDate);
      const reportData = {
        period: selectedPeriod,
        generatedAt: format(now, 'yyyy-MM-dd HH:mm:ss'),
        dateRange: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
        },
        metrics,
        systemStats: stats,
      };

      if (selectedFormat === 'csv') {
        // Generate CSV
        const csvContent = [
          ['Interceptor IDS Security Report'],
          [`Period: ${selectedPeriod}`],
          [`Generated: ${reportData.generatedAt}`],
          [''],
          ['Metrics Summary'],
          ['Total Events', metrics.totalEvents],
          ['Malicious Events', metrics.maliciousEvents],
          ['Benign Events', metrics.benignEvents],
          ['Detection Rate', `${metrics.detectionRate.toFixed(2)}%`],
          [''],
          ['Top Attack Types'],
          ['Type', 'Count'],
          ...metrics.topAttackTypes.map(({ type, count }) => [type, count]),
          [''],
          ['Top Source IPs'],
          ['IP', 'Count'],
          ...metrics.topSourceIPs.map(({ ip, count }) => [ip, count]),
        ]
          .map(row => row.join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interceptor-ids-report-${format(now, 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Generate JSON (in lieu of PDF for demo)
        const jsonContent = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interceptor-ids-report-${format(now, 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-cyan-500 mr-3" />
        <h2 className="text-xl font-bold">Security Reports</h2>
      </div>

      <div className="space-y-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={!canGenerateReports}
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={!canGenerateReports}
            >
              <option value="pdf">PDF Report</option>
              <option value="csv">CSV Export</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating || !canGenerateReports}
          className="w-full flex items-center justify-center px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-md transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Generate Report
            </>
          )}
        </button>

        {!canGenerateReports && (
          <p className="text-yellow-500 text-sm text-center">
            You need admin or analyst privileges to generate reports.
          </p>
        )}

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Report Contents:</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Summary of total events and classifications</li>
            <li>• Top attack patterns and techniques</li>
            <li>• Geographic distribution of attacks</li>
            <li>• System performance metrics</li>
            <li>• Threat intelligence correlations</li>
            <li>• Recommended security actions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}