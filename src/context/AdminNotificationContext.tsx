import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminNotificationService } from '../services/adminNotificationService';
import type { AdminNotification } from '../services/adminNotificationService';

interface AdminNotificationContextType {
    notifications: AdminNotification[];
    unreadCount: number;
    loading: boolean;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string | number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const AdminNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const response = await adminNotificationService.getNotifications();
        // Since the service guaranteed a fallback structure, we can safely use it
        setNotifications(response.data || []);
        setUnreadCount(response.unread_count || 0);
        setLoading(false);
    }, []);

    // Mark single notification as read
    const markAsRead = async (id: string | number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await adminNotificationService.markAsRead(id);
        fetchNotifications(); // Sync with server
    };

    // Mark all as read
    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await adminNotificationService.markAllAsRead();
        fetchNotifications(); // Sync
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();

        // Poll every 60 seconds
        const intervalId = setInterval(fetchNotifications, 60000);

        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    return (
        <AdminNotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refreshNotifications: fetchNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </AdminNotificationContext.Provider>
    );
};

export const useAdminNotifications = () => {
    const context = useContext(AdminNotificationContext);
    if (!context) {
        throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
    }
    return context;
};
