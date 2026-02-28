import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Share2, MessageCircle, Clock, Trash2, Edit } from 'lucide-react';
import type { Story } from '../../types/story';
import { deleteStory } from '../../services/storyService';
import { toggleLikeStory, shareStory } from '../../services/storyInteractionService';
import { useAuth } from '../../context/AuthContext';
import { getStoryImageUrl } from '../../utils/storyUtils';

interface StoryCardProps {
  story: Story;
  onUpdate?: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  adventure: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
  action: 'bg-red-900/30 text-red-400 border-red-500/30',
  romance: 'bg-pink-900/30 text-pink-400 border-pink-500/30',
  'sci-fi': 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  fantasy: 'bg-purple-900/30 text-purple-400 border-purple-500/30',
  mystery: 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30',
  horror: 'bg-gray-900/30 text-gray-400 border-gray-500/30',
  comedy: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
  drama: 'bg-orange-900/30 text-orange-400 border-orange-500/30',
};

const StoryCard = ({ story, onUpdate }: StoryCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Safe access to likes using either backend field 'likes' or frontend alias 'likes_count'
  const initialLikes = story.likes !== undefined ? story.likes : (story.likes_count || 0);
  const [isLiked, setIsLiked] = useState(story.liked_by_user || false);
  const [likes, setLikes] = useState(initialLikes);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOwner = user?.id?.toString() === story.user_id?.toString();

  // Author Details
  const authorName = story.userName || story.user_name || 'Anonymous';
  const authorAvatar = story.userAvatar || story.user_avatar;
  const authorAvatarUrl = getStoryImageUrl(authorAvatar);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await toggleLikeStory(story.id);
      setIsLiked(updated.liked_by_user || false);
      // Support both return formats
      setLikes(updated.likes !== undefined ? updated.likes : (updated.likes_count || 0));
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await shareStory(story.id);
      // Copy link to clipboard
      const url = `${window.location.origin}/story/${story.id}`;
      await navigator.clipboard.writeText(url);
      alert('Story link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share story:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStory(story.id);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  const readTime = Math.ceil(story.content.split(' ').length / 200);
  // Support nested cover image object and legacy fields - PRIORITIZE signed URL
  const coverImageUrl = getStoryImageUrl(
    (story as any).cover_image_url ||           // Signed URL from backend (PRIORITY)
    (story as any).coverImage?.previewUrl || 
    (story as any).coverImage?.path || 
    story.cover_image || 
    (story as any).coverImage
  );

  return (
    <div
      onClick={() => navigate(`/ai-studio/stories/${story.id}`)}
      className="group bg-tvk-dark-card border border-white/5 rounded-2xl hover:border-brand-gold/50 shadow-lg hover:shadow-[0_0_30px_rgba(230,198,91,0.2)] transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02]"
    >
      {/* Cover Image */}
      {coverImageUrl && !imageError ? (
        <div className="relative h-48 bg-gradient-to-br from-brand-goldDark/20 to-brand-gold/20">
          <img
            src={coverImageUrl}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {story.is_featured && (
            <div className="absolute top-3 right-3 px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-goldDark rounded-full text-xs font-bold text-brand-dark shadow-lg">
              ⭐ Featured
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-brand-goldDark/30 via-brand-gold/20 to-brand-goldDark/30 flex items-center justify-center">
          <div className="text-6xl drop-shadow-[0_0_10px_rgba(230,198,91,0.5)]">📖</div>
          {story.is_featured && (
            <div className="absolute top-3 right-3 px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-goldDark rounded-full text-xs font-bold text-brand-dark shadow-lg">
              ⭐ Featured
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Genre Badge */}
        <div className="mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${GENRE_COLORS[story.genre || 'adventure'] || GENRE_COLORS['adventure']}`}>
             {/* Robustly handle missing genre */}
            {(story.genre || 'Adventure').charAt(0).toUpperCase() + (story.genre || 'Adventure').slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors font-zentry tracking-wide">
          {story.title || 'Untitled Story'}
        </h3>

        {/* Author & Character */}
        <div className="flex items-center justify-between mb-3">
            {/* Author */}
            <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 overflow-hidden">
                    {authorAvatarUrl ? (
                        <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-gold font-bold">
                            {(authorName).charAt(0)}
                        </div>
                    )}
                 </div>
                 <span className="text-xs text-gray-400 truncate max-w-[100px]">{authorName}</span>
            </div>

             {/* Character */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                <span className="text-[10px] uppercase text-gray-500 font-bold">Starring</span>
                <span className="text-xs text-brand-gold font-medium truncate max-w-[80px]">
                    {story.character_name || story.characterName || 'Hero'}
                </span>
            </div>
        </div>

        {/* Excerpt */}
        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {(story.content || '').substring(0, 150)}...
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readTime} min read
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {story.views}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {story.comments ? story.comments.length : (story.comments_count || 0)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-brand-gold/10 hover:text-brand-gold hover:border-brand-gold/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-blue-900/20 hover:text-blue-400 hover:border-blue-500/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/story-studio/edit/${story.id}`);
                }}
                className="p-2 rounded-lg bg-blue-900/30 text-blue-400 border border-blue-500/30 hover:bg-blue-900/50 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-2 rounded-lg bg-red-900/30 text-red-400 border border-red-500/30 hover:bg-red-900/50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-2xl font-bold text-white mb-4">
              Delete Story?
            </h3>
            <p className="text-gray-400 mb-6 text-lg">
              Are you sure you want to delete "{story.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 border border-gray-700 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCard;
