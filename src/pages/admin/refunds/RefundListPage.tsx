import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, RefreshCw, AlertCircle, CheckCircle, 
    Clock, DollarSign, ArrowRightLeft, Eye 
} from 'lucide-react';
import { adminRefundService } from '../../../services/adminRefundService';
import type { RefundRequest, RefundStats } from '../../../services/adminRefundService';
import Loader from '../../../components/Loader';
import { debounce } from '../../../utils/debounce';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'requested': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        case 'approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'processing': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
        case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
        case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
        default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
};

const RefundListPage: React.FC = () => {
    const [refunds, setRefunds] = useState<RefundRequest[]>([]);
    const [stats, setStats] = useState<RefundStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'requested', // Default to requested as it needs action
        page: 1,
        per_page: 15,
        sort_by: 'created_at',
        sort_dir: 'desc' as 'asc' | 'desc'
    });
    const [total, setTotal] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [refundsData, statsData] = await Promise.all([
                adminRefundService.getRefunds(filters),
                adminRefundService.getStats()
            ]);
            
            if (refundsData.data) {
                setRefunds(refundsData.data);
                setTotal(refundsData.total);
            } else {
                setRefunds(Array.isArray(refundsData) ? refundsData : []);
            }
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load refunds', error);
        } finally {
            setLoading(false);
        }
    };

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

    const tabs = [
        { id: 'requested', label: 'Requested' },
        { id: 'approved', label: 'Approved' },
        { id: 'processing', label: 'Processing' },
        { id: 'completed', label: 'Completed' },
        { id: 'rejected', label: 'Rejected' },
    ];

    if (loading && !refunds.length) return <Loader />;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-zentry uppercase">Refunds</h1>
                    <p className="text-gray-400">Manage refund requests and returns</p>
                </div>
                <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <AlertCircle size={60} />
                        </div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-gray-400 text-sm">Pending Requests</span>
                            <AlertCircle className="text-orange-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white relative z-10">{stats.pending_requests}</div>
                        <div className="text-xs text-orange-400 mt-1 relative z-10">Requires action</div>
                    </div>
                    
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Processed (Month)</span>
                            <CheckCircle className="text-blue-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.processed_month}</div>
                    </div>

                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Refunded Amount</span>
                            <DollarSign className="text-green-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">£{Number(stats.total_amount_month).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1">This Month</div>
                    </div>

                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-400 text-sm">Avg Processing</span>
                            <Clock className="text-purple-400" size={20} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.avg_processing_time_hours}h</div>
                    </div>
                </div>
            )}

            {/* Filters & Tabs */}
            <div className="space-y-4">
                {/* Tabs */}
                <div className="border-b border-white/10 flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilters(prev => ({ ...prev, status: tab.id, page: 1 }))}
                            className={`pb-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                                filters.status === tab.id 
                                ? 'border-brand-gold text-brand-gold' 
                                : 'border-transparent text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {tab.label}
                            {tab.id === 'requested' && stats?.pending_requests ? (
                                <span className="bg-orange-500 text-black text-[10px] px-1.5 rounded-full">
                                    {stats.pending_requests}
                                </span>
                            ) : null}
                        </button>
                    ))}
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, status: '', page: 1 }))}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                            filters.status === ''
                            ? 'border-brand-gold text-brand-gold' 
                            : 'border-transparent text-gray-500 hover:text-white hover:border-white/20'
                        }`}
                    >
                        All
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                     <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search order #, customer email..." 
                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-gold/50"
                            onChange={(e) => debouncedSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-gray-400 font-medium text-sm">ID</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Order</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Customer</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Type</th>
                                <th className="p-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>
                                    Amount
                                </th>
                                <th className="p-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>
                                    Date
                                </th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Status</th>
                                <th className="p-4 text-gray-400 font-medium text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {refunds.length > 0 ? refunds.map((refund) => (
                                <tr key={refund.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 font-mono text-gray-500">#{refund.id}</td>
                                    <td className="p-4">
                                        <Link to={`/admin/orders/${refund.order_id}`} className="font-mono text-brand-gold hover:underline">
                                            #{refund.order_number}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white text-sm">{refund.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-gray-500">{refund.user?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {refund.type === 'return' ? (
                                                <ArrowRightLeft size={14} className="text-purple-400" />
                                            ) : (
                                                <DollarSign size={14} className="text-blue-400" />
                                            )}
                                            <span className="capitalize text-sm text-gray-300">{refund.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-white">
                                        £{Number(refund.amount).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(refund.created_at).toLocaleDateString()}
                                        {refund.status === 'requested' && refund.days_pending > 2 && (
                                            <div className="text-xs text-red-400 font-bold mt-1">
                                                {refund.days_pending} days pending
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(refund.status)}`}>
                                            {refund.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link 
                                            to={`/admin/refunds/${refund.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                                        >
                                            <Eye size={14} /> View
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        No refunds found in this category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-gray-400">
                <div>Showing {refunds.length} of {total} requests</div>
                <div className="flex gap-2">
                    <button 
                        disabled={filters.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="px-3 py-1 bg-[#111] border border-white/10 rounded disabled:opacity-50 hover:bg-white/5"
                    >
                        Previous
                    </button>
                    <button 
                         className="px-3 py-1 bg-[#111] border border-white/10 rounded disabled:opacity-50 hover:bg-white/5 disabled:cursor-not-allowed"
                         disabled={refunds.length < filters.per_page}
                         onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefundListPage;
