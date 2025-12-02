import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../utils/api';
import type { IUser } from '../types/auth';

/**
 * @fileoverview Global Authentication Context.
 * Provides logged-in state, user data, and global login/logout functions.
 * It handles checking cookies/localStorage on startup.
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Create Auth Provider Component ---

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false); // State to track if initial check is done
  const isLoggedIn = !!token;

  // Function called on successful login
  const login = useCallback((newToken: string, userData: IUser) => {
    setToken(newToken);
    // Setting secure: true and sameSite: 'strict' is highly recommended for production over HTTPS
    Cookies.set('authToken', newToken, { expires: 7 });
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User logged in successfully:', userData.name);
  }, []);

  // Function called to log out the user
  const logout = useCallback(() => {
    // 1. Clear state
    setToken(null);
    setUser(null);
    // 2. Clear token cookie and local storage
    Cookies.remove('authToken');
    localStorage.removeItem('user');

    // 3. Make an optional API call to invalidate the token on the server (best practice)
    // api.post('/v1/auth/logout').catch(err => console.error('Logout API failed:', err));

    // 4. Redirect to the home page (/) - 👈 UPDATED REDIRECT TARGET
    navigate('/');

    // NOTE: The alert is removed here as it is now handled by the modal confirmation in the Header component.
  }, [navigate]);

  // Initial Load Effect: Check for token and user data in storage on application startup
  useEffect(() => {
    const storedToken = Cookies.get('authToken');
    const storedUserJson = localStorage.getItem('user');

    if (storedToken && storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson) as IUser;
        setToken(storedToken);
        setUser(storedUser);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        // Clear invalid data
        Cookies.remove('authToken');
        localStorage.removeItem('user');
      }
    }
    // Set initialized flag to true once the check is complete
    setIsAuthInitialized(true);
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
