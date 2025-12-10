import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { adminGameService } from '../../../services/adminGameService';

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // New success state

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    is_premium: false,
  });

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
      await adminGameService.createGame(formData);

      // ✅ SUCCESS! We show a message instead of navigating away
      setSuccess('Game created successfully in database!');

      // Reset form
      setFormData({
        name: '',
        description: '',
        rules: '',
        is_premium: false,
      });
    } catch (err: any) {
      console.error(err);
      // Handle Laravel validation errors or 404s
      const msg = err.response?.data?.message || 'Failed to create game. Check console.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')} // Changed to go to Dashboard instead of broken List
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white font-serif">Add New Game</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <div>
            <p className="font-bold">{success}</p>
            <p className="text-sm opacity-80">
              Since the backend cannot list games yet, you can stay here to add more.
            </p>
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
              placeholder="e.g. Space Invaders"
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
              placeholder="Short description..."
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
              placeholder="Rules..."
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
                'Creating...'
              ) : (
                <>
                  <Save size={20} /> Create Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGamePage;
