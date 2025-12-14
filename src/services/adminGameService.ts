import api from '../utils/api';
import { type Game, type CreateGameData } from '../types/game';

// Base URL matches your routes/api.php: v1/admin/games
const BASE_URL = '/v1/admin/games';

export interface GameResponse {
  games: {
    data: Game[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export const adminGameService = {
  // GET ALL GAMES
  // Handles the response structure: { "games": { "data": [...] } }
  getAllGames: async () => {
    const response = await api.get<GameResponse>(BASE_URL);
    // Return just the array of games for the list
    return response.data.games.data;
  },

  // CREATE GAME
  createGame: async (data: CreateGameData) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // UPDATE GAME (New! Backend supports this now)
  updateGame: async (id: number, data: Partial<CreateGameData>) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // DELETE GAME
  deleteGame: async (id: number) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
