import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api'; // Ensure we can make API calls
import type { IContent, ReactionType } from '../../types/content';
import { interactionService } from '../../services/interactionService';
import CommentSection from './CommentSection';

import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  ShieldCheck,
  Download,
  FileText,
  Lock,
  Crown,
  ThumbsUp,
  Heart,
  Flame,
  Star,
  User as UserIcon,
} from 'lucide-react';

// Custom Clap Icon
const ClapIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.9 20.6c1.1.8 2.5.5 3.3-.6l2.9-3.9 1-1.3c.7-1 .8-2.3.1-3.3-.6-1-1.9-1.3-2.9-.5l-1.3.9-1.3 1 2.3-3.2c.7-1 .6-2.4-.4-3.1-.9-.8-2.3-.6-3.1.3l-2.6 3.7-.6.9c-.8 1.1-2.3 1.3-3.4.5-1.1-.8-1.3-2.3-.5-3.4l.9-1.3 2-2.9c.7-1 .5-2.5-.5-3.2-1-.8-2.4-.6-3.2.5l-3 4.3C-1 8.5.6 13.9 3.2 16.5l3.4 3.4c2.8 2.8 7.3 2.7 8.3 2l-4-1.3z" />
  </svg>
);

interface PostCardProps {
  post: IContent;
  isPremiumUser: boolean;
}

