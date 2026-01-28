import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, RotateCcw, 
  CheckCircle, Truck 
} from 'lucide-react';
import { orderService } from '../services/orderService';
import type { Order } from '../services/orderService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getFullImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchOrder();
        else navigate('/orders');
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await orderService.getOrder(id!);
            setOrder(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load order details");
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !order) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading mission data...</div>;
    }

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(order.status) === -1 ? (order.status === 'cancelled' ? -1 : 0) : steps.indexOf(order.status);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-brand-gold/30">
            <Header />
            
            <main className="container mx-auto px-4 pt-32 pb-24">
                <button 
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 font-bold uppercase tracking-wider text-xs"
                >
                    <ChevronLeft size={16} /> Back to Orders
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Order Header */}
                        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-zentry font-black uppercase text-white mb-2">
                                        Order #{order.order_number}
                                    </h1>
                                    <p className="text-neutral-500 text-sm font-mono">
                                        Placed on {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {order.status !== 'cancelled' ? (
                                    <button className="text-sm font-bold text-brand-gold border border-brand-gold/20 bg-brand-gold/5 px-4 py-2 rounded-lg hover:bg-brand-gold/10 transition-colors">
                                        Download Invoice
                                    </button>
                                ) : (
                                    <span className="text-red-400 font-bold uppercase border border-red-400/20 bg-red-400/5 px-4 py-2 rounded-lg">Cancelled</span>
                                )}
                            </div>

                            {/* Timeline */}
                            {order.status !== 'cancelled' && order.status !== 'refunded' && (
                                <div className="relative flex justify-between pt-4 pb-8">
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-7 left-0 w-full h-1 bg-white/10 rounded-full" />
                                    {/* Progress Bar Active */}
                                    <div 
                                        className="absolute top-7 left-0 h-1 bg-brand-gold rounded-full transition-all duration-500" 
                                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
                                    />
                                    
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx <= currentStepIndex;
                                        return (
                                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                                    isCompleted ? 'bg-brand-gold border-brand-gold text-black' : 'bg-[#0F0F0F] border-white/20 text-transparent'
                                                }`}>
                                                    <CheckCircle size={14} />
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isCompleted ? 'text-white' : 'text-neutral-600'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 font-zentry font-bold text-lg">Order Items</div>
                            <div className="divide-y divide-white/5">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex gap-4 md:items-center">
                                        <div className="w-20 h-24 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                                src={getFullImageUrl(item.product?.media?.[0]?.url || '')} 
                                                alt={item.product_name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-bold text-white mb-1">{item.product_name}</h3>
                                                {item.variant && (
                                                    <p className="text-sm text-brand-gold font-mono">
                                                        {item.variant.attributes?.color} / {item.variant.attributes?.size}
                                                    </p>
                                                )}
                                                <p className="text-sm text-neutral-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right flex flex-col justify-center">
                                                <span className="font-mono font-bold text-white">£{Number(item.price).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 space-y-6">
                        {/* Summary */}
                        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 sticky top-24">
                            <h3 className="font-zentry font-bold text-lg mb-4">Summary</h3>
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-mono">£{Number(order.total_amount).toFixed(2)}</span> 
                                    {/* Simplification: Assuming total is mostly subtotal + shipping in logic */}
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className="text-white font-mono">Calculated</span>
                                </div>
                                <div className="border-t border-white/10 my-2" />
                                <div className="flex justify-between text-lg font-black uppercase text-white">
                                    <span>Total</span>
                                    <span className="text-brand-gold font-mono">£{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            {order.shipping_address && (
                                <div className="border-t border-white/10 pt-4 mb-6">
                                    <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase mb-2">
                                        <MapPin size={14} /> Shipping Address
                                    </div>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        {order.shipping_address.line1}<br />
                                        {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                                        {order.shipping_address.country}
                                    </p>
                                </div>
                            )}

                             {/* Carrier Info */}
                             {order.tracking_number && (
                                <div className="border-t border-white/10 pt-4 mb-6">
                                    <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase mb-2">
                                        <Truck size={14} /> Tracking
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                        Carrier: {order.carrier}<br />
                                        <span className="font-mono select-all bg-white/5 px-2 py-1 rounded mt-1 inline-block text-white">
                                            {order.tracking_number}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {order.status === 'delivered' && (
                                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-neutral-400 font-bold uppercase text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                                    <RotateCcw size={14} /> Request Refund
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderDetails;
