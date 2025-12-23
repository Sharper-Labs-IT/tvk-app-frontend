import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, Paperclip, Send, X, Loader as LoaderIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { contentService } from '../../services/contentService';
import type { ICategory } from '../../types/content';

const CreatePostWidget: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
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

  // Load categories on mount
  useEffect(() => {
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
  }, []);

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
        is_premium: true, // Assuming member feed posts are premium/internal
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

  // Helper to trigger file input
  const triggerFileInput = (type: 'image' | 'video' | 'file') => {
    if (fileInputRef.current) {
      // Reset accept attribute based on type
      if (type === 'image') fileInputRef.current.accept = 'image/*';
      else if (type === 'video') fileInputRef.current.accept = 'video/*';
      else fileInputRef.current.accept = '*/*';

      fileInputRef.current.click();

      // We store the intended type in a temp way, actual state sets on change
      // But we need to know what button was clicked inside the change handler
      // Logic handled by wrapping the input or passing type to handler.
      // Simplified: We'll set a ref or just strictly set it on change.
      // Better approach: We need separate handlers or pass type to change.
      // Correct Fix: We attached `type` to the closure of `handleFileSelect`.
      fileInputRef.current.onchange = (e: any) => handleFileSelect(e, type);
    }
  };

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
          {/* Title Input (Backend requires it) */}
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
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          {/* Hidden File Input */}
          <input type="file" ref={fileInputRef} className="hidden" />

          <button
            onClick={() => triggerFileInput('image')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition text-sm font-medium"
          >
            <Image size={18} />
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            onClick={() => triggerFileInput('video')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition text-sm font-medium"
          >
            <Video size={18} />
            <span className="hidden sm:inline">Video</span>
          </button>

          <button
            onClick={() => triggerFileInput('file')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-blue-400 transition text-sm font-medium"
          >
            <Paperclip size={18} />
            <span className="hidden sm:inline">File</span>
          </button>

          {/* Category Selector (Small) */}
          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-transparent text-xs text-gray-400 hover:text-gold border-none focus:ring-0 cursor-pointer max-w-[100px]"
          >
            <option value="" disabled>
              Category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-gray-900 text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (!description && !file)}
          className="bg-gold hover:bg-goldDark text-black px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoaderIcon size={16} className="animate-spin" /> : <Send size={16} />}
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePostWidget;
