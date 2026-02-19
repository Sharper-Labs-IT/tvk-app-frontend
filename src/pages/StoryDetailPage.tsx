import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import type { Story } from '../types/story';
import { getStoryById } from '../services/storyService';
import { toggleLikeStory, addComment, trackStoryView, copyStoryLink } from '../services/storyInteractionService';
import { refreshStory, formatStoryContent, formatStoryDate, getStoryImageUrl } from '../utils/storyUtils';
import { getErrorMessage } from '../utils/storyErrorHandling';
import StoryReader from '../components/story/StoryReader';

/**
 * Story Detail Page
 * 
 * Displays full story with:
 * - Content and images
 * - Like, comment, share interactions
 * - Author info
 * - View count tracking
 * - Image URL auto-refresh
 */

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactions
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [isReading, setIsReading] = useState(false);
  // Fallback for image loading error
  const [imageError, setImageError] = useState(false);
  
  // Helpers
  const charAt = (str: string | undefined) => (str || '').charAt(0);

  // Fetch story
  useEffect(() => {
    if (!id) {
      navigate('/stories');
      return;
    }
    
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);
        
        let storyData = await getStoryById(id);
        
        // 🔍 DEBUG: Check received URLs
        console.log('=== STORY DETAIL LOADED ===');
        console.log('Story ID:', storyData.id);
        console.log('Cover Image URL:', storyData.cover_image_url || storyData.cover_image);
        if (storyData.scenes && storyData.scenes.length > 0) {
          console.log('First Scene Image URL:', storyData.scenes[0].image_url || storyData.scenes[0].imageUrl);
          // Check if URL has AWS signature
          const sceneUrl = storyData.scenes[0].image_url || storyData.scenes[0].imageUrl;
          if (sceneUrl && sceneUrl.includes('X-Amz-Date')) {
            const match = sceneUrl.match(/X-Amz-Date=(\d{8}T\d{6}Z)/);
            if (match) {
              console.log('🕐 URL Signed Date:', match[1], '(Expected: 20260218 for today)');
            }
          }
        }
        
        // Refresh images if needed (backend must regenerate expired signed URLs)
        storyData = await refreshStory(storyData);
        
        setStory(storyData);
        
        // Track view
        await trackStoryView(id);
        
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStory();
  }, [id, navigate]);
  
  // Handle like
  const handleLike = async () => {
    if (!story || togglingLike) return;
    
    setTogglingLike(true);
    try {
      const updated = await toggleLikeStory(story.id);
      setStory(updated);
    } catch (err: any) {
      console.error('Failed to like story:', err);
    } finally {
      setTogglingLike(false);
    }
  };
  
  // Handle comment
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !commentText.trim() || submittingComment) return;
    
    setSubmittingComment(true);
    try {
      const newComment = await addComment(story.id, commentText.trim());
      setStory({
        ...story,
        comments: [newComment, ...story.comments],
        comments_count: (story.comments_count ?? 0) + 1,
      });
      setCommentText('');
    } catch (err: any) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (!story) return;
    
    try {
      await copyStoryLink(story.id);
      alert('Link copied to clipboard!');
    } catch (err: any) {
      console.error('Failed to share story:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
        <div className="w-16 h-16 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mb-4"></div>
        <div className="text-brand-gold font-zentry tracking-widest text-xl">SUMMONING STORY...</div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
        <h2 className="text-3xl font-zentry text-red-500 mb-4">STORY LOST IN THE VOID</h2>
        <p className="text-gray-400 mb-8">{error || 'We couldn\'t find the story you were looking for.'}</p>
        <button 
          onClick={() => navigate('/stories')}
          className="px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded hover:bg-white transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }
  
  const paragraphs = formatStoryContent(story.content || '');
  
  // Support nested cover image object and legacy fields - PRIORITIZE signed URL from backend
  const coverImageUrl = getStoryImageUrl(
    (story as any).cover_image_url ||           // Signed URL from backend (PRIORITY)
    (story as any).coverImage?.previewUrl || 
    (story as any).coverImage?.path || 
    story.cover_image ||                         // S3 key (fallback)
    (story as any).coverImage
  );
  
  const userName = story.userName || story.user_name || 'Anonymous';
  const userAvatar = story.userAvatar || story.user_avatar;
  const userAvatarUrl = getStoryImageUrl(userAvatar);
  const likesCount = story.likes !== undefined ? story.likes : (story.likes_count || 0);

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/stories')}
          className="mb-8 flex items-center text-gray-400 hover:text-brand-gold transition-colors font-bold uppercase tracking-wide text-sm"
        >
          <span className="mr-2 text-xl">←</span> Back to Stories
        </button>

        {/* Cover Image */}
        {(() => {
          if (coverImageUrl && !imageError) {
            return (
              <div className="relative h-[30rem] rounded-2xl overflow-hidden mb-10 shadow-2xl border border-gray-800 group">
                <img
                  src={coverImageUrl}
                  alt={story.title || 'Story Cover'}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                   <div className="flex flex-wrap gap-3 mb-6">
                    <span className="bg-brand-gold/20 backdrop-blur-md text-brand-gold border border-brand-gold/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                      {story.genre || 'Adventure'}
                    </span>
                    <span className="bg-black/40 backdrop-blur-md text-gray-300 border border-gray-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                      {story.mood || 'Epic'}
                    </span>
                     {story.is_featured && (
                      <span className="bg-brand-gold text-brand-dark px-3 py-1 rounded text-xs font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(230,198,91,0.5)]">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-zentry tracking-wide leading-tight drop-shadow-lg">
                    {story.title || 'Untitled Story'}
                  </h1>
                </div>
              </div>
            );
          } else {
            // Title (if no cover)
            return (
              <div className="mb-12 text-center p-12 bg-tvk-dark-card rounded-2xl border border-white/5 relative overflow-hidden">
                 {/* Dynamic gradient background as fallback */}
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-brand-gold/5 opacity-50" />
                
                 <div className="relative z-10">
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded text-xs font-bold uppercase">{story.genre || 'Story'}</span>
                        <span className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 rounded text-xs font-bold uppercase">{story.mood || 'Epic'}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 font-zentry tracking-wide text-brand-gold drop-shadow-lg">{story.title || 'Untitled Story'}</h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-brand-goldDark to-brand-gold mx-auto rounded-full mb-6" />
                    <p className="text-gray-500 font-serif italic">Cover image unavailable</p>
                 </div>
              </div>
            );
          }
        })()}
        
        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 bg-tvk-dark-card p-6 rounded-xl border border-brand-gold/10 relative overflow-hidden">
             {/* Subtle shine effect */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-brand-gold/5 to-transparent pointer-events-none" />

          {/* Author */}
          <div className="flex items-center gap-3 relative z-10">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={userName}
                className="w-12 h-12 rounded-full border-2 border-brand-gold/20 object-cover" // Ensure object-cover
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                <span className="text-lg font-bold text-brand-gold">{charAt(userName)}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-white text-lg">{userName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatStoryDate(story.created_at)}</span>
                <span>•</span>
                <span>{story.estimated_read_time || 5} min read</span>
              </div>
            </div>
          </div>
          
           {/* Stats */}
           <div className="flex gap-4 text-gray-400">
             <div className="flex items-center gap-2">
                 <span>👁️</span> <span className="font-bold text-white">{story.views || 0}</span>
             </div>
              <div className="flex items-center gap-2">
                 <span>🔗</span> <span className="font-bold text-white">{story.shares || 0}</span>
             </div>
           </div>
        </div>
        
        {/* Read Mode Button */}
        <div className="flex justify-center mb-12">
            <button
                onClick={() => setIsReading(true)}
                className="group relative px-10 py-5 bg-gradient-to-r from-brand-gold via-[#FFE587] to-brand-goldDark text-brand-dark font-black text-xl rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(230,198,91,0.3)] hover:shadow-[0_0_50px_rgba(230,198,91,0.6)] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent)]" />
                
                <span className="relative flex items-center gap-3 font-zentry tracking-wider">
                    <span className="text-3xl animate-pulse">📖</span> 
                    ENTER IMMERSIVE READER
                </span>
            </button>
        </div>

        {/* Story Content */}
        <div className="bg-tvk-dark-card rounded-2xl p-8 md:p-12 mb-12 border border-brand-gold/5 shadow-2xl relative overflow-hidden">
           {/* Decorative bg */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Dynamic Content Rendering: By Scenes or Full Content */}
          <div className="prose prose-invert prose-lg max-w-none font-circular-web leading-relaxed relative z-10">
            {(() => {
              return story.scenes && story.scenes.length > 0 ? (
              // Scene-based rendering (Interleaved Text & Images)
              <div className="space-y-12">
                {story.scenes.map((scene: any, index: number) => {
                  // Support nested image object and legacy fields
                  const sceneImageUrl = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
                  const sceneTitle = scene.title || `Scene ${index + 1}`;
                  const _sceneNumber = scene.sceneNumber || scene.scene_number || index + 1; void _sceneNumber;
                  
                  return (
                  <div key={scene.id || index} className="animate-fadeIn">
                    {/* Scene Text */}
                    <div className="mb-8">
                       {scene.content && formatStoryContent(scene.content).map((para: string, idx: number) => (
                        <p key={idx} className={`text-gray-300 mb-6 text-justify ${index === 0 && idx === 0 ? "first-letter:text-5xl first-letter:font-bold first-letter:text-brand-gold first-letter:mr-2 first-letter:float-left" : ""}`}>
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Scene Image */}
                    {sceneImageUrl ? (
                       <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black/40 group hover:border-brand-gold/30 transition-all">
                          <img
                            src={getStoryImageUrl(sceneImageUrl) || ''}
                            alt={sceneTitle}
                            className="w-full h-auto max-h-[600px] object-cover mx-auto"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-48 bg-gradient-to-br from-brand-goldDark/20 via-brand-gold/10 to-brand-goldDark/20"><div class="text-6xl">🎬</div></div>';
                            }}
                          />
                       </div>
                    ) : (
                      <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gradient-to-br from-brand-goldDark/20 via-brand-gold/10 to-brand-goldDark/20 flex items-center justify-center h-48">
                        <div className="text-6xl">🎬</div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            ) : (
              // Fallback: Full content rendering
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-300 mb-6 text-justify first-letter:text-5xl first-letter:font-bold first-letter:text-brand-gold first-letter:mr-2 first-letter:float-left">
                  {paragraph}
                </p>
              ))
            );
          })()}
          </div>
          
          {/* End of Story */}
          
          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-black/40 text-gray-400 border border-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:text-brand-gold hover:border-brand-gold/30 transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Interaction Bar */}
         <div className="flex justify-center gap-4 mb-20">
            <button 
                onClick={handleLike}
                disabled={togglingLike}
                className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
                    story.liked_by_user
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/30'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
            >
                <span>{story.liked_by_user ? '❤️ Liked' : '🤍 Like Story'}</span>
                <span className="text-sm opacity-80 ml-1">({likesCount})</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="px-8 py-4 rounded-full bg-black/50 text-white font-bold text-lg border border-gray-700 hover:bg-gray-800 hover:border-gray-600 flex items-center gap-3 transition-all"
            >
                <span>🔗 Share</span>
            </button>
        </div>
      
      {/* Comments Section */}
      <div className="bg-tvk-dark-card rounded-2xl p-8 border border-brand-gold/10 shadow-xl">
        <h3 className="text-2xl font-bold mb-8 font-zentry text-white">
          COMMENTS ({story.comments_count || (story.comments ? story.comments.length : 0)})
        </h3>
        
        {/* Add Comment */}
        <form onSubmit={handleComment} className="mb-10">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts on this story..."
            rows={3}
            className="w-full px-5 py-4 bg-black/30 border border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold text-white placeholder-gray-500 resize-none transition-all"
          />
          <div className="flex justify-end mt-3">
             <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="px-6 py-2 bg-brand-gold text-brand-dark font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
        
        {/* Comments List */}
        <div className="space-y-6">
          {(story.comments || []).map((comment: any) => {
             const cUserName = comment.user_name || comment.userName || 'Anonymous';
             const cUserAvatar = comment.user_avatar || comment.userAvatar;
             const cUserAvatarUrl = getStoryImageUrl(cUserAvatar);

             return (
            <div key={comment.id || Math.random()} className="flex gap-4">
              {cUserAvatarUrl ? (
                <img
                  src={cUserAvatarUrl}
                  alt={cUserName}
                  className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-700 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700">
                  <span className="text-brand-gold font-bold">{charAt(cUserName)}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="bg-black/20 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{cUserName}</span>
                    <span className="text-xs text-gray-500">
                      {formatStoryDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
            );
          })}
          
          {(!story.comments || story.comments.length === 0) && (
            <div className="text-center py-10 bg-black/20 rounded-xl border border-dashed border-gray-800">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Immersive Reader Modal */}
    {isReading && story && (
      <StoryReader story={story} onClose={() => setIsReading(false)} />
    )}
  </div>
);
};

export default StoryDetailPage;
