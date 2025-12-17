import api from '../utils/api';

export const authService = {
  /**
   * Step 1: Request the reset token to be sent to email
   */
  requestPasswordReset: async (email: string) => {
    // This calls the existing 'forgotPassword' method in your AuthController
    const response = await api.post('/v1/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Step 2: Submit the token and new password
   */
  confirmPasswordReset: async (email: string, token: string, password: string) => {
    // This calls the existing 'resetPassword' method in your AuthController
    const response = await api.post('/v1/auth/reset-password', {
      email,
      token,
      password,
      password_confirmation: password, // Backend requires this field
    });
    return response.data;
  },

  /**
   * Fetch Real-time stats (Points, Badges)
   * Note: Since this endpoint might not exist yet, we wrap it in try/catch
   */
  fetchUserStats: async () => {
    try {
      const response = await api.get('/v1/user/stats');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
