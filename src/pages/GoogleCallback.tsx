import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import type { IUser } from '../types/auth';

interface AuthCallbackData {
  token: string;
  user: IUser;
  is_first_login?: boolean;
  daily_loot_box?: {
    available: boolean;
    coins_amount: number;
    message: string;
  };
}

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Log immediately when component mounts
  
  

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        
        
        
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        // Check for error parameter
        const errorParam = urlParams.get('error') || hashParams.get('error');
        if (errorParam) {
          console.error('❌ OAuth Error:', errorParam);
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Try to get data from multiple sources (Laravel might send it different ways)
        let authData: AuthCallbackData | null = null;

        // Method 1: Base64-encoded data parameter (recommended approach)
        const dataParam = urlParams.get('data') || hashParams.get('data');
        
        if (dataParam) {
          try {
            authData = JSON.parse(atob(dataParam));
            
          } catch (e) {
            console.error('❌ Failed to decode base64 data:', e);
          }
        }

        // Method 2: Individual query parameters (fallback)
        if (!authData) {
          const token = urlParams.get('token') || hashParams.get('token');
          const userParam = urlParams.get('user') || hashParams.get('user');
          
          
          
          
          if (token && userParam) {
            try {
              const user = JSON.parse(decodeURIComponent(userParam));
              authData = { token, user };
              
            } catch (e) {
              console.error('❌ Failed to parse user data:', e);
            }
          }
        }

        // Validate we have the required data
        if (!authData || !authData.token || !authData.user) {
          console.error('❌ No valid authentication data received');
          console.error('❌ authData:', authData);
          setError('Authentication failed. No valid credentials received.');
          setIsProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        

        // Save authentication
        login(authData.token, authData.user);

        // Give a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 200));

        // Determine redirect path
        let redirectPath = '/';
        if (authData.is_first_login) {
          redirectPath = '/?firstLogin=true';
        } else if (authData.daily_loot_box?.available) {
          redirectPath = '/?lootbox=true';
        }

        
        
        // Use window.location for a hard redirect to ensure fresh page load
        window.location.href = redirectPath;

      } catch (err) {
        console.error('❌ Google callback error:', err);
        setError('Authentication failed. Please try again.');
        setIsProcessing(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-tvk-dark flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-8 py-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-400">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-tvk-dark flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-gray-400 mt-4 text-lg">Completing Google Sign-In...</p>
          <p className="text-gray-500 mt-2 text-sm">Please wait while we log you in</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
