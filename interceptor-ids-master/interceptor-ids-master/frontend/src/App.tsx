import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ModelDetails } from './components/ModelDetails';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showModelDetails, setShowModelDetails] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (e.g., via token)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setShowModelDetails(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return showModelDetails ? (
    <ModelDetails onBack={() => setShowModelDetails(false)} user={user} />
  ) : (
    <Dashboard onViewModelDetails={() => setShowModelDetails(true)} user={user} onLogout={handleLogout} />
  );
}

export default App;
