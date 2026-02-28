import axiosClient from '../api/axiosClient';

export interface RefundItem {
    id: number;
    product_name: string;
    quantity: number;
    amount: number;
    reason?: string;
}

export interface RefundRequest {
    id: number;
    order_id: number;
    order_number: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    type: 'refund' | 'return'; // refund (just money), return (product return + money)
    amount: number;
    currency: string;
    reason: string;
    status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
    created_at: string;
    updated_at: string;
    days_pending: number;
    admin_response?: string;
    items?: RefundItem[]; // If partial refund specific items
    stripe_refund_id?: string;
    history?: {
        status: string;
        note: string;
        created_at: string;
        actor: string;
    }[];
}

export interface RefundStats {
    pending_requests: number;
    processed_month: number;
    total_amount_month: number;
    avg_processing_time_hours: number;
}

export interface RefundFilterParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string | 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
}

export interface ProcessRefundPayload {
    approve: boolean;
    admin_response?: string;
}

export const adminRefundService = {
    getRefunds: async (params: RefundFilterParams) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value.toString());
            }
        });
        const response = await axiosClient.get(`/admin-refunds?${query.toString()}`);
        return response.data;
    },

    getRefund: async (id: number | string): Promise<RefundRequest> => {
        const response = await axiosClient.get(`/admin-refunds/${id}`);
        return response.data;
    },

    getStats: async (): Promise<RefundStats> => {
        try {
            const response = await axiosClient.get('/admin-refunds');
            // Check if response data is actually stats (has pending_requests)
            const data = response.data;
            if (data && typeof data.pending_requests === 'number') {
                return data;
            }
            return {
                pending_requests: 0,
                processed_month: 0,
                total_amount_month: 0,
                avg_processing_time_hours: 0
            };
        } catch (error) {
            console.error('Failed to fetch refund stats', error);
            return {
                pending_requests: 0,
                processed_month: 0,
                total_amount_month: 0,
                avg_processing_time_hours: 0
            };
        }
    },

    processRefund: async (id: number | string, data: ProcessRefundPayload) => {
        const response = await axiosClient.post(`/admin-refunds/${id}/process`, data);
        return response.data;
    }
};
