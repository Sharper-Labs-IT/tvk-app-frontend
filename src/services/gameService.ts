import api from '../utils/api';

// --- Types ---

export interface Game {
  id: number;
  name: string;
  description?: string;
  is_premium: boolean;
  meta?: {
    trophy_thresholds?: {
      BRONZE: number;
      SILVER: number;
      GOLD: number;
      PLATINUM: number;
    };
  };
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  avatar?: string;
  total_trophies: number;
  rank: number;
  trophy_breakdown: {
    PLATINUM: number;
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };
}

export interface GameSessionResult {
  score: number;
  coins: number;
  data?: any; // Game specific data (e.g. accuracy, waves cleared)
}

export const gameService = {
  // GET /api/games
  // Fetch all games with their metadata (including trophy thresholds)
  getAllGames: async () => {
    const response = await api.get<Game[]>('/games');
    return response.data;
  },

  // GET /api/leaderboard
  // Fetch global leaderboard aggregated by total trophies
  getLeaderboard: async () => {
    const response = await api.get<LeaderboardEntry[]>('/leaderboard');
    return response.data;
  },

  // POST /api/games/{id}/start
  // Start a new game session. Returns a session ID.
  startGameSession: async (gameId: number) => {
    const response = await api.post<{ session_id: string }>(`/games/${gameId}/start`);
    return response.data;
  },

  // POST /api/games/{id}/submit
  // Submit score and coins for a game session.
  // Backend should calculate trophies based on score and update user stats.
  submitScore: async (gameId: number, payload: GameSessionResult) => {
    const response = await api.post(`/games/${gameId}/submit`, payload);
    return response.data;
  },

  // GET /api/user/stats
  // Get current user's total trophies and coins
  getUserStats: async () => {
    const response = await api.get<{ total_trophies: number; coins: number }>('/user/stats');
    return response.data;
  }
};
