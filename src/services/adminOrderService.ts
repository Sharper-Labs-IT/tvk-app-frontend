import axiosClient from '../api/axiosClient';
import type { Order, OrderItem } from './orderService';

export interface AdminOrder extends Omit<Order, 'items'> {
    items: OrderItem[]; 
    user?: {
        id: number;
        name: string;
        email: string;
        mobile?: string;
    };
    created_at: string;
    updated_at: string;
    payment_method?: string;
    payment_status: 'paid' | 'pending' | 'failed'; 
    stripe_payment_intent_id?: string;
    payment_date?: string;
    notes?: string;
    timeline?: OrderEvent[];
}

export interface OrderEvent {
    id: number;
    status: string;
    description: string;
    created_at: string;
    user_name: string;
}

export interface AdminOrderFilterParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
}

export interface OrderStats {
    total_orders_today: number;
    pending_orders: number;
    processing_orders: number;
    shipped_today: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
    average_order_value: number;
}

export interface UpdateShippingParams {
    carrier?: string;
    tracking_number?: string;
    tracking_url?: string;
    status?: string;
    shipped_at?: string;
    estimated_delivery?: string;
    notes?: string;
}

export const adminOrderService = {
    getOrders: async (params: AdminOrderFilterParams) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value.toString());
            }
        });
        const response = await axiosClient.get(`/admin-orders?${query.toString()}`);
        return response.data;
    },

    getOrder: async (id: number | string): Promise<AdminOrder> => {
        const response = await axiosClient.get(`/admin-orders/${id}`);
        return response.data;
    },

    updateStatus: async (id: number | string, status: string, notes?: string, notify_customer: boolean = true) => {
        const response = await axiosClient.patch(`/admin-orders/${id}/status`, {
            status,
            notes,
            notify_customer
        });
        return response.data;
    },

    updateShipping: async (id: number | string, data: UpdateShippingParams) => {
        const response = await axiosClient.patch(`/admin-orders/${id}/shipping`, data);
        return response.data;
    },

    getStats: async (): Promise<OrderStats> => {
        try {
            const response = await axiosClient.get('/admin-orders');
            // Check if response data is actually stats (has revenue_today)
            // If the endpoint returns a list (array or paginated objects), ignore and return zeros
            const data = response.data;
            if (data && typeof data.revenue_today === 'number') {
                return data;
            }
            return {
                total_orders_today: 0,
                pending_orders: 0,
                processing_orders: 0,
                shipped_today: 0,
                revenue_today: 0,
                revenue_week: 0,
                revenue_month: 0,
                average_order_value: 0
            };
        } catch (error) {
            console.error('Failed to fetch order stats', error);
            // Return empty/zero stats or rethrow depending on desired behavior. 
            // Returning empty stats prevents page crash.
            return {
                total_orders_today: 0,
                pending_orders: 0,
                processing_orders: 0,
                shipped_today: 0,
                revenue_today: 0,
                revenue_week: 0,
                revenue_month: 0,
                average_order_value: 0
            };
        }
    }
};
