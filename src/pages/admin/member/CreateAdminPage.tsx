import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminMemberService } from '../../../services/adminMemberService';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'admin' as 'admin' | 'moderator',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminMemberService.createAdmin(formData);
      toast.success(`${formData.role.toUpperCase()} created successfully!`);
      navigate('/admin/members/admins');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to create admin';
      // If validation errors exist, show the first one
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        toast.error(firstError[0]);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to List
      </button>

      <div className="bg-tvk-dark-card border border-white/10 rounded-xl p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="p-3 bg-gold/10 rounded-lg text-gold">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Admin</h1>
            <p className="text-gray-400">Add a new administrator or moderator to the system.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                placeholder="Ex: Dilshan"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Assign Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'admin' | 'moderator' })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="moderator">Moderator (Limited Access)</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
                placeholder="admin@example.com"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Mobile Number</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
                placeholder="0771234567"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none"
                placeholder="Set a strong password"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Save size={20} /> Create Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminPage;
