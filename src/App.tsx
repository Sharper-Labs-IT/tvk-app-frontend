//import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import CookieBanner from './components/CookieBanner';
import IdleTimeout from './components/IdleTimeOut';
import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn } = useAuth();
  return (
    <>
    
      {isLoggedIn && <IdleTimeout />}
      <AppRoutes />
      <CookieBanner />
    
    </>
    
  );
}

export default App;