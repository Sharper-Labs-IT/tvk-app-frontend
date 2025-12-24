import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentService } from '../../../services/contentService';
import { CONTENT_CATEGORIES } from '../../../constants/categories';
import {
  Upload,
  ArrowLeft,
  CheckCircle,
  Save,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';

const PostEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    type: 'post',
    is_premium: false,
  });

  // Separate state for current file URL (visual preview) and new file (upload)
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  // Load existing data
  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id]);

  const fetchPost = async (postId: number) => {
    try {
      setInitialLoading(true);
      const data = await contentService.getById(postId);

      setFormData({
        title: data.title,
        description: data.description || '',
        category_id: data.category_id.toString(),
        type: data.type,
        is_premium: !!data.is_premium, // Convert to boolean
      });

      if (data.file_url) {
        setCurrentFileUrl(data.file_url);
      }
    } catch (err) {
      setError('Failed to load post details.');
    } finally {
      setInitialLoading(false);
    }
  };

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
      setNewFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!id) throw new Error('Invalid Post ID');

      await contentService.update({
        id: parseInt(id),
        ...formData,
        file: newFile, // This will be null if they didn't pick a new file
      });

      // Redirect back to details page
      navigate(`/admin/posts/${id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update post';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return <div className="p-10 text-center text-white">Loading post data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/posts/${id}`)}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white font-serif">Edit Content</h1>
        </div>
      </div>

      <div className="bg-tvk-dark-card p-8 rounded-xl border border-white/10 shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
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
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <div className="relative">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white appearance-none focus:border-gold outline-none"
                  required
                >
                  <option value="">Select Category...</option>
                  {CONTENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type (Disabled - usually safer not to change type after creation, but allowed if logic permits) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Content Format</label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white appearance-none focus:border-gold outline-none"
                >
                  <option value="post">Text Post</option>
                  <option value="image">Image Post</option>
                  <option value="video">Video Post</option>
                  <option value="file">File Attachment</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          {formData.type !== 'post' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">Media / File</label>

              {/* Show Current File if exists and no new file selected */}
              {currentFileUrl && !newFile && (
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 text-gray-300">
                    {formData.type === 'video' ? (
                      <Video size={20} />
                    ) : formData.type === 'image' ? (
                      <ImageIcon size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                    <span className="text-sm">Current file is uploaded</span>
                  </div>
                  <a
                    href={currentFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold text-sm hover:underline"
                  >
                    View Current
                  </a>
                </div>
              )}

              {/* Upload Box */}
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div
                    className={`p-4 rounded-full mb-3 ${
                      newFile ? 'bg-gold/10 text-gold' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {newFile ? <CheckCircle size={32} /> : <Upload size={32} />}
                  </div>
                  <span className="text-gray-200 font-medium text-lg">
                    {newFile
                      ? newFile.name
                      : currentFileUrl
                      ? 'Click to replace current file'
                      : 'Click to upload file'}
                  </span>
                  <span className="text-gray-500 text-sm mt-2">
                    {newFile ? 'New file selected' : 'Leave empty to keep current file'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-gold outline-none resize-none"
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
              className="flex items-center gap-2 bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold hover:from-tvk-accent-gold hover:to-[#FFC43A] text-black px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditPage;
