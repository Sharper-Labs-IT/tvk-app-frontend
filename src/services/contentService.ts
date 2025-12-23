import api from '../utils/api';
import type {
  IContent,
  IPaginatedResponse,
  ICreateContentPayload,
  IUpdateContentPayload,
  ICategory, // Ensure ICategory is exported in your types/content.ts
} from '../types/content';

export const contentService = {
  // ------------------------------------------------------------------
  // PUBLIC / SHARED ROUTES
  // ------------------------------------------------------------------

  // GET /api/v1/contents
  getAll: async (page = 1) => {
    const response = await api.get<IPaginatedResponse<IContent>>(`/v1/contents?page=${page}`);
    return response.data.contents;
  },

  // GET /api/v1/contents/{id}
  getById: async (id: number) => {
    const response = await api.get<{ content: IContent }>(`/v1/contents/${id}`);
    return response.data.content;
  },

  // GET /api/v1/contents/categories
  // (Needed for the CreatePostWidget dropdown)
  getCategories: async () => {
    const response = await api.get<{ categories: ICategory[] }>('/v1/contents/categories');
    return response.data.categories;
  },

  // ------------------------------------------------------------------
  // ADMIN ROUTES (For Admin Panel)
  // ------------------------------------------------------------------

  // POST /api/v1/admin/contents/upload
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
      // ✅ Uses ADMIN route to avoid "Method Not Allowed" or "Premium" errors
      const response = await api.post('/v1/admin/contents/upload', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /api/v1/admin/contents/{id}
  update: async (payload: IUpdateContentPayload) => {
    const formData = new FormData();
    // Laravel requires _method: PUT when sending files in an update
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
      // ✅ Uses ADMIN route
      const response = await api.post(`/v1/admin/contents/${payload.id}`, formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /api/v1/admin/contents/{id}
  delete: async (id: number) => {
    // ✅ Uses ADMIN route
    const response = await api.delete(`/v1/admin/contents/${id}`);
    return response.data;
  },

  // ------------------------------------------------------------------
  // MEMBER ROUTES (For Dashboard Widget)
  // ------------------------------------------------------------------

  // POST /api/v1/member/contents/upload
  // (Used by CreatePostWidget.tsx)
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

    // ✅ Uses MEMBER route
    const response = await api.post('/v1/member/contents/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return response.data;
  },
};
