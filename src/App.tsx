//import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import CookieBanner from './components/CookieBanner';
import IdleTimeout from './components/IdleTimeout';
import UserTour from './components/UserTour';
import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn } = useAuth();
  return (
    <>
    
      {isLoggedIn && <IdleTimeout />}
      <UserTour />
      <AppRoutes />
      <CookieBanner />
    
    </>
    
  );
}

export default App;