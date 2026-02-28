import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Clock,
  Tag,
  Monitor,
  Gamepad2,
  Box,
  Truck,
  AlertCircle
} from 'lucide-react';
import { adminProductService } from '../../../services/adminProductService';
import type { Product } from '../../../types/product';
import Loader from '../../../components/Loader';

import { getFullImageUrl } from '../../../utils/imageUrl';

const ViewProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await adminProductService.getProduct(Number(id));
          setProduct(data);
        }
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) return;

    try {
      await adminProductService.deleteProduct(product.id);
      navigate('/admin/products');
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <div className="p-8 text-center bg-tvk-dark-card rounded-lg border border-white/10">
        <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
        <h3 className="text-xl text-white font-bold mb-2">Error Loading Product</h3>
        <p className="text-gray-400 mb-4">{error || 'Product not found.'}</p>
        <Link to="/admin/products" className="text-gold hover:underline">Return to Products</Link>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return <Box className="text-blue-400" size={20} />;
      case 'digital': return <Monitor className="text-purple-400" size={20} />;
      case 'game_item': return <Gamepad2 className="text-green-400" size={20} />;
      default: return <Package className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link to="/admin/products" className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">{product.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm">
                <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${getStatusColor(product.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                    {(product.status || 'inactive').toUpperCase()}
                </span>
                <span className="text-gray-500">SKU: <span className="text-gray-300 font-mono">{product.sku}</span></span>
                <span className="text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> Created: {new Date(product.created_at).toLocaleDateString()}
                </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Link 
            to={`/admin/products/edit/${product.id}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-colors"
           >
             <Edit size={18} /> Edit
           </Link>
           <button 
             onClick={handleDelete}
             className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold transition-colors"
           >
             <Trash2 size={18} /> Delete
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
           {/* Media Gallery */}
           <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden">
             <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Media Gallery</h3>
             </div>
             <div className="p-4">
                 {product.media && product.media.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {product.media.map((media, idx) => (
                             <div key={media.id || idx} className="aspect-square bg-black rounded-lg overflow-hidden border border-white/10 relative group">
                                 {media.type === 'video' ? (
                                     <video src={getFullImageUrl(media.url)} className="w-full h-full object-cover" />
                                 ) : (
                                     <img 
                                         src={getFullImageUrl(media.url)} 
                                         referrerPolicy="no-referrer"
                                         alt={media.alt_text || 'Product Image'} 
                                         className="w-full h-full object-cover"
                                         onError={(e) => {
                                             console.error('View Page Image Error:', (e.target as HTMLImageElement).src);
                                             (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Error'; // Fallback
                                         }}
                                     />
                                 )}
                                 {media.is_primary && (
                                     <span className="absolute top-2 left-2 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                         Primary
                                     </span>
                                 )}
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                         <div className="bg-white/5 p-4 rounded-full mb-3">
                             <Package size={32} />
                         </div>
                         No media uploaded for this product.
                     </div>
                 )}
             </div>
           </div>

           {/* Description */}
           <div className="bg-tvk-dark-card rounded-lg border border-white/10 p-6">
               <h3 className="text-lg font-bold text-white mb-4">Description</h3>
               <div className="prose prose-invert max-w-none text-gray-300">
                   {product.description || <span className="text-gray-500 italic">No description provided.</span>}
               </div>
           </div>

           {/* Variants Table (if any) */}
           {product.variants && product.variants.length > 0 && (
               <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden">
                   <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                       <h3 className="font-bold text-white">Variants ({product.variants.length})</h3>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm">
                           <thead className="text-gray-400 border-b border-white/10 bg-white/5">
                               <tr>
                                   <th className="p-3">Variant Name</th>
                                   <th className="p-3">Attributes</th>
                                   <th className="p-3">SKU</th>
                                   <th className="p-3 text-right">Price Adj.</th>
                                   <th className="p-3 text-center">Stock</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-white/10 text-gray-300">
                               {product.variants.map((variant) => (
                                   <tr key={variant.id} className="hover:bg-white/5">
                                       <td className="p-3 font-medium text-white">{variant.name}</td>
                                       <td className="p-3">
                                           {Object.entries(variant.attributes).map(([key, val]) => (
                                               <span key={key} className="inline-block bg-white/10 rounded px-1.5 py-0.5 text-xs mr-2">
                                                   {key}: {val}
                                               </span>
                                           ))}
                                       </td>
                                       <td className="p-3 font-mono text-xs text-gray-400">{variant.sku || '-'}</td>
                                       <td className="p-3 text-right">
                                           {variant.price_adjustment ? (
                                               <span className={variant.price_adjustment > 0 ? 'text-green-400' : 'text-red-400'}>
                                                   {variant.price_adjustment > 0 ? '+' : ''}£{variant.price_adjustment}
                                               </span>
                                           ) : '-'}
                                       </td>
                                       <td className="p-3 text-center">{variant.stock_quantity}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}
        </div>

        {/* Sidebar Info (Right Col) */}
        <div className="space-y-6">
            {/* Price & Stock */}
            <div className="bg-tvk-dark-card rounded-lg border border-white/10 p-6">
                <div className="flex items-baseline justify-between mb-4">
                    <span className="text-gray-400">Price</span>
                    <div className="text-right">
                         {product.discount_price ? (
                             <>
                                 <span className="block text-2xl font-bold text-gold">£{Number(product.discount_price).toFixed(2)}</span>
                                 <span className="text-sm text-gray-500 line-through">£{Number(product.price).toFixed(2)}</span>
                             </>
                         ) : (
                             <span className="text-2xl font-bold text-white">£{Number(product.price).toFixed(2)}</span>
                         )}
                    </div>
                </div>
                
                <div className="h-px bg-white/10 my-4" />

                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Stock Status</span>
                    <span className={`font-bold ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.track_inventory ? `${product.stock_quantity} in stock` : 'Unlimited'}
                    </span>
                </div>
            </div>

            {/* Product Details */}
            <div className="bg-tvk-dark-card rounded-lg border border-white/10 p-6 space-y-4">
                <h3 className="font-bold text-white mb-2">Additional Details</h3>
                
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2"><Tag size={16} /> Category</span>
                    <span className="text-white">{product.category?.name || 'Uncategorized'}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                        {getTypeIcon(product.type)} Type
                    </span>
                    <span className="text-white capitalize">{product.type.replace('_', ' ')}</span>
                </div>

                {product.type === 'physical' && product.weight && (
                    <>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 flex items-center gap-2"><Box size={16} /> Weight</span>
                       <span className="text-white">{product.weight} kg</span>
                    </div>
                    {product.dimensions && (
                        <div className="flex justify-between items-start">
                             <span className="text-gray-400 flex items-center gap-2 mt-1"><Truck size={16} /> Dims</span>
                             <span className="text-white text-right">
                                 {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                             </span>
                        </div>
                    )}
                    </>
                )}

                 {product.type === 'game_item' && product.game_item_metadata && (
                    <>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-green-400">Item Type</span>
                            <span className="text-white capitalize">{product.game_item_metadata.game_item_type}</span>
                        </div>
                        {product.game_item_metadata.coins_amount && (
                            <div className="flex justify-between">
                                <span className="text-green-400">Coins</span>
                                <span className="text-white">{product.game_item_metadata.coins_amount}</span>
                            </div>
                        )}
                    </div>
                    </>
                )}
            </div>

            {/* Quick Stats (Placeholder) */}
            <div className="bg-tvk-dark-card rounded-lg border border-white/10 p-6">
                <h3 className="font-bold text-white mb-4">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                         <span className="block text-2xl font-bold text-white">0</span>
                         <span className="text-xs text-gray-500 uppercase">Sold</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                         <span className="block text-2xl font-bold text-gold">£0</span>
                         <span className="text-xs text-gray-500 uppercase">Revenue</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductPage;