interface AuthorProfile {
  id: number;
  name: string;
  avatar_url?: string;
  role?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, isPremiumUser }) => {
  // --- STATE ---
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(post.user_reaction || null);
  const [reactionCount, setReactionCount] = useState(post.reactions_count || 0);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);

  // Reaction Dock State
  const [showReactionDock, setShowReactionDock] = useState(false);
  const longPressTimer = useRef<any>(null);
  const isLongPress = useRef(false);

  const isLocked = Boolean(post.is_premium) && !isPremiumUser;

  // --- 1. FETCH AUTHOR DATA ---
  useEffect(() => {
    const fetchAuthor = async () => {
      // If the backend already provided user object, use it (future proofing)
      if ((post as any).user) {
        setAuthor((post as any).user);
        return;
      }

      // Otherwise, fetch user details by ID
      if (post.created_by) {
        try {
          // Using the route: Route::get('auth/user/{id}', ...)
          const response = await api.get(`/v1/auth/user/${post.created_by}`);
          if (response.data) {
            // Adapt response based on your API structure (assuming response.data or response.data.user)
            const userData = response.data.user || response.data;
            setAuthor(userData);
          }
        } catch (error) {
          console.error('Failed to fetch author info', error);
          setAuthor({ id: post.created_by, name: 'Unknown Member' });
        }
      }
    };

    fetchAuthor();
  }, [post.created_by, post]);

  // --- 2. REACTION LOGIC (Click vs Long Press) ---

  const handleReactionClick = () => {
    if (isLocked) return;

    // If it was a long press, do nothing (dock is already open)
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }

    // Standard Click: Toggle Like
    executeReaction(userReaction ? userReaction : 'like');
  };

  const startPress = () => {
    if (isLocked) return;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowReactionDock(true); // Open Dock
    }, 500); // 500ms hold to open dock
  };

  const endPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const executeReaction = async (type: ReactionType) => {
    setShowReactionDock(false); // Close dock if open

    // Optimistic Update
    const oldReaction = userReaction;
    const oldCount = reactionCount;

    let newReaction: ReactionType | null = type;
    let newCount = oldCount;

    // Logic: If clicking the SAME reaction, remove it. If different, switch it.
    if (oldReaction === type) {
      newReaction = null; // Toggle off
      newCount = Math.max(0, oldCount - 1);
    } else if (oldReaction === null) {
      newCount = oldCount + 1;
    }
    // (If switching from 'like' to 'heart', count remains same)

    setUserReaction(newReaction);
    setReactionCount(newCount);

    try {
      await interactionService.toggleReaction(post.id, type);
    } catch (error) {
      // Revert on failure
      setUserReaction(oldReaction);
      setReactionCount(oldCount);
    }
  };

  // --- HELPER: Icons ---
  const getReactionIcon = (type: ReactionType | null) => {
    switch (type) {
      case 'heart':
        return <Heart className="text-red-500 fill-red-500" size={20} />;
      case 'fire':
        return <Flame className="text-orange-500 fill-orange-500" size={20} />;
      case 'clap':
        return <ClapIcon className="text-yellow-500 fill-yellow-500" size={20} />;
      case 'star':
        return <Star className="text-yellow-400 fill-yellow-400" size={20} />;
      case 'like':
        return <ThumbsUp className="text-blue-500 fill-blue-500" size={20} />;
      default:
        return <ThumbsUp size={20} />;
    }
  };

  const getReactionLabel = (type: ReactionType | null) => {
    if (!type) return 'Like';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-[#1E1E1E] rounded-xl border mb-6 overflow-visible shadow-md transition-colors relative ${
        isLocked ? 'border-gold/30' : 'border-white/5 hover:border-gold/20'
      }`}
    >
      {/* 1. Header with Real User Data */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10">
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <UserIcon size={20} />
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-1">
              {author ? author.name : 'Loading...'}
              {author?.role === 'admin' && <ShieldCheck size={14} className="text-gold" />}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDate(post.created_at)}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-gold">{post.category.name}</span>
                </>
              )}
              {Boolean(post.is_premium) && (
                <span className="bg-gold/20 text-gold px-1.5 py-0.5 rounded text-[10px] font-bold border border-gold/20 ml-2 flex items-center gap-1">
                  <Crown size={10} /> PREMIUM
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. Body */}
      <div className="px-4 pb-3 relative">
        {post.title && (
          <h3 className="text-white font-bold mb-2 text-lg leading-tight">{post.title}</h3>
        )}
        {post.description && (
          <div className={isLocked ? 'blur-sm select-none opacity-50' : ''}>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {post.description}
            </p>
          </div>
        )}
      </div>

      {/* 3. Media Content */}
      <div className="w-full relative border-y border-white/5 flex justify-center bg-[#111] min-h-[200px]">
        {isLocked ? (
          <div className="w-full py-16 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-gold animate-pulse">
              <Lock size={32} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Premium Content</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Upgrade your plan to unlock access.
            </p>
            <Link
              to="/membership"
              className="bg-gold hover:bg-goldDark text-black font-bold py-2.5 px-6 rounded-lg transition hover:scale-105"
            >
              Upgrade Plan
            </Link>
          </div>
        ) : (
          <>
            {post.type === 'image' && post.file_url && (
              <img
                src={post.file_url}
                alt={post.title}
                className="w-full max-h-[600px] object-cover"
              />
            )}
            {post.type === 'video' && post.file_url && (
              <video controls className="w-full max-h-[600px] bg-black">
                <source src={post.file_url} type="video/mp4" />
              </video>
            )}
            {post.type === 'file' && post.file_url && (
              <div className="w-full p-8 flex flex-col items-center justify-center bg-[#252525]">
                <FileText size={32} className="text-gold mb-3" />
                <a
                  href={post.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Download size={18} /> Download File
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Counts Row */}
      {!isLocked && (
        <div className="px-4 py-2 flex justify-between text-xs text-gray-400 border-b border-white/5">
          <div className="flex items-center gap-1">
            {reactionCount > 0 && (
              <div className="bg-blue-500 rounded-full p-0.5">
                <ThumbsUp size={10} className="text-white" />
              </div>
            )}
            <span>{reactionCount} reactions</span>
          </div>
          <div className="flex gap-3">
            <span>{commentCount} comments</span>
          </div>
        </div>
      )}

      {/* 5. Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-between text-gray-400 relative">
        {/* REACTION BUTTON CONTAINER */}
        <div className="flex-1 relative">
          {/* The Floating Emoji Dock (Appears on Long Press or Manual State) */}
          {showReactionDock && !isLocked && (
            <div className="absolute bottom-full left-0 mb-2 flex bg-[#2A2A2A] border border-white/10 rounded-full p-1 gap-1 shadow-xl animate-in fade-in zoom-in duration-200 z-50">
              {(['like', 'heart', 'fire', 'clap', 'star'] as ReactionType[]).map((type) => (
                <button
                  key={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    executeReaction(type);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition transform hover:scale-125 focus:outline-none"
                  title={type}
                >
                  {type === 'like' && (
                    <ThumbsUp className="text-blue-500 fill-blue-500" size={24} />
                  )}
                  {type === 'heart' && <Heart className="text-red-500 fill-red-500" size={24} />}
                  {type === 'fire' && (
                    <Flame className="text-orange-500 fill-orange-500" size={24} />
                  )}
                  {type === 'clap' && (
                    <ClapIcon className="text-yellow-500 fill-yellow-500" size={24} />
                  )}
                  {type === 'star' && (
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main Like Button (Touch & Click Handlers) */}
          <button
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            onClick={handleReactionClick}
            disabled={isLocked}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
              userReaction ? getColorForReaction(userReaction) + ' font-medium' : ''
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {getReactionIcon(userReaction)}
            <span>{getReactionLabel(userReaction)}</span>
          </button>
        </div>

        <button
          onClick={() => !isLocked && setShowComments(!showComments)}
          disabled={isLocked}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-gold'
          }`}
        >
          <MessageCircle size={20} />
          Comment
        </button>

        <button
          disabled={isLocked}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'
          }`}
        >
          <Share2 size={20} />
          Share
        </button>
      </div>

      {/* 6. Comment Section */}
      {showComments && !isLocked && (
        <CommentSection
          contentId={post.id}
          initialCount={commentCount}
          onCommentAdded={() => setCommentCount((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

// Helper for text colors
function getColorForReaction(type: ReactionType) {
  if (type === 'heart') return 'text-red-500';
  if (type === 'fire') return 'text-orange-500';
  if (type === 'clap' || type === 'star') return 'text-yellow-500';
  return 'text-blue-500';
}

export default PostCard;
