import { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

const IdleTimeout: React.FC = () => {
  const { logout, isLoggedIn } = useAuth();

  const handleOnIdle = () => {
    if (isLoggedIn) {
      console.log('User has been inactive for 1 hour → Auto logout triggered');
      logout(); // Clears cookie, localStorage, navigates to '/'
    }
  };

  const timer = useIdleTimer({
    timeout: INACTIVITY_TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500,
    // No crossTab → Timer starts immediately!
  });

  // Debug: See countdown in console (remove later if you want)
  useEffect(() => {
    const interval = setInterval(() => {
      const remainingSeconds = Math.round(timer.getRemainingTime() / 1000);
      if (remainingSeconds > 0) {
        console.log(`Time until auto-logout: ${remainingSeconds} seconds`);
      }
    }, 5000); // Log every 5 seconds

    return () => clearInterval(interval);
  }, [timer]);

  return null;
};

export default IdleTimeout;