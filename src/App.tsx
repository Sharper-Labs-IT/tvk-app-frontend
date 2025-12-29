import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <Router>
      <AppRoutes />
      <CookieBanner />
    </Router>
  );
}

export default App;