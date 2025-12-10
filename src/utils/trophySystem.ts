
export type TrophyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NONE';

export interface TrophyThresholds {
  BRONZE: number;
  SILVER: number;
  GOLD: number;
  PLATINUM: number;
}

export const GAME_TROPHY_THRESHOLDS: Record<string, TrophyThresholds> = {
  'city-defender': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 5000,
  },
  'space-invaders': {
    BRONZE: 1000,
    SILVER: 2500,
    GOLD: 5000,
    PLATINUM: 10000,
  },
  'whack-a-mole': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 3000,
  },
  'trivia': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 3000,
  },
  'memory': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 3000,
  },
  'jigsaw': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 3000,
  },
  'protect-queen': {
    BRONZE: 500,
    SILVER: 1000,
    GOLD: 2000,
    PLATINUM: 3000,
  }
};

export const getTrophyFromScore = (gameId: string, score: number): TrophyTier => {
  const thresholds = GAME_TROPHY_THRESHOLDS[gameId];
  if (!thresholds) return 'NONE';

  if (score >= thresholds.PLATINUM) return 'PLATINUM';
  if (score >= thresholds.GOLD) return 'GOLD';
  if (score >= thresholds.SILVER) return 'SILVER';
  if (score >= thresholds.BRONZE) return 'BRONZE';

  return 'NONE';
};

export const getTrophyIcon = (tier: TrophyTier): string => {
  switch (tier) {
    case 'PLATINUM': return '🏆💎'; // Placeholder or path to image
    case 'GOLD': return '🏆🥇';
    case 'SILVER': return '🏆🥈';
    case 'BRONZE': return '🏆🥉';
    default: return '';
  }
};

export const getTrophyColor = (tier: TrophyTier): string => {
  switch (tier) {
    case 'PLATINUM': return '#e5e4e2';
    case 'GOLD': return '#ffd700';
    case 'SILVER': return '#c0c0c0';
    case 'BRONZE': return '#cd7f32';
    default: return 'transparent';
  }
};

export const getUserTotalTrophies = (): number => {
  // Mock implementation - in real app this would come from backend/context
  const stored = localStorage.getItem('tvk_total_trophies');
  return stored ? parseInt(stored, 10) : 12; // Default dummy value
};
