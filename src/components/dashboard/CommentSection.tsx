import React, { useState, useEffect } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { interactionService } from '../../services/interactionService';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import type { IComment } from '../../types/content';

interface CommentSectionProps {
  contentId: number;
  initialCount: number;
  onCommentAdded: () => void; // To update parent count
}

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
      setComments(data.data);
    } catch (error) {
      console.error('Failed to load comments', error);
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

      const addedComment = response.comment;

      // Optimistic update
      if (replyTo) {
        // If reply, find parent and add to replies array
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyTo.id) {
              return { ...c, replies: [...(c.replies || []), addedComment] };
            }
            return c;
          })
        );
      } else {
        // New top level comment
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

  const CommentItem = ({
    comment,
    isReply = false,
    parentId = null,
  }: {
    comment: IComment;
    isReply?: boolean;
    parentId?: number | null;
  }) => (
    <div className={`flex gap-3 ${isReply ? 'mt-3 ml-10' : 'mt-4'}`}>
      <img
        src={comment.user.avatar_url || `https://ui-avatars.com/api/?name=${comment.user.name}`}
        className="w-8 h-8 rounded-full border border-white/10"
        alt="avatar"
      />
      <div className="flex-1">
        <div className="bg-[#252525] p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px]">
          <div className="flex justify-between items-start gap-4">
            <span className="text-gold text-xs font-bold">{comment.user.name}</span>
            <span className="text-[10px] text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200 text-sm mt-1">{comment.comment}</p>
        </div>

        {/* Actions Line */}
        <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
          {!isReply && (
            <button
              onClick={() => {
                setReplyTo(comment);
                // Focus input logic could go here
                document.getElementById(`comment-input-${contentId}`)?.focus();
              }}
              className="hover:text-gold transition-colors"
            >
              Reply
            </button>
          )}

          {user?.id === comment.user_id && (
            <button
              onClick={() => handleDelete(comment.id, parentId)}
              className="hover:text-red-500 flex items-center gap-1"
            >
              <Trash2 size={10} /> Delete
            </button>
          )}
        </div>

        {/* Render Replies */}
        {comment.replies &&
          comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
          ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#1a1a1a] p-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
      {/* Input */}
      <div className="flex gap-3 mb-6">
        <img
          src={user?.avatar_url || `https://ui-avatars.com/api/?name=Me`}
          className="w-8 h-8 rounded-full"
          alt="me"
        />
        <form onSubmit={handleSubmit} className="flex-1 relative">
          {replyTo && (
            <div className="flex justify-between text-xs text-gold mb-1 ml-1">
              <span>Replying to {replyTo.user.name}...</span>
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

      {/* List */}
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">Loading comments...</div>
      ) : comments.length > 0 ? (
        comments.map((c) => <CommentItem key={c.id} comment={c} />)
      ) : (
        <div className="text-center py-4 text-gray-600 text-sm italic">
          No comments yet. Be the first!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
