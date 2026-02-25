import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// Uses the smart client that attaches the token automatically
import axiosClient from '../api/axiosClient';
import type { IUser } from '../types/auth';
import { getStoryImageUrl } from '../utils/storyUtils';

/**
 * @fileoverview Global Authentication Context.
 * FIXED: 1. Uses axiosClient to prevent auto-logout.
 * FIXED: 2. Loads user from localStorage immediately so profile data isn't lost on refresh.
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

  // --- 🟢 FIX: Load user immediately from Local Storage ---
  // This prevents the "blank profile" issue while waiting for the API
  const [user, setUser] = useState<IUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return Cookies.get('authToken') || null;
  });

  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const isLoggedIn = !!token;

  // Function called on successful login
  const login = useCallback((newToken: string, userData: IUser) => {
    setToken(newToken);
    Cookies.set('authToken', newToken, { expires: 7 });

    // MERGE FIX: Used logic from 'development' branch to handle avatar normalization
    // Note: The userData coming from login MIGHT be missing roles depending on backend.
    // We set it for now, but the useEffect below will fix it on next reload.
    // Normalize avatar field (backend sends 'avatar' but we use 'avatar_url')
    let avatar_url = userData.avatar_url || userData.avatar || null;
    if (avatar_url) {
        avatar_url = getStoryImageUrl(avatar_url);
    }
    const normalizedUser = { ...userData, avatar_url };
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  }, []);

  // Function called to log out the user
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    Cookies.remove('authToken');
    localStorage.removeItem('user');
    navigate('/');
  }, [navigate]);

  // Function to update user data locally
  const updateUser = useCallback((updates: Partial<IUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Helper function to calculate total coins
  const calculateTotalCoins = (userData: IUser): number => {
    if (userData.coins !== undefined && userData.coins !== null) {
      return userData.coins;
    }
    if (userData.game_participation && Array.isArray(userData.game_participation)) {
      return userData.game_participation.reduce((total, participation) => {
        return total + (participation.coins || 0);
      }, 0);
    }
    return 0;
  };

  // Function to refresh user data from the backend
  const refreshUser = useCallback(async () => {
    try {
      // Uses axiosClient (automatically adds Bearer token)
      // Removed '/v1' because axiosClient baseURL already has it
      const response = await axiosClient.get('/auth/me');

      if (response.data && response.data.user) {
        const fullUser = response.data.user;
        const totalCoins = calculateTotalCoins(fullUser);
        
        // MERGE FIX: Kept 'development' logic to ensure avatar_url is set
        // Ensure avatar_url is set (backend might send 'avatar' or 'avatar_url')
        let avatar_url = fullUser.avatar_url || fullUser.avatar || null;
        if (avatar_url) {
            avatar_url = getStoryImageUrl(avatar_url);
        }
        
        const userWithCoins = { ...fullUser, avatar_url, coins: totalCoins };
        
        setUser(userWithCoins);
        localStorage.setItem('user', JSON.stringify(userWithCoins));
      }
    } catch (error) {
       console.error("Failed to refresh user:", error);
    }
  }, []);

  // --- Initialize Auth on Load ---
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = Cookies.get('authToken');

      if (storedToken) {
        setToken(storedToken);

        try {
          // Fetch fresh data from API to ensure roles/coins are up to date
          const response = await axiosClient.get('/auth/me');

          if (response.data && response.data.user) {
            const fullUser = response.data.user;
            const totalCoins = calculateTotalCoins(fullUser);
            
            // 3.5. Ensure avatar_url is set (backend might send 'avatar' or 'avatar_url')
            let avatar_url = fullUser.avatar_url || fullUser.avatar || null;
            if (avatar_url) {
                avatar_url = getStoryImageUrl(avatar_url);
            }
            
            const userWithCoins = { ...fullUser, avatar_url, coins: totalCoins };

            setUser(userWithCoins);
            localStorage.setItem('user', JSON.stringify(userWithCoins));
          }
        } catch (error) {
          console.error('Failed to sync user profile on load:', error);

          // MERGE FIX: Used logic from 'thilanka1' branch
          // Only logout if it's strictly a 401 Unauthorized error (avoids logout on network error)
          if ((error as any).response && (error as any).response.status === 401) {
            Cookies.remove('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      }

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