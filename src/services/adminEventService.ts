import api from '../utils/api';
import { type EventFormData } from '../types/event';

const ADMIN_URL = '/v1/admin/events';
const PUBLIC_URL = '/v1/events'; // We use this for listing since Admin doesn't have an index route

export const adminEventService = {
  // GET ALL EVENTS
  getAllEvents: async () => {
    // Uses the public endpoint as discussed
    const response = await api.get(PUBLIC_URL);
    // Laravel paginator returns { data: [...], current_page: ... }
    return response.data.data || response.data;
  },

  // CREATE EVENT (Requires FormData for file upload)
  createEvent: async (data: EventFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.rules) formData.append('rules', data.rules);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('reward_points', data.reward_points);

    if (data.media) {
      formData.append('media', data.media);
    }

    const response = await api.post(ADMIN_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // UPDATE EVENT
  // Laravel PUT with files is tricky, so we use POST with _method: 'PUT'
  updateEvent: async (id: number, data: EventFormData) => {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Trick for Laravel
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.rules) formData.append('rules', data.rules);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('reward_points', data.reward_points);

    if (data.media) {
      formData.append('media', data.media);
    }

    // We POST to the ID url
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
