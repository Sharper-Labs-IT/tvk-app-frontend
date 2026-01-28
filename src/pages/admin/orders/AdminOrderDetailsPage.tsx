import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, User, Mail, Phone, MapPin, CreditCard, 
    Calendar, Truck, CheckCircle, Printer 
} from 'lucide-react';
import { adminOrderService } from '../../../services/adminOrderService';
import type { AdminOrder } from '../../../services/adminOrderService';
import Loader from '../../../components/Loader';
import { getFullImageUrl } from '../../../utils/imageUrl';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        case 'processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
        case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
        case 'refunded': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        default: return 'text-white bg-white/10 border-white/10';
    }
};

const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<AdminOrder | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Status Update State
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    
    // Shipping Update State
    const [shippingForm, setShippingForm] = useState({
        carrier: '',
        tracking_number: '',
        tracking_url: '',
        status: 'preparing',
        shipped_at: new Date().toISOString().split('T')[0],
        estimated_delivery: ''
    });

    const fetchOrder = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await adminOrderService.getOrder(id);
            setOrder(data);
            if (data.tracking_number) {
                 setShippingForm(prev => ({
                     ...prev,
                     carrier: 'Carrier info hidden', // In real app, store carrier separately
                     tracking_number: data.tracking_number || '',
                     status: data.status === 'shipped' ? 'in_transit' : 'preparing'
                 }));
            }
        } catch (error) {
            toast.error('Failed to load order detailed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order || !window.confirm(`Change status to ${newStatus}?`)) return;
        
        setStatusLoading(true);
        try {
            await adminOrderService.updateStatus(order.id, newStatus, statusNote, true);
            toast.success(`Order updated to ${newStatus}`);
            fetchOrder();
            setStatusNote('');
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleShippingUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        try {
            await adminOrderService.updateShipping(order.id, shippingForm);
            toast.success('Shipping information updated');
            fetchOrder();
        } catch (error) {
            toast.error('Failed to update shipping');
        }
    };

    if (loading) return <Loader />;
    if (!order) return <div className="text-center p-10 text-white">Order not found</div>;

    const hasPhysicalItems = order.items.some(item => item.product.type === 'physical');

    return (
        <div className="pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/orders" className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-mono text-brand-gold">#{order.order_number}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <Calendar size={14} /> 
                            {new Date(order.created_at).toLocaleString()}
                             <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ml-2 ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded text-white" title="Print Invoice">
                        <Printer size={20} />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded text-white" title="Email Customer">
                        <Mail size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column - Details (3/5) */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Customer Card */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                         <h3 className="text-lg font-bold text-white mb-4">Customer Details</h3>
                         <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-brand-gold">
                                 <User size={24} />
                             </div>
                             <div>
                                 <div className="font-bold text-white text-lg">{order.user?.name || 'Guest User'}</div>
                                 <div className="flex flex-col gap-1 mt-2 text-sm text-gray-400">
                                     <a href={`mailto:${order.user?.email}`} className="flex items-center gap-2 hover:text-brand-gold">
                                         <Mail size={14} /> {order.user?.email}
                                     </a>
                                     {order.user?.mobile && (
                                         <span className="flex items-center gap-2">
                                             <Phone size={14} /> {order.user.mobile}
                                         </span>
                                     )}
                                 </div>
                             </div>
                         </div>
                    </div>
                    
                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-brand-gold" /> Shipping Address
                            </h3>
                            <div className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">
                                {order.shipping_address ? JSON.stringify(order.shipping_address, null, 2) : 'No shipping address provided'}
                            </div>
                        </div>
                        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-brand-gold" /> Billing Address
                            </h3>
                            <div className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">
                                {order.billing_address ? JSON.stringify(order.billing_address, null, 2) : 'Same as shipping address'}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Order Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="p-4">Product</th>
                                        <th className="p-4">SKU</th>
                                        <th className="p-4 text-center">Qty</th>
                                        <th className="p-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={getFullImageUrl(item.product.media?.[0]?.url)} 
                                                        className="w-10 h-10 object-cover rounded bg-black" 
                                                        alt=""
                                                    />
                                                    <div>
                                                        <div className="text-white font-medium">{item.product_name}</div>
                                                        {item.variant && (
                                                            <div className="text-xs text-gray-500">
                                                                {item.variant.attributes?.color} / {item.variant.attributes?.size}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400 font-mono">{item.product.sku}</td>
                                            <td className="p-4 text-center text-white">{item.quantity}</td>
                                            <td className="p-4 text-right font-mono text-white">£{Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/[0.02]">
                                    <tr>
                                        <td colSpan={3} className="p-4 text-right text-gray-400">Subtotal</td>
                                        <td className="p-4 text-right font-mono text-white">£{Number(order.total_amount).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="p-4 text-right text-brand-gold font-bold text-lg">Total</td>
                                        <td className="p-4 text-right font-mono text-brand-gold font-bold text-lg">£{Number(order.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions (2/5) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Status Management */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Update Status</h3>
                        <div className="space-y-4">
                            <select 
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={statusLoading}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <textarea 
                                placeholder="Add a note (optional)..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-24 resize-none"
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CheckCircle size={12} className="text-green-500" /> Customer will be notified via email.
                            </p>
                        </div>
                    </div>

                    {/* Shipping Management - Only if physical */}
                    {hasPhysicalItems && (
                        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-brand-gold" /> Shipping Details
                            </h3>
                            <form onSubmit={handleShippingUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Carrier</label>
                                    <select 
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                                        value={shippingForm.carrier}
                                        onChange={(e) => setShippingForm({...shippingForm, carrier: e.target.value})}
                                    >
                                        <option value="">Select Carrier</option>
                                        <option value="DHL">DHL</option>
                                        <option value="FedEx">FedEx</option>
                                        <option value="UPS">UPS</option>
                                        <option value="Royal Mail">Royal Mail</option>
                                        <option value="DPD">DPD</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Tracking Number</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                                            value={shippingForm.tracking_number}
                                            onChange={(e) => setShippingForm({...shippingForm, tracking_number: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Est. Delivery</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white"
                                            value={shippingForm.estimated_delivery}
                                            onChange={(e) => setShippingForm({...shippingForm, estimated_delivery: e.target.value})}
                                        />
                                     </div>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-white text-black font-bold uppercase py-3 rounded-lg hover:bg-brand-gold transition-colors"
                                >
                                    Update Shipping
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Admin Notes / Timeline Placeholder */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                             {order.timeline?.map((event) => (
                                 <div key={event.id} className="relative pl-8">
                                     <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#222] border-2 border-brand-gold z-10" />
                                     <div className="text-sm font-bold text-white">{event.status}</div>
                                     <div className="text-xs text-gray-400">{event.description}</div>
                                     <div className="text-[10px] text-gray-600 mt-1">
                                         {new Date(event.created_at).toLocaleString()} by {event.user_name}
                                     </div>
                                 </div>
                             )) || (
                                <div className="text-sm text-gray-500 pl-8 italic">No timeline events events.</div>
                             )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;
