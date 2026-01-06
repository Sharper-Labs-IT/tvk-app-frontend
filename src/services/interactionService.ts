import api from '../utils/api';
import type {
  IComment,
  ReactionType,
  IReactionSummary,
  CommentReactionType,
} from '../types/content';

export const interactionService = {
  // --- POST REACTIONS ---

  /**
   * Toggle reaction on a post (Content)
   * Endpoint: POST /api/v1/contents/{contentId}/reactions
   */
  toggleReaction: async (contentId: number, type: ReactionType) => {
    const response = await api.post<{
      message: string;
      action: 'added' | 'removed' | 'updated';
      reactions_summary: IReactionSummary;
    }>(`/v1/contents/${contentId}/reactions`, { type });
    return response.data;
  },

  // --- COMMENT REACTIONS (NEWLY ADDED) ---

  /**
   * Toggle reaction on a specific comment or reply
   * Endpoint: POST /api/v1/comments/{commentId}/reactions
   * Matches the backend route defined in ContentInteractionController@toggleCommentReaction
   */
  toggleCommentReaction: async (commentId: number, type: CommentReactionType) => {
    const response = await api.post<{
      message: string;
      action: 'added' | 'removed';
    }>(`/v1/comments/${commentId}/reactions`, { type });
    return response.data;
  },

  // --- COMMENTS MANAGEMENT ---

  /**
   * Get comments for a post
   * Endpoint: GET /api/v1/contents/{contentId}/comments
   */
  getComments: async (contentId: number, page = 1) => {
    const response = await api.get<{
      comments: { data: IComment[]; current_page: number; last_page: number };
    }>(`/v1/contents/${contentId}/comments?page=${page}`);

    // Returning the data property to match your existing frontend logic
    return response.data.comments;
  },

  /**
   * Add a comment (or reply to an existing comment)
   * Endpoint: POST /api/v1/contents/{contentId}/comments
   */
  addComment: async (contentId: number, comment: string, parentId?: number | null) => {
    const payload: any = { comment };
    if (parentId) payload.parent_id = parentId;

    const response = await api.post<{
      message: string;
      comment: IComment;
    }>(`/v1/contents/${contentId}/comments`, payload);
    return response.data;
  },

  /**
   * Update an existing comment
   * Endpoint: PUT /api/v1/comments/{commentId}
   */
  updateComment: async (commentId: number, comment: string) => {
    const response = await api.put<{
      message: string;
      comment: IComment;
    }>(`/v1/comments/${commentId}`, { comment });
    return response.data;
  },

  /**
   * Delete a comment
   * Endpoint: DELETE /api/v1/comments/{commentId}
   */
  deleteComment: async (commentId: number) => {
    const response = await api.delete<{
      message: string;
    }>(`/v1/comments/${commentId}`);
    return response.data;
  },
};
