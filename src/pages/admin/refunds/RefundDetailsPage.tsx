import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, User, Calendar, FileText, 
    AlertCircle, CheckCircle, XCircle, RefreshCw, ShoppingBag,
    Shield
} from 'lucide-react';
import { adminRefundService } from '../../../services/adminRefundService';
import type { RefundRequest } from '../../../services/adminRefundService';
import Loader from '../../../components/Loader';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'requested': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        case 'approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'processing': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
        case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
        default: return 'text-white bg-white/10 border-white/10';
    }
};

const RefundDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [refund, setRefund] = useState<RefundRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Action State
    const [adminResponse, setAdminResponse] = useState('');
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    const fetchRefund = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await adminRefundService.getRefund(id);
            setRefund(data);
            
            // Set default response based on status if needed, but usually fresh
            if (data.admin_response) setAdminResponse(data.admin_response);
        } catch (error) {
            toast.error('Failed to load refund details');
            navigate('/admin/refunds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefund();
    }, [id]);

    const handleProcess = async () => {
        if (!refund || !actionType) return;
        
        // Validation for rejection
        if (actionType === 'reject' && !adminResponse.trim()) {
            toast.error('Reason is required for rejection');
            return;
        }

        if (!window.confirm(`Are you sure you want to ${actionType.toUpperCase()} this refund?`)) return;

        setProcessing(true);
        try {
            await adminRefundService.processRefund(refund.id, {
                approve: actionType === 'approve',
                admin_response: adminResponse
            });
            toast.success(`Refund ${actionType}d successfully`);
            fetchRefund();
            setActionType(null); // Reset form
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loader />;
    if (!refund) return <div className="text-center p-10 text-white">Refund not found</div>;

    const isActionable = refund.status === 'requested' || refund.status === 'failed';

    return (
        <div className="pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/refunds" className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-mono text-white">Refund #{refund.id}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <Calendar size={14} /> 
                            {new Date(refund.created_at).toLocaleString()}
                             <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ml-2 ${getStatusColor(refund.status)}`}>
                                {refund.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer & Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                <User size={16} /> Customer
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-brand-gold font-bold">
                                    {refund.user?.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{refund.user?.name}</div>
                                    <div className="text-sm text-gray-400">{refund.user?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                <ShoppingBag size={16} /> Original Order
                            </h3>
                            <div>
                                <Link to={`/admin/orders/${refund.order_id}`} className="text-lg font-mono text-brand-gold font-bold hover:underline mb-1 block">
                                    #{refund.order_number}
                                </Link>
                                <div className="text-xs text-gray-500">
                                    Linked Order
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Refund Request Details */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Request Details</h3>
                        
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-xs uppercase text-gray-500 font-bold mb-2">Customer Reason</div>
                                <p className="text-white italic">"{refund.reason}"</p>
                            </div>

                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-gray-400">Refund Type</span>
                                <span className="font-bold text-white capitalize">{refund.type}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-gray-400">Request Date</span>
                                <span className="font-bold text-white">{new Date(refund.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex justify-between items-center py-4">
                                <span className="text-gray-400 text-lg">Requested Amount</span>
                                <span className="font-mono text-2xl font-bold text-brand-gold">
                                    £{Number(refund.amount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Refund Items (if partial/specific) */}
                    {refund.items && refund.items.length > 0 && (
                        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                             <div className="p-4 border-b border-white/5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase">Items to Refund</h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/[0.02]">
                                    <tr>
                                        <th className="p-4 text-gray-400 font-medium">Product</th>
                                        <th className="p-4 text-gray-400 font-medium text-center">Qty</th>
                                        <th className="p-4 text-gray-400 font-medium text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {refund.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-4 text-white">{item.product_name}</td>
                                            <td className="p-4 text-center text-gray-400">{item.quantity}</td>
                                            <td className="p-4 text-right font-mono text-white">£{item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: Decisions */}
                <div className="space-y-6">
                    
                    {/* Decision Form */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-brand-gold" /> Admin Decision
                        </h3>

                        {isActionable ? (
                            <div className="space-y-6">
                                {/* Action Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setActionType('approve')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                            actionType === 'approve' 
                                            ? 'bg-green-500/20 border-green-500 text-green-400' 
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-green-500/10 hover:text-green-400'
                                        }`}
                                    >
                                        <CheckCircle size={24} />
                                        <span className="font-bold">Approve</span>
                                    </button>
                                    <button 
                                        onClick={() => setActionType('reject')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                            actionType === 'reject' 
                                            ? 'bg-red-500/20 border-red-500 text-red-400' 
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400'
                                        }`}
                                    >
                                        <XCircle size={24} />
                                        <span className="font-bold">Reject</span>
                                    </button>
                                </div>

                                {/* Response Form */}
                                {actionType && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Admin Response 
                                                {actionType === 'reject' && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <textarea 
                                                value={adminResponse}
                                                onChange={(e) => setAdminResponse(e.target.value)}
                                                maxLength={1000}
                                                rows={5}
                                                placeholder={
                                                    actionType === 'approve' 
                                                    ? "Refund approved. Amount will be credited to your account within 5-10 business days." 
                                                    : "Unable to process refund as product was used..."
                                                }
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-brand-gold/50 focus:outline-none"
                                            />
                                            <div className="text-right text-xs text-gray-600 mt-1">
                                                {adminResponse.length}/1000
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-3 rounded-lg flex gap-3 items-start text-xs text-gray-400 mb-4">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <p>
                                                {actionType === 'approve' 
                                                    ? "This will initiate a Stripe refund immediately. The process cannot be undone once completed."
                                                    : "The customer will be notified of the rejection via email with your provided reason."
                                                }
                                            </p>
                                        </div>

                                        <button 
                                            onClick={handleProcess}
                                            disabled={processing || (actionType === 'reject' && !adminResponse.trim())}
                                            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                                                actionType === 'approve' 
                                                ? 'bg-green-500 hover:bg-green-600 text-black' 
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {processing ? (
                                                <RefreshCw size={18} className="animate-spin" /> 
                                            ) : (
                                                actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className={`inline-flex p-3 rounded-full mb-3 ${
                                    refund.status === 'completed' || refund.status === 'approved' 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : 'bg-white/10 text-gray-400'
                                }`}>
                                    {refund.status === 'completed' || refund.status === 'approved'  ? <CheckCircle size={32} /> : <FileText size={32} />}
                                </div>
                                <h4 className="text-white font-bold mb-1">Request {refund.status}</h4>
                                <p className="text-gray-500 text-sm mb-4">
                                    Processed on {new Date(refund.updated_at).toLocaleDateString()}
                                </p>
                                {refund.admin_response && (
                                    <div className="bg-white/5 p-4 rounded-lg text-left">
                                        <div className="text-xs uppercase text-gray-500 font-bold mb-1">Admin Response</div>
                                        <p className="text-gray-300 text-sm">{refund.admin_response}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Policy Guideline Snippet */}
                        <div className="mt-8 pt-6 border-t border-white/5 text-xs text-gray-500 space-y-2">
                             <h4 className="font-bold text-gray-400 uppercase">Guidelines</h4>
                             <ul className="list-disc pl-4 space-y-1">
                                 <li>Check return shipping status for returns.</li>
                                 <li>Stripe refunds take 5-10 days to appear.</li>
                                 <li>Reference <Link to="#" className="text-brand-gold hover:underline">Refund Policy</Link> for criteria.</li>
                             </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RefundDetailsPage;
