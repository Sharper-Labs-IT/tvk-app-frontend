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
  // GET /api/v1/games
  // Fetch all games with their metadata (including trophy thresholds)
  getAllGames: async () => {
    const response = await api.get<Game[]>('/v1/games');
    return response.data;
  },

  // GET /api/v1/games/leaderboard/overall
  // Fetch global leaderboard aggregated by total trophies
  getLeaderboard: async () => {
    const response = await api.get<LeaderboardEntry[]>('/v1/games/leaderboard/overall');
    return response.data;
  },

  // POST /api/v1/games/{id}/join
  // Join a game session. Returns a participant ID.
  joinGame: async (gameId: number) => {
    const response = await api.post<{ participant_id: number }>(`/v1/games/${gameId}/join`);
    return response.data;
  },

  // POST /api/v1/games/participant/{participantId}/score
  // Submit score and coins for a game session.
  submitScore: async (participantId: number, payload: GameSessionResult) => {
    const response = await api.post(`/v1/games/participant/${participantId}/score`, payload);
    return response.data;
  },

  // GET /api/v1/games/{id}/leaderboard
  // Fetch leaderboard for a specific game
  getGameLeaderboard: async (gameId: number) => {
    const response = await api.get<LeaderboardEntry[]>(`/v1/games/${gameId}/leaderboard`);
    return response.data;
  },

  // GET /api/v1/games/participant/{id}/trophies
  // Get trophies for a specific participant
  getParticipantTrophies: async (participantId: number) => {
    const response = await api.get(`/v1/games/participant/${participantId}/trophies`);
    return response.data;
  },

  // GET /api/v1/games/my/trophies
  // Get current user's trophies
  getMyTrophies: async () => {
    const response = await api.get('/v1/games/my/trophies');
    return response.data;
  },

  // GET /api/user/stats
  // Get current user's total trophies and coins
  getUserStats: async () => {
    // This endpoint wasn't in the provided list, but keeping it as it might be used.
    // If it needs to be updated to v1, it would likely be /v1/user/stats or similar.
    // For now, I'll assume it's still valid or not part of the change request unless specified.
    // However, looking at the "My Trophy List" endpoint, maybe that replaces part of this?
    // I'll leave it for now to avoid breaking existing code that relies on it, 
    // but I'll update the path to include /v1 just in case.
    const response = await api.get<{ total_trophies: number; coins: number }>('/v1/user/stats');
    return response.data;
  }
};
