import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Calendar, Upload } from 'lucide-react';
import { adminEventService } from '../../../services/adminEventService';
import { type Event } from '../../../types/event';
import Loader from '../../../components/Loader';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    start_date: '',
    end_date: '',
    reward_points: '0',
  });

  // File State (for new uploads)
  const [file, setFile] = useState<File | null>(null);

  // Helper to format MySQL date "2025-01-20 10:00:00" -> HTML input "2025-01-20T10:00"
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(' ', 'T').substring(0, 16);
  };

  // Helper to populate form data
  const populateForm = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      rules: event.rules || '',
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
      reward_points: String(event.reward_points || 0),
    });
  };

  // Load Data on Mount
  useEffect(() => {
    const loadEventData = async () => {
      // 1. Try loading from navigation state (Fastest)
      if (location.state?.event) {
        populateForm(location.state.event);
        setInitialLoading(false);
        return;
      }

      // 2. Fallback: Fetch all events and find this one
      // (Since there is no direct Admin 'Show' API endpoint)
      try {
        const events = await adminEventService.getAllEvents();
        const foundEvent = events.find((e: Event) => e.id === Number(id));

        if (foundEvent) {
          populateForm(foundEvent);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load event details.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadEventData();
  }, [id, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!id) throw new Error('Event ID is missing');

      // Prepare data object including the file (if any)
      const dataToSubmit = {
        ...formData,
        media: file, // This will be handled by the service using FormData
      };

      await adminEventService.updateEvent(Number(id), dataToSubmit);

      setSuccess('Event updated successfully!');

      // Redirect back to list after short delay
      setTimeout(() => {
        navigate('/admin/events');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update event.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white font-serif">Edit Event</h1>
      </div>

      {/* Messages */}
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
            <p className="text-sm opacity-80">Redirecting to event list...</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-tvk-dark-card p-8 rounded-lg border border-white/10 space-y-6 shadow-xl"
      >
        {/* Title */}
        <div className="space-y-2">
          <label className="text-gray-300 text-sm font-medium">Event Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            placeholder="e.g. Summer Championship"
          />
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-gold" /> Start Date & Time
            </label>
            <input
              type="datetime-local"
              name="start_date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-gold" /> End Date & Time
            </label>
            <input
              type="datetime-local"
              name="end_date"
              required
              value={formData.end_date}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Description */}
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

        {/* Rules */}
        <div className="space-y-2">
          <label className="text-gray-300 text-sm font-medium">Rules</label>
          <textarea
            name="rules"
            rows={4}
            value={formData.rules}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
          />
        </div>

        {/* Rewards & File Upload Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Reward Points</label>
            <input
              type="number"
              name="reward_points"
              value={formData.reward_points}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <Upload size={16} className="text-gold" /> Update Poster (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-gold hover:file:bg-white/20 transition-all cursor-pointer"
            />
            <p className="text-xs text-gray-500">Leave empty to keep existing image.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Updating...'
            ) : (
              <>
                <Save size={20} /> Update Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
