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
  getStoryById, 
  toggleLikeStory, 
  addComment, 
  deleteComment,
  incrementViews,
  shareStory 
} from '../services/storyService';
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
      const data = await getStoryById(storyId!);
      setStory(data);
      setIsLiked(data.likedBy.includes(user?.id?.toString() || ''));
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
      setIsLiked(updated.likedBy.includes(user?.id?.toString() || ''));
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
        comments: prev.comments.filter(c => c._id !== commentId)
      } : null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Story not found
          </h2>
          <button
            onClick={() => navigate('/story-studio')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
          >
            Back to Story Studio
          </button>
        </div>
      </div>
    );
  }

  const readTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-purple-200 dark:border-purple-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/story-studio')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stories
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {story.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Main Story Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
              {story.genre}
            </span>
            <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-semibold">
              {story.mood}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              {story.views}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {story.title}
          </h1>

          {/* Author & Character */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {story.characterName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featuring</p>
                <p className="font-bold text-gray-900 dark:text-white">{story.characterName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Created by</p>
              <p className="font-semibold text-gray-900 dark:text-white">{story.userName}</p>
            </div>
          </div>

          {/* Story Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
                isLiked
                  ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-pink-100 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {story.likes} Likes
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{story.comments.length} Comments</span>
            </div>
          </div>
        </div>

        {/* Scenes */}
        {story.scenes && story.scenes.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Story Scenes</h2>
            {story.scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {scene.imageUrl && (
                  <div className="h-64">
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Scene {scene.sceneNumber}: {scene.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {scene.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({story.comments.length})
          </h2>

          {/* Add Comment */}
          {isLoggedIn ? (
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this story..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Please <button onClick={() => navigate('/login')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">login</button> to comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {story.comments.length > 0 ? (
              story.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {user?.id?.toString() === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 ml-13">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
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
