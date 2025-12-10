import api from '../utils/api';
import { type Game, type CreateGameData } from '../types/game';

// We explicitly add /v1 to ensure we hit the correct backend group
const BASE_URL = '/v1/admin/games';

export const adminGameService = {
  // GET ALL GAMES
  // ⚠️ NOTE: This will likely fail (404) because your backend is missing "Route::get('admin/games'...)"
  getAllGames: async () => {
    try {
      const response = await api.get<Game[]>(BASE_URL);
      return response.data;
    } catch (error) {
      console.warn(
        "Backend missing 'index' route for games. Returning empty list to prevent crash."
      );
      return []; // Return empty array so the frontend doesn't break
    }
  },

  // CREATE GAME
  // This route exists in your backend: Route::post('admin/games', ...)
  createGame: async (data: CreateGameData) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // DELETE GAME
  // This route exists in your backend: Route::delete('admin/games/{id}', ...)
  deleteGame: async (id: number) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
