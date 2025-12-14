import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const DAILY_FREE_LIMIT = 3;
const PLAY_COST = 500;

// Helper to check if user has premium membership
const isPremiumUser = (user: any) => {
  if (!user) return false;
  
  // Debug log to see what user data we have
  console.log('[useGameAccess] Checking premium status for user:', {
    membership_type: user.membership_type,
    membership_tier: user.membership_tier,
    roles: user.roles
  });
  
  // Check membership_type (frontend standard)
  if (user.membership_type === 'premium' || user.membership_type === 'vip') return true;
  
  // Check membership_tier (backend field) - super_fan is treated as premium
  if (user.membership_tier === 'super_fan') return true;
  
  // Check roles array for premium/super_fan/vip role names
  if (user.roles && Array.isArray(user.roles)) {
    const premiumRoleNames = ['premium', 'vip', 'super_fan', 'superfan', 'super-fan', 'admin'];
    const hasPremiumRole = user.roles.some((role: any) => 
      premiumRoleNames.includes(role.name?.toLowerCase()) || 
      premiumRoleNames.includes(role.toLowerCase?.())
    );
    if (hasPremiumRole) return true;
  }
  
  return false;
};

export const useGameAccess = () => {
  const { user } = useAuth();
  const [dailyPlays, setDailyPlays] = useState(0);
  const isPremium = isPremiumUser(user);

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const key = `daily_plays_${today}_${user.id}`;
      const savedPlays = localStorage.getItem(key);
      setDailyPlays(savedPlays ? parseInt(savedPlays) : 0);
    }
  }, [user]);

  const checkAccess = useCallback(() => {
    if (!user) return { allowed: false, reason: 'not_logged_in', cost: 0 };

    // Premium/VIP/SuperFan users have unlimited plays
    if (isPremium) {
      return { allowed: true, reason: 'premium', cost: 0 };
    }

    if (dailyPlays < DAILY_FREE_LIMIT) {
      return { allowed: true, reason: 'free_limit', cost: 0 };
    }

    // Limit reached, check coins
    const userCoins = user.coins || 0;
    if (userCoins >= PLAY_COST) {
      return { allowed: false, reason: 'limit_reached', cost: PLAY_COST };
    }

    return { allowed: false, reason: 'no_coins', cost: PLAY_COST };
  }, [user, dailyPlays, isPremium]);

  const consumePlay = useCallback(async (payWithCoins: boolean) => {
    if (!user) return false;

    // Premium users don't consume free plays
    if (isPremium && !payWithCoins) {
      return true;
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `daily_plays_${today}_${user.id}`;

    if (payWithCoins) {
      // Deduct coins logic
      try {
        // TODO: Call backend to deduct coins
        // await gameService.deductCoins(PLAY_COST);
        
        // For now, update local user state if possible or just proceed
        // Ideally AuthContext should expose a way to update user coins
        console.log(`Deducting ${PLAY_COST} coins...`);
        
        // Update local storage for coins simulation if needed
        // const currentCoins = user.coins || 0;
        // const newCoins = currentCoins - PLAY_COST;
        
        // Update user object in context (This is a hack, ideally backend response updates it)
        // login(token, { ...user, coins: newCoins }); 
        
        return true;
      } catch (error) {
        console.error("Failed to deduct coins", error);
        return false;
      }
    } else {
      // Increment free play count
      const newCount = dailyPlays + 1;
      setDailyPlays(newCount);
      localStorage.setItem(key, newCount.toString());
      return true;
    }
  }, [user, dailyPlays, isPremium]);

  return {
    dailyPlays,
    checkAccess,
    consumePlay,
    remainingFreePlays: Math.max(0, DAILY_FREE_LIMIT - dailyPlays),
    isPremium
  };
};
