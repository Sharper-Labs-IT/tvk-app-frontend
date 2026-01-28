import axiosClient from '../api/axiosClient';
import type { Product } from '../types/product';

export interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
    product: Product;
    created_at: string;
}

export const wishlistService = {
    getWishlist: async (): Promise<WishlistItem[]> => {
        const response = await axiosClient.get('/wishlist');
        return response.data;
    },

    addToWishlist: async (productId: number): Promise<any> => {
        const response = await axiosClient.post('/wishlist', { product_id: productId });
        return response.data;
    },

    removeFromWishlist: async (productId: number): Promise<any> => {
        const response = await axiosClient.delete(`/wishlist/${productId}`);
        return response.data;
    },
    
    // Optional: Check if single product is in wishlist (if backend supports)
    // Otherwise we rely on the list
};
