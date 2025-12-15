import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../../../services/contentService';
import { CONTENT_CATEGORIES } from '../../../constants/categories';
import { Upload, ArrowLeft, CheckCircle } from 'lucide-react';

const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    type: 'post', // default
    is_premium: false,
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_premium: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Basic validation
      if (!formData.category_id) throw new Error('Please select a category');
      if (formData.type !== 'post' && !file)
        throw new Error('A file is required for this post type');

      await contentService.create({
        ...formData,
        file: file,
      });

      // Redirect on success
      navigate('/admin/posts');
    } catch (err: any) {
      // Handle axios error response or generic error
      const msg = err.response?.data?.message || err.message || 'Failed to create post';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white font-serif">Create New Content</h1>
        </div>
      </div>

      <div className="bg-tvk-dark-card p-8 rounded-xl border border-white/10 shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2 uppercase tracking-wide">
              Post Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
              placeholder="e.g. Weekly Updates from the Team"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <div className="relative">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white appearance-none focus:border-gold outline-none cursor-pointer"
                  required
                >
                  <option value="" className="text-gray-500">
                    Select Category...
                  </option>
                  {CONTENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Content Format</label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white appearance-none focus:border-gold outline-none cursor-pointer"
                >
                  <option value="post">Text Post (No File)</option>
                  <option value="image">Image Post</option>
                  <option value="video">Video Post</option>
                  <option value="file">File Attachment</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          {formData.type !== 'post' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Media Upload</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group">
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept={
                    formData.type === 'image'
                      ? 'image/*'
                      : formData.type === 'video'
                      ? 'video/*'
                      : '*/*'
                  }
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div
                    className={`p-4 rounded-full mb-3 ${
                      file
                        ? 'bg-gold/10 text-gold'
                        : 'bg-white/5 text-gray-500 group-hover:text-gold transition-colors'
                    }`}
                  >
                    {file ? <CheckCircle size={32} /> : <Upload size={32} />}
                  </div>
                  <span className="text-gray-200 font-medium text-lg">
                    {file ? file.name : `Click to upload ${formData.type}`}
                  </span>
                  <span className="text-gray-500 text-sm mt-2">
                    {file ? 'File selected (Click to change)' : 'Max file size: 100MB'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description / Caption
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-gold outline-none resize-none"
              placeholder="Write something about this post..."
            />
          </div>

          {/* Premium Toggle */}
          <div className="bg-tvk-dark-DEFAULT p-4 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <span className="block text-white font-medium">Premium Content</span>
              <span className="text-sm text-gray-500">Only visible to paid members</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold hover:from-tvk-accent-gold hover:to-[#FFC43A] text-black px-10 py-3 rounded-lg font-bold shadow-lg shadow-gold/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Publishing...' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreatePage;
