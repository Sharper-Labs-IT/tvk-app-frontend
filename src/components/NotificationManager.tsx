import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PromoModal from './common/PromoModal';

export const NotificationManager: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const [showPromo, setShowPromo] = useState(false);

  // Exclude auth pages from notifications
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

  // 1. Welcome Back / Daily Engagement Notification
  useEffect(() => {
    if (isAuthPage) return;

    const lastVisit = localStorage.getItem('last_visit_ts');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Update last visit
    localStorage.setItem('last_visit_ts', now.toString());

    if (lastVisit) {
      const timeSinceLastVisit = now - parseInt(lastVisit);
      if (timeSinceLastVisit > oneDay) {
        // User hasn't been here for more than 24 hours
        setTimeout(() => {
          toast('Welcome back! We missed you around here.', {
            icon: '👋',
            duration: 5000,
            style: {
              background: '#1a1c2e',
              color: '#fff',
              border: '1px solid #d4af37',
            },
          });
        }, 1500);
      }
    } else {
      // First time visit (or cleared cache)
      setTimeout(() => {
        toast('Welcome to the community!', {
          icon: '✨',
          style: {
             background: '#1a1c2e',
             color: '#fff',
             border: '1px solid #d4af37',
          }
        });
      }, 1500);
    }
  }, []); // Run once on mount (reload)

  // 2. Membership Promo Logic (Persistent "Nag" Loop)
  useEffect(() => {
    // Skip on auth pages
    if (isAuthPage) return;

    // Only show for logged-in users
    if (!isLoggedIn) return;

    // Check if user has active membership
    const status1 = user?.membership?.status;
    const status2 = user?.subscription?.status;
    const isActive = status1 === 'active' || status2 === 'active';
    
    // Strict Check: active members should NEVER see this
    if (isActive) return;

    // If modal is NOT currently showing, schedule the next appearance
    if (!showPromo) {
      const hasSeenInitial = sessionStorage.getItem('promo_popup_status');
      let delay = 0;

      if (!hasSeenInitial) {
        // First time this session: Show quickly (5 seconds)
        delay = 5000;
      } else {
        // Subsequent times: Show randomly between 45 seconds and 3 minutes
        // This persistent loop encourages users to upgrade
        const min = 45000; 
        const max = 180000;
        delay = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      const timer = setTimeout(() => {
        setShowPromo(true);
        sessionStorage.setItem('promo_popup_status', 'true');
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [showPromo, isLoggedIn, user, isAuthPage]);


  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <PromoModal isOpen={showPromo} onClose={() => setShowPromo(false)} isLoggedIn={isLoggedIn} />
    </>
  );
};
