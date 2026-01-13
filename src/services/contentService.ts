import api from '../utils/api';
import type {
  IContent,
  IPaginatedResponse,
  ICreateContentPayload,
  IUpdateContentPayload,
  ICategory,
  IPendingContentResponse,
  IRejectContentPayload,
  IMyContentResponse,
} from '../types/content';

export const contentService = {
  // ------------------------------------------------------------------
  // PUBLIC / SHARED ROUTES
  // ------------------------------------------------------------------

  // GET /api/v1/contents
  getAll: async (page = 1) => {
    const response = await api.get<IPaginatedResponse<IContent>>(`/v1/contents?page=${page}`);
    const contents = response.data.contents;
    
    // Map backend field names to frontend expected names
    if (contents.data && Array.isArray(contents.data)) {
      contents.data = contents.data.map((item: any) => ({
        ...item,
        status: item.approval_status || item.status,
        reviewed_by: item.approved_by || item.reviewed_by,
        reviewed_at: item.approved_at || item.reviewed_at,
      }));
    }
    
    return contents;
  },

  // GET /api/v1/contents/{id}
  getById: async (id: number) => {
    const response = await api.get<{ content: IContent }>(`/v1/contents/${id}`);
    return response.data.content;
  },

  // GET /api/v1/contents/categories
  getCategories: async () => {
    const response = await api.get<{ categories: ICategory[] }>('/v1/contents/categories');
    return response.data.categories;
  },

  // ------------------------------------------------------------------
  // ADMIN ROUTES (Corrected to match api.php)
  // ------------------------------------------------------------------

  // POST /api/v1/contents/upload
  // Fixed: Removed '/admin' prefix because it doesn't exist in api.php
  create: async (payload: ICreateContentPayload) => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('category_id', payload.category_id);
    formData.append('type', payload.type);
    formData.append('is_premium', payload.is_premium ? '1' : '0');

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    try {
      const response = await api.post('/v1/contents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Explicitly set for file uploads
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /api/v1/contents/{id}
  // Fixed: Removed '/admin' prefix
  update: async (payload: IUpdateContentPayload) => {
    const formData = new FormData();
    // Laravel requires _method: PUT when sending files in an update via POST
    formData.append('_method', 'PUT');

    if (payload.title) formData.append('title', payload.title);
    if (payload.category_id) formData.append('category_id', payload.category_id);
    if (payload.type) formData.append('type', payload.type);

    if (payload.is_premium !== undefined) {
      formData.append('is_premium', payload.is_premium ? '1' : '0');
    }

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    try {
      const response = await api.post(`/v1/contents/${payload.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /api/v1/contents/{id}
  // Fixed: Removed '/admin' prefix
  delete: async (id: number) => {
    const response = await api.delete(`/v1/contents/${id}`);
    return response.data;
  },

  // ------------------------------------------------------------------
  // MEMBER ROUTES
  // ------------------------------------------------------------------

  // POST /api/v1/contents/upload
  // Fixed: Removed '/member' prefix. Both Admins and Members use the same endpoint.
  // The backend determines who uploaded it via the Auth token.
  createMemberPost: async (payload: ICreateContentPayload) => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('category_id', payload.category_id);
    formData.append('type', payload.type);
    // Members are usually forced to premium/internal visibility
    formData.append('is_premium', '1');

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    const response = await api.post('/v1/contents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // ------------------------------------------------------------------
  // MODERATION ROUTES (Admin/Moderator Only)
  // ------------------------------------------------------------------

  // GET /api/v1/contents/pending
  getPending: async (page = 1) => {
    try {
      const response = await api.get<IPendingContentResponse>(`/v1/contents/pending?page=${page}`);
      
      // The actual backend returns: { contents: { data: [], ... } }
      // not { pending_contents: { data: [], ... } }
      const contents = response.data.contents || response.data.pending_contents || response.data;
      
      if (!contents) {
        // Return empty pagination structure
        return {
          current_page: 1,
          data: [],
          first_page_url: '',
          from: 0,
          last_page: 1,
          last_page_url: '',
          next_page_url: null,
          path: '',
          per_page: 15,
          prev_page_url: null,
          to: 0,
          total: 0,
        };
      }
      
      // Handle case where contents is already the pagination object
      const paginationData: any = 'data' in contents ? contents : { data: [], ...contents };
      
      // Map backend field names to frontend expected names
      if (paginationData.data && Array.isArray(paginationData.data)) {
        paginationData.data = paginationData.data.map((item: any) => ({
          ...item,
          status: item.approval_status || item.status || 'pending',
          reviewed_by: item.approved_by || item.reviewed_by,
          reviewed_at: item.approved_at || item.reviewed_at,
        }));
      }
      
      return paginationData;
    } catch (error: any) {
      throw error;
    }
  },

  // POST /api/v1/contents/{id}/approve
  approve: async (id: number) => {
    const response = await api.post(`/v1/contents/${id}/approve`);
    return response.data;
  },

  // POST /api/v1/contents/{id}/reject
  reject: async (id: number, payload?: IRejectContentPayload) => {
    const response = await api.post(`/v1/contents/${id}/reject`, payload);
    return response.data;
  },

  // GET /api/v1/contents/my-content
  getMyContent: async (page = 1) => {
    const response = await api.get<IMyContentResponse>(`/v1/contents/my-content?page=${page}`);
    
    // Map backend field names to frontend expected names
    const contents = response.data.contents || response.data;
    if (contents.data && Array.isArray(contents.data)) {
      contents.data = contents.data.map((item: any) => ({
        ...item,
        status: item.approval_status || item.status,
        reviewed_by: item.approved_by || item.reviewed_by,
        reviewed_at: item.approved_at || item.reviewed_at,
      }));
    }
    
    return contents;
  },
};
