//import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import CookieBanner from './components/CookieBanner';
import IdleTimeout from './components/IdleTimeout';
import UserTour from './components/UserTour';
import CartDrawer from './components/CartDrawer';
import { useAuth } from './context/AuthContext';
import { NotificationManager } from './components/NotificationManager';

function App() {
  const { isLoggedIn } = useAuth();
  return (
    <>
    
      {isLoggedIn && <IdleTimeout />}
      <NotificationManager />
      <UserTour />
      <CartDrawer />
      <AppRoutes />
      <CookieBanner />
    
    </>
    
  );
}

export default App;