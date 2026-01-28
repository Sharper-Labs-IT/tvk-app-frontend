import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  Filter, 
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminProductService } from '../../../services/adminProductService';
import type { Product, ProductFilterParams, ProductCategory, ProductType } from '../../../types/product';
import Loader from '../../../components/Loader';
import { getFullImageUrl } from '../../../utils/imageUrl';

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
} 

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter State
  const [filters, setFilters] = useState<ProductFilterParams>({
    sort_by: 'created_at',
    sort_dir: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search State (Debounced)
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminProductService.getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };
    loadCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, page, per_page: perPage, search: searchTerm };
      const response = await adminProductService.getProducts(params);
      
      // Assuming response structure (adjust based on actual API response)
      setProducts(response.data || []);
      setTotalPages(response.last_page || 1);
      setTotalItems(response.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, perPage, searchTerm]);

  // Debounced Search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPage(1); // Reset to page 1 on search
      setSearchTerm(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: keyof ProductFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({ sort_by: 'created_at', sort_dir: 'desc' });
    setSearchTerm('');
    // You might want to reset the search input value via ref or managed state if needed
    (document.getElementById('search-input') as HTMLInputElement).value = '';
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Set status to ${status} for ${selectedIds.length} items?`)) return;
    
    try {
      await adminProductService.bulkUpdateStatus(selectedIds, status);
      fetchProducts();
      setSelectedIds([]);
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items? This cannot be undone.`)) return;

    try {
      await adminProductService.bulkDeleteProducts(selectedIds);
      fetchProducts();
      setSelectedIds([]);
    } catch (e) {
      alert('Failed to delete items');
    }
  };

  const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure?")) return;
      try {
          await adminProductService.deleteProduct(id);
          fetchProducts();
      } catch (e) {
          alert("Failed to delete");
      }
  }

  const getTypeColor = (type: ProductType) => {
    switch (type) {
      case 'physical': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'digital': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'game_item': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Product Management</h1>
          <p className="text-gray-400 mt-1">Manage your store products, inventory, and listings.</p>
        </div>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          Create New Product
        </Link>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-tvk-dark-card p-4 rounded-lg border border-white/10 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Left: Search & Filter Toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="search-input"
              type="text"
              placeholder="Search products..."
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-gold focus:outline-none"
              onChange={handleSearchChange}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${showFilters ? 'bg-gold text-black border-gold' : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Right: Bulk Actions & Sort */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-white/5 p-1 rounded-lg">
              <span className="text-sm text-gray-400 px-2">{selectedIds.length} selected</span>
              <button onClick={() => handleBulkStatus('active')} className="p-1.5 hover:bg-green-500/20 text-green-400 rounded" title="Activate">
                <CheckCircle size={18} />
              </button>
              <button onClick={() => handleBulkStatus('inactive')} className="p-1.5 hover:bg-gray-500/20 text-gray-400 rounded" title="Deactivate">
                <XCircle size={18} />
              </button>
              <button onClick={handleBulkDelete} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm whitespace-nowrap">Sort by:</span>
            <select 
              className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              <option value="created_at">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock_quantity">Stock</option>
            </select>
            <button 
              onClick={() => handleFilterChange('sort_dir', filters.sort_dir === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-black/30 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
            >
              {filters.sort_dir === 'asc' ? <ChevronDown className="rotate-180" size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-tvk-dark-card p-4 rounded-lg border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Category</label>
            <select 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
              value={filters.category_id || ''}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Type</label>
            <select 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
              value={filters.type ? filters.type[0] : ''} // basic single select for now, can be improved
              onChange={(e) => handleFilterChange('type', e.target.value ? [e.target.value] : [])}
            >
              <option value="">All Types</option>
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="game_item">Game Item</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Status</label>
            <select 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              <X size={16} /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden shadow-lg">
        {loading ? (
            <div className="p-12"><Loader /></div>
        ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
            <>
            <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase font-medium">
                <tr>
                    <th className="p-4 w-10">
                    <input 
                        type="checkbox" 
                        checked={products.length > 0 && selectedIds.length === products.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-600 bg-black/30 text-gold focus:ring-gold"
                    />
                    </th>
                    <th className="p-4">Product</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-center">Type</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                {products.length === 0 ? (
                    <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                        No products found matching your criteria.
                    </td>
                    </tr>
                ) : (
                    products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                        <input 
                            type="checkbox" 
                            checked={selectedIds.includes(product.id)}
                            onChange={() => handleSelectOne(product.id)}
                            className="rounded border-gray-600 bg-black/30 text-gold focus:ring-gold"
                        />
                        </td>
                        <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-white/10 overflow-hidden flex-shrink-0 relative group">
                                {product.media && product.media.length > 0 ? (
                                    <img 
                                        src={getFullImageUrl(product.media.find(m => m.is_primary)?.url || product.media[0].url)}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            console.error('Image Load Failed:', img.src);
                                            img.style.display = 'none';
                                            const fallback = img.parentElement?.querySelector('.fallback-icon');
                                            if (fallback) {
                                                fallback.classList.remove('hidden');
                                                fallback.classList.add('flex');
                                            }
                                        }}
                                        alt={product.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Package size={20} />
                                    </div>
                                )}
                                {/* Fallback icon hidden by default, shown on error or if no image */}
                                <div className="fallback-icon hidden absolute inset-0 items-center justify-center bg-white/10 text-gray-600">
                                     <Package size={20} />
                                </div>
                            </div>
                            <div>
                            <Link to={`/admin/products/edit/${product.id}`} className="font-medium text-white hover:text-gold transition-colors block">
                                {product.name}
                            </Link>
                            <span className="text-xs text-gray-500">
                                {product.variants && product.variants.length > 0 ? `${product.variants.length} Variants` : 'No Variants'}
                            </span>
                            </div>
                        </div>
                        </td>
                        <td className="p-4 text-gray-400 font-mono text-xs">{product.sku}</td>
                        <td className="p-4 text-gray-300">{product.category?.name || '-'}</td>
                        <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs border ${getTypeColor(product.type)}`}>
                            {product.type.replace('_', ' ')}
                        </span>
                        </td>
                        <td className="p-4">
                        <div className="flex flex-col">
                            {product.discount_price ? (
                            <>
                                <span className="text-red-400 font-bold">£{Number(product.discount_price).toFixed(2)}</span>
                                <span className="text-gray-500 line-through text-xs">£{Number(product.price).toFixed(2)}</span>
                            </>
                            ) : (
                            <span className="text-white font-bold">£{Number(product.price).toFixed(2)}</span>
                            )}
                        </div>
                        </td>
                        <td className="p-4 text-center">
                            {product.track_inventory ? (
                                <span className={`${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {product.stock_quantity}
                                </span>
                            ) : (
                                <span className='text-xl'>∞</span>
                            )}
                        </td>
                        <td className="p-4 text-center">
                        <button 
                            className={`w-10 h-5 rounded-full relative transition-colors ${product.status === 'active' ? 'bg-green-500' : 'bg-gray-600'}`}
                            // OnClick to toggle would go here
                        >
                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${product.status === 'active' ? 'left-6' : 'left-1'}`} />
                        </button>
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link to={`/admin/products/view/${product.id}`} className="p-1.5 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors">
                            <Eye size={16} />
                            </Link>
                            <Link to={`/admin/products/edit/${product.id}`} className="p-1.5 hover:text-gold hover:bg-yellow-400/10 rounded transition-colors">
                            <Edit size={16} />
                            </Link>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                            <Trash2 size={16} />
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                Showing <span className="text-white font-bold">{Math.min((page - 1) * perPage + 1, totalItems)}</span> to <span className="text-white font-bold">{Math.min(page * perPage, totalItems)}</span> of <span className="text-white font-bold">{totalItems}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                <div className="flex items-center mr-4">
                    <span className="text-sm text-gray-400 mr-2">Rows per page:</span>
                    <select 
                    value={perPage} 
                    onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                    }}
                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-gold outline-none"
                    >
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded disabled:opacity-30 disabled:hover:bg-transparent hover:bg-white/10 text-white transition-colors"
                    >
                    <ChevronLeft size={20} />
                    </button>
                    {/* Simple page indication for now */}
                    <span className="px-3 text-white font-medium">{page} / {totalPages}</span>
                    <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded disabled:opacity-30 disabled:hover:bg-transparent hover:bg-white/10 text-white transition-colors"
                    >
                    <ChevronRight size={20} />
                    </button>
                </div>
                </div>
            </div>
            </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
