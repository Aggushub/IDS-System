import React, { useState } from 'react';
import { Shield, AlertCircle, Loader } from 'lucide-react';
import type { User } from '../types';
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Please wait ${blockTimer} seconds before trying again`);
      return;
    }

    if (loginAttempts >= 3 && !captchaValue) {
      setError('Please complete the CAPTCHA');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username === 'system_admin' && password === 'admin123') {
        onLogin({
          id: '1',
          email: 'admin@interceptor.com',
          username: 'system_admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      } else if (username === 'security_analyst' && password === 'analyst123') {
        onLogin({
          id: '2',
          email: 'analyst@interceptor.com',
          username: 'security_analyst',
          role: 'analyst',
          createdAt: new Date().toISOString()
        });
      } else if (username === 'system_viewer' && password === 'viewer123') {
        onLogin({
          id: '3',
          email: 'viewer@interceptor.com',
          username: 'system_viewer',
          role: 'viewer',
          createdAt: new Date().toISOString()
        });
      } else {
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts + 1 >= 5) {
          setIsBlocked(true);
          setBlockTimer(300); // 5 minutes
          setError('Too many failed attempts. Please try again in 5 minutes.');
        } else {
          setError('Invalid credentials');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setCaptchaValue(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80')] bg-cover bg-center bg-blend-overlay">
      <div className="max-w-md w-full mx-4 glass-darker backdrop-blur-lg p-8 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Shield className="w-16 h-16 text-cyan-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">Interceptor IDS</h1>
          <p className="text-gray-400 mt-2">Advanced Intrusion Detection System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transition-all duration-300">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              required
              disabled={isBlocked}
            />
          </div>

          <div className="transition-all duration-300">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              required
              disabled={isBlocked}
            />
          </div>

          {loginAttempts >= 3 && (
            <div className="transition-all duration-300">
              <ReCAPTCHA
                sitekey="your-recaptcha-site-key"
                onChange={(value) => setCaptchaValue(value)}
                theme="dark"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-500 bg-opacity-10 p-3 rounded-md transition-all duration-300">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isBlocked}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}