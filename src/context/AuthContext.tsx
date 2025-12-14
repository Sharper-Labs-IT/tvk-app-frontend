import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../utils/api'; // Import your Axios instance
import type { IUser } from '../types/auth';

/**
 * @fileoverview Global Authentication Context.
 * FIXED: Now fetches fresh user data (with Roles) on application load.
 */

// --- 1. Define Types ---

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isAuthInitialized: boolean;
  login: (newToken: string, userData: IUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<IUser>) => void;
  refreshUser: () => Promise<void>;
}

// --- 2. Create Context ---

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Create Auth Provider Component ---

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const isLoggedIn = !!token;

  // Function called on successful login
  const login = useCallback((newToken: string, userData: IUser) => {
    setToken(newToken);
    Cookies.set('authToken', newToken, { expires: 7 });

    // Note: The userData coming from login MIGHT be missing roles depending on backend.
    // We set it for now, but the useEffect below will fix it on next reload.
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Function called to log out the user
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    Cookies.remove('authToken');
    localStorage.removeItem('user');
    navigate('/');
  }, [navigate]);

  // Function to update user data (e.g., coins after game)
  // TODO: This is a temporary local update until backend APIs are ready
  const updateUser = useCallback((updates: Partial<IUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('[AuthContext] User updated locally:', updates);
      return updatedUser;
    });
  }, []);

  // Helper function to calculate total coins from game_participation
  const calculateTotalCoins = (userData: IUser): number => {
    if (userData.coins !== undefined && userData.coins !== null) {
      return userData.coins;
    }
    // Calculate from game_participation if coins field is not directly available
    if (userData.game_participation && Array.isArray(userData.game_participation)) {
      return userData.game_participation.reduce((total, participation) => {
        return total + (participation.coins || 0);
      }, 0);
    }
    return 0;
  };

  // Function to refresh user data from the backend
  // Call this after game ends to get updated coins/trophies
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/v1/auth/me');
      if (response.data && response.data.user) {
        const fullUser = response.data.user;
        
        // Calculate total coins from game_participation if not provided
        const totalCoins = calculateTotalCoins(fullUser);
        const userWithCoins = { ...fullUser, coins: totalCoins };
        
        setUser(userWithCoins);
        localStorage.setItem('user', JSON.stringify(userWithCoins));
        console.log('[AuthContext] User refreshed from API:', userWithCoins, 'Total coins:', totalCoins);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  }, []);

  // --- 🛑 CRITICAL FIX: Fetch User Data on Load ---
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = Cookies.get('authToken');

      if (storedToken) {
        // 1. Set token immediately so API calls work
        setToken(storedToken);

        try {
          // 2. FORCE call the API to get the user WITH ROLES
          // We use the Axios instance 'api' which automatically adds the Bearer token
          const response = await api.get('/v1/auth/me');

          if (response.data && response.data.user) {
            const fullUser = response.data.user;

            // 3. Calculate total coins from game_participation
            const totalCoins = calculateTotalCoins(fullUser);
            const userWithCoins = { ...fullUser, coins: totalCoins };

            // 4. Update State with the FULL user object (including roles and coins)
            setUser(userWithCoins);

            // 5. Update Local Storage so it's correct for next time
            localStorage.setItem('user', JSON.stringify(userWithCoins));
            console.log('Auth Initialized: User roles loaded:', fullUser.roles, 'Total coins:', totalCoins);
          }
        } catch (error) {
          console.error('Failed to fetch user profile on load:', error);
          // If the token is invalid/expired, log them out
          Cookies.remove('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      // 6. Mark initialization as done
      setIsAuthInitialized(true);
    };

    initializeAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn,
      isAuthInitialized,
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, token, isLoggedIn, isAuthInitialized, login, logout, updateUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 4. Custom Hook for Components ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
