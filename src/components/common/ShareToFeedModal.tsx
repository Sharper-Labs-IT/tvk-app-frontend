import React, { useState, useEffect } from 'react';
import { X, Send, Loader as LoaderIcon } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { toast } from 'react-hot-toast';
import { getFullImageUrl } from '../../utils/imageUrl';

interface ShareToFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  storyContent?: string;
  defaultTitle?: string;
}

const ShareToFeedModal: React.FC<ShareToFeedModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  storyContent,
  defaultTitle = 'My new AI creation!'
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(storyContent || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setDescription(storyContent || '');
      loadCategories();
    }
  }, [isOpen, defaultTitle, storyContent]);

  const loadCategories = async () => {
    try {
      setFetchingCategories(true);
      const cats = await contentService.getCategories();
      setCategories(cats);
      if (cats && cats.length > 0) {
        // Try to find a relevant category, or default to first
        const feedCat = cats.find(c => c.name.toLowerCase().includes('feed') || c.name.toLowerCase().includes('general') || c.name.toLowerCase().includes('ai'));
        if (feedCat) {
          setCategoryId(feedCat.id.toString());
        } else {
          setCategoryId(cats[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load categories', error);
      toast.error('Failed to load categories');
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    try {
      let filePathToSend = '';
      let postType: 'post' | 'image' | 'video' | 'file' = 'post';

      if (imageUrl) {
        // Instead of downloading and sending file again, just trigger via file_path
        try {
          const urlObj = new URL(imageUrl);
          filePathToSend = urlObj.pathname.replace(/^\/+/, '');
        } catch (_err) {
          filePathToSend = imageUrl;
        }
        postType = 'image';
      }

      await contentService.createMemberPost({
        title: title || 'New AI Creation',
        description: description,
        category_id: categoryId,
        type: postType,
        is_premium: true,
        file: null, // no need to append file if backend accepts URL
        file_path: filePathToSend || undefined,
      });

      toast.success('Successfully shared to Community Feed!');
      onClose();
    } catch (error: any) {
      console.error('Failed to post', error);
      toast.error(error.response?.data?.message || 'Failed to share to feed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#1E1E1E] border border-gold/30 w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-auto mt-auto sm:my-auto flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50 flex-shrink-0"></div>
        
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 flex-shrink-0 rounded-t-2xl">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Share to Feed <Send size={16} className="text-gold" />
          </h3>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          {imageUrl && (
            <div className="flex justify-center mb-2 sm:mb-4">
              <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-32 sm:max-h-48 w-full flex justify-center bg-black/40 p-2">
                <img src={getFullImageUrl(imageUrl)} alt="Preview" className="object-contain h-full max-w-full" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Look at my new AI selfie!"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={fetchingCategories}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              {fetchingCategories ? (
                <option value="">Loading categories...</option>
              ) : (
                <>
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-gray-900">
                      {cat.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="pt-2 sm:pt-4 flex gap-3 flex-shrink-0 mt-auto">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !categoryId || !title.trim()}
              className="flex-1 bg-gold hover:bg-goldDark text-black py-2 sm:py-2.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10 text-sm sm:text-base"
            >
              {loading ? (
                <><LoaderIcon size={16} className="animate-spin" /> Sharing...</>
              ) : (
                <><Send size={16} /> Share Now</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareToFeedModal;