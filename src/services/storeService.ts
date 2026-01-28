import axiosClient from '../api/axiosClient';
import type { Product, ProductCategory, ProductFilterParams } from '../types/product';

export const storeService = {
  getProducts: async (params?: ProductFilterParams): Promise<{ data: Product[]; last_page: number; total: number }> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category_id) query.append('category_id', params.category_id.toString());
      if (params?.type && params.type.length > 0) {
        params.type.forEach(t => query.append('type[]', t));
      }
      if (params?.sort_by) query.append('sort_by', params.sort_by);
      if (params?.sort_dir) query.append('sort_dir', params.sort_dir);

      const response = await axiosClient.get(`/store/products?${query.toString()}`);
      return response.data;
    } catch (error) {
       console.warn('Backend API failed, using mock data for products');
       // Mock data for development
       return {
         data: [
           {
             id: 1,
             name: 'Premium T-Shirt',
             slug: 'premium-t-shirt',
             sku: 'TSH-001',
             category_id: 1,
             type: 'physical',
             status: 'active',
             price: 29.99,
             stock_quantity: 100,
             track_inventory: true,
             is_featured: true,
             description: 'High quality cotton t-shirt',
             media: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80', type: 'image', is_primary: true }],
             has_variants: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
           },
           {
             id: 2,
             name: 'Exotic Hoodie',
             slug: 'exotic-hoodie',
             sku: 'HD-001',
             category_id: 1,
             type: 'physical',
             status: 'active',
             price: 59.99,
             discount_price: 49.99,
             stock_quantity: 50,
             track_inventory: true,
             is_featured: true,
             description: 'Warm and stylish hoodie',
             media: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80', type: 'image', is_primary: true }],
             has_variants: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
           },
           {
              id: 3,
              name: '1000 Gold Coins',
              slug: '1000-gold-coins',
              sku: 'COIN-1000',
              category_id: 7,
              type: 'game_item',
              status: 'active',
              price: 9.99,
              stock_quantity: 999999,
              track_inventory: false,
              is_featured: false,
              description: 'Currency for in-game purchases',
              media: [{ url: 'https://images.unsplash.com/photo-1611095790444-1dfa35e37b52?auto=format&fit=crop&q=80', type: 'image', is_primary: true }],
              has_variants: false,
              game_item_metadata: {
                  game_item_type: 'coins',
                  coins_amount: 1000
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
           }
         ],
         last_page: 1,
         total: 3
       };
    }
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    try {
      const response = await axiosClient.get('/store/categories');
      return response.data;
    } catch (error) {
       console.warn('Backend API failed, using mock data for categories');
       return [
          { id: 1, name: 'Apparel', slug: 'apparel' },
          { id: 2, name: 'Drinkware', slug: 'drinkware' },
          { id: 3, name: 'Accessories', slug: 'accessories' },
          { id: 4, name: 'Digital', slug: 'digital' },
          { id: 5, name: 'Game Items', slug: 'game-items' },
       ];
    }
  },

  getProduct: async (id: string | number): Promise<Product> => {
    const response = await axiosClient.get(`/store/products/${id}`);
    return response.data;
  },

  // Cart Operations
  getCart: async () => {
    const response = await axiosClient.get('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number, variantId?: number) => {
    const response = await axiosClient.post('/cart', {
      product_id: productId,
      quantity,
      variant_id: variantId
    });
    return response.data;
  },

  updateCartItem: async (cartItemId: string | number, quantity: number) => {
    const response = await axiosClient.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (cartItemId: string | number) => {
    const response = await axiosClient.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosClient.post('/cart/clear');
    return response.data;
  },
  
  // Legacy support if needed, otherwise these can be removed/mapped
  getCoinPackages: async () => [],
  getMerchItems: async () => [],
  getPowerUps: async () => []
};
