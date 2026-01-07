import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { ArrowLeft, Save, Loader, Video, Paperclip, X, Upload } from 'lucide-react';
import type { ICategory } from '../../types/content';

const MemberPostEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    type: 'post',
  });

  // Media State
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        setInitialLoading(true);
        // 1. Fetch Categories
        const cats = await contentService.getCategories();
        setCategories(cats);

        // 2. Fetch Post Data
        if (id) {
          const data = await contentService.getById(parseInt(id));
          setFormData({
            title: data.title,
            description: data.description || '',
            category_id: data.category_id.toString(),
            type: data.type,
          });
          if (data.file_url) {
            setCurrentFileUrl(data.file_url);
          }
        }
      } catch (err) {
        setError('Failed to load post data');
      } finally {
        setInitialLoading(false);
      }
    };
    initPage();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setNewFile(selectedFile);

      // Create local preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearNewFile = () => {
    setNewFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!id) return;
      await contentService.update({
        id: parseInt(id),
        ...formData,
        is_premium: true, // Community posts remain premium
        file: newFile, // Send the new file if selected
      });

      // Navigate back to community feed
      navigate('/dashboard/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="animate-spin text-gold mb-4" size={40} />
        <p className="text-gray-500 animate-pulse">Fetching post details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/feed')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Feed
      </button>

      <div className="bg-[#1E1E1E] rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-8 font-zentry tracking-wide text-gold text-center">
          Edit Post
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Post Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-gray-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Media Section: Only show if original post wasn't just text */}
          {formData.type !== 'post' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                Media Content
              </label>

              {/* Show Current File */}
              {currentFileUrl && !newFile && (
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black/40">
                  {formData.type === 'image' ? (
                    <img
                      src={currentFileUrl}
                      alt="Current"
                      className="w-full h-40 object-cover opacity-50"
                    />
                  ) : (
                    <div className="p-6 flex items-center gap-3 text-gray-500">
                      {formData.type === 'video' ? <Video size={24} /> : <Paperclip size={24} />}
                      <span className="text-sm italic">Existing {formData.type} attached</span>
                    </div>
                  )}
                </div>
              )}

              {/* Show New Selection Preview */}
              {newFile && (
                <div className="relative rounded-xl overflow-hidden border border-gold/40 bg-gold/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          className="w-14 h-14 object-cover rounded-lg border border-gold/20"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center text-gold">
                          {formData.type === 'video' ? (
                            <Video size={24} />
                          ) : (
                            <Paperclip size={24} />
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-xs font-bold truncate max-w-[180px]">
                          {newFile.name}
                        </p>
                        <p className="text-[10px] text-gold uppercase tracking-tight">
                          New file ready
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearNewFile}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="w-full bg-black/20 border-2 border-dashed border-white/10 group-hover:border-gold/50 rounded-xl p-8 text-center transition-all">
                  <Upload
                    className="mx-auto text-gray-500 group-hover:text-gold mb-2 transition-colors"
                    size={28}
                  />
                  <p className="text-sm text-gray-400 group-hover:text-gray-200">
                    Click to replace {formData.type}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">Leave empty to keep original</p>
                </div>
              </div>
            </div>
          )}

          {/* Message / Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Message
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none transition-all placeholder:text-gray-700"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-goldDark text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              Update Community Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPostEditPage;
