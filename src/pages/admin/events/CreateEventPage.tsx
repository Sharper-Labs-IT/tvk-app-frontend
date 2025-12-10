import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Calendar } from 'lucide-react';
import { adminEventService } from '../../../services/adminEventService';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    start_date: '',
    end_date: '',
    reward_points: '0',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminEventService.createEvent({ ...formData, media: file });
      navigate('/admin/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white font-serif">Create Event</h1>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="bg-tvk-dark-card p-8 rounded-lg border border-white/10 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Event Title</label>
          <input
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
            placeholder="e.g. Summer Tournament"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Start Date & Time</label>
            <input
              type="datetime-local"
              name="start_date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">End Date & Time</label>
            <input
              type="datetime-local"
              name="end_date"
              required
              value={formData.end_date}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
        </div>

        {/* Description & Rules */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-2">Rules</label>
          <textarea
            name="rules"
            rows={3}
            value={formData.rules}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
          />
        </div>

        {/* Points & File */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Reward Points</label>
            <input
              type="number"
              name="reward_points"
              value={formData.reward_points}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Event Poster (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white/10 file:text-gold hover:file:bg-white/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-black font-bold py-3 px-8 rounded hover:bg-yellow-500 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateEventPage;
