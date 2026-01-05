import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, MapPin, Trophy, Star, AlertCircle } from 'lucide-react';
import { adminEventService } from '../../../services/adminEventService';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. INITIALIZE STATE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    venue_name: '',
    event_type: '', // This will now match 'live', 'online', or 'fan_meetup'
    start_date: '',
    end_date: '',
    reward_points: '0',
  });

  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 2. HANDLE INPUT CHANGES
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Optional: Check file type against backend rules (jpg, png, mp4, etc.)
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'application/pdf',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        alert('Invalid File Type! Backend allows: JPG, PNG, GIF, MP4, MOV, AVI, PDF.');
        e.target.value = '';
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminEventService.createEvent({
        ...formData,
        is_featured: isFeatured,
        media: file,
      });
      navigate('/admin/events');
    } catch (err: any) {
      console.error('Submission Error:', err);

      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]: [string, any]) => `${field.replace('_', ' ')}: ${msgs[0]}`)
          .join(' | ');
        setError(`VALIDATION FAILED: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create event. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Create New Event</h1>
          <p className="text-gray-400 text-sm">Fill in the details below to publish a new event.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-tvk-dark-card p-6 md:p-8 rounded-xl border border-white/10 space-y-8 shadow-xl"
      >
        {/* --- Basic Info --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">
            Basic Information
          </h2>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Event Title *</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none transition-colors"
              placeholder="e.g. Grand Fan Meetup"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <MapPin size={16} /> Venue Name *
              </label>
              <input
                name="venue_name"
                required
                value={formData.venue_name}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                placeholder="e.g. Colombo Town Hall"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Event Type *</label>

              {/* ✅ FIX: Dropdown uses strictly allowed values: live, online, fan_meetup */}
              <select
                name="event_type"
                required
                value={formData.event_type}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none transition-colors appearance-none"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="live">Live Event</option>
                <option value="online">Online Event</option>
                <option value="fan_meetup">Fan Meetup</option>
              </select>
            </div>
          </div>

          {/* Featured Toggle */}
          <div
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              isFeatured ? 'bg-gold/10 border-gold' : 'bg-white/5 border-white/10'
            }`}
            onClick={() => setIsFeatured(!isFeatured)}
          >
            <div
              className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                isFeatured ? 'bg-gold border-gold' : 'border-gray-500'
              }`}
            >
              {isFeatured && <Star size={14} className="text-black fill-black" />}
            </div>
            <div>
              <span className="text-white font-medium">Feature this Event</span>
              <p className="text-xs text-gray-400">
                Featured events appear on the home page slider.
              </p>
            </div>
          </div>
        </div>

        {/* --- Schedule --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">
            Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} /> Start Date & Time *
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
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} /> End Date & Time *
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
        </div>

        {/* --- Details --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">Details</h2>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Rules / Guidelines</label>
            <textarea
              name="rules"
              rows={4}
              value={formData.rules}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none resize-none"
            />
          </div>
        </div>

        {/* --- Media & Rewards --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">
            Media & Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Trophy size={16} /> Reward Points
              </label>
              <input
                type="number"
                name="reward_points"
                value={formData.reward_points}
                onChange={handleChange}
                min="0"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Upload size={16} /> Event Poster
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.pdf"
                  className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Allowed: JPG, PNG, GIF, MP4, PDF (Max 50MB)
              </p>
            </div>
          </div>
        </div>

        {/* --- Actions --- */}
        <div className="flex justify-end pt-6 border-t border-white/10 gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
