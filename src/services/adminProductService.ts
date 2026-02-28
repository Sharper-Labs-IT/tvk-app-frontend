import axiosClient from '../api/axiosClient';
import type { Product, ProductFilterParams, ProductCategory } from '../types/product';

// Utility to convert object params to query string
const getQueryParams = (params: ProductFilterParams) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category_id) query.append('category_id', params.category_id.toString());
  if (params.status && params.status !== 'active') query.append('status', params.status); // Assuming default/none is handled
  if (params.status === 'active' || params.status === 'inactive') query.append('status', params.status);
  
  if (params.type && params.type.length > 0) {
    params.type.forEach(t => query.append('type[]', t));
  }
  
  if (params.page) query.append('page', params.page.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.sort_by) query.append('sort_by', params.sort_by);
  if (params.sort_dir) query.append('sort_dir', params.sort_dir);

  return query.toString();
};

export const adminProductService = {
  getProducts: async (params: ProductFilterParams): Promise<{ data: Product[]; last_page: number; total: number }> => {
    const queryString = getQueryParams(params);
    const response = await axiosClient.get(`/admin/products?${queryString}`);
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await axiosClient.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (data: FormData) => {
    const response = await axiosClient.post('/admin/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id: number, data: FormData) => {
    // Note: For FormData with PUT/PATCH, sometimes Laravel/Backends require _method field or POST with _method=PUT
    // Using POST with _method field is safer for FormData
    data.append('_method', 'PUT');
    const response = await axiosClient.post(`/admin/products/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await axiosClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  deleteProductMedia: async (mediaId: number) => {
    const response = await axiosClient.delete(`/admin/products/media/${mediaId}`);
    return response.data;
  },

  bulkDeleteProducts: async (ids: number[]) => {
    const response = await axiosClient.post('/admin/products/bulk-delete', { ids });
    return response.data;
  },

  bulkUpdateStatus: async (ids: number[], status: 'active' | 'inactive') => {
    const response = await axiosClient.post('/admin/products/bulk-status', { ids, status });
    return response.data;
  },
  
  getCategories: async (): Promise<ProductCategory[]> => {
      try {
        // Updated to matching backend route: store/categories
        const response = await axiosClient.get('/store/categories'); 
        // If backend returns empty array, fallback to mocks for development
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
        // If response is successful but data is empty, we might return empty or mock.
        // For now, let's allow empty if it's strictly an array.
        if (Array.isArray(response.data)) return response.data;
        
        throw new Error('Empty categories list');
      } catch (error) {
        console.warn('Using mock categories (Backend API might be missing or empty)');
        return [
          { id: 1, name: 'apparel (t-shirts, hoodies)', slug: 'apparel' },
          { id: 2, name: 'Mugs & Drinkware', slug: 'drinkware' },
          { id: 3, name: 'Pens & Stationery', slug: 'stationery' },
          { id: 4, name: 'Accessories', slug: 'accessories' },
          { id: 5, name: 'Wall Art & Posters', slug: 'wall-art' },
          { id: 6, name: 'Digital Collectibles', slug: 'digital' },
          { id: 7, name: 'Game Items (Coins, Powerups)', slug: 'game-items' },
        ];
      }
  }
};
