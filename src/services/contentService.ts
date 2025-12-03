import api from '../utils/api';
// Using 'import type' fixes the verbatimModuleSyntax TypeScript error
import type { IContent, IPaginatedResponse, ICreateContentPayload } from '../types/content';

export const contentService = {
  // GET /api/v1/contents
  getAll: async (page = 1) => {
    // Returns a paginated response
    const response = await api.get<IPaginatedResponse<IContent>>(`/v1/contents?page=${page}`);
    return response.data.contents;
  },

  // GET /api/v1/contents/{id}
  getById: async (id: number) => {
    const response = await api.get<{ content: IContent }>(`/v1/contents/${id}`);
    return response.data.content;
  },

  // POST /api/v1/contents/upload
  create: async (payload: ICreateContentPayload) => {
    console.log('[ContentService] Starting upload...', payload); // Debug log 1

    const formData = new FormData();

    // Append standard text fields
    formData.append('title', payload.title);
    formData.append('category_id', payload.category_id);
    formData.append('type', payload.type);

    // Laravel typically expects '1' or '0' for boolean validation
    formData.append('is_premium', payload.is_premium ? '1' : '0');

    if (payload.description) {
      formData.append('description', payload.description);
    }

    // Only append the file if the user selected one
    if (payload.file) {
      formData.append('file', payload.file);
    }

    // Debug log 2: Verify what is actually inside FormData
    for (const [key, value] of formData.entries()) {
      console.log(`[ContentService] FormData Key: ${key}`, value);
    }

    try {
      // CRITICAL FIX:
      // 1. We send 'formData' as the body.
      // 2. We explicitly set 'Content-Type' to undefined.
      //    This forces Axios to remove the default 'application/json' from api.ts
      //    and allows the browser to automatically generate the correct
      //    'multipart/form-data; boundary=----WebKitFormBoundary...' header.
      const response = await api.post('/v1/contents/upload', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });

      console.log('[ContentService] Success:', response.data); // Debug log 3
      return response.data;
    } catch (error) {
      console.error('[ContentService] Upload Failed:', error); // Debug log 4
      throw error;
    }
  },

  // DELETE /api/v1/contents/{id}
  delete: async (id: number) => {
    const response = await api.delete(`/v1/contents/${id}`);
    return response.data;
  },
};
