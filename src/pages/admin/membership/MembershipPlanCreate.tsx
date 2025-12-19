import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import api from '../../../utils/api';

const MembershipPlanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stripe_price_id: '', // New Field
    duration_days: '30',
  });

  const [benefitInput, setBenefitInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stripe_price_id: formData.stripe_price_id, // Sending the ID
        duration_days: parseInt(formData.duration_days),
        benefits: benefits,
      };

      await api.post('/v1/membership/plans', payload);

      navigate('/admin/membership');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(JSON.stringify(err.response.data.errors));
      } else if (err.response && err.response.status === 404) {
        setError('API Endpoint not found (404). Check URL.');
      } else {
        setError(err.response?.data?.message || 'Failed to create plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/membership')}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Create New Plan</h1>
          <p className="text-gray-400 text-sm">Set up a new subscription tier for your users.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-tvk-dark-card border border-white/10 rounded-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm flex gap-2">
              <AlertCircle size={20} className="shrink-0" />
              <span className="break-all">{error}</span>
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Gold Membership"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          {/* Price, Stripe ID & Duration Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD $)</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="15.00"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                name="duration_days"
                required
                value={formData.duration_days}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>

            {/* Stripe Price ID - Full Width on Mobile, Half on Desktop */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <CreditCard size={16} className="text-gold" />
                Stripe Price ID
              </label>
              <input
                type="text"
                name="stripe_price_id"
                required
                value={formData.stripe_price_id}
                onChange={handleChange}
                placeholder="price_1Pxyz..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this ID from your Stripe Dashboard (Product Catalog).
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe what this plan offers..."
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          {/* Dynamic Benefits Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plan Benefits</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                placeholder="Add a benefit (e.g. Free shipping)"
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold transition-all"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-black/30 px-3 py-2 rounded border border-white/5"
                >
                  <span className="text-sm text-gray-300">{benefit}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-white text-black font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-gold/20 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Membership Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipPlanCreate;
