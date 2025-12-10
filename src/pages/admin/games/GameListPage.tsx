import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Gamepad2, AlertCircle, Edit } from 'lucide-react';
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
      setGames(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load games. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      await adminGameService.deleteGame(id);
      // Remove from local state immediately
      setGames((prev) => prev.filter((g) => g.id !== id));
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Game Management</h1>
          <p className="text-gray-400 mt-1">Manage arcade games, rules, and premium status.</p>
        </div>
        <Link
          to="/admin/games/create"
          className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          Add New Game
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Games Table */}
      <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase font-medium">
              <tr>
                <th className="p-4">Game Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Created By</th>
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
                        <div>
                          <span className="block font-bold text-white">{game.name}</span>
                          <span className="text-xs text-gray-500">ID: {game.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 max-w-xs truncate" title={game.description}>
                      {game.description || 'No description provided.'}
                    </td>
                    <td className="p-4 text-center">
                      {/* Check if 1 (true) or 0 (false) */}
                      {Number(game.is_premium) === 1 ? (
                        <span className="inline-flex px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full border border-gold/30">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500">
                      {/* Assuming backend sends 'creator' relation, otherwise handle gracefully */}
                      {(game as any).creator?.name || 'Admin'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button Placeholder */}
                        <Link
                          to={`/admin/games/edit/${game.id}`}
                          state={{ game }} // <-- Passing the game object here is CRITICAL
                          className="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg inline-flex items-center justify-center"
                          title="Edit Game"
                        >
                          <Edit size={18} />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                          title="Delete Game"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2"
                  >
                    <Gamepad2 size={40} className="opacity-20" />
                    <span className="text-lg">No games found.</span>
                    <Link to="/admin/games/create" className="text-gold hover:underline text-sm">
                      Create your first game
                    </Link>
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
