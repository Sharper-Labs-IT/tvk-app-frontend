import type { IUser } from '../types/auth';

/**
 * Helper to check if user has a premium membership
 */
export const isPremiumUser = (user: IUser | any): boolean => {
  if (!user) return false;
  
  // Check membership_type (frontend standard)
  if (user.membership_type === 'premium' || user.membership_type === 'vip') return true;
  
  // Check membership_tier (backend field) - normalize spaces to underscores
  const premiumTiers = ['super_fan', 'superfan', 'premium', 'vip', 'gold', 'platinum'];
  if (user.membership_tier) {
    const normalizedTier = user.membership_tier.toLowerCase().replace(/\s+/g, '_');
    if (premiumTiers.includes(normalizedTier)) return true;
  }
  
  // Check membership object's plan_id (plan_id 1 = Free, plan_id > 1 = Premium)
  if (user.membership?.plan_id && Number(user.membership.plan_id) > 1) return true;
  
  // Check roles array for premium/super_fan/vip role names
  if (user.roles && Array.isArray(user.roles)) {
    const premiumRoleNames = ['premium', 'vip', 'super_fan', 'superfan', 'super-fan', 'admin'];
    return user.roles.some((role: any) => {
      const roleName = role.name?.toLowerCase() || role?.toLowerCase?.() || '';
      const normalizedRole = roleName.trim().replace(/\s+/g, '_');
      return premiumRoleNames.includes(normalizedRole);
    });
  }
  return false;
};
