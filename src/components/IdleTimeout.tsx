import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from '../context/AuthContext';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

const IdleTimeout: React.FC = () => {
  const { logout, isLoggedIn } = useAuth();

  const handleOnIdle = () => {
    if (isLoggedIn) {
      logout(); // Clears cookie, localStorage, navigates to '/'
    }
  };

  useIdleTimer({
    timeout: INACTIVITY_TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500,
    // No crossTab → Timer starts immediately!
  });


  return null;
};

export default IdleTimeout;