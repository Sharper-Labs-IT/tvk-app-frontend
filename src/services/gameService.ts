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
  // Join a game session. Returns a participant object with ID.
  // Response: { participant: { id, game_id, user_id, status, data } }
  joinGame: async (gameId: number) => {
    const response = await api.post<{
      participant: {
        id: number;
        game_id: number;
        user_id: number;
        status: string;
        data: any;
      };
    }>(`/v1/games/${gameId}/join`);
    return response.data;
  },

  // POST /api/v1/games/participant/{participantId}/score
  // Submit score and coins for a game session.
  // Response: { participant: { id, score, coins } }
  submitScore: async (participantId: number, payload: GameSessionResult) => {
    const response = await api.post<{
      participant: {
        id: number;
        score: number;
        coins: number;
      };
    }>(`/v1/games/participant/${participantId}/score`, payload);
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
  // Get current user's trophies across all games
  // Response: { user: number, trophies: [{ tier: string, score_at_time_of_earning: number }] }
  getMyTrophies: async () => {
    const response = await api.get<{
      user: number;
      trophies: Array<{
        tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
        score_at_time_of_earning: number;
      }>;
    }>('/v1/games/my/trophies');
    return response.data;
  },
};
