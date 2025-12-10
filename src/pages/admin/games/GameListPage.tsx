import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Gamepad2, AlertCircle } from 'lucide-react';
import { adminGameService } from '../../../services/adminGameService';
import { type Game } from '../../../types/game';
import Loader from '../../../components/Loader';

const GameListPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await adminGameService.getAllGames();
      // Handle case where API might wrap data in { data: [...] }
      const gameList = Array.isArray(data) ? data : (data as any).data || [];
      setGames(gameList);
    } catch (err) {
      console.error(err);
      setError('Failed to load games. Ask Senior Dev if GET /api/v1/admin/games exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      await adminGameService.deleteGame(id);
      // Remove from local state
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      alert('Failed to delete game');
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Game Management</h1>
          <p className="text-gray-400 mt-1">Manage arcade games and settings</p>
        </div>
        <Link
          to="/admin/games/create"
          className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          Add New Game
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4">Game Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.length > 0 ? (
                games.map((game) => (
                  <tr key={game.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg text-gold">
                          <Gamepad2 size={24} />
                        </div>
                        <span className="font-bold text-white">{game.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 max-w-xs truncate">
                      {game.description || 'No description'}
                    </td>
                    <td className="p-4 text-center">
                      {game.is_premium ? (
                        <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full border border-gold/30">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                        title="Delete Game"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No games found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GameListPage;
