import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  X, 
  Package, 
  Gamepad2, 
  Monitor, 
  AlertCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { adminProductService } from '../../../services/adminProductService';
import type { ProductCategory, ProductType } from '../../../types/product';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  
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

  // Media
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Load Categories
    const loadCategories = async () => {
      try {
        const data = await adminProductService.getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (newFiles.length > 0) {
        setImages(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
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
    
    if (!name || !price || !categoryId) {
      alert("Please fill in required fields: Name, Price, and Category.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('name', name);
      formData.append('category_id', categoryId);
      formData.append('price', price);
      if (discountPrice) formData.append('discount_price', discountPrice);
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

      images.forEach((file) => {
        formData.append('images[]', file);
      });

      await adminProductService.createProduct(formData);
      
      // Success
      alert('Product created successfully!');
      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors) {
         // Format validation errors for the alert
         const errorDetails = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
         
         alert(`${errorMessage}\n\nPlease check the following fields:\n${errorDetails}`);
      } else {
         alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
           <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-white mb-2 flex items-center gap-1 text-sm">
             ← Back to Products
           </button>
           <h1 className="text-3xl font-bold text-white font-serif">Create New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Basic Info */}
          <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="text-gold" size={20} /> Basic Information
            </h2>
            
            {/* Product Type Selector */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div 
                onClick={() => setType('physical')}
                className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'physical' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <Package size={24} />
                <span className="font-bold">Physical</span>
              </div>
              <div 
                onClick={() => setType('digital')}
                className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'digital' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <Monitor size={24} />
                <span className="font-bold">Digital</span>
              </div>
              <div 
                onClick={() => setType('game_item')}
                className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === 'game_item' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <Gamepad2 size={24} />
                <span className="font-bold">Game Item</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                  placeholder="e.g. Vintage TVK T-Shirt"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-300 text-sm mb-1">Slug (URL) <span className="text-gray-500 text-xs">(optional)</span></label>
                    <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 text-sm mb-1">Category <span className="text-red-500">*</span></label>
                    <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                    required
                    >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none h-32"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Physical Dimensions (If Physical) */}
          {type === 'physical' && (
            <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="text-blue-400" size={20} /> Dimensions & Weight
              </h2>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-4 flex gap-3 text-blue-300 text-sm">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p>Dimensions and weight are required for accurate shipping calculation. Please measure the packaged product.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Weight (kg) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Length (cm) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Width (cm) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Height (cm) <span className="text-red-500">*</span></label>
                  <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="0.0" />
                </div>
              </div>
              
              <div className="mt-4">
                  <label className="block text-gray-300 text-sm mb-1">Manual Shipping Cost (£)</label>
                  <input type="number" step="0.01" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Leave blank to calculate automatically" />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to calculate based on weight/dimensions at checkout.</p>
              </div>
            </div>
          )}

          {/* Game Item Metadata (If Game Item) */}
          {type === 'game_item' && (
             <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-green-400" size={20} /> Game Item Details
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Item Type</label>
                        <select 
                            value={gameItemType} 
                            onChange={(e) => setGameItemType(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                        >
                            <option value="coins">Coins / Currency</option>
                            <option value="power_up">Power Up</option>
                            <option value="skin">Skin / Cosmetic</option>
                            <option value="weapon">Weapon</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label className="block text-gray-300 text-sm mb-1">Metadata (JSON)</label>
                     <textarea 
                        value={gameItemMetadata}
                        onChange={(e) => setGameItemMetadata(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-white focus:border-green-500 outline-none h-32"
                        placeholder='{"amount": 500, "bonus": 50}'
                     />
                </div>
             </div>
          )}

          {/* Media Upload */}
          <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="text-gold" size={20} /> Media
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                  <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded">Primary</span>
                  )}
                </div>
              ))}
              
              <label 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-gold hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-400 text-center px-2">Click or Drag Images Here</span>
                <input type="file" onChange={handleImageChange} accept="image/*" multiple className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-500">Supported: Max 5MB per image. JPG, PNG, WEBP.</p>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
            {/* Publish & Status */}
            <div className="bg-tvk-dark-card p-6 rounded-lg border border-white/10 sticky top-6">
                <h3 className="font-bold text-white mb-4">Pricing & Inventory</h3>
                
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Price (£) <span className="text-red-500">*</span></label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none font-bold text-lg"
                        placeholder="0.00" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Stored in GBP. Converted at checkout.</p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Discount Price (£)</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none"
                        placeholder="0.00" 
                    />
                     {calculateDiscountPercent() > 0 && (
                        <span className="text-green-400 text-xs mt-1 block">
                            {calculateDiscountPercent()}% Discount
                        </span>
                    )}
                </div>

                <div className="h-px bg-white/10 my-4"></div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-300 text-sm">Stock Quantity</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="track-inv" 
                                checked={trackInventory} 
                                onChange={(e) => setTrackInventory(e.target.checked)} 
                            />
                            <label htmlFor="track-inv" className="text-xs text-gray-400">Track</label>
                        </div>
                    </div>
                    <input 
                        type="number" 
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        disabled={!trackInventory}
                        className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none ${!trackInventory && 'opacity-50'}`}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">SKU</label>
                    <input 
                        type="text" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none font-mono text-sm"
                        placeholder="Auto-generated if blank" 
                    />
                </div>

                <div className="h-px bg-white/10 my-4"></div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={status === 'active'} onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')} className="w-4 h-4 rounded text-gold focus:ring-gold" />
                        <span>Active Product</span>
                    </label>
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded text-gold focus:ring-gold" />
                        <span>Featured Product</span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gold hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><Save size={20} /> Create Product</>
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
