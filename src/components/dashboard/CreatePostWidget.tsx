import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Paperclip, Send, X, Loader as LoaderIcon, Lock, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { contentService } from '../../services/contentService';
import type { ICategory } from '../../types/content';

interface CreatePostWidgetProps {
  onPostCreated?: () => void;
  // ✅ New Prop: Controls access just like in PostCard
  isPremiumUser: boolean;
}

const CreatePostWidget: React.FC<CreatePostWidgetProps> = ({ onPostCreated, isPremiumUser }) => {
  const { user } = useAuth();

  // State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [postType, setPostType] = useState<'post' | 'image' | 'video' | 'file'>('post');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories on mount (Only if user is premium to save resources)
  useEffect(() => {
    if (!isPremiumUser) return; // Don't fetch if they can't post

    const loadCats = async () => {
      try {
        const cats = await contentService.getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id.toString());
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCats();
  }, [isPremiumUser]);

  // Handle File Selection
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video' | 'file'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPostType(type);

      // Create preview for images
      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    setPostType('post');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!description.trim() && !file) return;
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend requires a title. If user didn't type one, use first 30 chars of desc or "New Post"
      const finalTitle = title.trim() || description.slice(0, 30) || 'New Community Post';

      await contentService.createMemberPost({
        title: finalTitle,
        description: description,
        category_id: categoryId,
        type: postType,
        is_premium: true, // Member feed posts are premium
        file: file,
      });

      // Reset Form
      setTitle('');
      setDescription('');
      clearFile();
      if (onPostCreated) onPostCreated(); // Refresh parent list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post content');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (type: 'image' | 'video' | 'file') => {
    if (fileInputRef.current) {
      if (type === 'image') fileInputRef.current.accept = 'image/*';
      else if (type === 'video') fileInputRef.current.accept = 'video/*';
      else fileInputRef.current.accept = '*/*';

      fileInputRef.current.click();
      fileInputRef.current.onchange = (e: any) => handleFileSelect(e, type);
    }
  };

  // 🔒 LOCKED STATE: If user is not premium, show Upgrade Banner
  if (!isPremiumUser) {
    return (
      <div className="bg-[#1E1E1E] rounded-xl border border-gold/30 p-8 mb-6 shadow-lg text-center relative overflow-hidden group">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold mb-1 border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <Lock size={24} />
          </div>

          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Share Your Thoughts <Crown size={16} className="text-gold" />
          </h3>

          <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
            Posting content is exclusive to our Premium Members. Upgrade your plan to join the
            conversation and share with the community!
          </p>

          <Link
            to="/membership"
            className="bg-gold hover:bg-goldDark text-black font-bold py-2.5 px-8 rounded-lg transition-all hover:scale-105 shadow-lg shadow-gold/10 flex items-center gap-2"
          >
            <Crown size={18} /> Upgrade to Post
          </Link>
        </div>
      </div>
    );
  }

  // ✅ ACTIVE STATE: If user is premium, show Form
  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-gold/20 p-4 mb-6 shadow-lg">
      <div className="flex gap-4">
        {/* User Avatar */}
        <img
          src={
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=E6C65B&color=000`
          }
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-gold/50 flex-shrink-0"
        />

        {/* Input Area */}
        <div className="flex-1 space-y-3">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title (Optional)"
            className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-gold placeholder-gold/40 focus:outline-none focus:border-gold transition-all"
          />

          {/* Description Input */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            rows={2}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder-gray-500 resize-none"
          />

          {/* File Preview */}
          {file && (
            <div className="relative inline-block mt-2">
              <div className="bg-white/5 rounded-lg p-2 border border-white/10 flex items-center gap-3 pr-8">
                {postType === 'image' && filePreview ? (
                  <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                ) : (
                  <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center text-gold">
                    {postType === 'video' ? <Video size={20} /> : <Paperclip size={20} />}
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-white truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500 uppercase">{postType}</p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>

      <hr className="border-white/5 my-3" />

      {/* Action Buttons */}
<div className="flex flex-col min-[430px]:flex-row min-[430px]:items-center justify-between gap-4 min-[430px]:gap-0">
  {/* Left: Icons + Category – always stay in one row, never wrap */}
  <div className="flex items-center gap-3 flex-nowrap overflow-hidden">
    {/* Hidden File Input */}
    <input type="file" ref={fileInputRef} className="hidden" />

    {/* Compact icon-only buttons */}
    <button
      onClick={() => triggerFileInput('image')}
      className="p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition-shrink"
      title="Photo"
    >
      <Image size={19} />
    </button>

    <button
      onClick={() => triggerFileInput('video')}
      className="p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-shrink"
      title="Video"
    >
      <Video size={19} />
    </button>

    <button
      onClick={() => triggerFileInput('file')}
      className="p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-blue-400 transition-shrink"
      title="File"
    >
      <Paperclip size={19} />
    </button>

    {/* Thin divider */}
    <div className="h-6 w-[1px] bg-white/10 mx-2" />

    {/* Category – truncates long names, takes available space */}
    <select
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      className="bg-white/5 px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-gold focus:outline-none cursor-pointer truncate min-w-0 flex-1 max-w-[160px]"
    >
      <option value="" disabled>Category</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id} className="bg-gray-900 text-white">
          {cat.name}
        </option>
      ))}
    </select>
  </div>

  {/* Post Button – full width on small screens, normal on larger */}
  <button
    onClick={handleSubmit}
    disabled={loading || (!description && !file)}
    className="bg-gold hover:bg-goldDark text-black px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed w-full min-[430px]:w-auto"
  >
    {loading ? <LoaderIcon size={17} className="animate-spin" /> : <Send size={17} />}
    Post
  </button>
</div>
    </div>
  );
};

export default CreatePostWidget;
