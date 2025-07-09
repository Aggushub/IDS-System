import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Bot, Mic, MicOff, Bell } from 'lucide-react';
import { format } from 'date-fns';
import type { Log } from '../types';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high';
}

interface SecurityChatbotProps {
  logs: Log[];
}

export function SecurityChatbot({ logs }: SecurityChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hello! I\'m your AI Security Assistant. How can I help you analyze threats today? You can type or use voice commands.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript;
        setInput(command);
        handleSend(command);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Simulate real-time alerts
    const alertInterval = setInterval(() => {
      const randomAlert = generateRandomAlert();
      if (randomAlert) {
        setNotifications(prev => [...prev, randomAlert]);
        setMessages(prev => [...prev, randomAlert]);
      }
    }, 30000);

    return () => {
      clearInterval(alertInterval);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const generateRandomAlert = (): Message | null => {
    const alerts = [
      {
        text: '🔴 HIGH: Brute-force attack detected from IP 203.0.113.45',
        severity: 'high',
      },
      {
        text: '🟠 MEDIUM: Multiple login failures detected for admin user',
        severity: 'medium',
      },
      {
        text: '🟢 LOW: Suspicious port scan detected',
        severity: 'low',
      },
    ];

    if (Math.random() > 0.7) {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      return {
        id: Date.now().toString(),
        type: 'bot',
        text: alert.text,
        timestamp: new Date(),
        severity: alert.severity as 'low' | 'medium' | 'high',
      };
    }

    return null;
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Process the user's query and generate a response
    const response = processQuery(text, logs);
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const processQuery = (query: string, logs: Log[]): string => {
    const normalizedQuery = query.toLowerCase();

    // Example query processing logic
    if (normalizedQuery.includes('today')) {
      const todayLogs = logs.filter(log => 
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      );
      return `Today's logs: Found ${todayLogs.length} events. ${todayLogs.length > 0 
        ? `Latest event: ${todayLogs[0].event} from ${todayLogs[0].sourceIP}` 
        : ''}`;
    }

    if (normalizedQuery.includes('brute force')) {
      const bruteForceCount = logs.filter(log => 
        log.event.toLowerCase().includes('ssh login attempt')
      ).length;
      return `Detected ${bruteForceCount} potential brute force attempts in the logs.`;
    }

    if (normalizedQuery.includes('top') && normalizedQuery.includes('ip')) {
      const ipCounts = logs.reduce((acc, log) => {
        acc[log.sourceIP] = (acc[log.sourceIP] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topIPs = Object.entries(ipCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([ip, count]) => `${ip} (${count} events)`)
        .join('\n');

      return `Top 5 source IPs:\n${topIPs}`;
    }

    if (normalizedQuery.includes('report')) {
      const totalEvents = logs.length;
      const maliciousCount = logs.filter(log => log.classification === 'malicious').length;
      const benignCount = logs.filter(log => log.classification === 'benign').length;

      return `Security Report Summary:
- Total Events: ${totalEvents}
- Malicious Events: ${maliciousCount}
- Benign Events: ${benignCount}
- Detection Rate: ${((maliciousCount / totalEvents) * 100).toFixed(1)}%`;
    }

    if (normalizedQuery.includes('alert') || normalizedQuery.includes('notification')) {
      const recentAlerts = notifications.slice(-5);
      if (recentAlerts.length === 0) {
        return 'No recent alerts to display.';
      }
      return `Recent Alerts:\n${recentAlerts.map(alert => alert.text).join('\n')}`;
    }

    return "I'm not sure how to help with that query. Try asking about today's logs, brute force attacks, top IPs, alerts, or requesting a security report.";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Security Assistant</span>
          {notifications.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full text-xs">
              {notifications.length}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`bg-gray-800 rounded-lg shadow-xl ${isMinimized ? 'w-72' : 'w-96'} transition-all`}>
          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-500" />
              <span className="font-medium text-white">Security Assistant</span>
              {notifications.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full text-xs">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceRecognition}
                className={`text-gray-400 hover:text-white transition-colors ${
                  isListening ? 'text-cyan-500' : ''
                }`}
                title="Toggle voice commands"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-cyan-600 text-white'
                          : message.severity === 'high'
                          ? 'bg-red-900 bg-opacity-50 text-gray-200'
                          : message.severity === 'medium'
                          ? 'bg-orange-900 bg-opacity-50 text-gray-200'
                          : message.severity === 'low'
                          ? 'bg-green-900 bg-opacity-50 text-gray-200'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {format(message.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isListening ? 'Listening...' : 'Ask about security events...'}
                    className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={() => handleSend()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}