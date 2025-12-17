import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { adminGameService } from '../../../services/adminGameService';
import { type Game } from '../../../types/game';
import Loader from '../../../components/Loader';

const EditGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    is_premium: false,
  });

  // Load game data on mount
  useEffect(() => {
    const loadGameData = async () => {
      // 1. Check if data was passed via Link state (Fastest)
      if (location.state?.game) {
        const game = location.state.game as Game;
        populateForm(game);
        setInitialLoading(false);
        return;
      }

      // 2. If no state (e.g., page refresh), fetch all games and find this one
      // (Because backend is missing 'show' single game endpoint)
      try {
        const games = await adminGameService.getAllGames();
        const foundGame = games.find((g) => g.id === Number(id));

        if (foundGame) {
          populateForm(foundGame);
        } else {
          setError('Game not found.');
        }
      } catch (err) {
        setError('Failed to load game details.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadGameData();
  }, [id, location.state]);

  const populateForm = (game: Game) => {
    setFormData({
      name: game.name,
      description: game.description || '',
      rules: game.rules || '',
      // Handle both boolean true/false and number 1/0 from Laravel
      is_premium: Number(game.is_premium) === 1,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_premium: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!id) throw new Error('Game ID missing');

      await adminGameService.updateGame(Number(id), formData);
      setSuccess('Game updated successfully!');

      // Optional: Redirect back after short delay
      setTimeout(() => {
        navigate('/admin/games');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update game.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/games')}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white font-serif">Edit Game</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <div>
            <p className="font-bold">{success}</p>
            <p className="text-sm opacity-80">Redirecting to list...</p>
          </div>
        </div>
      )}

      <div className="bg-tvk-dark-card p-8 rounded-lg border border-white/10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Game Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
            <input
              type="checkbox"
              id="is_premium"
              checked={formData.is_premium}
              onChange={handleCheckbox}
              className="w-5 h-5 rounded border-gray-600 text-gold focus:ring-gold bg-transparent"
            />
            <label
              htmlFor="is_premium"
              className="text-white font-medium cursor-pointer select-none"
            >
              Is this a Premium Game?
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Game Rules</label>
            <textarea
              name="rules"
              rows={5}
              value={formData.rules}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? (
                'Updating...'
              ) : (
                <>
                  <Save size={20} /> Update Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGamePage;
