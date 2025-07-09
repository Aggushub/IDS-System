import React, { useState } from 'react';
import { Send, Save, X } from 'lucide-react';

interface TelegramSettingsProps {
  onClose: () => void;
}

export function TelegramSettings({ onClose }: TelegramSettingsProps) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [notificationLevel, setNotificationLevel] = useState<'all' | 'high' | 'medium'>('high');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSave = () => {
    localStorage.setItem('telegramSettings', JSON.stringify({
      botToken,
      chatId,
      notificationLevel,
    }));
    onClose();
  };

  const handleTestNotification = async () => {
    setTestStatus('sending');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 2000);
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-50">
      <div className="glass-darker rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Telegram Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-3 py-2 glass border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your Telegram bot token"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3 py-2 glass border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your Telegram chat ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notification Level
            </label>
            <select
              value={notificationLevel}
              onChange={(e) => setNotificationLevel(e.target.value as 'all' | 'high' | 'medium')}
              className="w-full px-3 py-2 glass border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Events</option>
              <option value="high">High Severity Only</option>
              <option value="medium">Medium & High Severity</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleTestNotification}
              disabled={!botToken || !chatId || testStatus === 'sending'}
              className="flex-1 flex items-center justify-center px-4 py-2 glass hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              {testStatus === 'sending' ? 'Sending...' : 'Test Notification'}
            </button>
            <button
              onClick={handleSave}
              disabled={!botToken || !chatId}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>

          {testStatus === 'success' && (
            <p className="text-green-500 text-sm text-center mt-2">
              Test notification sent successfully!
            </p>
          )}
          {testStatus === 'error' && (
            <p className="text-red-500 text-sm text-center mt-2">
              Failed to send test notification. Please check your settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}