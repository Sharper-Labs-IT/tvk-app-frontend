import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, 
  X, 
  Package, 
  Gamepad2, 
  Monitor, 
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { adminProductService } from '../../../services/adminProductService';
import type { ProductCategory, ProductType, ProductMedia } from '../../../types/product';
import Loader from '../../../components/Loader';

import { getFullImageUrl } from '../../../utils/imageUrl';

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [existingMedia, setExistingMedia] = useState<ProductMedia[]>([]);

  // Form State
  const [type, setType] = useState<ProductType>('physical');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [trackInventory, setTrackInventory] = useState(true);
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'active'|'inactive'>('active');
  const [isFeatured, setIsFeatured] = useState(false);

  // Physical Attributes
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [shippingCost, setShippingCost] = useState('');

  // Game Item Attributes
  const [gameItemType, setGameItemType] = useState('coins');
  const [gameItemMetadata, setGameItemMetadata] = useState('{}');

  // New Media Uploads
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  // Store initial values for comparison/revert (simplified)
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            setInitialLoading(true);
            const [cats, prod] = await Promise.all([
                adminProductService.getCategories(),
                adminProductService.getProduct(Number(id))
            ]);
            
            setCategories(cats);
            
            // Hydrate Form
            if (prod) {
                setType(prod.type);
                setName(prod.name);
                setSlug(prod.slug);
                setCategoryId(prod.category_id.toString());
                setDescription(prod.description || '');
                setPrice(prod.price.toString());
                setDiscountPrice(prod.discount_price?.toString() || '');
                setStock(prod.stock_quantity.toString());
                setTrackInventory(prod.track_inventory);
                setSku(prod.sku);
                setStatus(prod.status);
                setIsFeatured(prod.is_featured);
                setExistingMedia(prod.media || []);

                if (prod.type === 'physical') {
                    setWeight(prod.weight?.toString() || '');
                    setLength(prod.dimensions?.length.toString() || '');
                    setWidth(prod.dimensions?.width.toString() || '');
                    setHeight(prod.dimensions?.height.toString() || '');
                    setShippingCost(prod.shipping_cost?.toString() || '');
                }

                if (prod.type === 'game_item' && prod.game_item_metadata) {
                    setGameItemType(prod.game_item_metadata.game_item_type);
                    // Extract other metadata back to JSON string or fields
                    const { game_item_type, ...rest } = prod.game_item_metadata;
                    setGameItemMetadata(JSON.stringify(rest, null, 2));
                }
                
                setInitialData(prod);
            }
        } catch (e) {
            console.error("Failed to load product data", e);
            alert("Failed to load product data");
            navigate('/admin/products');
        } finally {
            setInitialLoading(false);
        }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingMedia = async (mediaId: number) => {
      if (!window.confirm("Delete this image permanently?")) return;
      try {
          await adminProductService.deleteProductMedia(mediaId);
          setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
      } catch (e) {
          alert('Failed to delete image');
      }
  };

  const calculateDiscountPercent = () => {
    if (!price || !discountPrice) return 0;
    const p = parseFloat(price);
    const d = parseFloat(discountPrice);
    if (p <= 0) return 0;
    return Math.round(((p - d) / p) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Already handled in service but good for clarity
      
      formData.append('type', type);
      formData.append('name', name);
      formData.append('category_id', categoryId);
      formData.append('price', price);
      if (discountPrice) formData.append('discount_price', discountPrice);
      else formData.append('discount_price', ''); // Send empty to clear if needed, check backend logic
      
      formData.append('stock_quantity', stock);
      formData.append('track_inventory', trackInventory ? '1' : '0');
      formData.append('status', status);
      if (slug) formData.append('slug', slug);
      if (sku) formData.append('sku', sku);
      if (description) formData.append('description', description);
      formData.append('is_featured', isFeatured ? '1' : '0');

      if (type === 'physical') {
        formData.append('weight', weight);
        formData.append('length', length);
        formData.append('width', width);
        formData.append('height', height);
        if (shippingCost) formData.append('shipping_cost', shippingCost);
      }

      if (type === 'game_item') {
        formData.append('game_item_metadata', JSON.stringify({
            type: gameItemType,
            ...JSON.parse(gameItemMetadata || '{}')
        }));
      }

      // Add NEW images only
      newImages.forEach((file) => {
        formData.append('images[]', file);
      });

      await adminProductService.updateProduct(Number(id), formData);
      
      // Success
      alert('Product updated successfully!');
      // Refresh current page or go back? User asked for options. For now, refresh via reload or fetch.
      // Easiest is to reload to get fresh data including new images
      window.location.reload(); 
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
           <Link to="/admin/products" className="text-gray-400 hover:text-white mb-2 flex items-center gap-1 text-sm">
             <ArrowLeft size={16} /> Back to Products
           </Link>
           <h1 className="text-3xl font-bold text-white font-serif">Edit Product: {initialData?.name}</h1>
        </div>
        <div className="flex gap-2">
            <Link to={`/admin/products/view/${id}`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold">
                View Details
            </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="text-gold" size={20} /> Basic Information
            </h2>
            
            {/* Warning if type changed from original */}
            {initialData && initialData.type !== type && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded mb-4 text-yellow-500 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5" />
                    <div>
                        <strong>Warning: Changing Product Type</strong><br/>
                        Changing from {initialData.type} to {type} may cause data loss for type-specific fields (dimensions, game metadata).
                    </div>
                </div>
            )}
            
            {/* Type Selector (same as create) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div onClick={() => setType('physical')} className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'physical' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                <Package size={24} /> <span className="font-bold">Physical</span>
              </div>
              <div onClick={() => setType('digital')} className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'digital' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                <Monitor size={24} /> <span className="font-bold">Digital</span>
              </div>
              <div onClick={() => setType('game_item')} className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'game_item' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                <Gamepad2 size={24} /> <span className="font-bold">Game Item</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-300 text-sm mb-1">Slug (URL)</label>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm mb-1">Category <span className="text-red-500">*</span></label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" required>
                    <option value="">Select Category</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none h-32" />
              </div>
            </div>
          </div>

          {/* Physical Dimensions */}
          {type === 'physical' && (
            <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="text-blue-400" size={20} /> Dimensions & Weight
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-gray-300 text-sm mb-1">Weight (kg)</label><input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>
                <div><label className="block text-gray-300 text-sm mb-1">Length (cm)</label><input type="number" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>
                <div><label className="block text-gray-300 text-sm mb-1">Width (cm)</label><input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>
                <div><label className="block text-gray-300 text-sm mb-1">Height (cm)</label><input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>
              </div>
            </div>
          )}

          {/* Game Metadata */}
          {type === 'game_item' && (
             <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-green-400" size={20} /> Game Item Details
                </h2>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Item Type</label>
                    <select value={gameItemType} onChange={(e) => setGameItemType(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 outline-none">
                        <option value="coins">Coins</option>
                        <option value="power_up">Power Up</option>
                        <option value="skin">Skin</option>
                        <option value="weapon">Weapon</option>
                    </select>
                </div>
                <div>
                     <label className="block text-gray-300 text-sm mb-1">Metadata (JSON)</label>
                     <textarea value={gameItemMetadata} onChange={(e) => setGameItemMetadata(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-white focus:border-green-500 outline-none h-32" />
                </div>
             </div>
          )}

          {/* Media Manager */}
          <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="text-gold" size={20} /> Media Management
            </h2>
            
            {/* Existing Media */}
            {existingMedia.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Current Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingMedia.map((media) => (
                             <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                                <img 
                                    src={getFullImageUrl(media.url)} 
                                    referrerPolicy="no-referrer"
                                    alt="product" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                         console.error('Edit Page Image Error:', (e.target as HTMLImageElement).src);
                                         (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Error';
                                    }}
                                />
                                {media.is_primary && <span className="absolute top-1 left-1 bg-gold text-black text-xs px-1 rounded">Primary</span>}
                                <button type="button" onClick={() => media.id && handleDeleteExistingMedia(media.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Image">
                                    <Trash2 size={14} />
                                </button>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Uploads */}
            <div>
                 <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Add New Images</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newImagePreviews.map((src, index) => (
                         <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                             <img src={src} alt="new preview" className="w-full h-full object-cover opacity-80" />
                             <span className="absolute bottom-1 right-1 text-green-400 text-xs font-bold bg-black/50 px-1 rounded">NEW</span>
                             <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={14} /></button>
                         </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-gold hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-colors">
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400">Upload</span>
                        <input type="file" onChange={handleNewImageChange} accept="image/*" multiple className="hidden" />
                    </label>
                 </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10 sticky top-6">
                <h3 className="font-bold text-white mb-4">Pricing & Inventory</h3>
                
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Price (£)</label>
                    <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none font-bold text-lg" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Discount Price (£)</label>
                    <input type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" />
                     {calculateDiscountPercent() > 0 && (
                        <span className="text-green-400 text-xs mt-1 block">{calculateDiscountPercent()}% Discount</span>
                    )}
                </div>

                <div className="h-px bg-white/10 my-4"></div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-300 text-sm">Stock Quantity</label>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="track-inv" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} />
                            <label htmlFor="track-inv" className="text-xs text-gray-400">Track</label>
                        </div>
                    </div>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} disabled={!trackInventory} className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none ${!trackInventory && 'opacity-50'}`} />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">SKU</label>
                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none font-mono text-sm" />
                </div>

                <div className="h-px bg-white/10 my-4"></div>

                <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={status === 'active'} onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')} className="w-4 h-4 rounded text-gold focus:ring-gold" />
                        <span>Active Product</span>
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded text-gold focus:ring-gold" />
                        <span>Featured Product</span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full bg-gold hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Update Product</>}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
