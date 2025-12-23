import React, { useState, useEffect } from 'react';
import { Send, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import { interactionService } from '../../services/interactionService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import type { IComment } from '../../types/content';

interface CommentSectionProps {
  contentId: number;
  initialCount: number;
  onCommentAdded: () => void;
}

// --- SUB-COMPONENT: Single Comment Item with User Fetching ---
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
  // Local state to store user details for this specific comment
  // Use 'any' type for author to avoid strict type conflicts during fetch
  const [author, setAuthor] = useState<any>(comment.user || null);
  const [loadingAuthor, setLoadingAuthor] = useState(!comment.user);

  useEffect(() => {
    // If we don't have the user object but have a user_id, fetch it!
    if (!author && comment.user_id) {
      const fetchAuthor = async () => {
        try {
          const response = await api.get(`/v1/auth/user/${comment.user_id}`);
          if (response.data) {
            const userData = response.data.user || response.data;
            setAuthor(userData);
          }
        } catch (error) {
          console.error('Failed to fetch comment author');
          setAuthor({ name: 'Unknown User' }); // Fallback
        } finally {
          setLoadingAuthor(false);
        }
      };
      fetchAuthor();
    } else {
      setLoadingAuthor(false);
    }
  }, [comment.user_id, author]);

  const displayName = author?.name || 'Loading...';
  const displayAvatar = author?.avatar_url;

  return (
    <div className={`flex gap-3 ${isReply ? 'mt-3 ml-10' : 'mt-4'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full border border-white/10 bg-gray-700 overflow-hidden flex-shrink-0">
        {displayAvatar ? (
          <img src={displayAvatar} className="w-full h-full object-cover" alt="avatar" />
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
        <div className="bg-[#252525] p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px]">
          <div className="flex justify-between items-start gap-4">
            <span className="text-gold text-xs font-bold">
              {loadingAuthor ? '...' : displayName}
            </span>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200 text-sm mt-1 break-words">{comment.comment}</p>
        </div>

        {/* Actions Line */}
        <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
          {!isReply && (
            <button onClick={() => onReply(comment)} className="hover:text-gold transition-colors">
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

        {/* Render Replies (Recursive) */}
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
const CommentSection: React.FC<CommentSectionProps> = ({ contentId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<IComment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    try {
      const data = await interactionService.getComments(contentId);
      // Ensure we treat the data as an array
      const commentsArray = Array.isArray(data) ? data : data.data || [];
      setComments(commentsArray);
    } catch (error) {
      console.error('Failed to load comments', error);
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

      // ✅ FIX: Create a fallback user object to satisfy strict TypeScript types
      // This ensures 'user' is never null in the optimistic update
      const fallbackUser = {
        id: user?.id || 0,
        name: user?.name || 'Me',
        email: user?.email || '',
        avatar_url: user?.avatar_url,
        role: 'member', // Add other required fields if your IUser has them
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Construct the new comment object
      const addedComment: IComment = {
        ...response.comment,
        // FORCE the user to be the fallback if the context user is null
        // We cast as 'any' if your IUser interface is very strict, to prevent further errors
        user: user || (fallbackUser as any),
        user_id: user?.id || 0,
        replies: [],
      };

      if (replyTo) {
        // Add to replies
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyTo.id) {
              return { ...c, replies: [...(c.replies || []), addedComment] };
            }
            return c;
          })
        );
      } else {
        // Add to top list
        setComments((prev) => [addedComment, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
      onCommentAdded();
    } catch (error) {
      console.error('Failed to post comment', error);
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
          prev.map((c) => {
            if (c.id === parentId && c.replies) {
              return { ...c, replies: c.replies.filter((r) => r.id !== commentId) };
            }
            return c;
          })
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleReplyClick = (comment: IComment) => {
    setReplyTo(comment);
    document.getElementById(`comment-input-${contentId}`)?.focus();
  };

  return (
    <div className="bg-[#1a1a1a] p-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
      {/* Input Area */}
      <div className="flex gap-3 mb-6">
        <img
          src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'Me'}`}
          className="w-8 h-8 rounded-full border border-white/10"
          alt="me"
        />
        <form onSubmit={handleSubmit} className="flex-1 relative">
          {replyTo && (
            <div className="flex justify-between text-xs text-gold mb-1 ml-1">
              <span>Replying to comment...</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-red-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <input
            id={`comment-input-${contentId}`}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            className="w-full bg-[#2A2A2A] border border-white/10 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:border-gold/50"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gold rounded-full text-black hover:bg-goldDark disabled:opacity-50 transition"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Loading comments...</div>
      ) : comments.length > 0 ? (
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
        </div>
      ) : (
        <div className="text-center py-4 text-gray-600 text-sm italic">
          No comments yet. Be the first!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
