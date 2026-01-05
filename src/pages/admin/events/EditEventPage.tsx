import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  Upload,
  MapPin,
  Star,
  Trophy,
} from 'lucide-react';
import { adminEventService } from '../../../services/adminEventService';
import { type Event } from '../../../types/event'; // Ensure your Event type has the new fields
import Loader from '../../../components/Loader';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Form State (Includes new fields)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    venue_name: '',
    event_type: '',
    start_date: '',
    end_date: '',
    reward_points: '0',
  });

  // 2. Separate State for Boolean & File
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Helper: Format MySQL date "2025-01-20 10:00:00" -> HTML input "2025-01-20T10:00"
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(' ', 'T').substring(0, 16);
  };

  // Helper: Populate form with existing data
  const populateForm = (event: Event | any) => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      rules: event.rules || '',
      venue_name: event.venue_name || '',
      event_type: event.event_type || '',
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
      reward_points: String(event.reward_points || 0),
    });
    // Set boolean state
    setIsFeatured(!!event.is_featured);
  };

  // Load Data on Mount
  useEffect(() => {
    const loadEventData = async () => {
      // Option A: Load from navigation state (Fastest)
      if (location.state?.event) {
        populateForm(location.state.event);
        setInitialLoading(false);
        return;
      }

      // Option B: Fetch from server if direct link accessed
      try {
        const events = await adminEventService.getAllEvents();
        const foundEvent = events.find((e: any) => e.id === Number(id));

        if (foundEvent) {
          populateForm(foundEvent);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadEventData();
  }, [id, location.state]);

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Change with Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

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
    setSuccess('');

    try {
      if (!id) throw new Error('Event ID is missing');

      // Prepare data object
      // The service handles FormData conversion and 'is_featured' 1/0 conversion
      const dataToSubmit = {
        ...formData,
        is_featured: isFeatured,
        media: file,
      };

      await adminEventService.updateEvent(Number(id), dataToSubmit);

      setSuccess('Event updated successfully!');

      // Redirect back to list after short delay
      setTimeout(() => {
        navigate('/admin/events');
      }, 1500);
    } catch (err: any) {
      // MERGE FIX: Used 'thilanka1' logic for better validation feedback
      console.error(err);

      // Error Handling matching Create Page
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]: [string, any]) => `${field.replace('_', ' ')}: ${msgs[0]}`)
          .join(' | ');
        setError(`VALIDATION FAILED: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to update event.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Edit Event</h1>
          <p className="text-gray-400 text-sm">Update event details and settings</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
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
        className="bg-tvk-dark-card p-6 md:p-8 rounded-xl border border-white/10 space-y-8 shadow-xl"
      >
        {/* --- Section 1: Basic Info --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">
            Basic Information
          </h2>

          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Event Title *</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none transition-colors"
            />
          </div>

          {/* Venue & Type */}
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
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Event Type *</label>
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

        {/* --- Section 2: Schedule --- */}
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

        {/* --- Section 3: Content --- */}
        <div className="space-y-6">
          <h2 className="text-xl text-gold font-semibold border-b border-white/10 pb-2">Details</h2>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Rules</label>
            <textarea
              name="rules"
              rows={4}
              value={formData.rules}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none resize-none"
            />
          </div>
        </div>

        {/* --- Section 4: Media & Rewards --- */}
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
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Upload size={16} /> Update Poster (Optional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.pdf"
                onChange={handleFileChange}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Allowed: JPG, PNG, GIF, MP4, PDF. Leave empty to keep existing.
              </p>
            </div>
          </div>
        </div>

        {/* --- Submit --- */}
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