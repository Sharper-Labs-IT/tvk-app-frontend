import api from '../utils/api';
import type { IComment, ReactionType, IReactionSummary } from '../types/content';

export const interactionService = {
  // --- REACTIONS ---

  /**
   * Toggle reaction on a post
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

  // --- COMMENTS ---

  /**
   * Get comments for a post
   * Endpoint: GET /api/v1/contents/{contentId}/comments
   */
  getComments: async (contentId: number, page = 1) => {
    const response = await api.get<{
      comments: { data: IComment[]; current_page: number; last_page: number };
    }>(`/v1/contents/${contentId}/comments?page=${page}`);
    return response.data.comments;
  },

  /**
   * Add a comment (or reply)
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
   * Delete a comment
   * Endpoint: DELETE /api/v1/comments/{commentId}
   */
  deleteComment: async (commentId: number) => {
    const response = await api.delete(`/v1/comments/${commentId}`);
    return response.data;
  },
};
