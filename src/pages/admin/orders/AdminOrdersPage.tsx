import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, Download, ShoppingBag, Truck,  
    AlertCircle, RefreshCw
} from 'lucide-react';
import { adminOrderService } from '../../../services/adminOrderService';
import type { AdminOrder, OrderStats } from '../../../services/adminOrderService';
import Loader from '../../../components/Loader';
import { debounce } from '../../../utils/debounce';

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

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        per_page: 15,
        sort_by: 'created_at',
        sort_dir: 'desc' as 'asc' | 'desc'
    });
    const [total, setTotal] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersData, statsData] = await Promise.all([
                adminOrderService.getOrders(filters),
                adminOrderService.getStats()
            ]);
            // Handle pagination wrapper if exists, or direct array
            if (ordersData.data) {
                setOrders(ordersData.data);
                setTotal(ordersData.total);
            } else {
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            }
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setFilters(prev => ({ ...prev, search: value, page: 1 }));
        }, 500),
        []
    );

    useEffect(() => {
        fetchData();
    }, [filters.page, filters.per_page, filters.status, filters.sort_by, filters.sort_dir, filters.search]);


    const handleSort = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sort_by: field,
            sort_dir: prev.sort_by === field && prev.sort_dir === 'desc' ? 'asc' : 'desc'
        }));
    };

    if (loading && !orders.length) return <Loader />;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-zentry uppercase">Orders</h1>
                    <p className="text-gray-400">Manage customer orders and shipments</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                        <RefreshCw size={20} />
                    </button>
                    <button className="flex items-center gap-2 bg-brand-gold text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Today's Orders</span>
                            <ShoppingBag className="text-brand-gold" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.total_orders_today}</div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Pending Action</span>
                            <AlertCircle className="text-orange-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.pending_orders}</div>
                    </div>
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Total Revenue</span>
                            <span className="text-green-400 font-mono font-bold">£</span>
                        </div>
                        <div className="text-2xl font-bold text-white">£{stats.revenue_today.toFixed(2)}</div>
                        <span className="text-xs text-gray-500">Today</span>
                    </div>
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Shipped Today</span>
                            <Truck className="text-purple-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.shipped_today}</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search order #, email, customer..." 
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-gold/50"
                        onChange={(e) => debouncedSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white" onClick={() => handleSort('order_number')}>
                                    Order ID
                                </th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Customer</th>
                                <th className="p-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>
                                    Date
                                </th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Status</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Items</th>
                                <th className="p-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white" onClick={() => handleSort('total_amount')}>
                                    Total
                                </th>
                                <th className="p-4 text-gray-400 font-medium text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 font-mono text-brand-gold font-bold">
                                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                                            #{order.order_number}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                        <div className="text-xs text-gray-600">{new Date(order.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {order.items_count} items
                                    </td>
                                    <td className="p-4 font-mono font-bold text-white">
                                        £{Number(order.total_amount).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link 
                                            to={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-500">
                                        No orders found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* Pagination (Simple) */}
            <div className="flex justify-between items-center text-sm text-gray-400">
                <div>Showing {orders.length} of {total} orders</div>
                <div className="flex gap-2">
                    <button 
                        disabled={filters.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="px-3 py-1 bg-[#111] border border-white/10 rounded disabled:opacity-50 hover:bg-white/5"
                    >
                        Previous
                    </button>
                    <button 
                         className="px-3 py-1 bg-[#111] border border-white/10 rounded disabled:opacity-50 hover:bg-white/5"
                         onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
