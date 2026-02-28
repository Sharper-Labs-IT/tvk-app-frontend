import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Eye, 
  Share2, 
  MessageCircle, 
  Clock, 
  ArrowLeft,
  Send,
  Trash2
} from 'lucide-react';
import { 
  getStoryById 
} from '../services/storyService';
import { getStoryImageUrl, refreshStory } from '../utils/storyUtils';
import { 
  toggleLikeStory, 
  addComment, 
  deleteComment,
  incrementViews,
  shareStory 
} from '../services/storyInteractionService';
import type { Story } from '../types/story';
import { useAuth } from '../context/AuthContext';

const StoryView = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      setLoading(true);
      let data = await getStoryById(storyId!);
      
      // 🔍 DEBUG: Check received URLs
      console.log('=== STORY LOADED ===');
      console.log('Story ID:', data.id);
      console.log('Cover Image URL:', data.cover_image_url || data.cover_image);
      if (data.scenes && data.scenes.length > 0) {
        console.log('First Scene Image URL:', data.scenes[0].image_url || data.scenes[0].imageUrl);
        // Check if URL has AWS signature
        const sceneUrl = data.scenes[0].image_url || data.scenes[0].imageUrl;
        if (sceneUrl && sceneUrl.includes('X-Amz-Date')) {
          const match = sceneUrl.match(/X-Amz-Date=(\d{8}T\d{6}Z)/);
          if (match) {
            console.log('🕐 URL Signed Date:', match[1], '(Expected: 20260218 for today)');
          }
        }
      }
      
      // Refresh images if needed (backend must regenerate expired signed URLs)
      data = await refreshStory(data);
      setStory(data);
      setIsLiked(data.liked_by_user || false);
      // Increment view count
      await incrementViews(storyId!);
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('Please login to like stories');
      return;
    }
    try {
      const updated = await toggleLikeStory(storyId!);
      setStory(updated);
      setIsLiked(updated.liked_by_user || false);
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleShare = async () => {
    try {
      await shareStory(storyId!);
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert('Story link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share story:', error);
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const comment = await addComment(storyId!, newComment);
      setStory(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(storyId!, commentId);
      setStory(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      } : null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gold border-t-transparent shadow-[0_0_20px_rgba(230,198,91,0.3)]"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center p-8 bg-tvk-dark-card rounded-2xl border border-white/5 shadow-2xl">
          <h2 className="text-3xl font-zentry text-white mb-4">
            Story not found
          </h2>
          <button
            onClick={() => navigate('/story-studio')}
            className="px-8 py-3 bg-brand-gold text-brand-dark font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(230,198,91,0.4)] transition-all uppercase tracking-wide"
          >
            Back to Story Studio
          </button>
        </div>
      </div>
    );
  }

  const readTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Header */}
      <div className="bg-brand-dark/95 backdrop-blur-lg border-b border-brand-gold/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/story-studio')}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors font-bold uppercase tracking-wide text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stories
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {(() => {
          // Prioritize signed URL from backend over S3 key
          const coverImageUrl = story.cover_image_url || 
                                story.coverImage?.previewUrl || 
                                story.coverImage?.path || 
                                story.cover_image;
          return coverImageUrl ? (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-brand-dark ring-1 ring-white/10">
              <img
                src={getStoryImageUrl(coverImageUrl) || ''}
                alt={story.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          ) : null;
        })()}

        {/* Main Story Card */}
        <div className="bg-tvk-dark-card rounded-2xl shadow-xl p-8 mb-6 border border-white/5">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider">
              {story.genre}
            </span>
            <span className="px-4 py-1.5 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider">
              {story.mood}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-400 font-medium ml-auto">
              <Clock className="w-4 h-4 text-brand-gold" />
              {readTime} min read
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400 font-medium">
              <Eye className="w-4 h-4 text-brand-gold" />
              {story.views}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-zentry text-brand-gold mb-8 leading-tight drop-shadow-md">
            {story.title}
          </h1>

          {/* Author & Character */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-dark font-black text-xl shadow-lg shadow-brand-gold/20">
                {story.character_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-brand-gold/70 uppercase tracking-widest font-bold mb-0.5">Featuring</p>
                <p className="font-bold text-white text-lg">{story.character_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left sm:text-right">
              <div>
                <p className="text-xs text-brand-gold/70 uppercase tracking-widest font-bold mb-0.5">Created by</p>
                <p className="font-bold text-white text-lg">{story.userName}</p>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="prose prose-invert max-w-none mb-10 [&_p]:text-justify">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-gray-300 text-lg leading-relaxed font-light !text-justify">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-white/5">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-bold uppercase tracking-wide text-sm ${
                isLiked
                  ? 'bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(230,198,91,0.3)]'
                  : 'bg-brand-dark text-gray-400 hover:text-brand-gold border border-white/5 hover:border-brand-gold/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {story.likes_count} Likes
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-dark text-gray-400 hover:text-brand-gold border border-white/5 hover:border-brand-gold/30 transition-all font-bold uppercase tracking-wide text-sm"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <div className="flex items-center justify-center gap-2 text-gray-400 sm:ml-auto font-medium py-2 sm:py-0">
              <MessageCircle className="w-5 h-5 text-brand-gold" />
              <span>{story.comments.length} Comments</span>
            </div>
          </div>
        </div>

        {/* Scenes */}
        {((story.scenes_with_urls && story.scenes_with_urls.length > 0) || (story.scenes && story.scenes.length > 0)) && (
          <div className="space-y-8 mb-12">
            <div className="flex items-center gap-4 my-8">
             <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent flex-1" />
             <span className="font-zentry text-2xl text-white uppercase tracking-wider">Scenes</span>
             <div className="h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent flex-1" />
            </div>

            {/* Use scenes_with_urls if available (has full AWS URLs), otherwise use scenes */}
            {(story.scenes_with_urls || story.scenes || []).map((scene, index) => {
              // Support nested image object and legacy fields
              const imageUrl = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
              const sceneNumber = scene.sceneNumber || scene.scene_number;
              
              return (
              <div
                key={scene.id}
                className="bg-tvk-dark-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-gold/30 transition-all duration-300"
              >
                {imageUrl ? (
                  <div className="h-72 relative">
                    <img
                      src={getStoryImageUrl(imageUrl) || ''}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image for scene ${index}:`, getStoryImageUrl(imageUrl));
                        // Show fallback
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-brand-goldDark/20 via-brand-gold/10 to-brand-goldDark/20 flex items-center justify-center">
                            <div class="text-6xl">🎬</div>
                          </div>
                        `;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tvk-dark-card to-transparent" />
                  </div>
                ) : (
                  <div className="h-72 relative bg-gradient-to-br from-brand-goldDark/20 via-brand-gold/10 to-brand-goldDark/20 flex items-center justify-center">
                    <div className="text-6xl">🎬</div>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-zentry text-brand-gold mb-4">
                    Scene {sceneNumber}: {scene.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg font-light text-justify">
                    {scene.content}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-tvk-dark-card rounded-2xl shadow-xl p-8 border border-white/5">
          <h2 className="text-3xl font-zentry text-brand-gold mb-8">
            Comments ({story.comments.length})
          </h2>

          {/* Add Comment */}
          {isLoggedIn ? (
            <div className="mb-10">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this story..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-brand-dark text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none placeholder-gray-600"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-dark font-bold uppercase tracking-wide text-sm rounded-xl hover:shadow-[0_0_15px_rgba(230,198,91,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-brand-dark/50 rounded-xl text-center border border-white/5">
              <p className="text-gray-400">
                Please <button onClick={() => navigate('/login')} className="text-brand-gold font-bold hover:underline">login</button> to comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {story.comments.length > 0 ? (
              story.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-6 bg-brand-dark rounded-xl border border-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tvk-dark-card border border-brand-gold/30 flex items-center justify-center text-brand-gold font-bold">
                        {comment.user_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {comment.user_name}
                        </p>
                        <p className="text-xs text-brand-gold/60 uppercase tracking-widest font-bold">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {user?.id?.toString() === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 ml-13 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 italic">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
