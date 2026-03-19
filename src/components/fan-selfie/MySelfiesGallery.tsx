import React, { useState, useEffect } from 'react';
import { fanSelfieService } from '../../services/fanSelfieService';
import type { FanSelfie } from '../../types/fanSelfie';
import Loader from '../Loader';
import { FaTrash, FaEye, FaEyeSlash, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '../../utils/imageUrl';

const MySelfiesGallery: React.FC = () => {
    const [selfies, setSelfies] = useState<FanSelfie[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMySelfies = async (showGlobalLoader = true) => {
        try {
            if (showGlobalLoader) setLoading(true);
            const response = await fanSelfieService.getMySelfies();
            if (response.status === 'success' && Array.isArray(response.data)) {
                setSelfies(response.data);
            }
        } catch (error) {
            console.error("Error fetching my selfies:", error);
            if (showGlobalLoader) toast.error("Failed to load your selfies.");
        } finally {
            if (showGlobalLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMySelfies(true);
    }, []);

    // Polling mechanism for pending/processing selfies
    useEffect(() => {
        const hasProcessingSelfies = selfies.some(s => s.status === 'pending' || s.status === 'processing');
        
        let intervalId: ReturnType<typeof setInterval>;
        if (hasProcessingSelfies) {
            intervalId = setInterval(() => {
                fetchMySelfies(false);
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [selfies]);

    const handleToggleVisibility = async (id: number) => {
        try {
            const response = await fanSelfieService.toggleVisibility(id);
            if (response.status === 'success') {
                setSelfies(prev => prev.map(s => s.id === id ? { ...s, is_public: response.is_public } : s));
                toast.success(response.message);
            }
        } catch (error) {
            toast.error("Failed to update visibility.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this selfie? This action cannot be undone.")) return;

        try {
            await fanSelfieService.deleteSelfie(id);
            setSelfies(prev => prev.filter(s => s.id !== id));
            toast.success("Selfie deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete selfie.");
        }
    };

    const handleDownload = (url: string | null) => {
        if (!url) return;
        const fullUrl = getFullImageUrl(url);
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = 'My-VJ-Selfie.jpg';
        link.target = "_blank"; // Add this in case it opens instead of downloading due to CORS
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader /></div>;

    if (selfies.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="mb-4">You haven't generated any selfies yet.</p>
                <p className="text-sm">Click "Generate New" to create your first selfie with VJ!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
                {selfies.map((selfie) => (
                    <motion.div
                        key={selfie.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 relative group"
                    >
                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-900">
                            {selfie.status === 'completed' && selfie.generated_image_url ? (
                                <img 
                                    src={getFullImageUrl(selfie.generated_image_url)} 
                                    alt="My Selfie" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : selfie.status === 'failed' ? (
                                <div className="flex flex-col items-center justify-center h-full text-red-500 bg-red-900/10 p-4 text-center">
                                    <span className="text-3xl mb-2">⚠️</span>
                                    <p className="text-sm font-semibold uppercase tracking-wider mb-1">Failed</p>
                                    <p className="text-xs text-red-400 line-clamp-3">{selfie.error_message || "Something went wrong"}</p>
                                </div>
                            ) : selfie.status === 'completed' && !selfie.generated_image_url ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-800 p-4 text-center">
                                    <span className="text-3xl mb-2">🖼️</span>
                                    <p className="text-sm">Image unavailable</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-800 p-4">
                                    <Loader />
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary animate-pulse">
                                        {selfie.status}...
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                                        Please wait,<br/>AI is doing its magic ✨
                                    </p>
                                </div>
                            )}
                            
                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase
                                    ${selfie.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
                                      selfie.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
                                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 animate-pulse'
                                    }`}>
                                    {selfie.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-800">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-gray-400">
                                    {new Date(selfie.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleToggleVisibility(selfie.id)}
                                    title={selfie.is_public ? "Public (Click to make private)" : "Private (Click to make public)"}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors
                                        ${selfie.is_public ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
                                    `}
                                >
                                    {selfie.is_public ? <FaEye /> : <FaEyeSlash />}
                                    {selfie.is_public ? 'Public' : 'Private'}
                                </button>
                            </div>

                            <div className="flex justify-between gap-2 mt-2">
                                <button
                                    onClick={() => handleDownload(selfie.generated_image_url)}
                                    disabled={selfie.status !== 'completed'}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition disabled:opacity-50"
                                >
                                    <FaDownload /> Download
                                </button>
                                <button
                                    onClick={() => handleDelete(selfie.id)}
                                    className="p-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded transition"
                                    title="Delete Selfie"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MySelfiesGallery;
