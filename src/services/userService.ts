import api from '../utils/api';
import type { IUser } from '../types/auth';

export const userService = {
  /**
   * Update basic profile info (Name only, as per your request)
   */
  updateProfile: async (name: string) => {
    const response = await api.post<{ user: IUser; message: string }>('/v1/auth/update-profile', {
      name,
    });
    return response.data;
  },

  /**
   * Update Avatar (Requires Multipart Form Data)
   */
  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<{ avatar_url: string; message: string }>(
      '/v1/auth/update-avatar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Change Password
   * ⚠️ Backend endpoint needs to be created for this.
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) => {
    const response = await api.post('/v1/auth/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    });
    return response.data;
  },

  /**
   * Fetch User Stats (Points, Games, etc.)
   * ⚠️ This assumes a new endpoint exists. If not, it returns mock data for now so UI doesn't break.
   */
  fetchUserStats: async () => {
    try {
      // Try to hit a stats endpoint
      const response = await api.get('/v1/user/stats');
      return response.data;
    } catch (error) {
      return {
        points: 0,
        games_played: 0,
        trophies: 0,
      };
    }
  },

  /**
   * Update Nickname
   * Premium users: unlimited updates
   * Free users: 1 free change, then 2000 coins per change
   */
  updateNickname: async (nickname: string) => {
    const response = await api.post<{ user: IUser; message: string; coins_deducted?: number }>(
      '/v1/auth/update-nickname',
      { nickname }
    );
    return response.data;
  },
};
