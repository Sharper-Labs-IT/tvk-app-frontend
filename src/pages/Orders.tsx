import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

import { orderService } from '../services/orderService';
import type { Order } from '../services/orderService';

// Local implementation of useDebounce since the hook file is missing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    // Search & Filter
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearch = useDebounce(search, 500); // Wait 500ms before searching
    
    // Status color mapping
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
            processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
            shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
            delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
            cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
            refunded: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
        };
        return colors[status] || 'text-white bg-white/10';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5" />;
            case 'processing': return <Package className="w-5 h-5" />;
            case 'shipped': return <TruckIcon className="w-5 h-5" />;
            case 'delivered': return <CheckCircle className="w-5 h-5" />;
            case 'cancelled': return <XCircle className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    useEffect(() => {
        // Reset page to 1 when search or filter changes
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [page, debouncedSearch, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getOrders(page, {
                search: debouncedSearch,
                status: statusFilter
            });
            setOrders(prev => page === 1 ? data.data : [...prev, ...data.data]);
            setHasMore(page < data.last_page);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-gold/30">
            <Header />
            
            <main className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Package size={32} className="text-brand-gold" />
                    <h1 className="text-4xl font-zentry font-black uppercase tracking-wide text-white">
                        My Orders
                    </h1>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="relative flex-grow md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Order #..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <Filter size={18} className="text-white/50 hidden md:block" />
                        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                    statusFilter === status 
                                        ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {status === '' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && page === 1 ? (
                    <div className="space-y-4">
                         {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 hover:border-brand-gold/30 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-lg font-bold text-white tracking-widest font-mono">#{order.order_number}</span>
                                            <span className={`flex items-center gap-1 text-xs font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-neutral-500 font-mono">
                                             {new Date(order.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                             })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white font-mono">
                                            £{Number(order.total_amount).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-neutral-500">
                                            {order.items_count} Item{order.items_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                     <div className="flex text-sm text-neutral-400">
                                        Click to view details
                                     </div>
                                    <div className="flex items-center gap-2 text-brand-gold text-sm font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                        View Details <ChevronRight size={14} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        
                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <button 
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 transition-colors"
                                >
                                    Load More Orders
                                </button>
                            </div>
                        )}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
                        <div className="bg-white/5 p-6 rounded-full mb-6">
                            <Package size={40} className="text-white/20" />
                        </div>
                        <h3 className="text-2xl font-zentry font-bold text-white mb-2">NO ORDERS YET</h3>
                        <p className="text-neutral-500 mb-8">Your mission log is empty.</p>
                        <button 
                            onClick={() => navigate('/store')}
                            className="px-8 py-3 bg-brand-gold text-black font-black uppercase rounded-full hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <span className="font-bold">Visit Store</span>
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Orders;
