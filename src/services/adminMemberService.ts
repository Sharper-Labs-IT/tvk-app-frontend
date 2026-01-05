import api from '../utils/api';
import type { UserListResponse } from '../types/user';

export const adminMemberService = {
  // Get all users (paginated) - ADDED /v1
  getUsers: async (page = 1) => {
    const response = await api.get<UserListResponse>(`/v1/admin/users?page=${page}`);
    return response.data;
  },

  // Create a new Admin/Moderator - ADDED /v1
  createAdmin: async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    role: 'admin' | 'moderator';
  }) => {
    const response = await api.post('/v1/admin/create-admin', data);
    return response.data;
  },

  // Ban a user - ADDED /v1
  banUser: async (userId: number) => {
    const response = await api.post(`/v1/admin/users/${userId}/ban`);
    return response.data;
  },

  // Activate a user - ADDED /v1
  activateUser: async (userId: number) => {
    const response = await api.post(`/v1/admin/users/${userId}/activate`);
    return response.data;
  },

  // Assign a role - ADDED /v1
  assignRole: async (userId: number, role: string) => {
    const response = await api.post(`/v1/admin/users/${userId}/assign-role`, { role });
    return response.data;
  },

  // Remove a role - ADDED /v1
  removeRole: async (userId: number, role: string) => {
    const response = await api.post(`/v1/admin/users/${userId}/remove-role`, { role });
    return response.data;
  },
};
