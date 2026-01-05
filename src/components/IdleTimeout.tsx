

import React from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

const IdleTimeout: React.FC = () => {
  const { logout, isLoggedIn } = useAuth();

  const handleOnIdle = () => {
    if (isLoggedIn) {

      logout(); // Perform logout: clear auth state, cookies, redirect to login
    }
  };

  useIdleTimer({
    timeout: INACTIVITY_TIMEOUT,
    onIdle: handleOnIdle,
    eventsThrottle: 200, // Default value, but kept for clarity
    
  });
  return null;
};

export default IdleTimeout;