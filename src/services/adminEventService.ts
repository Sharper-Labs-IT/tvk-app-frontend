import api from '../utils/api';

const ADMIN_URL = '/v1/admin/events';
const PUBLIC_URL = '/v1/events';

export const adminEventService = {
  // GET ALL EVENTS
  getAllEvents: async () => {
    const response = await api.get(PUBLIC_URL);
    return response.data.data || response.data;
  },

  // CREATE EVENT
  createEvent: async (data: any) => {
    const formData = new FormData();

    // 1. Text Fields (We use || '' to prevent "undefined" string)
    formData.append('title', data.title || '');
    formData.append('description', data.description || '');
    formData.append('rules', data.rules || '');
    formData.append('venue_name', data.venue_name || '');
    formData.append('event_type', data.event_type || '');
    formData.append('reward_points', String(data.reward_points || '0'));

    // 2. Date Formatting
    const formatDate = (date: string) => {
      if (!date) return ''; // If empty, return empty (Laravel will say "Required")
      // Converts "2025-01-01T12:00" to "2025-01-01 12:00:00"
      return date.replace('T', ' ') + ':00';
    };

    formData.append('start_date', formatDate(data.start_date));
    formData.append('end_date', formatDate(data.end_date));

    // 3. Boolean Formatting
    formData.append('is_featured', data.is_featured ? '1' : '0');

    // 4. File Upload
    if (data.media instanceof File) {
      formData.append('media', data.media);
    }

    const response = await api.post(ADMIN_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // UPDATE EVENT
  updateEvent: async (id: number, data: any) => {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Trick for Laravel PUT files

    formData.append('title', data.title || '');
    formData.append('description', data.description || '');
    formData.append('rules', data.rules || '');
    formData.append('venue_name', data.venue_name || '');
    formData.append('event_type', data.event_type || '');
    formData.append('reward_points', String(data.reward_points || '0'));

    const formatDate = (date: string) => {
      if (!date) return '';
      return date.replace('T', ' ').substring(0, 19);
    };
    formData.append('start_date', formatDate(data.start_date));
    formData.append('end_date', formatDate(data.end_date));

    formData.append('is_featured', data.is_featured ? '1' : '0');

    if (data.media instanceof File) {
      formData.append('media', data.media);
    }

    const response = await api.post(`${ADMIN_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // DELETE EVENT
  deleteEvent: async (id: number) => {
    const response = await api.delete(`${ADMIN_URL}/${id}`);
    return response.data;
  },

  // CANCEL EVENT
  cancelEvent: async (id: number) => {
    const response = await api.post(`${ADMIN_URL}/${id}/cancel`);
    return response.data;
  },
};
