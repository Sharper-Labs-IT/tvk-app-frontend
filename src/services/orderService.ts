// src/services/orderService.ts
import axiosClient from '../api/axiosClient';
import type { Product } from '../types/product';

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    product: Product;
    variant?: {
        id: number;
        attributes: { size?: string; color?: string };
    };
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total_amount: number;
    currency: string;
    items_count: number;
    items: OrderItem[];
    shipping_address?: any;
    billing_address?: any;
    tracking_number?: string;
    carrier?: string;
    created_at: string;
    payment_status: string;
}

export interface CreateOrderPayload {
    shipping_address: {
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postal_code: string;
        country: string;
    };
    billing_address?: {
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postal_code: string;
        country: string;
    };
    referral_code?: string;
    customer_notes?: string;
    currency?: string;
}

export interface RefundRequest {
    id: number;
    order_id: number;
    order: Order;
    type: 'refund' | 'return';
    amount: number;
    reason: string;
    status: 'requested' | 'approved' | 'rejected' | 'processing' | 'completed';
    admin_response?: string;
    created_at: string;
}

export const orderService = {
    getOrders: async (page = 1, filters?: { status?: string; search?: string }): Promise<{ data: Order[]; last_page: number; total: number }> => {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        if (filters?.status) query.append('status', filters.status);
        if (filters?.search) query.append('search', filters.search);
        
        const response = await axiosClient.get(`/orders/index?${query.toString()}`);
        return response.data;
    },

    getOrder: async (id: string | number): Promise<Order> => {
        const response = await axiosClient.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (data: CreateOrderPayload): Promise<{ order: Order; checkout_url: string }> => {
        const response = await axiosClient.post('/orders', data);
        return response.data;
    },
    
    validateReferral: async (code: string): Promise<{ valid: boolean; discount_amount: number; error?: string }> => {
         try {
             // Assuming validation endpoint or logic
             const response = await axiosClient.post('/referral/validate', { code });
             return response.data;
         } catch (error: any) {
             return { valid: false, discount_amount: 0, error: error.response?.data?.message || 'Invalid code' };
         }
    },

    // Refund Logic
    getRefunds: async (): Promise<RefundRequest[]> => {
        const response = await axiosClient.get('/refunds');
        return response.data; // adjust if paginated
    },

    requestRefund: async (orderId: number, data: { type: string; reason: string; amount?: number; items?: number[] }) => {
        const response = await axiosClient.post(`/refunds/orders/${orderId}`, data);
        return response.data;
    }
};
