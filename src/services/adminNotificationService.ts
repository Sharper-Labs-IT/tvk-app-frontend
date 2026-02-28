import axiosClient from '../api/axiosClient';

export interface AdminNotification {
    id: string | number;
    type: 'order' | 'refund' | 'system' | 'user';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link?: string; // Optional link to the relevant resource (e.g., /admin/orders/123)
}

export interface NotificationResponse {
    data: AdminNotification[];
    unread_count: number;
}

export const adminNotificationService = {
    /**
     * Fetch latest admin notifications
     */
    getNotifications: async (page = 1, limit = 10): Promise<NotificationResponse> => {
        try {
            const response = await axiosClient.get('/admin/notifications', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch admin notifications', error);
            // Fallback to empty to prevent UI crash if endpoint is missing
            return {
                data: [],
                unread_count: 0
            };
        }
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: string | number) => {
        try {
            await axiosClient.patch(`/admin/notifications/${id}/read`);
            return true;
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            return false;
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        try {
            await axiosClient.patch('/admin/notifications/read-all');
            return true;
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
            return false;
        }
    }
};
