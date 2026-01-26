import React, { useState, useEffect } from 'react';
import { Send, Trash2, Loader2, User as UserIcon, ThumbsUp, Heart } from 'lucide-react';
import { interactionService } from '../../services/interactionService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import type { IComment, CommentReactionType } from '../../types/content';

interface CommentSectionProps {
  contentId: number;
  initialCount: number;
  onCommentAdded: () => void;
  onCountUpdate?: (total: number) => void;
}

// --- SUB-COMPONENT: Single Comment Item ---
const CommentItem = ({
  comment,
  isReply = false,
  parentId = null,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: IComment;
  isReply?: boolean;
  parentId?: number | null;
  currentUserId?: number;
  onReply: (comment: IComment) => void;
  onDelete: (commentId: number, parentId: number | null) => void;
}) => {
  const [author, setAuthor] = useState<any>(comment.user || null);
  const [loadingAuthor, setLoadingAuthor] = useState(!comment.user);

  // NEW: Comment Reaction State
  const [userReaction, setUserReaction] = useState<CommentReactionType | null>(
    comment.user_reaction || null
  );
  const [reactionCount, setReactionCount] = useState(comment.reactions_count || 0);

  useEffect(() => {
    if ((!author || (!author.avatar_url && !author.profile_photo_url)) && comment.user_id) {
      const fetchAuthor = async () => {
        try {
          const response = await api.get(`/v1/auth/user/${comment.user_id}`);
          if (response.data) {
            const userData = response.data.user || response.data;
            setAuthor(userData);
          }
        } catch (error) {
          setAuthor({ name: 'Unknown User' });
        } finally {
          setLoadingAuthor(false);
        }
      };
      fetchAuthor();
    } else {
      setLoadingAuthor(false);
    }
  }, [comment.user_id, author]);

  // NEW: Handle Comment Reaction
  const handleToggleReaction = async (type: CommentReactionType) => {
    const oldReaction = userReaction;
    const oldCount = reactionCount;

    // Optimistic Update
    let newReaction: CommentReactionType | null = type;
    let newCount = oldCount;

    if (oldReaction === type) {
      newReaction = null;
      newCount = Math.max(0, oldCount - 1);
    } else if (oldReaction === null) {
      newCount = oldCount + 1;
    } else {
      // Switching from like to heart or vice versa (count stays same)
      newReaction = type;
    }

    setUserReaction(newReaction);
    setReactionCount(newCount);

    try {
      await interactionService.toggleCommentReaction(comment.id, type);
    } catch (error) {
      // Rollback on error
      setUserReaction(oldReaction);
      setReactionCount(oldCount);
    }
  };

  const displayName = author?.name || 'Loading...';
  const displayAvatar = author?.avatar_url || author?.profile_photo_url || author?.image;

  return (
    <div className={`flex gap-3 ${isReply ? 'mt-3 ml-10' : 'mt-4'}`}>
      <div className="w-8 h-8 rounded-full border border-white/10 bg-gray-700 overflow-hidden flex-shrink-0">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            className="w-full h-full object-cover"
            alt="avatar"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {loadingAuthor ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <UserIcon size={16} />
            )}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-[#252525] p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px] relative">
          <div className="flex justify-between items-start gap-4">
            <span className="text-gold text-xs font-bold">
              {loadingAuthor ? '...' : displayName}
            </span>
            <span className="text-[10px] text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200 text-sm mt-1 break-words">{comment.comment}</p>

          {/* Floating Reaction Count */}
          {reactionCount > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-[#333] border border-white/10 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
              <div className="flex items-center gap-0.5">
                {(reactionCount > 1 || userReaction === 'like' || (reactionCount === 1 && !userReaction)) && (
                  <ThumbsUp size={10} className="text-blue-400 fill-blue-400" />
                )}
                {(reactionCount > 1 || userReaction === 'heart') && (
                  <Heart size={10} className="text-red-400 fill-red-400" />
                )}
              </div>
              <span className="text-[10px] text-gray-300 font-bold">{reactionCount}</span>
            </div>
          )}
        </div>

        {/* Actions Line */}
        <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleReaction('like')}
              className={`flex items-center gap-1 transition-colors ${
                userReaction === 'like' ? 'text-blue-400' : 'hover:text-blue-400'
              }`}
            >
              <ThumbsUp size={12} className={userReaction === 'like' ? 'fill-blue-400' : ''} /> Like
            </button>
            <button
              onClick={() => handleToggleReaction('heart')}
              className={`flex items-center gap-1 transition-colors ${
                userReaction === 'heart' ? 'text-red-400' : 'hover:text-red-400'
              }`}
            >
              <Heart size={12} className={userReaction === 'heart' ? 'fill-red-400' : ''} /> Love
            </button>
          </div>

          {!isReply && (
            <button onClick={() => onReply(comment)} className="hover:text-gold transition">
              Reply
            </button>
          )}

          {currentUserId === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id, parentId)}
              className="hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 size={10} /> Delete
            </button>
          )}
        </div>

        {comment.replies &&
          comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              parentId={comment.id}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  onCommentAdded,
  onCountUpdate,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<IComment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const calculateTotalCount = (commentList: IComment[]): number => {
    let total = 0;
    commentList.forEach((c) => {
      total += 1;
      if (c.replies && c.replies.length > 0) total += calculateTotalCount(c.replies);
    });
    return total;
  };

  useEffect(() => {
    if (onCountUpdate) onCountUpdate(calculateTotalCount(comments));
  }, [comments, onCountUpdate]);

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    try {
      const data = await interactionService.getComments(contentId);
      const commentsArray = Array.isArray(data) ? data : data.data || [];
      setComments(commentsArray);
    } catch (error) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await interactionService.addComment(contentId, newComment, replyTo?.id);
      const addedComment: IComment = {
        ...response.comment,
        user: user!,
        user_id: user?.id || 0,
        replies: [],
        reactions_count: 0,
        user_reaction: null,
      };

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), addedComment] } : c
          )
        );
      } else {
        setComments((prev) => [addedComment, ...prev]);
      }
      setNewComment('');
      setReplyTo(null);
      onCommentAdded();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number, parentId: number | null) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await interactionService.deleteComment(commentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) } : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyClick = (comment: IComment) => {
    setReplyTo(comment);
    document.getElementById(`comment-input-${contentId}`)?.focus();
  };

  return (
    <div className="bg-[#1a1a1a] p-4 border-t border-white/5">
      <div className="flex gap-3 mb-6">
        <img
          src={
            user?.avatar_url ||
            user?.profile_photo_url ||
            `https://ui-avatars.com/api/?name=${user?.name || 'Me'}`
          }
          className="w-8 h-8 rounded-full border border-white/10 object-cover"
          alt="me"
        />
        <form onSubmit={handleSubmit} className="flex-1 relative">
          {replyTo && (
            <div className="flex justify-between text-xs text-gold mb-1">
              <span>Replying to {replyTo.user?.name}...</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-red-400">
                Cancel
              </button>
            </div>
          )}
          <input
            id={`comment-input-${contentId}`}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-[#2A2A2A] border border-white/10 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:border-gold/50"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gold rounded-full text-black"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.id}
              onReply={handleReplyClick}
              onDelete={handleDelete}
            />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-4 text-gray-600 text-sm italic">No comments yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
