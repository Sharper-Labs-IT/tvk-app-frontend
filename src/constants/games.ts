// src/constants/games.ts
// Centralized game configuration for TVK Gaming Platform
// These IDs should match the backend's `games` table entries

export interface GameConfig {
  id: number;
  name: string;
  slug: string;
  description: string;
  isPremium: boolean;
  route: string;
  startRoute: string;
  trophyThresholds: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
}

// Game IDs - must match backend database
export const GAME_IDS = {
  MEMORY: 1,          
  SPACE_INVADERS: 5,
  CITY_DEFENDER: 3,
  WHACK_A_MOLE: 4,
  TRIVIA: 7,
  JIGSAW_PUZZLE: 6,
} as const;

// Full game configurations
export const GAMES: Record<number, GameConfig> = {
  [GAME_IDS.SPACE_INVADERS]: {
    id: GAME_IDS.SPACE_INVADERS,
    name: "VJ's Galaxy Force",
    slug: 'space-invaders',
    description: 'Defend the galaxy from alien invasion in this classic shooter!',
    isPremium: false,
    route: '/game/protect-area',
    startRoute: '/game/protect-area/start',
    trophyThresholds: {
      BRONZE: 1000,
      SILVER: 2500,
      GOLD: 5000,
      PLATINUM: 10000,
    },
  },
  [GAME_IDS.CITY_DEFENDER]: {
    id: GAME_IDS.CITY_DEFENDER,
    name: 'City Defender',
    slug: 'city-defender',
    description: 'Protect the city from incoming threats!',
    isPremium: false,
    route: '/game/city-defender',
    startRoute: '/game/city-defender/start',
    trophyThresholds: {
      BRONZE: 500,
      SILVER: 1500,
      GOLD: 3000,
      PLATINUM: 6000,
    },
  },
  [GAME_IDS.WHACK_A_MOLE]: {
    id: GAME_IDS.WHACK_A_MOLE,
    name: 'Villain Hunt',
    slug: 'whack-a-mole',
    description: 'Hunt down villains in this fast-paced whack game!',
    isPremium: false,
    route: '/game/villain-hunt',
    startRoute: '/game/villain-hunt/start',
    trophyThresholds: {
      BRONZE: 300,
      SILVER: 800,
      GOLD: 1500,
      PLATINUM: 3000,
    },
  },
  [GAME_IDS.TRIVIA]: {
    id: GAME_IDS.TRIVIA,
    name: 'VJ Trivia Challenge',
    slug: 'trivia',
    description: 'Test your knowledge about VJ in this trivia game!',
    isPremium: false,
    route: '/game/trivia',
    startRoute: '/game/trivia/start',
    trophyThresholds: {
      BRONZE: 500,
      SILVER: 1000,
      GOLD: 2000,
      PLATINUM: 4000,
    },
  },
  [GAME_IDS.MEMORY]: {
    id: GAME_IDS.MEMORY,
    name: 'Memory Match Showdown',
    slug: 'memory',
    description: 'Match pairs of cards in this memory challenge!',
    isPremium: false,
    route: '/game/memory-challenge',
    startRoute: '/game/memory-challenge/start',
    trophyThresholds: {
      BRONZE: 200,
      SILVER: 500,
      GOLD: 1000,
      PLATINUM: 2000,
    },
  },
  [GAME_IDS.JIGSAW_PUZZLE]: {
    id: GAME_IDS.JIGSAW_PUZZLE,
    name: 'Puzzle Master',
    slug: 'jigsaw-puzzle',
    description: 'Solve jigsaw puzzles featuring iconic VJ moments!',
    isPremium: false,
    route: '/game/puzzle-master',
    startRoute: '/game/puzzle-master/start',
    trophyThresholds: {
      BRONZE: 500,
      SILVER: 1000,
      GOLD: 2000,
      PLATINUM: 4000,
    },
  },
};

// Helper functions
export const getGameById = (id: number): GameConfig | undefined => GAMES[id];

export const getGameBySlug = (slug: string): GameConfig | undefined => {
  return Object.values(GAMES).find((game) => game.slug === slug);
};

export const getAllGames = (): GameConfig[] => Object.values(GAMES);

export const getPremiumGames = (): GameConfig[] => {
  return Object.values(GAMES).filter((game) => game.isPremium);
};

export const getFreeGames = (): GameConfig[] => {
  return Object.values(GAMES).filter((game) => !game.isPremium);
};
