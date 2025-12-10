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

            // 3. Update State with the FULL user object (including roles)
            setUser(fullUser);

            // 4. Update Local Storage so it's correct for next time
            localStorage.setItem('user', JSON.stringify(fullUser));
            console.log('Auth Initialized: User roles loaded:', fullUser.roles);
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

      // 5. Mark initialization as done
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
    }),
    [user, token, isLoggedIn, isAuthInitialized, login, logout]
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
