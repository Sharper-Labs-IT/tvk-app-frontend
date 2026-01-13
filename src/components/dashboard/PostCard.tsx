import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import type { IContent, ReactionType, IComment } from '../../types/content';
import { interactionService } from '../../services/interactionService';
import { contentService } from '../../services/contentService';
import { useAuth } from '../../context/AuthContext';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';
import ShareModal from './ShareModal';
import { linkifyText } from '../../utils/linkify';

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
  Edit2,
  Trash2,
} from 'lucide-react';

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
  onPostDeleted?: () => void;
}

interface AuthorProfile {
  id: number;
  name: string;
  nickname?: string;
  avatar_url?: string;
  role?: string;
  roles?: any[];
}

const PostCard: React.FC<PostCardProps> = ({ post, isPremiumUser, onPostDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(post.user_reaction || null);
  const [reactionCount, setReactionCount] = useState(post.reactions_count || 0);
  const [commentCount, setCommentCount] = useState(post.comments_count ?? 0); // ✅ TS FIX: Added null check
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [showReactionDock, setShowReactionDock] = useState(false);
  const longPressTimer = useRef<any>(null);
  const isLongPress = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLocked = Boolean(post.is_premium) && !isPremiumUser;

  // --- RECURSIVE COUNTER FOR SYNC ---
  const calculateTotalCount = (commentList: IComment[]): number => {
    let total = 0;
    commentList.forEach((c) => {
      total += 1;
      if (c.replies && c.replies.length > 0) {
        total += calculateTotalCount(c.replies);
      }
    });
    return total;
  };

  // ✅ SILENT SYNC ON MOUNT: Corrects the count to include replies before opening
  useEffect(() => {
    const syncRealCommentCount = async () => {
      if (isLocked) return;
      try {
        const data = await interactionService.getComments(post.id);
        const commentsArray = Array.isArray(data) ? data : data.data || [];
        const realTotal = calculateTotalCount(commentsArray);
        setCommentCount(realTotal);
      } catch (error) {
        console.error('Failed to sync comment count', error);
      }
    };

    // Run if there is at least 1 comment (including potentially hidden replies)
    if ((post.comments_count ?? 0) > 0) {
      syncRealCommentCount();
    }
  }, [post.id, isLocked]);

  const getUserRole = () => {
    const roles = (user as any)?.roles;
    if (Array.isArray(roles) && roles.length > 0) {
      const firstRole = roles[0];
      return typeof firstRole === 'object' ? firstRole.name : firstRole;
    }
    return (user as any)?.role || '';
  };

  const userRoleName = getUserRole();
  const isAdmin = userRoleName === 'admin';
  const isOwner = user?.id === post.created_by;
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAuthor = async () => {
      if ((post as any).user) {
        setAuthor((post as any).user);
        return;
      }
      if (post.created_by) {
        try {
          const response = await api.get(`/v1/auth/user/${post.created_by}`);
          if (response.data) {
            const userData = response.data.user || response.data;
            setAuthor(userData);
          }
        } catch (error) {
          setAuthor({ id: post.created_by, name: 'Unknown Member' });
        }
      }
    };
    fetchAuthor();
  }, [post.created_by, post]);

  const handleReactionClick = () => {
    if (isLocked) return;
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    executeReaction(userReaction ? userReaction : 'like');
  };

  const startPress = () => {
    if (isLocked) return;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowReactionDock(true);
    }, 500);
  };

  const endPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const executeReaction = async (type: ReactionType) => {
    setShowReactionDock(false);
    const oldReaction = userReaction;
    const oldCount = reactionCount;
    let newReaction: ReactionType | null = type;
    let newCount = oldCount;

    if (oldReaction === type) {
      newReaction = null;
      newCount = Math.max(0, oldCount - 1);
    } else if (oldReaction === null) {
      newCount = oldCount + 1;
    }

    setUserReaction(newReaction);
    setReactionCount(newCount);

    try {
      await interactionService.toggleReaction(post.id, type);
    } catch (error) {
      setUserReaction(oldReaction);
      setReactionCount(oldCount);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await contentService.delete(post.id);
      setShowDeleteModal(false);
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

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
    <>
      <div
        className={`bg-[#1E1E1E] rounded-xl border mb-6 overflow-visible shadow-md transition-colors relative ${
          isLocked ? 'border-gold/30' : 'border-white/5 hover:border-gold/20'
        }`}
      >
        {/* 1. Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
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
                {author ? (author.nickname || author.name) : 'Loading...'}
                {(author?.role === 'admin' ||
                  (author?.roles && author.roles[0]?.name === 'admin')) && (
                  <ShieldCheck size={14} className="text-gold" />
                )}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(post.created_at)}</span>
                {post.category && <span className="text-gold"> • {post.category.name}</span>}
                {Boolean(post.is_premium) && (
                  <span className="bg-gold/20 text-gold px-1.5 py-0.5 rounded text-[10px] font-bold border border-gold/20 ml-2 flex items-center gap-1">
                    <Crown size={10} /> PREMIUM
                  </span>
                )}
              </div>
            </div>
          </div>

          {canManage && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden py-1">
                  <button
                    onClick={() => navigate(`/dashboard/posts/edit/${post.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <Edit2 size={16} className="text-gold" /> Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={16} /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Body */}
        <div className="px-4 pb-3 relative">
          {post.title && (
            <h3 className="text-white font-bold mb-2 text-lg leading-tight">{post.title}</h3>
          )}
          {post.description && (
            <div className={isLocked ? 'blur-sm select-none opacity-50' : ''}>
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {linkifyText(post.description)}
              </p>
            </div>
          )}
        </div>

        {/* 3. Media Content */}
        <div className="w-full relative border-y border-white/5 flex justify-center bg-[#111] min-h-[200px]">
          {isLocked ? (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center px-4">
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
                    className="bg-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition hover:scale-105"
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
            {/* ✅ FIXED: Recursive count is now displayed here */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline hover:text-white transition-colors"
            >
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </button>
          </div>
        )}

        {/* 5. Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-between text-gray-400 relative">
          <div className="flex-1 relative">
            {showReactionDock && !isLocked && (
              <div className="absolute bottom-full left-0 mb-2 flex bg-[#2A2A2A] border border-white/10 rounded-full p-1 gap-1 shadow-xl z-50">
                {(['like', 'heart', 'fire', 'clap', 'star'] as ReactionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeReaction(type);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition transform hover:scale-125 focus:outline-none"
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
            <button
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onClick={handleReactionClick}
              disabled={isLocked}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
                userReaction ? 'text-gold font-medium' : ''
              } ${isLocked ? 'opacity-50' : ''}`}
            >
              {getReactionIcon(userReaction)} <span>{getReactionLabel(userReaction)}</span>
            </button>
          </div>
          <button
            onClick={() => !isLocked && setShowComments(!showComments)}
            disabled={isLocked}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
              isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-gold'
            } ${showComments ? 'text-gold' : ''}`}
          >
            <MessageCircle size={20} /> Comment
          </button>
          <button
            onClick={() => !isLocked && setShowShareModal(true)}
            disabled={isLocked}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-white/5 transition active:scale-95 ${
              isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'
            }`}
          >
            <Share2 size={20} /> Share
          </button>
        </div>

        {showComments && !isLocked && (
          <CommentSection
            contentId={post.id}
            initialCount={commentCount}
            onCommentAdded={() => setCommentCount((prev) => prev + 1)}
            onCountUpdate={(newTotal) => setCommentCount(newTotal)}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Post?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={isDeleting}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postTitle={post.title || 'Check out this post'}
        postId={post.id}
      />
    </>
  );
};

export default PostCard;
